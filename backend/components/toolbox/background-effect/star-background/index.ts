import { Router } from 'express'
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