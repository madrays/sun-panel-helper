import { Router, Request, Response } from 'express'
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs'
import { resolve, dirname, join } from 'path'
import axios from 'axios'

const router = Router()
const WEATHER_WIDGET_CONFIG_PATH = join(process.cwd(), 'data/weather-widget-config.json')

// 确保 weather-widget.html 存在
function ensureWeatherWidget() {
  const templatePath = resolve(__dirname, '../../components/weather-widget/template.html')
  const previewPath = resolve(__dirname, '../../custom/helper/weather-widget/weather-widget.html')

  // 确保目录存在
  const previewDir = dirname(previewPath)
  if (!existsSync(previewDir)) {
    mkdirSync(previewDir, { recursive: true })
  }

  if (!existsSync(previewPath)) {
    // 如果预览文件不存在，从模板复制
    copyFileSync(templatePath, previewPath)

    // 读取文件并替换默认配置
    let content = readFileSync(previewPath, 'utf-8')
    content = content.replace(
      /const WEATHER_API = {[\s\S]*?};/,
      `const WEATHER_API = {
        key: '',
        host: '',
        location: '116.41,39.92',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        textColor: '#ffffff',
        maxWidth: '600px',
        retryDelay: 60000,
        lastFailTime: {}
      };`
    )
    writeFileSync(previewPath, content)
  }
}

// 初始化时确保文件存在
ensureWeatherWidget()

// ==================== 天气 Widget 配置管理 ====================

// 读取天气 widget 配置
function readWeatherWidgetConfig(): { apiPrefix: string; key: string; host: string; location: string } | null {
  try {
    if (existsSync(WEATHER_WIDGET_CONFIG_PATH)) {
      const content = readFileSync(WEATHER_WIDGET_CONFIG_PATH, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('读取天气 widget 配置失败:', error)
  }
  return null
}

// 保存天气 widget 配置
function saveWeatherWidgetConfig(config: { apiPrefix: string; key: string; host: string; location: string }): boolean {
  try {
    const configDir = dirname(WEATHER_WIDGET_CONFIG_PATH)
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true })
    }
    writeFileSync(WEATHER_WIDGET_CONFIG_PATH, JSON.stringify(config, null, 2))
    return true
  } catch (error) {
    console.error('保存天气 widget 配置失败:', error)
    return false
  }
}

// 保存配置路由
router.post('/weather-widget/config', (req, res) => {
  try {
    const { apiPrefix, key, host, location } = req.body
    if (!key || !host) {
      return res.status(400).json({
        success: false,
        message: 'API Key 和 Host 不能为空'
      })
    }
    const success = saveWeatherWidgetConfig({
      apiPrefix: apiPrefix || '',
      key,
      host,
      location: location || '116.41,39.92'
    })
    res.json({ success })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '保存配置失败'
    })
  }
})

// 获取配置路由
router.get('/weather-widget/config', (_req, res) => {
  try {
    const config = readWeatherWidgetConfig()
    res.json(config || { apiPrefix: '', key: '', host: '', location: '' })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取配置失败'
    })
  }
})

router.get('/weather-widget', (req, res) => {
  const { key, host, location } = req.query

  // 读取模板文件
  const templatePath = resolve(__dirname, '../../components/weather-widget/template.html')
  let template = readFileSync(templatePath, 'utf-8')

  // 替换 API_KEY 和 LOCATION
  template = template.replace('API_KEY', key as string || '')
    .replace('API_HOST', host as string || '')
    .replace('DEFAULT_LOCATION', location as string || '116.41,39.92')

  // 写入预览文件
  const previewPath = resolve(__dirname, '../../custom/helper/weather-widget/weather-widget.html')
  writeFileSync(previewPath, template)

  res.send('ok')
})

