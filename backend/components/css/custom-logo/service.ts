import { readFileSync } from 'fs'
import { join } from 'path'
import { CustomLogoParams } from './types'
import * as deployUtils from './deploy'

// 使用join拼接路径
const configPath = join('components', 'css', 'custom-logo', 'config.json')

interface ConfigParam {
  name: string
  type: string
  min?: number
  max?: number
}

interface Config {
  params: Record<keyof CustomLogoParams, ConfigParam>
}

const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Config

/**
 * 验证参数
 */
export function validateParams(params: CustomLogoParams): string[] {
  const errors: string[] = []
  
  Object.entries(params).forEach(([key, value]) => {
    const param = config.params[key as keyof CustomLogoParams]
    if (!param) {
      errors.push(`未知参数: ${key}`)
      return
    }

    if (param.type === 'number') {
      if (typeof value !== 'number') {
        errors.push(`${param.name}必须是数字类型`)
        return
      }
      if (param.min !== undefined && value < param.min) {
        errors.push(`${param.name}不能小于${param.min}`)
      }
      if (param.max !== undefined && value > param.max) {
        errors.push(`${param.name}不能大于${param.max}`)
      }
    }

    if (param.type === 'string' && typeof value !== 'string') {
      errors.push(`${param.name}必须是字符串类型`)
    }
  })

  return errors
}

/**
 * 生成CSS内容
 */
export function generateCSS(params: CustomLogoParams): string {
  return `/* PC端Logo样式 */
.logo {
  width: ${params.pcWidth}px;
  height: ${params.pcHeight}px;
  margin-top: ${params.pcMarginTop}px;
  content: url(${params.pcLogo});
}

/* 手机端Logo样式 */
@media screen and (max-width: 768px) {
  .logo {
    width: ${params.mobileWidth}px;
    height: ${params.mobileHeight}px;
    margin-top: ${params.mobileMarginTop}px;
    content: url(${params.mobileLogo || params.pcLogo});
  }
}

/* 平板端Logo样式 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .logo {
    width: ${params.tabletWidth}px;
    height: ${params.tabletHeight}px;
    margin-top: ${params.tabletMarginTop}px;
    content: url(${params.tabletLogo || params.pcLogo});
  }
}`
}

/**
 * 部署自定义LOGO组件
 */
export async function deploy(params: CustomLogoParams): Promise<void> {
  const errors = validateParams(params)
  if (errors.length > 0) {
    throw new Error(`参数验证失败：${errors.join(', ')}`)
  }
  
  const css = generateCSS(params)
  await deployUtils.deploy(css)
}

/**
 * 取消部署自定义LOGO组件
 */
export const undeploy = deployUtils.undeploy

/**
 * 检查组件是否已部署
 */
export const isDeployed = deployUtils.isDeployed 