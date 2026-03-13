import { EVT } from '../EVT'
import { settings } from '../setting/Settings'
import { lang } from '../Lang'

interface TaskResponse {
  taskId: string
}

interface TaskStatus {
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  progress: number
  total: number
  completed: number
  failed: number
}

interface CheckDownloadedResponse {
  id: string
  downloaded: boolean
}

class ServerAPI {
  private serverUrl: string = 'http://localhost:3000'

  constructor() {
    // 从设置中获取服务器URL
    EVT.on('settingChange', () => {
      this.serverUrl = settings.serverURL || 'http://localhost:3000'
    })
  }

  /**
   * 创建下载任务
   * @param urls 下载URL列表
   * @param headers 请求头
   * @param fileName 文件名模板
   * @param skipDownloaded 是否跳过已下载的作品
   */
  public async createDownloadTask(
    urls: string[],
    headers: Record<string, string>,
    fileName: string,
    skipDownloaded: boolean = false
  ): Promise<string | null> {
    try {
      const response = await fetch(`${this.serverUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          headers,
          fileName,
          skipDownloaded,
        }),
      })

      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`)
      }

      const data = await response.json()
      return data.taskId
    } catch (error) {
      console.error('创建下载任务失败:', error)
      throw error
    }
  }

  /**
   * 获取任务状态
   * @param taskId 任务ID
   */
  public async getTaskStatus(taskId: string): Promise<TaskStatus> {
    try {
      const response = await fetch(`${this.serverUrl}/api/tasks/${taskId}`)

      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('获取任务状态失败:', error)
      throw error
    }
  }

  /**
   * 取消任务
   * @param taskId 任务ID
   */
  public async cancelTask(taskId: string): Promise<void> {
    try {
      const response = await fetch(`${this.serverUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`)
      }
    } catch (error) {
      console.error('取消任务失败:', error)
      throw error
    }
  }

  /**
   * 检查作品是否已下载
   * @param workIds 作品ID列表
   */
  public async checkDownloaded(workIds: string[]): Promise<CheckDownloadedResponse[]> {
    try {
      const response = await fetch(`${this.serverUrl}/api/check-downloaded`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workIds,
        }),
      })

      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('检查作品下载状态失败:', error)
      throw error
    }
  }
}

export const serverAPI = new ServerAPI() 