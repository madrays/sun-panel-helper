import axios from 'axios'
import request from '@/utils/request'

// QB配置类型
export interface QBConfig {
  id: string
  /**
   * 组件名称，具有唯一性，是系统识别组件的关键标识
   */
  name: string
  url: string
  username: string
  password: string
  updateInterval: number
  domainPrefix?: string
  displayItems: {
    downloadSpeed: boolean
    uploadSpeed: boolean
    activeDownloads: boolean
    activeTorrents: boolean
    pausedTorrents: boolean
    completedTorrents: boolean
    totalTorrents: boolean
    globalRatio: boolean
    globalDownloaded: boolean
    globalUploaded: boolean
    freeSpace: boolean
    seedingTorrents: boolean
    totalSize: boolean
    averageRatio: boolean
    ioTasks: boolean
    errorTorrents: boolean
    uploadLimit: boolean
    downloadLimit: boolean
  }
  displayOrder?: string[]
  isConfigValid: boolean
  lastTested: number
  isAppliedToFixed?: boolean
  isAppliedToFree?: boolean
}

// QB状态数据类型
export interface QBStatusData {
  name: string
  isOnline: boolean
  downloadSpeed: number
  uploadSpeed: number
  activeTorrents: number
  pausedTorrents: number
  completedTorrents: number
  totalTorrents: number
  activeDownloads: number
  globalRatio: number
  globalDownloaded: number
  globalUploaded: number
  freeSpace: number
  seedingTorrents: number
  totalSize: number
  averageRatio: number
  ioTasks: number
  errorTorrents: number
  uploadLimit: number
  downloadLimit: number
}

// 测试连接响应类型
interface TestConnectionResponse {
  success: boolean
  message?: string
}

// QB种子类型
interface QBTorrent {
  state: string
  progress: number
  [key: string]: any
}

// 安全的 Base64 编码函数
function safeBase64Encode(str: string): string {
  // 先将字符串转换为 UTF-8 编码的字节数组
  const utf8Bytes = new TextEncoder().encode(str);
  
  // 将字节数组转换为二进制字符串
  let binaryStr = '';
  utf8Bytes.forEach(byte => {
    binaryStr += String.fromCharCode(byte);
  });
  
  // 使用 btoa 对二进制字符串进行 Base64 编码
  return btoa(binaryStr);
}

// QB API服务类
export class QBService {
  private config: QBConfig

