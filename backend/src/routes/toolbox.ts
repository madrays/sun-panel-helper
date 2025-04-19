// 百宝箱工具API路由
import { Router } from 'express'

import lifelineFooterRouter from '../../components/toolbox/footer/lifeline-footer'
import icpFooterRouter from '../../components/toolbox/footer/icp-footer'
import socialistValuesRouter from '../../components/toolbox/click-effect/socialist-values'
import backgroundEffectRouter from '../../components/toolbox/background-effect'

const router = Router()

// 根路由
router.get('/', (req, res) => {
  res.json({ message: 'Toolbox API - 百宝箱工具' })
})

// 页脚特效
router.use('/footer/lifeline-footer', lifelineFooterRouter)
router.use('/footer/icp-footer', icpFooterRouter)

// 点击特效API
router.use('/click-effect/socialist-values', socialistValuesRouter)

// 背景特效API
router.use('/background-effect', backgroundEffectRouter)

export default router 