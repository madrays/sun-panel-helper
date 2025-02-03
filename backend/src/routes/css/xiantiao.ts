import { Router } from 'express'
import { deployXiantiao, undeployXiantiao, checkDeployed } from '../../../components/css/xiantiao/service'
import type { XiantiaoParams } from '../../../components/css/xiantiao/types'

const router = Router()

// 部署装饰线条组件
router.post('/deploy', async (req, res) => {
  try {
    const params = req.body as XiantiaoParams
    const result = await deployXiantiao(params)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('部署装饰线条组件失败:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

// 取消部署装饰线条组件
router.post('/undeploy', async (req, res) => {
  try {
    const result = await undeployXiantiao()
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('取消部署装饰线条组件失败:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

// 检查组件是否已部署
router.get('/deployed', async (req, res) => {
  try {
    const deployed = await checkDeployed()
    res.json({ deployed })
  } catch (error) {
    console.error('检查组件部署状态失败:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

export default router 