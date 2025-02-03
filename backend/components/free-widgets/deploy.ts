import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'

// 部署路径
const jsOutputPath = join('custom', 'index.js')

// 组件标记
const jsStartMark = '/* Sun-Panel-Helper JS Start: free-widgets */'
const jsEndMark = '/* Sun-Panel-Helper JS End: free-widgets */'

/**
 * 生成JS头部注释
 */
function generateJSHeaderComment(): string {
  const now = new Date()
  return `/* Sun-Panel-Helper JS */
/* 组件：自由组件 */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致功能冲突或程序异常 */
/* 上次更新：${now.toLocaleString('zh-CN')} */

`
}

/**
 * 更新头部注释的时间
 */
function updateHeaderTime(content: string): string {
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
function addNewComponent(content: string, code: string, startMark: string, endMark: string): string {
  const componentCode = `${startMark}
${code.trim()}
${endMark}`

  // 如果内容为空，添加头部注释和组件代码
  if (!content) {
    return generateJSHeaderComment() + componentCode
  }

  // 如果已有内容，只更新时间并添加组件代码
  const updated = updateHeaderTime(content.trim())
  return updated + '\n\n' + componentCode
}

/**
 * 部署组件
 */
export async function deploy(js: string): Promise<void> {
  try {
    await deployFile(js, jsOutputPath, jsStartMark, jsEndMark)
  } catch (error) {
    console.error('部署组件失败:', error)
    throw error
  }
}

/**
 * 部署单个文件
 */
async function deployFile(content: string, outputPath: string, startMark: string, endMark: string): Promise<void> {
  console.log('部署JS路径:', outputPath)
  
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
  fileContent = addNewComponent(fileContent, content, startMark, endMark)

  // 5. 写入文件
  await writeFile(outputPath, fileContent, 'utf-8')
  console.log(isAlreadyDeployed ? '更新部署成功' : '新部署成功')
}

/**
 * 取消部署
 */
export async function undeploy(): Promise<void> {
  try {
    await undeployFile(jsOutputPath, jsStartMark)
  } catch (error) {
    console.error('取消部署失败:', error)
    throw error
  }
}

/**
 * 取消部署单个文件
 */
async function undeployFile(outputPath: string, startMark: string): Promise<void> {
  try {
    console.log('准备取消部署JS，路径:', outputPath)
    
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
    content = removeOldComponent(content, startMark, jsEndMark)

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
    const content = await readFile(jsOutputPath, 'utf-8')
    return content.includes(jsStartMark)
  } catch (error) {
    return false
  }
} 