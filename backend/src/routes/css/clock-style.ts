import { Router } from 'express'
import { validateParams, generateCSS } from '../../../components/css/clock-style/service'
import { deploy, undeploy, isDeployed } from '../../../components/css/clock-style/deploy'

const router = Router()

// 检查部署状态
router.get('/deployed', async (req, res) => {
  try {
    const deployed = await isDeployed()
    res.json({ deployed })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '检查部署状态失败' 
    })
  }
})

// 部署
router.post('/deploy', async (req, res) => {
  try {
    const params = req.body
    
    // 验证参数
    const errors = validateParams(params)
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `参数验证失败: ${errors.join(', ')}`
      })
    }

    // 生成CSS并部署
    const css = generateCSS(params)
    await deploy(css)

    res.json({ 
      success: true, 
      message: '部署成功' 
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : '部署失败'
    })
  }
})

// 取消部署
router.post('/undeploy', async (req, res) => {
  try {
    await undeploy()
    res.json({ 
      success: true, 
      message: '取消部署成功' 
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '取消部署失败' 
    })
  }
})

export default router 