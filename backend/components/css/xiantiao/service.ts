import { readFileSync } from 'fs'
import { join } from 'path'
import { deploy, undeploy, isDeployed } from './deploy'
import type { XiantiaoParams } from './types'

// 使用join拼接路径
const configPath = join('components', 'css', 'xiantiao', 'config.json')
const templatePath = join('components', 'css', 'xiantiao', 'template.css')

// 直接读取配置文件
const config = JSON.parse(
  readFileSync(configPath, 'utf-8')
)

// 直接读取模板文件
const template = readFileSync(templatePath, 'utf-8')

/**
 * 生成CSS内容
 */
function generateCSS(params: XiantiaoParams): string {
  return `/* 背景线条样式 BY 香水 [二群大佬提供] */

/* 伪元素创建背景线条样式 */
.w-full .font-semibold:before {
  content: "";
  position: absolute;
  width: ${params.beforeCircleSize}px;
  height: ${params.beforeCircleSize}px;
  border-radius: 60%;
  background: ${params.beforeCircleColor};
  box-shadow: -8px 21px 0 ${params.beforeCircleShadowColor};
  z-index: -1;
  right: ${params.beforeCircleRight}px;
  top: ${params.beforeCircleTop}px;
  pointer-events: none;
}

/* 伪元素创建另一种背景线条样式 */
.w-full .font-semibold:after {
  content: "";
  position: absolute;
  width: ${params.afterCircleSize}px;
  height: ${params.afterCircleSize}px;
  border: ${params.afterCircleBorderWidth}px solid ${params.afterCircleColor};
  border-radius: 70%;
  z-index: -1;
  top: ${params.afterCircleTop}px;
  right: ${params.afterCircleRight}px;
  pointer-events: none;
}

/* 设置图标信息框的圆角样式 */
.icon-info-box .rounded-2xl {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  -webkit-backdrop-filter: blur(${params.blurAmount}px);
  backdrop-filter: blur(${params.blurAmount}px);
}`
}

/**
 * 部署装饰线条组件
 * @param params 组件参数
 */
export async function deployXiantiao(params: XiantiaoParams): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // 1. 验证参数
    validateParams(params)
    
    // 2. 生成CSS
    const css = generateCSS(params)
    
    // 3. 部署CSS
    await deploy(css)
    
    return { success: true, message: '装饰线条组件部署成功' }
  } catch (error) {
    console.error('部署装饰线条组件失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '装饰线条组件部署失败'
    }
  }
}

/**
 * 取消部署装饰线条组件
 */
export async function undeployXiantiao(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await undeploy()
    return { success: true, message: '装饰线条组件取消部署成功' }
  } catch (error) {
    console.error('取消部署装饰线条组件失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '装饰线条组件取消部署失败'
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
function validateParams(params: XiantiaoParams): void {
  const { params: configParams } = config
  
  for (const param of configParams) {
    const value = params[param.name as keyof XiantiaoParams]
    
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
    
    if (param.type === 'color' && typeof value !== 'string') {
      throw new Error(`参数 ${param.name} 必须是颜色字符串`)
    }
  }
} 