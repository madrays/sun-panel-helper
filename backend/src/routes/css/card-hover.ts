import { Router } from 'express'
import { deployCardHover, undeployCardHover, checkDeployed } from '../../../components/css/card-hover/service'
import type { CardHoverParams } from '../../../components/css/card-hover/types'

const router = Router()

// 部署卡片悬停动画组件
router.post('/deploy', async (req, res) => {
  try {
    const params = req.body as CardHoverParams
    const result = await deployCardHover(params)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('部署卡片悬停动画组件失败:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

// 取消部署卡片悬停动画组件
router.post('/undeploy', async (req, res) => {
  try {
    const result = await undeployCardHover()
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('取消部署卡片悬停动画组件失败:', error)
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