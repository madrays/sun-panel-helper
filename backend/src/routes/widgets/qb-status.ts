import { Router, Request, Response } from 'express'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { join } from 'path'
// 添加声明文件
// @ts-ignore
import qbittorrent from 'qbittorrent-api-v2'

const router = Router()

// 配置存储路径
const CONFIG_DIR = path.join(__dirname, '../../../data')
const QB_CONFIG_FILE = path.join(CONFIG_DIR, 'qb-configs.json')

// 确保配置目录存在
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
}

// 确保配置文件存在
if (!fs.existsSync(QB_CONFIG_FILE)) {
  fs.writeFileSync(QB_CONFIG_FILE, JSON.stringify({}), 'utf8')
}

// QB种子类型
interface QBTorrent {
  state: string
  progress: number
  [key: string]: any
}

// QB配置类型
interface QBConfig {
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
    ioTasks: boolean
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

// QB状态数据类型
interface QBStatusData {
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
  [key: string]: string | number | boolean // 添加索引签名
}

// qBittorrent API 返回的种子类型
interface QBApiTorrent {
  state: string
  progress: number
  hash: string
  name: string
  size: number
  dlspeed: number
  upspeed: number
  eta: number
  num_seeds?: number
  num_leechs?: number
  ratio: number
  [key: string]: any
}

// qBittorrent API 返回的传输信息类型
interface TransferInfo {
  dl_info_speed: number
  up_info_speed: number
  dl_info_data: number
  up_info_data: number
  global_ratio: number
  dl_info_session: number
  up_info_session: number
  free_space_on_disk?: number
  up_rate_limit?: number
  dl_rate_limit?: number
  io_tasks?: number
  read_cache_hits?: number
  [key: string]: any
}

// qBittorrent API 返回的偏好设置类型
interface Preferences {
  save_path_disk_space_free?: number
  disk_space_free?: number
  free_space_on_disk?: number
  [key: string]: any
}

// qBittorrent API 返回的同步数据类型
interface SyncMainData {
  server_state?: {
    free_space_on_disk?: number
    [key: string]: any
  }
  [key: string]: any
}

// 定义API错误接口
interface ApiError extends Error {
  response?: {
    status: number;
    statusText: string;
    data: any;
  };
}

// 安全的 Base64 解码函数
function safeBase64Decode(base64: string): string {
  try {
    // Node.js 环境中使用 Buffer 进行 Base64 解码
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Base64解码失败:', error);
    throw new Error('Base64解码失败');
  }
}

// 迁移配置
function migrateConfig(config: any): QBConfig {
  // 创建新的配置对象
  const newConfig: QBConfig = {
    id: config.id || '',
    name: config.name || '',
    url: config.url || '',
    username: config.username || '',
    password: config.password || '',
    updateInterval: config.updateInterval || 30,
    displayItems: {
      downloadSpeed: config.displayItems?.downloadSpeed !== undefined ? config.displayItems.downloadSpeed : true,
      uploadSpeed: config.displayItems?.uploadSpeed !== undefined ? config.displayItems.uploadSpeed : true,
      activeDownloads: config.displayItems?.activeDownloads !== undefined ? config.displayItems.activeDownloads : true,
      activeTorrents: config.displayItems?.activeTorrents !== undefined ? config.displayItems.activeTorrents : true,
      pausedTorrents: config.displayItems?.pausedTorrents !== undefined ? config.displayItems.pausedTorrents : true,
      completedTorrents: config.displayItems?.completedTorrents !== undefined ? config.displayItems.completedTorrents : true,
      totalTorrents: config.displayItems?.totalTorrents !== undefined ? config.displayItems.totalTorrents : true,
      globalRatio: config.displayItems?.globalRatio !== undefined ? config.displayItems.globalRatio : true,
      globalDownloaded: config.displayItems?.globalDownloaded !== undefined ? config.displayItems.globalDownloaded : true,
      globalUploaded: config.displayItems?.globalUploaded !== undefined ? config.displayItems.globalUploaded : true,
      freeSpace: config.displayItems?.freeSpace !== undefined ? config.displayItems.freeSpace : true,
      seedingTorrents: config.displayItems?.seedingTorrents !== undefined ? config.displayItems.seedingTorrents : true,
      totalSize: config.displayItems?.totalSize !== undefined ? config.displayItems.totalSize : true,
      averageRatio: config.displayItems?.averageRatio !== undefined ? config.displayItems.averageRatio : true,
      ioTasks: config.displayItems?.ioTasks !== undefined ? config.displayItems.ioTasks : true,
      errorTorrents: config.displayItems?.errorTorrents !== undefined ? config.displayItems.errorTorrents : true,
      uploadLimit: config.displayItems?.uploadLimit !== undefined ? config.displayItems.uploadLimit : true,
      downloadLimit: config.displayItems?.downloadLimit !== undefined ? config.displayItems.downloadLimit : true
    }
  }

  // 如果存在displayOrder字段，则保留
  if (config.displayOrder && Array.isArray(config.displayOrder)) {
    newConfig.displayOrder = [...config.displayOrder];
  } else {
    // 创建默认的显示顺序
    newConfig.displayOrder = [
      'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
      'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
      'seedingTorrents', 'ioTasks', 'globalRatio', 'averageRatio',
      'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
      'freeSpace', 'totalSize'
    ];
  }

  // 保留其他元数据字段
  if (config.isConfigValid !== undefined) newConfig.isConfigValid = config.isConfigValid
  if (config.lastTested !== undefined) newConfig.lastTested = config.lastTested
  if (config.isAppliedToFixed !== undefined) newConfig.isAppliedToFixed = config.isAppliedToFixed
  if (config.isAppliedToFree !== undefined) newConfig.isAppliedToFree = config.isAppliedToFree
  if (config.domainPrefix !== undefined) newConfig.domainPrefix = config.domainPrefix

  return newConfig
}

// 根据ID获取配置
function getConfigById(id: string): QBConfig | null {
  try {
    // 读取配置文件
    const configsRaw = fs.readFileSync(QB_CONFIG_FILE, 'utf8')
    const configs = JSON.parse(configsRaw || '{}')
    
    // 获取指定ID的配置
    const config = configs[id] || null
    
    // 如果找到配置，进行迁移处理
    if (config) {
      // 检查配置是否需要迁移（例如，缺少新字段）
      let needsMigration = false;
      
      // 检查是否缺少displayItems字段
      if (!config.displayItems) {
        needsMigration = true;
      } else {
        // 检查是否缺少新的显示项
        const allItems = [
          'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
          'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
          'seedingTorrents', 'ioTasks', 'globalRatio', 'averageRatio',
          'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
          'freeSpace', 'totalSize'
        ];
        
        for (const item of allItems) {
          if (config.displayItems[item] === undefined) {
            needsMigration = true;
            break;
          }
        }
      }
      
      // 检查是否缺少displayOrder字段
      if (!config.displayOrder || !Array.isArray(config.displayOrder)) {
        needsMigration = true;
      }
      
      // 只有在需要迁移时才进行迁移
      if (needsMigration) {
        const migratedConfig = migrateConfig(config);
        
        // 将迁移后的配置保存回文件
        configs[id] = migratedConfig;
        fs.writeFileSync(QB_CONFIG_FILE, JSON.stringify(configs, null, 2), 'utf8');
        
        return migratedConfig;
      }
      
      // 如果不需要迁移，直接返回原始配置
      return config;
    }
    
    return null
  } catch (error) {
    console.error('获取配置失败:', error)
    return null
  }
}

// 保存配置
router.post('/config', (req, res) => {
  try {
    const config = req.body as QBConfig;
    
    // 检查配置是否完整
    if (!config || !config.id || !config.name || !config.url) {
      return res.status(400).json({
        success: false,
        message: '配置不完整'
      });
    }
    
    // 读取现有配置
    let configs: Record<string, QBConfig> = {};
    try {
      const configsRaw = fs.readFileSync(QB_CONFIG_FILE, 'utf8');
      configs = JSON.parse(configsRaw || '{}');
    } catch (error) {
      // 读取配置文件失败，将创建新的配置文件
    }
    
    // 确保displayItems包含所有可能的项目
    if (!config.displayItems) {
      config.displayItems = {
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
        ioTasks: true,
        errorTorrents: true,
        uploadLimit: true,
        downloadLimit: true
      };
    }
    
    // 确保所有显示项都存在
    const allDisplayItems = [
      'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
      'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
      'seedingTorrents', 'ioTasks', 'globalRatio', 'averageRatio',
      'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
      'freeSpace', 'totalSize'
    ];
    
    allDisplayItems.forEach(item => {
      if (config.displayItems[item] === undefined) {
        // 设置默认值为true，所有选项都默认显示
        config.displayItems[item] = true;
      }
    });
    
    // 确保displayOrder字段存在
    if (!config.displayOrder || !Array.isArray(config.displayOrder)) {
      // 创建默认的displayOrder字段，包含所有启用的项目
      config.displayOrder = allDisplayItems.filter(item => config.displayItems[item] === true);
      
      if (config.displayOrder.length === 0) {
        // 如果没有启用的项目，则使用所有项目
        config.displayOrder = [...allDisplayItems];
      }
    } else {
      // 此时我们已经确认config.displayOrder存在且是数组
      const displayOrder = config.displayOrder as string[];
      
      // 确保displayOrder包含所有必要的项目
      const missingItems = allDisplayItems.filter(item => !displayOrder.includes(item));
      if (missingItems.length > 0) {
        config.displayOrder = [...displayOrder, ...missingItems];
      }
    }
    
    // 创建干净的配置对象
    const cleanConfig: QBConfig = {
      id: config.id,
      name: config.name,
      url: config.url,
      username: config.username || '',
      password: config.password || '',
      updateInterval: config.updateInterval || 30,
      displayItems: { ...config.displayItems },
      displayOrder: [...config.displayOrder]
    };
    
    // 保留现有配置的元数据和其他字段
    if (configs[config.id]) {
      const existingConfig = configs[config.id];
      
      if (existingConfig.isConfigValid !== undefined) {
        cleanConfig.isConfigValid = existingConfig.isConfigValid;
      }
      
      if (existingConfig.lastTested !== undefined) {
        cleanConfig.lastTested = existingConfig.lastTested;
      }
      
      if (existingConfig.isAppliedToFixed !== undefined) {
        cleanConfig.isAppliedToFixed = existingConfig.isAppliedToFixed;
      }
      
      if (existingConfig.isAppliedToFree !== undefined) {
        cleanConfig.isAppliedToFree = existingConfig.isAppliedToFree;
      }
      
      if (existingConfig.domainPrefix !== undefined) {
        cleanConfig.domainPrefix = existingConfig.domainPrefix;
      }
    }
    
    // 从请求中保留这些字段
    if (config.isConfigValid !== undefined) cleanConfig.isConfigValid = config.isConfigValid;
    if (config.lastTested !== undefined) cleanConfig.lastTested = config.lastTested;
    if (config.isAppliedToFixed !== undefined) cleanConfig.isAppliedToFixed = config.isAppliedToFixed;
    if (config.isAppliedToFree !== undefined) cleanConfig.isAppliedToFree = config.isAppliedToFree;
    if (config.domainPrefix !== undefined) cleanConfig.domainPrefix = config.domainPrefix;
    
    // 更新配置
    configs[config.id] = cleanConfig;
    
    // 确保配置目录存在
    if (!fs.existsSync(path.dirname(QB_CONFIG_FILE))) {
      fs.mkdirSync(path.dirname(QB_CONFIG_FILE), { recursive: true });
    }
    
    // 写入配置文件
    fs.writeFileSync(QB_CONFIG_FILE, JSON.stringify(configs, null, 2));
    
    return res.json({
      success: true,
      message: '配置已保存'
    });
  } catch (error) {
    console.error('保存配置失败:', error);
    return res.status(500).json({
      success: false,
      message: '保存配置失败'
    });
  }
});

// 添加一个简单的根路由处理程序，避免500错误
router.get('/', async (req, res) => {
  try {
    const id = req.query.id as string
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: '缺少ID参数'
      })
    }
    
