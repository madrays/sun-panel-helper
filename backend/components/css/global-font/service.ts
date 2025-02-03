import { readFileSync } from 'fs'
import { join } from 'path'
import { GlobalFontParams } from './types'
import * as deployUtils from './deploy'

// 使用join拼接路径
const configPath = join('components', 'css', 'global-font', 'config.json')

interface ConfigParam {
  name: string
  type: string
}

interface Config {
  params: Record<keyof GlobalFontParams, ConfigParam>
}

const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Config

const presetFonts = [
  { label: '江湖风古体', value: '江湖风古体' },
  { label: '马赛克MC风', value: '马赛克MC风' },
  { label: '猫啃圆珠体', value: '猫啃圆珠体' }
]

/**
 * 验证参数
 */
export function validateParams(params: GlobalFontParams): string[] {
  const errors: string[] = []
  
  if (!params.fontFamily) {
    errors.push('字体名称不能为空')
    return errors
  }

  // 检查是否是预设字体或已上传的字体
  const isPresetFont = presetFonts.some(font => font.value === params.fontFamily)
  const fontPath = join('custom', 'helper', 'font', `${params.fontFamily}.ttf`)
  let fontExists = false
  try {
    readFileSync(fontPath)
    fontExists = true
  } catch (error) {
    // 文件不存在
  }

  if (!isPresetFont && !fontExists) {
    errors.push('无效的字体名称')
  }

  return errors
}

/**
 * 生成CSS内容
 */
export function generateCSS(params: GlobalFontParams): string {
  return `/* 自定义字体 */
@font-face {
  font-family: "${params.fontFamily}";
  src: url("/custom/helper/font/${params.fontFamily}.ttf");
}
/* 自定义全局字体 */
* {
  font-family: ${params.fontFamily};
}`.trim()
}

/**
 * 部署全局字体组件
 */
export async function deploy(params: GlobalFontParams): Promise<void> {
  const errors = validateParams(params)
  if (errors.length > 0) {
    throw new Error(`参数验证失败：${errors.join(', ')}`)
  }
  
  const css = generateCSS(params)
  await deployUtils.deploy(css)
}

/**
 * 取消部署全局字体组件
 */
export const undeploy = deployUtils.undeploy

/**
 * 检查组件是否已部署
 */
export const isDeployed = deployUtils.isDeployed 