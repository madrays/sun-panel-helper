import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import UserModel from '../models/user'
import { auth } from '../middleware/auth'

const router = Router()

// 登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    console.log('Login attempt:', { username, password }) // 添加日志
    
    const user = UserModel.findByUsername(username)
    if (!user) {
      console.log('User not found:', username) // 添加日志
      return res.status(401).json({
        code: 1,
        message: '用户名或密码错误'
      })
    }
    
    const isValid = await UserModel.validatePassword(user, password)
    if (!isValid) {
      console.log('Invalid password for user:', username) // 添加日志
      return res.status(401).json({
        code: 1,
        message: '用户名或密码错误'
      })
    }
    
    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    )
    
    const userInfo = UserModel.getUserInfo(username)
    console.log('Login successful:', { username, userInfo }) // 添加日志
    
    res.json({
      code: 0,
      data: {
        token,
        userInfo
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      code: 1,
      message: '服务器错误'
    })
  }
})

// 获取用户信息
router.get('/user/info', auth, (req: Request, res: Response) => {
  try {
    if (!req.user?.username) {
      return res.status(401).json({
        code: 1,
        message: '未授权访问'
      })
    }
    
    const userInfo = UserModel.getUserInfo(req.user.username)
    if (!userInfo) {
      return res.status(404).json({
        code: 1,
        message: '用户不存在'
      })
    }
    
    res.json({
      code: 0,
      data: userInfo
    })
  } catch (error) {
    console.error('Get user info error:', error)
    res.status(500).json({
      code: 1,
      message: '服务器错误'
    })
  }
})

// 修改密码
router.post('/user/change-password', auth, async (req: Request, res: Response) => {
  try {
    if (!req.user?.username) {
      return res.status(401).json({
        code: 1,
        message: '未授权访问'
      })
    }
    
    const { currentPassword, newPassword, username: newUsername } = req.body
    const user = UserModel.findByUsername(req.user.username)
    
    if (!user) {
      return res.status(404).json({
        code: 1,
        message: '用户不存在'
      })
    }
    
    const isValid = await UserModel.validatePassword(user, currentPassword)
    if (!isValid) {
      return res.status(400).json({
        code: 1,
        message: '当前密码错误'
      })
    }
    
    await UserModel.changePassword(req.user.username, newPassword, newUsername)
    
    res.json({
      code: 0,
      data: null,
      message: newUsername ? '用户名和密码修改成功' : '密码修改成功'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      code: 1,
      message: '服务器错误'
    })
  }
})

export default router 