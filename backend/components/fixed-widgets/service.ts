import { readFileSync } from 'fs'
import { join } from 'path'
import { deploy, undeploy, isDeployed } from './deploy'

// 读取模板文件
const jsTemplate = readFileSync(join(__dirname, 'template.js'), 'utf-8')
const cssTemplate = readFileSync(join(__dirname, 'template.css'), 'utf-8')

/**
 * 生成组件代码
 */
function generateCode(widgets: any[], customCode: string): { js: string; css: string } {
  // 生成 widgets 数组字符串
  const widgetsCode = widgets.map(widget => {
    if (widget.type === 'break') {
      return '    { type: "break" }';
    }
    return `    {
        type: '${widget.type}',
        url: '${widget.url}',
        height: '${widget.height}',
        width: '${widget.width}px',
        mobileShow: ${widget.mobileShow}
    }`;
  }).join(',\n');

  // 替换模板中的 WIDGETS 数组
  let js = jsTemplate.replace('const WIDGETS = []', `const WIDGETS = [\n${widgetsCode}\n]`);
  
  // 添加自定义代码，不添加注释
  if (customCode) {
    js = js.replace(
      '// ======================用户自定义页脚代码放在这下面======================',
      customCode
    )
  } else {
    // 如果没有自定义代码，直接移除注释
    js = js.replace(
      '// ======================用户自定义页脚代码放在这下面======================',
      ''
    )
  }
  
  // CSS 代码不需要替换，直接使用模板
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
  await deploy(js, css)
}

export { undeploy, isDeployed } 