import { readFileSync } from 'fs'
import { join } from 'path'
import { deploy, undeploy, isDeployed } from './deploy'
import type { CardHoverParams } from './types'

// 配置参数类型定义
interface ConfigParam {
  name: string
  type: 'string' | 'number' | 'boolean'
  min?: number
  max?: number
}

interface Config {
  params: Record<keyof CardHoverParams, ConfigParam>
}

// 使用join拼接路径
const configPath = join('components', 'css', 'card-hover', 'config.json')
const templatePath = join('components', 'css', 'card-hover', 'template.css')

// 直接读取配置文件
const config = JSON.parse(
  readFileSync(configPath, 'utf-8')
) as Config

// 直接读取模板文件
const template = readFileSync(templatePath, 'utf-8')

/**
 * 生成CSS内容
 */
function generateCSS(params: CardHoverParams): string {
  // 生成CSS变量
  const cssVars = `
.icon-info-box .rounded-2xl {
  --scale-size: ${params.enableScale ? params.scaleSize : 1};
  --shake-degree: ${params.shakeDegree}deg;
  --shake-speed: ${params.shakeSpeed}s;
  --scale-delay: ${params.enableScale ? params.scaleDelay : 0}s;
}
`
  return cssVars + template
}

/**
 * 部署卡片悬停动画组件
 * @param params 组件参数
 */
export async function deployCardHover(params: CardHoverParams): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // 1. 验证参数
    validateParams(params)
    
    // 2. 生成CSS
    const css = generateCSS(params)
    
    // 3. 部署CSS
    await deploy(css)
    
    return { success: true, message: '卡片悬停动画组件部署成功' }
  } catch (error) {
    console.error('部署卡片悬停动画组件失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '卡片悬停动画组件部署失败'
    }
  }
}

/**
 * 取消部署卡片悬停动画组件
 */
export async function undeployCardHover(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await undeploy()
    return { success: true, message: '卡片悬停动画组件取消部署成功' }
  } catch (error) {
    console.error('取消部署卡片悬停动画组件失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '卡片悬停动画组件取消部署失败'
    }
  }
}

/**
 * 检查组件是否已部署
 */
export async function checkDeployed(): Promise<boolean> {
  return await isDeployed()
}

/**
 * 验证参数
 */
function validateParams(params: CardHoverParams): void {
  const { params: configParams } = config
  
  for (const [key, param] of Object.entries(configParams)) {
    const value = params[key as keyof CardHoverParams]
    
    // 检查必填
    if (value === undefined) {
      throw new Error(`缺少参数: ${param.name}`)
    }
    
    // 检查类型
    if (param.type === 'number') {
      if (typeof value !== 'number') {
        throw new Error(`参数 ${param.name} 必须是数字`)
      }
      if (param.min !== undefined && value < param.min) {
        throw new Error(`参数 ${param.name} 不能小于 ${param.min}`)
      }
      if (param.max !== undefined && value > param.max) {
        throw new Error(`参数 ${param.name} 不能大于 ${param.max}`)
      }
    }
    
    if (param.type === 'string' && typeof value !== 'string') {
      throw new Error(`参数 ${param.name} 必须是字符串`)
    }
    
    if (param.type === 'boolean' && typeof value !== 'boolean') {
      throw new Error(`参数 ${param.name} 必须是布尔值`)
    }
  }
} 