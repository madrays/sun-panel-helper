import axios from 'axios'

// Transmission配置类型
export interface TRConfig {
  id: string
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
    errorTorrents: boolean
    uploadLimit: boolean
    downloadLimit: boolean
    [key: string]: boolean
  }
  displayOrder?: string[]
  isConfigValid?: boolean
  lastTested?: number
  isAppliedToFixed?: boolean
  isAppliedToFree?: boolean
}

// Transmission状态数据类型
export interface TRStatusData {
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
  errorTorrents: number
  uploadLimit: number
  downloadLimit: number
  [key: string]: string | number | boolean
}

// 连接测试结果类型
export interface ConnectionTestResult {
  success: boolean
  message: string
}

// Transmission服务类
export class TRService {
  // 获取所有配置
  static async getAllConfigs(): Promise<TRConfig[]> {
    try {
      const response = await axios.get<TRConfig[]>('/api/widgets/tr-status')
      return response.data
    } catch (error) {
      console.error('获取Transmission配置失败:', error)
      return []
    }
  }

  // 获取单个配置
  static async getConfig(id: string): Promise<TRConfig | null> {
    try {
      const response = await axios.get<TRConfig>(`/api/widgets/tr-status/${id}`)
      return response.data
    } catch (error) {
      console.error(`获取Transmission配置 ${id} 失败:`, error)
      return null
    }
  }

  // 保存配置
  static async saveConfig(config: TRConfig): Promise<TRConfig | null> {
    try {
      const response = await axios.post<TRConfig>('/api/widgets/tr-status/config', config)
      return response.data
    } catch (error) {
      console.error('保存Transmission配置失败:', error)
      return null
    }
  }

  // 删除配置
  static async deleteConfig(id: string): Promise<boolean> {
    try {
      await axios.delete(`/api/widgets/tr-status/${id}`)
      return true
    } catch (error) {
      console.error(`删除Transmission配置 ${id} 失败:`, error)
      return false
    }
  }

  // 测试连接
  static async testConnection(url: string, username: string, password: string): Promise<ConnectionTestResult> {
    try {
      const response = await axios.post<ConnectionTestResult>('/api/widgets/tr-status/test-connection', {
        url,
        username,
        password
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '连接测试失败'
      }
    }
  }

  // 获取Transmission状态
  static async getStatus(id: string): Promise<TRStatusData | null> {
    try {
      console.log('获取Transmission状态，ID:', id);
      const response = await axios.get<TRStatusData>(`/api/widgets/tr-status/status`, {
        params: {
          id: id
        }
      });
      console.log('获取Transmission状态成功:', response.data);
      return response.data;
    } catch (error) {
      console.error(`获取Transmission状态 ${id} 失败:`, error);
      return null;
    }
  }

  // 创建默认配置
  static createDefaultConfig(): TRConfig {
    return {
      id: Date.now().toString(),
      name: `Transmission下载器 ${new Date().toLocaleString('zh-CN', { hour12: false }).replace(/[\/\s:]/g, '')}`,
      url: 'http://localhost:9091/transmission/rpc',
      username: '',
      password: '',
      updateInterval: 30,
      displayItems: {
        downloadSpeed: true,
        uploadSpeed: true,
        activeDownloads: true,
        activeTorrents: true,
        pausedTorrents: true,
        completedTorrents: true,
        totalTorrents: true,
        globalRatio: true,
        globalDownloaded: true,
        globalUploaded: true,
        freeSpace: true,
        seedingTorrents: true,
        totalSize: true,
        averageRatio: true,
        errorTorrents: true,
        uploadLimit: true,
        downloadLimit: true
      },
      displayOrder: [
        'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
        'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
        'seedingTorrents', 'globalRatio', 'averageRatio',
        'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
        'freeSpace', 'totalSize'
      ]
    }
  }

  // 生成组件URL
  static generateWidgetUrl(config: TRConfig): string {
    if (!config || !config.id) {
      return '';
    }
    
    // 构建基础URL
    const domainPrefix = config.domainPrefix || '';
    const baseUrl = domainPrefix ? 
      (domainPrefix.endsWith('/') ? domainPrefix : `${domainPrefix}/`) : 
      '/';
    
    // 生成组件URL，直接指向HTML文件
    return `${baseUrl}widgets/tr-status.html?id=${config.id}`
  }
} 