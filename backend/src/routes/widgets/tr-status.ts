import { Router, Request, Response } from 'express'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { join } from 'path'
// @ts-ignore
// import qbittorrent from 'qbittorrent-api-v2'

const router = Router()

// 配置存储路径
const CONFIG_DIR = path.join(__dirname, '../../../data')
const TR_CONFIG_FILE = path.join(CONFIG_DIR, 'tr-configs.json')

// 确保配置目录存在
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
}

// 确保配置文件存在
if (!fs.existsSync(TR_CONFIG_FILE)) {
  fs.writeFileSync(TR_CONFIG_FILE, JSON.stringify({}), 'utf8')
}

// 如果配置文件存在，打印现有配置
if (fs.existsSync(TR_CONFIG_FILE)) {
  try {
    const configsRaw = fs.readFileSync(TR_CONFIG_FILE, 'utf8')
    const configs = JSON.parse(configsRaw || '{}')
  } catch (error) {
    console.error('读取配置文件失败:', error)
  }
}

// TR种子类型（将 QBTorrent 改名为 TRTorrent）
interface TRTorrent {
  state: string
  progress: number
  [key: string]: any
}

// TR配置类型（将 QBConfig 改名为 TRConfig）
interface TRConfig {
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

// TR状态数据类型（将 QBStatusData 改名为 TRStatusData）
interface TRStatusData {
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
}

// Transmission API 响应类型
interface TRSessionStats {
  arguments: {
    "activeTorrentCount": number;
    "downloadSpeed": number;
    "pausedTorrentCount": number;
    "torrentCount": number;
    "uploadSpeed": number;
    "cumulative-stats": {
      "downloadedBytes": number;
      "filesAdded": number;
      "secondsActive": number;
      "sessionCount": number;
      "uploadedBytes": number;
    };
    "current-stats": {
      "downloadedBytes": number;
      "filesAdded": number;
      "secondsActive": number;
      "sessionCount": number;
      "uploadedBytes": number;
    };
    "download-dir-free-space": number;
    [key: string]: any;
  };
  result: string;
}

// Transmission API 种子响应类型
interface TRTorrentsResponse {
  arguments: {
    torrents: Array<{
      id: number;
      name: string;
      status: number;
      totalSize: number;
      percentDone: number;
      rateDownload: number;
      rateUpload: number;
      uploadRatio: number;
      error: number;
      errorString: string;
      downloadedEver: number;
      uploadedEver: number;
      [key: string]: any;
    }>;
  };
  result: string;
  [key: string]: any;
}

// Transmission API 会话响应类型
interface TRSessionResponse {
  arguments: {
    version: string;
    'rpc-version': number;
    [key: string]: any;
  };
  result: string;
  [key: string]: any;
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
function migrateConfig(config: any): TRConfig {
  // 创建新的配置对象
  const newConfig: TRConfig = {
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
      'seedingTorrents', 'globalRatio', 'averageRatio',
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
function getConfigById(id: string): TRConfig | null {
  try {
    // 读取配置文件
    const configsRaw = fs.readFileSync(TR_CONFIG_FILE, 'utf8')
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
          'seedingTorrents', 'globalRatio', 'averageRatio',
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
        fs.writeFileSync(TR_CONFIG_FILE, JSON.stringify(configs, null, 2), 'utf8');
        
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
    
    // 获取TR状态 (修改日志消息)
    try {
      const status = await getTRStatus(config)
      return res.json({
        success: true,
        data: status,
        config: config
      })
    } catch (error) {
      console.error('获取TR状态失败:', error)
      
      // 简化错误处理，避免TypeScript错误
      return res.status(500).json({
        success: false,
        message: '获取TR状态失败',
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

// 添加根路由的POST处理程序，与/config路由功能相同
router.post('/', (req, res) => {
  try {
    const config = req.body as TRConfig;
    
    // 检查配置是否完整
    if (!config || !config.id || !config.name || !config.url) {
      return res.status(400).json({
        success: false,
        message: '配置不完整'
      });
    }
    
    // 读取现有配置
    let configs: Record<string, TRConfig> = {};
    try {
      const configsRaw = fs.readFileSync(TR_CONFIG_FILE, 'utf8');
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
        errorTorrents: true,
        uploadLimit: true,
        downloadLimit: true
      };
    }
    
    // 确保所有显示项都存在
    const allDisplayItems = [
      'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
      'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
      'seedingTorrents', 'globalRatio', 'averageRatio',
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
    
    // 创建一个干净的配置对象
    const cleanConfig: TRConfig = {
      id: config.id,
      name: config.name,
      url: config.url,
      username: config.username || '',
      password: config.password || '',
      updateInterval: config.updateInterval || 30,
      displayItems: config.displayItems || {
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
        errorTorrents: false,
        uploadLimit: false,
        downloadLimit: false
      },
      displayOrder: config.displayOrder || []
    };
    
    // 保留元数据字段
    if (config.isConfigValid !== undefined) cleanConfig.isConfigValid = config.isConfigValid;
    if (config.lastTested !== undefined) cleanConfig.lastTested = config.lastTested;
    if (config.isAppliedToFixed !== undefined) cleanConfig.isAppliedToFixed = config.isAppliedToFixed;
    if (config.isAppliedToFree !== undefined) cleanConfig.isAppliedToFree = config.isAppliedToFree;
    if (config.domainPrefix !== undefined) cleanConfig.domainPrefix = config.domainPrefix;
    
    // 保存配置
    configs[config.id] = cleanConfig;
    
    // 确保配置目录存在
    if (!fs.existsSync(path.dirname(TR_CONFIG_FILE))) {
      fs.mkdirSync(path.dirname(TR_CONFIG_FILE), { recursive: true });
    }
    
    // 写入配置文件
    fs.writeFileSync(TR_CONFIG_FILE, JSON.stringify(configs, null, 2));
    
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

// 添加状态路由，用于获取TR状态
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
    
    // 获取TR状态
    getTRStatus(config)
      .then(statusData => {
        // 返回JSON数据
        res.json({
          success: true,
          data: statusData
        })
      })
      .catch(error => {
        console.error('获取TR状态失败:', error)
        res.json({
          success: false,
          error: '获取TR状态失败',
          message: error instanceof Error ? error.message : '未知错误',
          name: config.name
        })
      })
  } catch (error) {
    console.error('TR状态API错误:', error)
    res.status(500).json({
      success: false,
      error: 'TR状态API错误',
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
      // 使用 axios 直接发送请求测试 Transmission 连接
      const sessionUrl = `${url}transmission/rpc`
      
      // 第一次请求，获取会话ID
      let sessionId = ''
      try {
        await axios.post(sessionUrl, { method: 'session-stats' }, {
          auth: {
            username,
            password
          }
        })
      } catch (error: any) {
        if (error.response && error.response.status === 409) {
          // 从响应头中获取会话ID
          sessionId = error.response.headers['x-transmission-session-id']
        } else {
          throw error
        }
      }
      
      // 使用会话ID获取会话信息
      const sessionResponse = await axios.post<TRSessionResponse>(
        sessionUrl,
        { method: 'session-get' },
        {
          headers: {
            'X-Transmission-Session-Id': sessionId
          },
          auth: {
            username,
            password
          }
        }
      )
      
      // 如果成功获取会话信息，则连接成功
      res.json({ 
        success: true, 
        version: sessionResponse.data.arguments.version || 'Unknown',
        rpcVersion: sessionResponse.data.arguments['rpc-version'] || 'Unknown'
      })
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

// 添加测试连接别名路由，兼容前端调用
router.post('/test-connection', async (req, res) => {
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
      // 使用 axios 直接发送请求测试 Transmission 连接
      const sessionUrl = `${url}transmission/rpc`
      
      // 第一次请求，获取会话ID
      let sessionId = ''
      try {
        await axios.post(sessionUrl, { method: 'session-stats' }, {
          auth: {
            username,
            password
          }
        })
      } catch (error: any) {
        if (error.response && error.response.status === 409) {
          // 从响应头中获取会话ID
          sessionId = error.response.headers['x-transmission-session-id']
        } else {
          throw error
        }
      }
      
      // 使用会话ID获取会话信息
      const sessionResponse = await axios.post<TRSessionResponse>(
        sessionUrl,
        { method: 'session-get' },
        {
          headers: {
            'X-Transmission-Session-Id': sessionId
          },
          auth: {
            username,
            password
          }
        }
      )
      
      // 如果成功获取会话信息，则连接成功
      res.json({ 
        success: true, 
        version: sessionResponse.data.arguments.version || 'Unknown',
        rpcVersion: sessionResponse.data.arguments['rpc-version'] || 'Unknown'
      })
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

// 获取TR状态
async function getTRStatus(config: TRConfig): Promise<TRStatusData> {
  try {
    // 确保 URL 以斜杠结尾
    let url = config.url
    if (!url.endsWith('/')) {
      url = url + '/'
    }
    
    // 使用 axios 直接发送请求
    // 1. 首先获取会话ID
    const sessionUrl = `${url}transmission/rpc`
    
    // 第一次请求，获取会话ID
    let sessionId = ''
    try {
      await axios.post(sessionUrl, { method: 'session-stats' }, {
        auth: {
          username: config.username,
          password: config.password
        }
      })
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        // 从响应头中获取会话ID
        sessionId = error.response.headers['x-transmission-session-id']
      } else {
        throw error
      }
    }
    
    // 2. 获取会话统计信息
    const sessionStatsResponse = await axios.post<TRSessionStats>(
      sessionUrl,
      { method: 'session-stats' },
      {
        headers: {
          'X-Transmission-Session-Id': sessionId
        },
        auth: {
          username: config.username,
          password: config.password
        }
      }
    )
    
    const sessionStats = sessionStatsResponse.data.arguments
    
    // 获取会话信息，包括可用空间和限速设置
    const sessionGetResponse = await axios.post<any>(
      sessionUrl,
      { method: 'session-get' },
      {
        headers: {
          'X-Transmission-Session-Id': sessionId
        },
        auth: {
          username: config.username,
          password: config.password
        }
      }
    )
    
    const sessionInfo = sessionGetResponse.data.arguments
    
    // 3. 获取所有种子信息
    const torrentsResponse = await axios.post<TRTorrentsResponse>(
      sessionUrl,
      {
        method: 'torrent-get',
        arguments: {
          fields: [
            'id', 'name', 'status', 'totalSize', 'percentDone',
            'rateDownload', 'rateUpload', 'uploadRatio', 'error',
            'errorString', 'downloadedEver', 'uploadedEver'
          ]
        }
      },
      {
        headers: {
          'X-Transmission-Session-Id': sessionId
        },
        auth: {
          username: config.username,
          password: config.password
        }
      }
    )
    
    const torrents = torrentsResponse.data.arguments.torrents
    
    // 计算活跃下载数量
    const activeDownloads = torrents.filter(
      (torrent: any) => torrent.status === 4 && torrent.percentDone < 1
    ).length
    
    // 计算活跃任务数量
    const activeTorrents = torrents.filter(
      (torrent: any) => [4, 6].includes(torrent.status)
    ).length
    
    // 计算暂停任务数量
    const pausedTorrents = torrents.filter(
      (torrent: any) => torrent.status === 0
    ).length
    
    // 计算已完成任务数量
    const completedTorrents = torrents.filter(
      (torrent: any) => torrent.percentDone === 1
    ).length
    
    // 计算做种数量
    const seedingTorrents = torrents.filter(
      (torrent: any) => torrent.status === 6
    ).length
    
    // 计算错误任务数量
    const errorTorrents = torrents.filter(
      (torrent: any) => torrent.error !== 0
    ).length
    
    // 计算总体积
    const totalSize = torrents.reduce((sum: number, torrent: any) => sum + (torrent.totalSize || 0), 0)
    
    // 计算平均分享率
    const totalRatio = torrents.reduce((sum: number, torrent: any) => sum + (torrent.uploadRatio || 0), 0)
    const averageRatio = torrents.length > 0 ? totalRatio / torrents.length : 0
    
    // 获取会话下载和上传数据
    const sessionDownloaded = sessionStats["cumulative-stats"]?.downloadedBytes || 0
    const sessionUploaded = sessionStats["cumulative-stats"]?.uploadedBytes || 0
    const globalRatio = sessionDownloaded > 0 ? sessionUploaded / sessionDownloaded : 0
    
    // 获取上传和下载限制 - 使用正确的属性路径
    const uploadLimit = sessionInfo["speed-limit-up-enabled"] ? sessionInfo["speed-limit-up"] * 1024 : 0
    const downloadLimit = sessionInfo["speed-limit-down-enabled"] ? sessionInfo["speed-limit-down"] * 1024 : 0
    
    // 获取可用空间信息 - 正确的获取方式
    // 首先获取完整的下载目录路径
    const downloadDir = sessionInfo["download-dir"]
    
    // 然后查询该路径的可用空间
    let freeSpace = 0
    try {
      const freeSpaceResponse = await axios.post<any>(
        sessionUrl,
        { 
          method: 'free-space', 
          arguments: { 
            path: downloadDir 
          } 
        },
        {
          headers: {
            'X-Transmission-Session-Id': sessionId
          },
          auth: {
            username: config.username,
            password: config.password
          }
        }
      )
      freeSpace = freeSpaceResponse.data.arguments["size-bytes"] || 0
    } catch (error) {
      console.error('获取可用空间失败:', error)
      // 尝试使用会话统计中的值
      freeSpace = sessionStats["download-dir-free-space"] || 0
    }
    
    // 返回状态数据
    return {
      name: config.name,
      isOnline: true,
      downloadSpeed: sessionStats.downloadSpeed || 0,
      uploadSpeed: sessionStats.uploadSpeed || 0,
      activeTorrents: sessionStats.activeTorrentCount || activeTorrents,
      pausedTorrents: sessionStats.pausedTorrentCount || pausedTorrents,
      completedTorrents,
      totalTorrents: sessionStats.torrentCount || torrents.length,
      activeDownloads,
      globalRatio,
      globalDownloaded: sessionDownloaded,
      globalUploaded: sessionUploaded,
      freeSpace,
      seedingTorrents,
      totalSize,
      averageRatio,
      errorTorrents,
      uploadLimit,
      downloadLimit
    }
  } catch (error) {
    console.error('获取TR状态失败:', error)
    // 返回离线状态，而不是抛出错误
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
            widget.type === 'tr-status' && 
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
            widget.type === 'tr-status' && 
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
    
    // 修改重定向到tr-status.html页面
    res.redirect(`/widgets/tr-status.html?id=${configId}`)
  } catch (error) {
    console.error('获取组件路由失败:', error)
    res.status(500).json({ error: '获取组件路由失败' })
  }
})

// 添加获取所有配置的路由
router.get('/configs', (req, res) => {
  try {
    // 确保配置文件存在
    if (!fs.existsSync(TR_CONFIG_FILE)) {
      return res.json({})
    }
    
    // 读取配置文件
    const configsRaw = fs.readFileSync(TR_CONFIG_FILE, 'utf8')
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
    fs.writeFileSync(TR_CONFIG_FILE, JSON.stringify(configs, null, 2), 'utf8')
    
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

// 添加与QB组件完全一致的/config路由处理
router.post('/config', (req, res) => {
  try {
    const config = req.body as TRConfig;
    
    // 检查配置是否完整
    if (!config || !config.id || !config.name || !config.url) {
      return res.status(400).json({
        success: false,
        message: '配置不完整'
      });
    }
    
    // 读取现有配置
    let configs: Record<string, TRConfig> = {};
    try {
      const configsRaw = fs.readFileSync(TR_CONFIG_FILE, 'utf8');
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
        errorTorrents: true,
        uploadLimit: true,
        downloadLimit: true
      };
    }
    
    // 确保所有显示项都存在
    const allDisplayItems = [
      'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
      'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
      'seedingTorrents', 'globalRatio', 'averageRatio',
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
    const cleanConfig: TRConfig = {
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
    if (!fs.existsSync(path.dirname(TR_CONFIG_FILE))) {
      fs.mkdirSync(path.dirname(TR_CONFIG_FILE), { recursive: true });
    }
    
    // 写入配置文件
    fs.writeFileSync(TR_CONFIG_FILE, JSON.stringify(configs, null, 2));
    
    return res.json({
      success: true,
      id: config.id,
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

export default router 