    // 获取配置
    const config = getConfigById(id)
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: '找不到配置'
      })
    }
    
    // 获取QB状态
    try {
      const status = await getQBStatus(config)
      return res.json({
        success: true,
        data: status,
        config: config
      })
    } catch (error) {
      console.error('获取QB状态失败:', error)
      
      // 简化错误处理，避免TypeScript错误
      return res.status(500).json({
        success: false,
        message: '获取QB状态失败',
        error: error instanceof Error ? error.message : '未知错误'
      })
    }
  } catch (error) {
    console.error('处理请求失败:', error)
    
    return res.status(500).json({
      success: false,
      message: '处理请求失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 添加状态路由，用于获取QB状态
router.get('/status', (req, res) => {
  try {
    // 获取配置ID
    const configId = req.query.id as string
    
    if (!configId) {
      return res.status(400).json({ error: '缺少配置ID参数' })
    }
    
    // 获取配置
    const config = getConfigById(configId)
    
    if (!config) {
      return res.status(404).json({ error: '未找到配置' })
    }
    
    // 验证配置
    if (!config.url || !config.username || !config.password) {
      return res.status(400).json({ error: '配置参数不完整' })
    }
    
    // 获取QB状态
    getQBStatus(config)
      .then(statusData => {
        // 返回JSON数据
        res.json({
          success: true,
          data: statusData
        })
      })
      .catch(error => {
        console.error('获取QB状态失败:', error)
        res.json({
          success: false,
          error: '获取QB状态失败',
          message: error instanceof Error ? error.message : '未知错误',
          name: config.name
        })
      })
  } catch (error) {
    console.error('QB状态API错误:', error)
    res.status(500).json({
      success: false,
      error: 'QB状态API错误',
      message: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 测试连接
router.post('/test', async (req, res) => {
  try {
    let { url, username, password } = req.body
    
    if (!url || !username || !password) {
      return res.status(400).json({ error: '参数不完整' })
    }
    
    // 确保 URL 以斜杠结尾
    if (!url.endsWith('/')) {
      url = url + '/'
    }
    
    try {
      // 使用 axios 直接发送请求
      // 1. 首先登录
      const loginUrl = `${url}api/v2/auth/login`
      
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)
      
      const loginResponse = await axios.post(loginUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': url
        }
      })
      
      // 2. 获取 API 版本
      const apiVersionUrl = `${url}api/v2/app/webapiVersion`
      
      const apiVersionResponse = await axios.get(apiVersionUrl, {
        headers: {
          'Referer': url,
          'Cookie': loginResponse.headers['set-cookie']?.join('; ') || ''
        }
      })
      
      res.json({ success: true, apiVersion: apiVersionResponse.data })
    } catch (error) {
      console.error('测试连接失败:', error)
      // 返回更详细的错误信息，使用类型断言处理axios错误
      const axiosError = error as any;
      res.status(200).json({ 
        success: false, 
        message: error instanceof Error ? error.message : '未知错误',
        details: error instanceof Error ? (error.stack || '') : '',
        response: axiosError.response ? {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data
        } : null
      })
    }
  } catch (error) {
    console.error('测试连接API错误:', error)
    res.status(200).json({ 
      success: false,
      error: '测试连接失败',
      message: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 格式化大小
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// 格式化速度
function formatSpeed(bytes: number): string {
  return formatSize(bytes) + '/s';
}

// 获取QB状态
async function getQBStatus(config: QBConfig): Promise<QBStatusData> {
  try {
    // 确保 URL 以斜杠结尾
    let url = config.url
    if (!url.endsWith('/')) {
      url = url + '/'
    }
    
    // 使用 axios 直接发送请求
    // 1. 首先登录
    const loginUrl = `${url}api/v2/auth/login`
    
    const formData = new URLSearchParams()
    formData.append('username', config.username)
    formData.append('password', config.password)
    
    const loginResponse = await axios.post(loginUrl, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': url
      }
    })
    
    // 设置 cookie
    const cookies = loginResponse.headers['set-cookie']?.join('; ') || ''
    
    // 2. 获取应用程序信息
    const appVersionUrl = `${url}api/v2/app/version`
    const appVersionResponse = await axios.get(appVersionUrl, {
      headers: {
        'Referer': url,
        'Cookie': cookies
      }
    })
    
    // 3. 获取传输信息
    const transferInfoUrl = `${url}api/v2/transfer/info`
    const transferInfoResponse = await axios.get(transferInfoUrl, {
      headers: {
        'Referer': url,
        'Cookie': cookies
      }
    })
    
    const transferInfo = transferInfoResponse.data as TransferInfo
    
    // 4. 获取种子列表
    const torrentsUrl = `${url}api/v2/torrents/info`
    const torrentsResponse = await axios.get(torrentsUrl, {
      headers: {
        'Referer': url,
        'Cookie': cookies
      }
    })
    
    const torrents = torrentsResponse.data as QBApiTorrent[]
    
    // 计算活跃下载数量
    const activeDownloads = torrents.filter(
      (torrent: QBApiTorrent) => torrent.state === 'downloading'
    ).length
    
    // 计算活跃任务数量
    const activeTorrents = torrents.filter(
      (torrent: QBApiTorrent) => ['downloading', 'uploading', 'stalledUP', 'stalledDL'].includes(torrent.state)
    ).length
    
    // 计算暂停任务数量
    const pausedTorrents = torrents.filter(
      (torrent: QBApiTorrent) => torrent.state === 'pausedDL' || torrent.state === 'pausedUP'
    ).length
    
    // 计算已完成任务数量
    const completedTorrents = torrents.filter(
      (torrent: QBApiTorrent) => torrent.progress === 1
    ).length
    
    // 计算做种数量
    const seedingTorrents = torrents.filter(
      (torrent: QBApiTorrent) => torrent.state === 'uploading' || torrent.state === 'stalledUP'
    ).length
    
    // 计算错误任务数量
    const errorTorrents = torrents.filter(
      (torrent: QBApiTorrent) => torrent.state === 'error' || torrent.state === 'missingFiles'
    ).length
    
    // 计算总体积
    const totalSize = torrents.reduce((sum, torrent) => sum + (torrent.size || 0), 0)
    
    // 计算平均分享率
    const totalRatio = torrents.reduce((sum, torrent) => sum + (torrent.ratio || 0), 0)
    const averageRatio = torrents.length > 0 ? totalRatio / torrents.length : 0
    
    // 6. 获取默认保存路径的可用空间
    const preferencesUrl = `${url}api/v2/app/preferences`
    const preferencesResponse = await axios.get(preferencesUrl, {
      headers: {
        'Referer': url,
        'Cookie': cookies
      }
    })
    
    const preferences = preferencesResponse.data as Preferences
    
    // 获取上传和下载限制
    let uploadLimit = 0
    let downloadLimit = 0
    
    if (transferInfo.up_rate_limit !== undefined) {
      uploadLimit = transferInfo.up_rate_limit;
    }
    
    if (transferInfo.dl_rate_limit !== undefined) {
      downloadLimit = transferInfo.dl_rate_limit;
    }
    
    // 获取I/O任务数
    let ioTasks = 0
    try {
      // 尝试从transferInfo中获取I/O任务数
      if (transferInfo.io_tasks !== undefined) {
        ioTasks = transferInfo.io_tasks;
      } else if (transferInfo.read_cache_hits !== undefined) {
        // 某些版本可能使用不同的字段表示I/O活动
        ioTasks = transferInfo.read_cache_hits;
      }
    } catch (ioError) {
      console.error('获取I/O任务数失败:', ioError);
    }
    
    // 检查剩余空间字段
    let freeSpace = 0
    if (preferences.save_path_disk_space_free !== undefined) {
      freeSpace = preferences.save_path_disk_space_free
    } else if (preferences.disk_space_free !== undefined) {
      freeSpace = preferences.disk_space_free
    } else if (preferences.free_space_on_disk !== undefined) {
      // 某些版本的qBittorrent可能使用这个字段
      freeSpace = preferences.free_space_on_disk
    } else {
      // 尝试使用另一个API端点获取磁盘空间信息
      try {
        // 尝试使用sync/maindata API获取磁盘空间信息
        const syncUrl = `${url}api/v2/sync/maindata`
        
        const syncResponse = await axios.get<SyncMainData>(syncUrl, {
          headers: {
            'Referer': url,
            'Cookie': cookies
          }
        })
        
        // 检查响应中是否包含磁盘空间信息
        if (syncResponse.data && syncResponse.data.server_state && 
            syncResponse.data.server_state.free_space_on_disk !== undefined) {
          freeSpace = syncResponse.data.server_state.free_space_on_disk
        }
      } catch (syncError) {
        console.error('获取sync/maindata信息失败:', syncError)
      }
      
      // 如果仍然无法获取，尝试使用transfer/info API
      if (freeSpace === 0) {
        try {
          const transferInfoUrl = `${url}api/v2/transfer/info`
          
          const transferInfoResponse = await axios.get<TransferInfo>(transferInfoUrl, {
            headers: {
              'Referer': url,
              'Cookie': cookies
            }
          })
          
          // 检查响应中是否包含磁盘空间信息
          if (transferInfoResponse.data && transferInfoResponse.data.free_space_on_disk !== undefined) {
            freeSpace = transferInfoResponse.data.free_space_on_disk
          }
        } catch (transferError) {
          console.error('获取transfer/info信息失败:', transferError)
        }
      }
    }
    
    // 获取会话下载和上传数据
    const sessionDownloaded = transferInfo.dl_info_session || 0
    const sessionUploaded = transferInfo.up_info_session || 0
    
    // 返回状态数据
    return {
      name: config.name,
      isOnline: true,
      downloadSpeed: transferInfo.dl_info_speed,
      uploadSpeed: transferInfo.up_info_speed,
      activeTorrents,
      pausedTorrents,
      completedTorrents,
      totalTorrents: torrents.length,
      activeDownloads,
      globalRatio: transferInfo.global_ratio,
      globalDownloaded: transferInfo.dl_info_data,
      globalUploaded: transferInfo.up_info_data,
      freeSpace,
      seedingTorrents,
      totalSize,
      averageRatio,
      ioTasks,
      errorTorrents,
      uploadLimit,
      downloadLimit
    }
  } catch (error) {
    console.error('获取QB状态失败:', error)
    return {
      name: config.name,
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

// 添加组件路由
router.get('/widget', (req, res) => {
  try {
    // 获取配置ID
    const configId = req.query.id as string
    
    if (!configId) {
      return res.status(400).json({ error: '缺少配置ID参数' })
    }
    
    // 获取配置
    const config = getConfigById(configId)
    
    if (!config) {
      return res.status(404).json({ error: '未找到配置' })
    }
    
    // 检查是否应该使用简化版本
    // 1. 首先检查URL参数
    let useSimple = req.query.useSimple === 'true'
    
    // 2. 如果URL参数中没有指定，则尝试从固定组件池中获取配置
    if (req.query.useSimple === undefined) {
      try {
        const fixedPoolPath = join(__dirname, '../../../data/fixed-pool.json')
        const freePoolPath = join(__dirname, '../../../data/free-pool.json')
        
        // 检查固定组件池
        if (fs.existsSync(fixedPoolPath)) {
          const fixedPoolContent = fs.readFileSync(fixedPoolPath, 'utf8')
          const fixedPool = JSON.parse(fixedPoolContent)
          
          // 查找匹配的组件
          const matchingWidget = fixedPool.widgets?.find((widget: any) => 
            widget.type === 'qb-status' && 
            widget.config?.id === configId
          )
          
          if (matchingWidget && matchingWidget.config?.useSimple) {
            useSimple = true
          }
        }
        
        // 检查自由组件池
        if (!useSimple && fs.existsSync(freePoolPath)) {
          const freePoolContent = fs.readFileSync(freePoolPath, 'utf8')
          const freePool = JSON.parse(freePoolContent)
          
          // 查找匹配的组件
          const matchingWidget = freePool.widgets?.find((widget: any) => 
            widget.type === 'qb-status' && 
            widget.config?.id === configId
          )
          
          if (matchingWidget && matchingWidget.config?.useSimple) {
            useSimple = true
          }
        }
      } catch (error) {
        console.error('读取组件池配置失败:', error)
        // 出错时默认使用标准版本
      }
    }
    
    // 不再重定向到简化版本，因为我们已经删除了简化版本
    // 直接重定向到标准版本
    res.redirect(`/widgets/qb-status.html?id=${configId}`)
  } catch (error) {
    console.error('获取组件路由失败:', error)
    res.status(500).json({ error: '获取组件路由失败' })
  }
})

// 添加获取所有配置的路由
router.get('/configs', (req, res) => {
  try {
    // 确保配置文件存在
    if (!fs.existsSync(QB_CONFIG_FILE)) {
      return res.json({})
    }
    
    // 读取配置文件
    const configsRaw = fs.readFileSync(QB_CONFIG_FILE, 'utf8')
    const configs = JSON.parse(configsRaw || '{}')
    
    // 返回所有配置
    res.json(configs)
  } catch (error) {
    console.error('获取所有配置失败:', error)
    res.status(500).json({ 
      error: '获取所有配置失败',
      message: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 添加保存所有配置的路由
router.post('/configs', (req, res) => {
  try {
    const configs = req.body
    
    if (!configs || typeof configs !== 'object') {
      return res.status(400).json({ error: '无效的配置数据' })
    }
    
    // 确保配置目录存在
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true })
    }
    
    // 写入配置文件
    fs.writeFileSync(QB_CONFIG_FILE, JSON.stringify(configs, null, 2), 'utf8')
    
    res.json({ success: true })
  } catch (error) {
    console.error('保存所有配置失败:', error)
    res.status(500).json({ 
      success: false, 
      error: '保存所有配置失败',
      message: error instanceof Error ? error.message : '未知错误'
    })
  }
})

export default router 