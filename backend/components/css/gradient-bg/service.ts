import { readFileSync } from 'fs'
import { join } from 'path'
import { GradientBgParams } from './types'
import * as deployUtils from './deploy'

const configPath = join(__dirname, 'config.json')
const templatePath = join(__dirname, 'template.css')

interface ConfigParam {
  name: string
  type: 'string' | 'number'
  min?: number
  max?: number
}

interface Config {
  params: Record<keyof GradientBgParams, ConfigParam>
}

const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Config

/**
 * 验证参数
 */
export function validateParams(params: GradientBgParams): string[] {
  const errors: string[] = []
  
  Object.entries(params).forEach(([key, value]) => {
    const param = config.params[key as keyof GradientBgParams]
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
    }
  })

  return errors
}

/**
 * 生成CSS内容
 */
export function generateCSS(params: GradientBgParams): string {
  return `body {
  height: 100vh;
  background: linear-gradient(${params.angle}deg, ${params.color1}, ${params.color2}, ${params.color3}, ${params.color4});
  background-size: 400% 400%;
  animation: gradientBg ${params.duration}s ease-in-out infinite;
}

@keyframes gradientBg {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}`
}

export const deploy = deployUtils.deploy
export const undeploy = deployUtils.undeploy
export const isDeployed = deployUtils.isDeployed 