  constructor(config: QBConfig) {
    this.config = config
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      console.log('开始测试连接，发送请求到:', '/api/widgets/qb-status/test')
      console.log('请求数据:', {
        url: this.config.url,
        username: this.config.username,
        password: '******' // 隐藏密码
      })
      
      // 使用axios直接发送请求
      const response = await axios.post<TestConnectionResponse>('/api/widgets/qb-status/test', {
        url: this.config.url,
        username: this.config.username,
        password: this.config.password
      })
      
      console.log('测试连接响应:', response.data)
      return response.data.success === true
    } catch (error) {
      console.error('QB连接测试失败:', error)
      return false
    }
  }

  // 获取QB状态
  async getStatus(): Promise<QBStatusData> {
    try {
      // 通过后端API获取状态，而不是直接请求qBittorrent
      interface StatusResponse {
        success: boolean;
        data: QBStatusData;
        message?: string;
      }
      
      const response = await axios.get<StatusResponse>(`/api/widgets/qb-status/status`, {
        params: {
          id: this.config.id
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '获取状态失败');
      }
    } catch (error) {
      console.error('获取QB状态失败:', error)
      
      // 返回离线状态
      return {
        name: this.config.name,
        isOnline: false,
        downloadSpeed: 0,
        uploadSpeed: 0,
        activeTorrents: 0,
        pausedTorrents: 0,
        completedTorrents: 0,
        totalTorrents: 0,
        activeDownloads: 0,
        globalRatio: 0,
        globalDownloaded: 0,
        globalUploaded: 0,
        freeSpace: 0,
        seedingTorrents: 0,
        totalSize: 0,
        averageRatio: 0,
        ioTasks: 0,
        errorTorrents: 0,
        uploadLimit: 0,
        downloadLimit: 0
      }
    }
  }
  
  // 获取全局传输信息
  private async getTransferInfo(): Promise<any> {
    try {
      const response = await this.apiRequest('/api/v2/transfer/info')
      return response.data || {}
    } catch (error) {
      console.error('获取全局传输信息失败:', error)
      return {}
    }
  }

  // 获取种子列表
  private async getTorrents(): Promise<QBTorrent[]> {
    try {
      const response = await this.apiRequest('/api/v2/torrents/info')
      return response.data || []
    } catch (error) {
      console.error('获取种子列表失败:', error)
      return []
    }
  }

  // 获取应用程序偏好设置
  private async getPreferences(): Promise<any> {
    try {
      const response = await this.apiRequest('/api/v2/app/preferences')
      return response.data || {}
    } catch (error) {
      console.error('获取应用程序偏好设置失败:', error)
      return {}
    }
  }

  // 获取I/O任务数
  private async getIOTasks(): Promise<number> {
    try {
      // 尝试获取I/O任务数，如果API支持的话
      const response = await this.apiRequest('/api/v2/transfer/info')
      return response.data?.io_tasks || 0
    } catch (error) {
      console.error('获取I/O任务数失败:', error)
      return 0
    }
  }

  // 保存配置到服务器
  public async saveConfigToServer(): Promise<boolean> {
    try {
      interface SaveConfigResponse {
        success: boolean;
        id?: string;
        error?: string;
      }
      
      const response = await axios.post<SaveConfigResponse>('/api/widgets/qb-status/config', this.config);
      return response.data.success === true;
    } catch (error) {
      console.error('保存配置到服务器失败:', error);
      return false;
    }
  }

  // 保存配置到后端
  private async saveConfig(): Promise<boolean> {
    try {
      // 使用axios直接发送请求到后端API
      const response = await axios.post<{success: boolean}>('/api/widgets/qb-status/config', this.config);
      return response.data.success === true;
    } catch (error) {
      console.error('保存配置到后端失败:', error);
      return false;
    }
  }

  // 发送API请求
  private async apiRequest(url: string, data?: any): Promise<any> {
    try {
      // 构建完整URL
      const fullUrl = this.config.url + url;
      
      // 如果有数据，使用POST请求，否则使用GET请求
      let response;
      if (data) {
        response = await axios.post(fullUrl, data, {
          auth: {
            username: this.config.username,
            password: this.config.password
          }
        });
      } else {
        response = await axios.get(fullUrl, {
          auth: {
            username: this.config.username,
            password: this.config.password
          }
        });
      }
      
      return response;
    } catch (error) {
      console.error(`API请求失败: ${url}`, error);
      throw error;
    }
  }
}

// 创建默认QB配置
export function createDefaultQBConfig(): QBConfig {
  return {
    id: Date.now().toString(),
    name: `QB下载器 ${new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[\/\s:]/g, '')}`,
    url: '',
    username: '',
    password: '',
    updateInterval: 10,
    displayItems: {
      downloadSpeed: true,
      uploadSpeed: true,
      activeDownloads: false,
      activeTorrents: false,
      pausedTorrents: false,
      completedTorrents: false,
      totalTorrents: false,
      globalRatio: false,
      globalDownloaded: false,
      globalUploaded: false,
      freeSpace: false,
      seedingTorrents: false,
      totalSize: false,
      averageRatio: false,
      ioTasks: false,
      errorTorrents: false,
      uploadLimit: false,
      downloadLimit: false
    },
    displayOrder: [],
    isConfigValid: false,
    lastTested: 0
  }
}

// 生成组件URL
export function generateWidgetUrl(config: QBConfig): string {
  // 只传递配置ID，敏感信息保存在服务器
  // 使用配置中的域名前缀，不再使用localStorage
  const domainPrefix = config.domainPrefix || '';
  const baseUrl = domainPrefix ? 
    (domainPrefix.endsWith('/') ? domainPrefix : `${domainPrefix}/`) : 
    '/';
  
  // 生成组件URL，指向新的Vue组件
  return `${baseUrl}api/widgets/qb-status/widget?id=${config.id}`
} 