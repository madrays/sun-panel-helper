import { Router } from 'express'
import { deploy, undeploy, isDeployed } from './deploy'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

// 配置存储路径 - 放在正确位置
const CONFIG_PATH = 'data/toolbox/footer/icp-footer/config.json'

// 默认配置
const defaultConfig = {
  icpNumber: '',
  gonganNumber: '',
  gonganLink: 'http://www.beian.gov.cn',
  textColor: '#909399',
  linkColor: '#409EFF',
  separatorColor: '#DCDFE6'  // 添加默认分隔符颜色
}

// 路由
const router = Router()

/**
 * 保存配置到文件
 */
async function saveConfig(config: any): Promise<void> {
  try {
    // 确保目录存在
    await mkdir(dirname(CONFIG_PATH), { recursive: true })
    // 保存配置
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
  } catch (error) {
    console.error('保存配置失败:', error)
    throw error
  }
}

/**
 * 获取页脚配置和部署状态
 */
router.get('/config', async (req, res) => {
  try {
    const deployed = await isDeployed()

    let config = { ...defaultConfig }
    
    try {
      await mkdir(dirname(CONFIG_PATH), { recursive: true })
      const configStr = await readFile(CONFIG_PATH, 'utf-8')
      const loadedConfig = JSON.parse(configStr)
      
      // 合并配置，确保字段完整
      config = { ...defaultConfig, ...loadedConfig }
      
    } catch (error) {
      // 文件不存在或解析错误，使用默认配置并保存
      console.log('配置文件不存在或解析失败，使用默认配置', error)
      await saveConfig(config)
    }

    res.json({
      success: true,
      deployed,
      config
    })
  } catch (error) {
    console.error('获取状态失败:', error)
    res.status(500).json({
      success: false,
      message: '获取状态失败:' + (error as Error).message
    })
  }
})

/**
 * 实时保存配置（不部署）
 */
router.post('/save-config', async (req, res) => {
  try {
    // 获取配置
    const config = req.body
    
    // 保存配置
    await saveConfig(config)
    
    res.json({
      success: true,
      message: '配置保存成功'
    })
  } catch (error) {
    console.error('保存配置失败:', error)
    res.status(500).json({
      success: false,
      message: '保存配置失败:' + (error as Error).message
    })
  }
})

/**
 * 部署页脚
 */
router.post('/deploy', async (req, res) => {
  try {
    // 检查是否有其他页脚已部署
    const isOtherDeployed = await isOtherFooterDeployed()
    if (isOtherDeployed) {
      return res.status(400).json({
        success: false,
        message: '当前已有其他页脚部署，请先取消部署',
        error: 'ANOTHER_FOOTER_DEPLOYED'
      })
    }

    // 获取配置
    const config = req.body
    
    // 检查ICP备案号是否为空
    if (!config.icpNumber || config.icpNumber.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'ICP备案号不能为空，请输入备案号',
        error: 'EMPTY_ICP_NUMBER'
      })
    }
    
    // 保存配置
    await saveConfig(config)
    
    // 部署页脚
    await deploy(config)
    
    res.json({
      success: true,
      message: '部署成功'
    })
  } catch (error) {
    console.error('部署失败:', error)
    res.status(500).json({
      success: false,
      message: '部署失败:' + (error as Error).message
    })
  }
})

/**
 * 取消部署页脚
 */
router.post('/undeploy', async (req, res) => {
  try {
    // 取消部署
    await undeploy()
    
    res.json({
      success: true,
      message: '取消部署成功'
    })
  } catch (error) {
    console.error('取消部署失败:', error)
    res.status(500).json({
      success: false,
      message: '取消部署失败:' + (error as Error).message
    })
  }
})

/**
 * 检查其他页脚是否已部署
 */
async function isOtherFooterDeployed(): Promise<boolean> {
  try {
    const customJsPath = join('custom', 'index.js')
    
    // 检查文件是否存在
    if (!existsSync(customJsPath)) {
      return false
    }
    
    // 读取文件内容
    const content = await readFile(customJsPath, 'utf-8')
    
    // 检查是否包含其他页脚标记
    const otherFooters = [
      'lifeline-footer',
      'fancy-footer'
      // 添加其他可能的页脚名称
    ]
    
    for (const footer of otherFooters) {
      if (content.includes(`/* Sun-Panel-Helper JS Start: ${footer} */`)) {
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('检查其他页脚失败:', error)
    return false
  }
}

export default router