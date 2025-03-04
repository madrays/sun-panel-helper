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
  }
  displayOrder?: string[]
  isConfigValid: boolean
  lastTested?: number
  isAppliedToFixed?: boolean
  isAppliedToFree?: boolean
  theme?: any
  themeSettings?: {
    wallpaper?: {
      backgroundColor: string
      style: 'gradient' | 'solid'
      gradientDirection: string
      animation: boolean
      [key: string]: any
    }
    componentSize?: {
      width: number
      height: number
      [key: string]: any
    }
    theme?: {
      backgroundColor: string
      headerBackgroundColor: string
      headerTextColor: string
      onlineStatusColor: string
      offlineStatusColor: string
      labelTextColor: string
      valueTextColor: string
      borderRadius: string
      [key: string]: any
    }
    [key: string]: any
  }
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
      name: '新建Transmission下载器',
      url: '',
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
      ],
      isConfigValid: false,
      lastTested: 0,
      theme: {
        backgroundColor: '#2d3436',
        backgroundOpacity: 1,
        headerBackgroundColor: '#2980b9',
        headerTextColor: '#ffffff',
        onlineStatusColor: 'rgba(46, 204, 113, 0.8)',
        offlineStatusColor: 'rgba(231, 76, 60, 0.8)',
        
        // 下载速度
        downloadSpeedBgColor: 'rgba(33, 150, 243, 0.15)',
        downloadSpeedTextColor: '#3498db',
        
        // 上传速度
        uploadSpeedBgColor: 'rgba(76, 175, 80, 0.15)',
        uploadSpeedTextColor: '#27ae60',
        
        // 活跃下载
        activeDownloadsBgColor: 'rgba(33, 150, 243, 0.1)',
        activeDownloadsTextColor: '#4fc3f7',
        
        // 活跃任务
        activeTorrentsBgColor: 'rgba(156, 39, 176, 0.1)',
        activeTorrentsTextColor: '#9c27b0',
        
        // 暂停任务
        pausedTorrentsBgColor: 'rgba(255, 152, 0, 0.1)',
        pausedTorrentsTextColor: '#ff9800',
        
        // 完成任务
        completedTorrentsBgColor: 'rgba(76, 175, 80, 0.1)',
        completedTorrentsTextColor: '#4caf50',
        
        // 总任务数
        totalTorrentsBgColor: 'rgba(158, 158, 158, 0.1)',
        totalTorrentsTextColor: '#9e9e9e',
        
        // 错误任务
        errorTorrentsBgColor: 'rgba(244, 67, 54, 0.1)',
        errorTorrentsTextColor: '#f44336',
        
        // 做种数
        seedingTorrentsBgColor: 'rgba(0, 188, 212, 0.1)',
        seedingTorrentsTextColor: '#00bcd4',
        
        // 分享率
        globalRatioBgColor: 'rgba(3, 169, 244, 0.1)',
        globalRatioTextColor: '#03a9f4',
        
        // 平均分享率
        averageRatioBgColor: 'rgba(63, 81, 181, 0.1)',
        averageRatioTextColor: '#3f51b5',
        
        // 已下载
        globalDownloadedBgColor: 'rgba(0, 188, 212, 0.1)',
        globalDownloadedTextColor: '#00bcd4',
        
        // 已上传
        globalUploadedBgColor: 'rgba(233, 30, 99, 0.1)',
        globalUploadedTextColor: '#e91e63',
        
        // 上传限制
        uploadLimitBgColor: 'rgba(255, 87, 34, 0.1)',
        uploadLimitTextColor: '#ff5722',
        
        // 下载限制
        downloadLimitBgColor: 'rgba(121, 85, 72, 0.1)',
        downloadLimitTextColor: '#795548',
        
        // 可用空间
        freeSpaceBgColor: 'rgba(96, 125, 139, 0.1)',
        freeSpaceTextColor: '#607d8b',
        
        // 总体积
        totalSizeBgColor: 'rgba(97, 97, 97, 0.1)',
        totalSizeTextColor: '#616161',
        
        // 通用
        labelTextColor: 'rgba(255, 255, 255, 0.7)',
        valueTextColor: '#ffffff',
        
        borderRadius: '8px'
      },
      themeSettings: {
        wallpaper: {
          backgroundColor: '#2d3436',
          style: 'solid',
          gradientDirection: '',
          animation: false
        },
        componentSize: {
          width: 300,
          height: 200
        },
        theme: {
          backgroundColor: '#2d3436',
          headerBackgroundColor: '2d3436',
          headerTextColor: '#ffffff',
          onlineStatusColor: 'rgba(46, 204, 113, 0.8)',
          offlineStatusColor: 'rgba(231, 76, 60, 0.8)',
          labelTextColor: 'rgba(255, 255, 255, 0.7)',
          valueTextColor: '#ffffff',
          borderRadius: '8px'
        }
      }
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