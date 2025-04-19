import { Router } from 'express'
import starBackgroundRouter from './star-background'

const router = Router()

// 根路由
router.get('/', (req, res) => {
  res.json({ message: '背景特效API' })
})

// 星空背景特效
router.use('/star-background', starBackgroundRouter)

export default router 