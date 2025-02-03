import { readFileSync } from 'fs'
import { join } from 'path'
import type { TocNavParams } from './types'

// 参数验证
export function validateParams(params: TocNavParams): string[] {
  const errors: string[] = []
  
  // 检查参数是否完整
  if (!params) {
    errors.push('参数不能为空')
    return errors
  }

  // 检查主题配置
  if (!params.theme) {
    errors.push('主题配置不能为空')
    return errors
  }

  const { theme } = params
  
  // 检查颜色值
  const colorRegex = /^#([0-9A-F]{3}){1,2}$/i
  const rgbaRegex = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*(?:0?\.)?\d+\s*)?\)$/i

  const validateColor = (color: string, name: string) => {
    if (!color) {
      errors.push(`${name}不能为空`)
    } else if (!colorRegex.test(color) && !rgbaRegex.test(color)) {
      errors.push(`${name}格式不正确，支持HEX或RGBA格式`)
    }
  }

  validateColor(theme.background, '背景颜色')
  validateColor(theme.text, '文字颜色')
  validateColor(theme.hover, '悬停颜色')
  validateColor(theme.active, '激活颜色')

  return errors
}

// 生成JS代码
export function generateJS(params: TocNavParams): string {
  const template = readFileSync(join(__dirname, 'template.js'), 'utf-8')
  
  return template
    .replace(/\{THEME_BACKGROUND\}/g, JSON.stringify(params.theme.background))
    .replace(/\{THEME_TEXT\}/g, JSON.stringify(params.theme.text))
    .replace(/\{THEME_HOVER\}/g, JSON.stringify(params.theme.hover))
    .replace(/\{THEME_ACTIVE\}/g, JSON.stringify(params.theme.active))
}

export { deploy, undeploy, isDeployed } from './deploy' 