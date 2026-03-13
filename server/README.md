# Pixiv批量下载器 - 服务器端组件

这是Pixiv批量下载器的服务器端组件，用于处理大量下载任务，避免浏览器卡顿。

## 功能

- 接收浏览器插件发送的下载任务
- 在服务器端下载Pixiv作品
- 记录已下载的作品，支持跳过已下载内容
- 提供任务状态查询API

## 安装

1. 确保已安装Node.js (v14或更高版本)
2. 克隆或下载此仓库
3. 进入服务器目录并安装依赖：

```bash
cd server
npm install
```

## 使用方法

### 启动服务器

```bash
npm start
```

开发模式（自动重启）：

```bash
npm run dev
```

默认情况下，服务器将在端口3000上运行。可以通过环境变量PORT修改端口：

```bash
PORT=8080 npm start
```

### 配置浏览器插件

1. 在浏览器插件的设置中，启用"使用服务器下载"选项
2. 设置服务器URL（默认为`http://localhost:3000`）
3. 如果需要，启用"跳过已下载的作品"选项

## API接口

### 创建下载任务

```
POST /api/tasks
```

请求体：
```json
{
  "urls": ["https://i.pximg.net/img-original/..."],
  "headers": {"referer": "https://www.pixiv.net/", "cookie": "..."},
  "fileName": "pixiv_{id}_{title}",
  "skipDownloaded": true
}
```

### 获取任务状态

```
GET /api/tasks/:taskId
```

### 获取所有任务

```
GET /api/tasks
```

### 取消任务

```
DELETE /api/tasks/:taskId
```

### 检查作品是否已下载

```
POST /api/check-downloaded
```

请求体：
```json
{
  "workIds": ["12345", "67890"]
}
```

## 文件存储

下载的文件将保存在服务器的`downloads`目录中。已下载的作品ID将保存在`downloaded_works.json`文件中。

## 注意事项

- 服务器需要有足够的磁盘空间来存储下载的文件
- 为了避免IP被Pixiv封禁，建议不要设置过高的并发下载数量
- 确保服务器与浏览器插件之间的网络连接稳定 