import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'

// 部署路径
const jsOutputPath = join('custom', 'index.js')
const cssOutputPath = join('custom', 'index.css')

// 组件标记
const jsStartMark = '/* Sun-Panel-Helper JS Start: fixed-widgets */'
const jsEndMark = '/* Sun-Panel-Helper JS End: fixed-widgets */'
const cssStartMark = '/* Sun-Panel-Helper CSS Start: fixed-widgets */'
const cssEndMark = '/* Sun-Panel-Helper CSS End: fixed-widgets */'

/**
 * 生成JS头部注释
 */
function generateJSHeaderComment(): string {
  const now = new Date()
  return `/* Sun-Panel-Helper JS */
/* 组件：固定组件 */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致功能冲突或程序异常 */
/* 上次更新：${now.toLocaleString('zh-CN')} */

`
}

/**
 * 生成CSS头部注释
 */
function generateCSSHeaderComment(): string {
  const now = new Date()
  return `/* Sun-Panel-Helper CSS */
/* 组件：固定组件 */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致样式冲突或程序异常 */
/* 上次更新：${now.toLocaleString('zh-CN')} */

`
}

/**
 * 更新头部注释的时间
 */
function updateHeaderTime(content: string, isJS: boolean): string {
  const now = new Date()
  const timeStr = now.toLocaleString('zh-CN')
  return content.replace(
    /\/\* 上次更新：.*?\*\//, 
    `/* 上次更新：${timeStr} */`
  )
}

/**
 * 从内容中移除旧的组件代码
 */
function removeOldComponent(content: string, startMark: string, endMark: string): string {
  // 找到组件代码块的位置
  const startIndex = content.indexOf(startMark)
  if (startIndex === -1) return content
  
  const endIndex = content.indexOf(endMark, startIndex)
  if (endIndex === -1) return content
  
  // 只移除组件代码块，保留其他内容
  return content.slice(0, startIndex) + content.slice(endIndex + endMark.length).replace(/^\n+/, '')
}

/**
 * 添加新的组件代码
 */
function addNewComponent(content: string, code: string, startMark: string, endMark: string, isJS: boolean): string {
  const componentCode = `${startMark}\n${code.trim()}\n${endMark}`

  // 如果内容为空，添加头部注释和组件代码
  if (!content) {
    const header = isJS ? generateJSHeaderComment() : generateCSSHeaderComment()
    return header + componentCode
  }

  // 如果已有内容，只更新时间并添加组件代码
  const updated = updateHeaderTime(content.trim(), isJS)
  return updated + '\n\n' + componentCode
}

/**
 * 部署组件
 */
export async function deploy(js: string, css: string): Promise<void> {
  try {
    // 部署 JS
    await deployFile(js, jsOutputPath, jsStartMark, jsEndMark)
    // 部署 CSS
    await deployFile(css, cssOutputPath, cssStartMark, cssEndMark)
  } catch (error) {
    console.error('部署组件失败:', error)
    throw error
  }
}

/**
 * 部署单个文件
 */
async function deployFile(content: string, outputPath: string, startMark: string, endMark: string): Promise<void> {
  console.log('部署路径:', outputPath)
  
  // 1. 确保部署目录存在
  await mkdir(dirname(outputPath), { recursive: true })

  // 2. 读取现有文件
  let fileContent = ''
  let isAlreadyDeployed = false
  try {
    fileContent = await readFile(outputPath, 'utf-8')
    console.log('读取现有文件成功')
    isAlreadyDeployed = fileContent.includes(startMark)
    if (isAlreadyDeployed) {
      console.log('检测到已部署，将更新现有部署')
    }
  } catch (error) {
    console.log('文件不存在,将创建新文件')
  }

  // 3. 如果已部署，移除旧的组件代码
  if (isAlreadyDeployed) {
    fileContent = removeOldComponent(fileContent, startMark, endMark)
  }

  // 4. 添加新的组件代码
  const componentCode = `${startMark}\n${content.trim()}\n${endMark}`
  fileContent = fileContent.trim() + '\n\n' + componentCode

  // 5. 写入文件
  await writeFile(outputPath, fileContent, 'utf-8')
  console.log(isAlreadyDeployed ? '更新部署成功' : '新部署成功')
}

/**
 * 取消部署
 */
export async function undeploy(): Promise<void> {
  try {
    // 取消部署 JS
    await undeployFile(jsOutputPath, jsStartMark, jsEndMark)
    // 取消部署 CSS
    await undeployFile(cssOutputPath, cssStartMark, cssEndMark)
  } catch (error) {
    console.error('取消部署失败:', error)
    throw error
  }
}

/**
 * 取消部署单个文件
 */
async function undeployFile(outputPath: string, startMark: string, endMark: string): Promise<void> {
  try {
    console.log('准备取消部署，路径:', outputPath)
    
    // 1. 读取现有文件
    let content = ''
    try {
      content = await readFile(outputPath, 'utf-8')
      console.log('成功读取现有文件')
    } catch (error) {
      console.log('文件不存在，无需取消部署')
      return
    }

    // 2. 检查是否包含组件代码
    if (!content.includes(startMark)) {
      console.log('文件中不包含该组件代码，无需取消部署')
      return
    }

    // 3. 移除组件代码块
    content = removeOldComponent(content, startMark, endMark)

    // 4. 写入文件
    await writeFile(outputPath, content, 'utf-8')
    console.log('取消部署成功')
  } catch (error) {
    console.error('取消部署失败:', error)
    throw error
  }
}

/**
 * 检查组件是否已部署
 */
export async function isDeployed(): Promise<boolean> {
  try {
    const jsContent = await readFile(jsOutputPath, 'utf-8')
    const cssContent = await readFile(cssOutputPath, 'utf-8')
    return jsContent.includes(jsStartMark) && cssContent.includes(cssStartMark)
  } catch (error) {
    return false
  }
} 