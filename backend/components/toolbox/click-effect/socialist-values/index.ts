import { Router } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { isDeployed, deploy, undeploy, getPreviewHtml } from './deploy'

// 创建路由
const router = Router()

// 获取特效状态
router.get('/status', async (req, res) => {
  try {
    const deployed = await isDeployed()
    res.json({ 
      success: true,
      isDeployed: deployed 
    })
  } catch (error) {
    console.error('获取特效状态失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取特效状态失败', 
      error: error instanceof Error ? error.message : String(error) 
    })
  }
})

// 检查其他特效状态
async function checkOtherEffects(): Promise<string | null> {
  // 检查index.js中是否有其他点击特效
  try {
    const customDir = path.join(process.cwd(), 'public', 'custom')
    const indexPath = path.join(customDir, 'index.js')
    
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8')
      // 检查是否有其他点击特效，但不是当前这个
      if (content.includes('// BEGIN CLICK-EFFECT') && 
          !content.includes('社会主义核心价值观点击特效')) {
        return 'ANOTHER_EFFECT_DEPLOYED'
      }
    }
    return null
  } catch (error) {
    console.error('检查其他特效失败:', error)
    return null
  }
}

// 部署特效
router.post('/deploy', async (req, res) => {
  try {
    const result = await deploy()
    if (result.success) {
      res.json({ 
        success: true,
        message: '特效部署成功' 
      })
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('部署特效失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '部署特效失败', 
      error: error instanceof Error ? error.message : String(error) 
    })
  }
})

// 取消部署
router.post('/undeploy', async (req, res) => {
  try {
    const result = await undeploy()
    if (result.success) {
      res.json({ 
        success: true,
        message: '特效已取消部署' 
      })
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('取消部署特效失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '取消部署特效失败', 
      error: error instanceof Error ? error.message : String(error) 
    })
  }
})

// 获取预览HTML
router.get('/preview', async (req, res) => {
  try {
    const html = await getPreviewHtml()
    res.send(html)
  } catch (error) {
    console.error('获取预览代码失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取预览代码失败', 
      error: error instanceof Error ? error.message : String(error) 
    })
  }
})

// 直接导出router对象
export default router 