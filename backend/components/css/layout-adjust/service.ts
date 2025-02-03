import { readFileSync } from 'fs'
import { join } from 'path'
import { LayoutAdjustParams } from './types'
import * as deployUtils from './deploy'

const configPath = join(__dirname, 'config.json')

interface ConfigParam {
  name: string
  type: 'boolean' | 'number'
  min?: number
  max?: number
}

interface Config {
  params: Record<keyof LayoutAdjustParams, ConfigParam>
}

const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Config

/**
 * 验证参数
 */
export function validateParams(params: LayoutAdjustParams): string[] {
  const errors: string[] = []
  
  Object.entries(params).forEach(([key, value]) => {
    const param = config.params[key as keyof LayoutAdjustParams]
    if (!param) {
      errors.push(`Unknown parameter: ${key}`)
      return
    }

    if (param.type === 'number') {
      if (typeof value !== 'number') {
        errors.push(`${param.name} must be a number`)
        return
      }
      if (param.min !== undefined && value < param.min) {
        errors.push(`${param.name} must be greater than or equal to ${param.min}`)
      }
      if (param.max !== undefined && value > param.max) {
        errors.push(`${param.name} must be less than or equal to ${param.max}`)
      }
    } else if (param.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${param.name} must be a boolean`)
    }
  })

  return errors
}

/**
 * 生成CSS内容
 */
export function generateCSS(params: LayoutAdjustParams): string {
  return `${params.showClock ? '' : `
.clock,
.clock-time,
.clock-date,
.clock-week,
.divider {
  display: none !important;
}`}

.search-container {
  margin-top: ${params.searchMarginTop}px !important;
}

.system-monitor {
  margin-top: ${params.systemMarginTop}px !important;
}`
}

/**
 * 部署组件
 */
export async function deploy(params: LayoutAdjustParams): Promise<void> {
  const css = generateCSS(params)
  await deployUtils.deploy(css)
}

export const undeploy = deployUtils.undeploy
export const isDeployed = deployUtils.isDeployed 