import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { readFileSync } from 'fs'

// 运行时已在backend目录下，使用join拼接路径
const outputPath = join('custom', 'index.js')

// 组件标记
const startMark = '/* Sun-Panel-Helper JS Start: fish-animation */'
const endMark = '/* Sun-Panel-Helper JS End: fish-animation */'

// 读取组件顺序配置
const orderConfig = JSON.parse(
  readFileSync(join(__dirname, '../../config/order.json'), 'utf-8')
);

/**
 * 生成头部注释
 */
function generateHeaderComment(): string {
  const now = new Date()
  return `/* Sun-Panel-Helper JS */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致功能冲突或程序异常 */
/* 上次更新：${now.toLocaleString('zh-CN')} */\n`
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
 * 部署JS
 */
export async function deploy(js: string): Promise<void> {
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
      isAlreadyDeployed = content.includes(startMark)
      if (isAlreadyDeployed) {
        console.log('检测到已部署，将更新现有部署')
      }
    } catch (error) {
      console.log('文件不存在,将创建新文件')
    }

    // 3. 如果已部署，移除旧的组件代码
    if (isAlreadyDeployed) {
      const startIndex = content.indexOf(startMark)
      const endIndex = content.indexOf(endMark, startIndex) + endMark.length
      if (startIndex !== -1 && endIndex !== -1) {
        content = content.slice(0, startIndex).trim() + content.slice(endIndex).trim()
      }
    }

    // 4. 如果没有头部注释，添加头部注释；否则只更新时间
    if (!content.includes('/* Sun-Panel-Helper JS */')) {
      content = generateHeaderComment() + (content ? content.trim() + '\n\n' : '')
    } else {
      content = updateHeaderTime(content.trim())
    }

    // 获取插入位置
    const order = orderConfig.js;
    const currentIndex = order.indexOf('fish-animation');
    let insertIndex = content.length;  // 默认插入到末尾

    // 先找前面最后一个已部署的组件
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevComponent = order[i];
      const prevMark = `/* Sun-Panel-Helper JS End: ${prevComponent} */`;
      const prevIndex = content.lastIndexOf(prevMark);
      if (prevIndex !== -1) {
        insertIndex = prevIndex + prevMark.length;
        break;
      }
    }

    // 如果前面没找到，就找后面第一个已部署的组件
    if (insertIndex === content.length) {
      for (let i = currentIndex + 1; i < order.length; i++) {
        const nextComponent = order[i];
        const nextMark = `/* Sun-Panel-Helper JS Start: ${nextComponent} */`;
        const nextIndex = content.indexOf(nextMark);
        if (nextIndex !== -1) {
          insertIndex = nextIndex;
          break;
        }
      }
    }

    // 在正确的位置插入组件代码
    const newCode = `${startMark}\n${js.trim()}\n${endMark}`;
    content = content.slice(0, insertIndex) + (insertIndex === content.length ? '\n\n' : '') + newCode + (insertIndex === content.length ? '' : '\n\n') + content.slice(insertIndex);

    // 写入文件
    await writeFile(outputPath, content.trim() + '\n', 'utf-8');
    console.log(isAlreadyDeployed ? '更新部署成功' : '新部署成功');
  } catch (error) {
    console.error('部署JS失败:', error);
    throw error;
  }
}

/**
 * 取消部署
 */
export async function undeploy(): Promise<void> {
  try {
    console.log('准备取消部署，路径:', outputPath)
    
    let content = ''
    try {
      content = await readFile(outputPath, 'utf-8')
      console.log('成功读取现有文件')
    } catch (error) {
      console.log('文件不存在，无需取消部署')
      return
    }

    if (!content.includes(startMark)) {
      console.log('文件中不包含该组件代码，无需取消部署')
      return
    }

    const startIndex = content.indexOf(startMark)
    const endIndex = content.indexOf(endMark, startIndex) + endMark.length
    if (startIndex !== -1 && endIndex !== -1) {
      content = content.slice(0, startIndex) + content.slice(endIndex).replace(/^\n+/, '')
      console.log('已移除组件代码')
    }

    content = updateHeaderTime(content.trim())
    await writeFile(outputPath, content, 'utf-8')
    console.log('取消部署成功')
  } catch (error) {
    console.error('取消部署JS失败:', error)
    throw error
  }
}

/**
 * 检查组件是否已部署
 */
export async function isDeployed(): Promise<boolean> {
  try {
    const content = await readFile(outputPath, 'utf-8')
    return content.includes(startMark)
  } catch (error) {
    return false
  }
} 