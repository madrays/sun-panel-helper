import { Router } from 'express'
import socialistValuesRouter from './socialist-values'

const router = Router()

// 根路由
router.get('/', (req, res) => {
  res.json({ message: '点击特效API' })
})

// 社会主义核心价值观点击特效
router.use('/socialist-values', socialistValuesRouter)

export default router 