import { readFileSync } from 'fs'
import { join } from 'path'
import { MouseCursorParams } from './types'
import * as deployUtils from './deploy'

// 使用join拼接路径
const configPath = join('components', 'css', 'mouse-cursor', 'config.json')
const templatePath = join('components', 'css', 'mouse-cursor', 'template.css')

interface ConfigParam {
  name: string
  type: 'string'
}

interface Config {
  params: Record<keyof MouseCursorParams, ConfigParam>
}

const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Config

/**
 * 验证参数
 */
export function validateParams(params: MouseCursorParams): string[] {
  const errors: string[] = []
  
  Object.entries(params).forEach(([key, value]) => {
    const param = config.params[key as keyof MouseCursorParams]
    if (!param) {
      errors.push(`未知参数: ${key}`)
      return
    }

    if (typeof value !== 'string') {
      errors.push(`${param.name}必须是字符串类型`)
    }
  })

  return errors
}

/**
 * 生成CSS内容
 */
export function generateCSS(params: MouseCursorParams): string {
  return `body {
  cursor: url(${params.defaultCursor}) 0 0, default !important;
}

.cursor-pointer,
a:hover,
button:hover,
.clickable:hover {
  cursor: url(${params.hoverCursor}) 0 0, pointer !important;
}`
}

/**
 * 部署鼠标指针组件
 */
export async function deploy(params: MouseCursorParams): Promise<void> {
  const errors = validateParams(params)
  if (errors.length > 0) {
    throw new Error(`参数验证失败：${errors.join(', ')}`)
  }
  
  const css = generateCSS(params)
  await deployUtils.deploy(css)
}

/**
 * 取消部署鼠标指针组件
 */
export const undeploy = deployUtils.undeploy

/**
 * 检查组件是否已部署
 */
export const isDeployed = deployUtils.isDeployed 