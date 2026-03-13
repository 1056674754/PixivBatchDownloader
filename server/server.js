const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// 存储下载任务
const downloadTasks = new Map();
// 存储已下载的作品ID
const downloadedWorks = new Set();

// 检查下载目录是否存在，不存在则创建
const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// 从文件加载已下载的作品ID
const downloadedWorksFile = path.join(__dirname, 'downloaded_works.json');
if (fs.existsSync(downloadedWorksFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(downloadedWorksFile, 'utf8'));
    data.forEach(id => downloadedWorks.add(id));
    console.log(`已加载 ${downloadedWorks.size} 个已下载作品ID`);
  } catch (error) {
    console.error('加载已下载作品ID失败:', error);
  }
}

// 保存已下载的作品ID到文件
function saveDownloadedWorks() {
  try {
    fs.writeFileSync(downloadedWorksFile, JSON.stringify([...downloadedWorks]), 'utf8');
    console.log(`已保存 ${downloadedWorks.size} 个已下载作品ID`);
  } catch (error) {
    console.error('保存已下载作品ID失败:', error);
  }
}

// 创建下载任务
app.post('/api/tasks', (req, res) => {
  const { urls, headers, fileName, skipDownloaded } = req.body;
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: '无效的URL列表' });
  }

  // 过滤已下载的作品
  let filteredUrls = urls;
  if (skipDownloaded) {
    filteredUrls = urls.filter(url => {
      // 从URL中提取作品ID
      const match = url.match(/\/(\d+)_/);
      if (match && match[1]) {
        const workId = match[1];
        return !downloadedWorks.has(workId);
      }
      return true;
    });
  }

  if (filteredUrls.length === 0) {
    return res.status(200).json({ message: '所有作品已下载，无需重复下载', taskId: null });
  }

  const taskId = uuidv4();
  downloadTasks.set(taskId, {
    urls: filteredUrls,
    headers,
    fileName,
    status: 'pending',
    progress: 0,
    total: filteredUrls.length,
    completed: 0,
    failed: 0,
    createdAt: new Date()
  });

  // 启动下载任务
  processDownloadTask(taskId);

  res.status(201).json({ taskId });
});

// 获取任务状态
app.get('/api/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  
  if (!downloadTasks.has(taskId)) {
    return res.status(404).json({ error: '任务不存在' });
  }
  
  res.json(downloadTasks.get(taskId));
});

// 获取所有任务
app.get('/api/tasks', (req, res) => {
  const tasks = Array.from(downloadTasks.entries()).map(([id, task]) => ({
    id,
    ...task
  }));
  
  res.json(tasks);
});

// 取消任务
app.delete('/api/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  
  if (!downloadTasks.has(taskId)) {
    return res.status(404).json({ error: '任务不存在' });
  }
  
  const task = downloadTasks.get(taskId);
  task.status = 'cancelled';
  
  res.json({ message: '任务已取消' });
});

// 处理下载任务
async function processDownloadTask(taskId) {
  const task = downloadTasks.get(taskId);
  if (!task || task.status === 'cancelled') return;

  task.status = 'processing';
  
  for (let i = 0; i < task.urls.length; i++) {
    if (task.status === 'cancelled') break;
    
    const url = task.urls[i];
    try {
      // 从URL中提取作品ID和文件名
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const match = fileName.match(/(\d+)_/);
      let workId = null;
      if (match && match[1]) {
        workId = match[1];
      }

      const filePath = path.join(downloadDir, fileName);
      
      // 下载文件
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: task.headers
      });
      
      const writer = fs.createWriteStream(filePath);
      
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      task.completed++;
      
      // 记录已下载的作品ID
      if (workId) {
        downloadedWorks.add(workId);
      }
    } catch (error) {
      console.error(`下载失败: ${url}`, error);
      task.failed++;
    }
    
    task.progress = Math.floor((task.completed + task.failed) / task.total * 100);
  }
  
  task.status = 'completed';
  saveDownloadedWorks();
}

// 检查作品是否已下载
app.post('/api/check-downloaded', (req, res) => {
  const { workIds } = req.body;
  
  if (!workIds || !Array.isArray(workIds)) {
    return res.status(400).json({ error: '无效的作品ID列表' });
  }
  
  const results = workIds.map(id => ({
    id,
    downloaded: downloadedWorks.has(id.toString())
  }));
  
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 