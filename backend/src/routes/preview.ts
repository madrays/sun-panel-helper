import { Router } from 'express'
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs'
import { resolve, dirname, join } from 'path'

const router = Router()

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
        keys: ['',''],
        currentKeyIndex: 0,
        baseUrl: 'https://devapi.qweather.com/v7',
        location: '116.41,39.92',
        retryDelay: 60000,
        lastFailTime: {}
      };`
    )
    writeFileSync(previewPath, content)
  }
}

// 初始化时确保文件存在
ensureWeatherWidget()

router.get('/weather-widget', (req, res) => {
  const { keys, location } = req.query
  
  // 读取模板文件
  const templatePath = resolve(__dirname, '../../components/weather-widget/template.html')
  let template = readFileSync(templatePath, 'utf-8')
  
  // 替换 API_KEY 和 LOCATION
  const parsedKeys = JSON.parse(keys as string)
  template = template.replace('API_KEY_1', parsedKeys[0] || '')
                    .replace('API_KEY_2', parsedKeys[1] || '')
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

export default router 