import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { deploy, undeploy, isDeployed } from './deploy'
import { readdirSync } from 'fs'

// 读取模板文件
const jsTemplate = readFileSync(join(__dirname, 'template.js'), 'utf-8')
const cssTemplate = readFileSync(join(__dirname, 'template.css'), 'utf-8')

/**
 * 生成组件代码
 */
function generateCode(widgets: any[], customCode: string) {

  
  // 生成 widgets 数组字符串
  const widgetsCode = widgets.map(widget => {
    if (widget.type === 'break') {
      return '    { type: "break" }';
    }
    
    // 如果是天气组件，复制模板文件
    if (widget.name === '天气预报') {
      // 1. 先检查是否已有动态生成的文件
      const weatherDir = join(__dirname, '../../custom/helper/weather-widget')
      const files = readdirSync(weatherDir)
      const existingFile = files.find(f => f.startsWith('weather-') && f.endsWith('.html'))
      
      let filename
      if (existingFile) {
        // 使用已存在的文件
        filename = existingFile

      } else {
        // 生成新文件
        const timestamp = Date.now()
        filename = `weather-${timestamp}.html`
        const templatePath = join(weatherDir, 'weather-widget.html')
        const newPath = join(weatherDir, filename)
        
        // 复制模板文件
        const template = readFileSync(templatePath, 'utf-8')
        writeFileSync(newPath, template, 'utf-8')
        
      }
      
      return `    {
        type: '${widget.type}',
        url: '/custom/helper/weather-widget/${filename}',
        height: '${widget.height}',
        width: '${widget.width}px',
        mobileShow: ${widget.mobileShow}
      }`;
    }
    
    return `    {
      type: '${widget.type}',
      url: '${widget.url}',
      height: '${widget.height}',
      width: '${widget.width}px',
      mobileShow: ${widget.mobileShow}
    }`;
  }).join(',\n');
  
  let js = jsTemplate
    .replace('const WIDGETS = []', `const WIDGETS = [\n${widgetsCode}\n]`)
    .replace(
      '// ======================用户自定义页脚代码放在这下面======================',
      customCode || ''
    )
  return {
    js,
    css: cssTemplate
  }
}

/**
 * 部署固定组件
 */
export async function deployFixedWidgets(widgets: any[], customCode: string): Promise<void> {
  
  
  const { js, css } = generateCode(widgets, customCode)

  try {
    await deploy(js, css)
  } catch (error) {
    console.error('部署失败:', error)
    throw error
  }
}

export { undeploy, isDeployed } 