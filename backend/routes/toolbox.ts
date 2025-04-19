import { Router } from 'express'
import icpFooterRouter from '../components/toolbox/footer/icp-footer'
import lifelineFooterRouter from '../components/toolbox/footer/lifeline-footer'
import clickEffectRouter from '../components/toolbox/click-effect'

const router = Router()

// 页脚特效
router.use('/footer/icp-footer', icpFooterRouter)
router.use('/footer/lifeline-footer', lifelineFooterRouter)

// 点击特效API
router.use('/click-effect', clickEffectRouter)

// 背景特效API（占位）
router.get('/background-effect', (req, res) => {
  res.json({ message: '背景特效API' })
})

export default router 