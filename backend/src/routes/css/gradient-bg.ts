import { Router } from 'express'
import { validateParams, generateCSS, deploy, undeploy, isDeployed } from '../../../components/css/gradient-bg/service'

const router = Router()

router.post('/deploy', async (req, res) => {
  const params = req.body
  const errors = validateParams(params)
  
  if (errors.length > 0) {
    res.status(400).json({ success: false, errors })
    return
  }

  try {
    const css = generateCSS(params)
    await deploy(css)
    res.json({ success: true })
  } catch (error) {
    console.error('部署渐变背景组件失败:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

router.post('/undeploy', async (req, res) => {
  try {
    await undeploy()
    res.json({ success: true })
  } catch (error) {
    console.error('取消部署渐变背景组件失败:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

router.get('/deployed', async (req, res) => {
  try {
    const deployed = await isDeployed()
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