import { Router } from 'express'
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'

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
  const { html } = req.body
  
  // 写入预览文件
  const previewPath = resolve(__dirname, '../../custom/helper/weather-widget/weather-widget.html')
  writeFileSync(previewPath, html)
  
  res.send('ok')
})

export default router 