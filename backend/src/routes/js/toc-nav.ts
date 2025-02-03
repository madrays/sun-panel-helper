import { Router } from 'express'
import { validateParams, generateJS, deploy, undeploy, isDeployed } from '../../../components/js/toc-nav/service'
import type { TocNavParams } from '../../../components/js/toc-nav/types'

const router = Router()

// 获取配置
router.get('/config', (_req, res) => {
  try {
    const config = {
      theme: {
        background: 'rgba(42, 42, 42, 0.42)',
        text: '#ffffff',
        hover: 'rgba(255, 255, 255, 0.2)',
        active: 'rgba(255, 255, 255, 0.3)'
      }
    }
    res.json(config)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '读取配置失败'
    })
  }
})

// 部署
router.post('/deploy', async (req, res) => {
  try {
    const params = req.body as TocNavParams

    // 验证参数
    const errors = validateParams(params)
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      })
    }

    // 生成并部署JS
    const js = generateJS(params)
    await deploy(js)

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '部署失败'
    })
  }
})

// 取消部署
router.post('/undeploy', async (_req, res) => {
  try {
    await undeploy()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '取消部署失败'
    })
  }
})

// 检查部署状态
router.get('/deployed', async (_req, res) => {
  try {
    const deployed = await isDeployed()
    res.json({ deployed })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '检查部署状态失败'
    })
  }
})

export default router 