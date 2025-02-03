import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'

// 运行时已在backend目录下，使用join拼接路径
const outputPath = join('custom', 'index.css')

// 组件标记
const startMark = '/* Sun-Panel-Helper CSS Start: mouse-cursor */'
const endMark = '/* Sun-Panel-Helper CSS End: mouse-cursor */'

/**
 * 生成头部注释
 */
function generateHeaderComment(): string {
  const now = new Date()
  return `/* Sun-Panel-Helper CSS */
/* 组件：鼠标指针 */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致样式冲突或程序异常 */
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
function removeOldComponent(content: string): string {
  // 1. 移除旧的头部注释
  const headerPattern = /\/\* Sun-Panel-Helper CSS \*\/[\s\S]*?\/\* 上次更新：.*?\*\/\n*/
  content = content.replace(headerPattern, '')

  // 2. 移除旧的组件代码
  const componentPattern = new RegExp(`\\n*${startMark}[\\s\\S]*?${endMark}\\n*`)
  content = content.replace(componentPattern, '\n')

  return content.trim()
}

/**
 * 添加新的组件代码
 */
function addNewComponent(content: string, css: string): string {
  const componentCode = `${startMark}
${css.trim()}
${endMark}`

  // 如果内容为空，添加头部注释和组件代码
  if (!content) {
    return generateHeaderComment() + componentCode
  }

  // 如果已有内容，只更新时间并添加组件代码
  return updateHeaderTime(content.trim()) + '\n\n' + componentCode
}

/**
 * 部署CSS
 * @param css CSS内容
 */
export async function deploy(css: string): Promise<void> {
  try {
    console.log('部署路径:', outputPath)
    
    // 1. 确保部署目录存在
    await mkdir(dirname(outputPath), { recursive: true })

    // 2. 读取现有文件
    let content = ''
    let isAlreadyDeployed = false
    try {
      content = await readFile(outputPath, 'utf-8')
      console.log('读取现有文件成功')
      // 检查是否已部署
      isAlreadyDeployed = content.includes(startMark)
      if (isAlreadyDeployed) {
        console.log('检测到已部署，将更新现有部署')
      }
    } catch (error) {
      // 文件不存在时创建空文件
      console.log('文件不存在,将创建新文件')
      content = ''
    }

    // 3. 如果已部署，移除旧的组件代码，但保留头部注释
    if (isAlreadyDeployed) {
      const startIndex = content.indexOf(startMark)
      const endIndex = content.indexOf(endMark, startIndex) + endMark.length
      if (startIndex !== -1 && endIndex !== -1) {
        content = content.slice(0, startIndex).trim() + content.slice(endIndex).trim()
      }
    }

    // 4. 如果没有头部注释，添加头部注释；否则只更新时间
    if (!content.includes('/* Sun-Panel-Helper CSS */')) {
      content = generateHeaderComment() + (content ? content.trim() + '\n\n' : '')
    } else {
      content = updateHeaderTime(content.trim())
    }

    // 5. 添加新的组件代码，确保只有两个换行符
    content = content.trim() + '\n\n' + `${startMark}\n${css.trim()}\n${endMark}`

    // 6. 写入文件，确保文件末尾只有一个换行符
    await writeFile(outputPath, content.trim() + '\n', 'utf-8')
    console.log(isAlreadyDeployed ? '更新部署成功' : '新部署成功')
  } catch (error) {
    console.error('部署CSS失败:', error)
    throw error
  }
}

/**
 * 取消部署
 */
export async function undeploy(): Promise<void> {
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

    // 3. 移除组件代码块（包括注释标记）
    const startIndex = content.indexOf(startMark)
    const endIndex = content.indexOf(endMark, startIndex) + endMark.length
    if (startIndex !== -1 && endIndex !== -1) {
      // 删除组件代码块和周围的空行
      content = content.slice(0, startIndex).trim() + '\n\n' + content.slice(endIndex).trim()
    }

    // 4. 更新时间
    content = updateHeaderTime(content.trim())

    // 5. 写入文件，确保文件末尾只有一个换行符
    await writeFile(outputPath, content.trim() + '\n', 'utf-8')
    console.log('取消部署成功')
  } catch (error) {
    console.error('取消部署CSS失败:', error)
    throw error
  }
}

/**
 * 检查组件是否已部署
 */
export async function isDeployed(): Promise<boolean> {
  try {
    // 1. 读取文件
    const content = await readFile(outputPath, 'utf-8')
    
    // 2. 检查是否包含组件标记
    return content.includes(startMark)
  } catch (error) {
    // 文件不存在或读取失败，说明未部署
    return false
  }
} 