import { Router } from 'express'
import trStatusRouter from './widgets/tr-status'
import qbStatusRouter from './widgets/qb-status'

const router = Router()

// 根路由
router.get('/', (req, res) => {
  res.json({ message: 'Widgets API' })
})

console.log('注册TR状态路由...');
router.use('/tr-status', trStatusRouter)
console.log('TR状态路由注册完成');

console.log('注册QB状态路由...');
router.use('/qb-status', qbStatusRouter)
console.log('QB状态路由注册完成');

export default router 