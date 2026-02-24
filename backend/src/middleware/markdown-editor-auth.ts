import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import markdownEditorUserModel from '../models/markdown-editor-user'

declare global {
  namespace Express {
    interface Request {
      markdownEditorUser?: {
        username: string
      }
    }
  }
}

/**
 * Markdown Editor 专用的认证中间件
 * 验证 JWT Token 并检查用户是否在允许列表中
 */
export const markdownEditorAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    // 允许无 token 访问（用于匿名用户或本地存储模式）
    if (!authHeader) {
      return next()
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '无效的认证格式'
      })
    }

    const token = authHeader.split(' ')[1]

    // 特殊处理：如果是 'anonymous' token，允许匿名访问
    if (token === 'anonymous') {
      return next()
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-super-secret-jwt-key'
    ) as { username?: string }

    if (!decoded?.username) {
      return res.status(401).json({
        success: false,
        message: '无效的 token'
      })
    }

    // 检查用户是否在允许列表中
    const user = markdownEditorUserModel.findByUsername(decoded.username)
    if (!user) {
      return res.status(403).json({
        success: false,
        message: '用户未被授权访问 Markdown 编辑器'
      })
    }

    req.markdownEditorUser = { username: decoded.username }
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token 无效或已过期'
      })
    }

    console.error('Markdown editor auth error:', error)
    res.status(500).json({
      success: false,
      message: '认证失败'
    })
  }
}
