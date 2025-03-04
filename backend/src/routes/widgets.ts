import { Router } from 'express'
import trStatusRouter from './widgets/tr-status'
import qbStatusRouter from './widgets/qb-status'

const router = Router()

// 根路由
router.get('/', (req, res) => {
  res.json({ message: 'Widgets API' })
})


router.use('/tr-status', trStatusRouter)

router.use('/qb-status', qbStatusRouter)

export default router 