import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string
      }
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未授权访问' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key')
    
    if (typeof decoded === 'object' && decoded.username) {
      req.user = {
        username: decoded.username
      }
      next()
    } else {
      res.status(401).json({ message: '无效的 token' })
    }
  } catch (error) {
    res.status(401).json({ message: '认证失败' })
  }
} 