router.post('/weather-widget', (req, res) => {
  try {
    const { html, filename } = req.body
    const templatePath = resolve(__dirname, '../../components/weather-widget/template.html')
    const weatherDir = resolve(__dirname, '../../custom/helper/weather-widget')

    // 删除旧的配置文件（保留模板）
    const files = readdirSync(weatherDir)
    files.forEach(file => {
      if (file !== 'weather-widget.html' && file.startsWith('weather-')) {
        unlinkSync(join(weatherDir, file))
      }
    })

    // 读取模板并替换配置
    let template = readFileSync(templatePath, 'utf-8')
    template = template.replace(
      /const WEATHER_API = {[\s\S]*?};/,
      html
    )

    // 保存新文件
    const previewPath = resolve(weatherDir, filename)
    writeFileSync(previewPath, template)

    res.json({
      success: true,
      url: `/custom/helper/weather-widget/${filename}`
    })
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 获取最新的配置文件
router.get('/weather-widget/latest', (req, res) => {
  try {
    const weatherDir = resolve(__dirname, '../../custom/helper/weather-widget')
    const files = readdirSync(weatherDir)

    // 找到最新的配置文件
    const latestFile = files
      .filter(file => file.startsWith('weather-') && file !== 'weather-widget.html')
      .sort()
      .pop()

    // 如果有配置文件，返回内容
    if (latestFile) {
      const content = readFileSync(join(weatherDir, latestFile), 'utf-8')
      res.send(content)
    } else {
      // 否则返回模板
      const templatePath = resolve(__dirname, '../../custom/helper/weather-widget/weather-widget.html')
      const content = readFileSync(templatePath, 'utf-8')
      res.send(content)
    }
  } catch (error) {
    res.status(500).send('读取配置失败')
  }
})

// 更新预览文件
router.post('/weather-widget/preview', (req, res) => {
  try {
    const { html } = req.body
    const templatePath = resolve(__dirname, '../../components/weather-widget/template.html')
    const previewPath = resolve(__dirname, '../../custom/helper/weather-widget/weather-widget.html')

    // 读取模板并替换配置
    let template = readFileSync(templatePath, 'utf-8')
    template = template.replace(
      /const WEATHER_API = {[\s\S]*?};/,
      html
    )

    // 更新预览文件
    writeFileSync(previewPath, template)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// ==================== 天气 API 代理（隐藏 API Key） ====================

// 代理天气查询 API
router.get('/weather-widget/api/weather', async (req: Request, res: Response) => {
  try {
    const config = readWeatherWidgetConfig()
    if (!config?.key || !config?.host) {
      return res.status(400).json({
        success: false,
        message: '天气 API 配置不完整'
      })
    }

    const { type = 'now', location = config.location } = req.query

    // 清理 host
    const cleanHost = config.host.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const url = `https://${cleanHost}/v7/weather/${type}?location=${location}&key=${config.key}`

    const response = await axios.get(url, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    })

    res.json(response.data)
  } catch (error: any) {
    console.error('Weather API proxy error:', error)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || '天气数据获取失败'
    })
  }
})

// 代理小时预报 API
router.get('/weather-widget/api/hourly', async (req: Request, res: Response) => {
  try {
    const config = readWeatherWidgetConfig()
    if (!config?.key || !config?.host) {
      return res.status(400).json({
        success: false,
        message: '天气 API 配置不完整'
      })
    }

    const location = req.query.location as string || config.location

    const cleanHost = config.host.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const url = `https://${cleanHost}/v7/weather/24h?location=${location}&key=${config.key}`

    const response = await axios.get(url, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    })

    res.json(response.data)
  } catch (error: any) {
    console.error('Hourly weather API proxy error:', error)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || '小时天气预报获取失败'
    })
  }
})

// 代理每日预报 API
router.get('/weather-widget/api/daily', async (req: Request, res: Response) => {
  try {
    const config = readWeatherWidgetConfig()
    if (!config?.key || !config?.host) {
      return res.status(400).json({
        success: false,
        message: '天气 API 配置不完整'
      })
    }

    const location = req.query.location as string || config.location

    const cleanHost = config.host.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const url = `https://${cleanHost}/v7/weather/7d?location=${location}&key=${config.key}`

    const response = await axios.get(url, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    })

    res.json(response.data)
  } catch (error: any) {
    console.error('Daily weather API proxy error:', error)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || '每日天气预报获取失败'
    })
  }
})

// 代理空气质量 API
router.get('/weather-widget/api/air', async (req: Request, res: Response) => {
  try {
    const config = readWeatherWidgetConfig()
    if (!config?.key || !config?.host) {
      return res.status(400).json({
        success: false,
        message: '天气 API 配置不完整'
      })
    }

    const location = req.query.location as string || config.location

    const cleanHost = config.host.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const url = `https://${cleanHost}/v7/air/now?location=${location}&key=${config.key}`

    const response = await axios.get(url, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    })

    res.json(response.data)
  } catch (error: any) {
    console.error('Air quality API proxy error:', error)
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || '空气质量数据获取失败'
    })
  }
})

export default router 