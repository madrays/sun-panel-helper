import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { join } from 'path'
import userRoutes from './routes/user'
import xiantiaoRoutes from './routes/css/xiantiao'
import cardHoverRoutes from './routes/css/card-hover'
import gradientBgRoutes from './routes/css/gradient-bg'
import mouseCursorRoutes from './routes/css/mouse-cursor'
import globalFontRoutes from './routes/css/global-font'
import customLogoRoutes from './routes/css/custom-logo'
import layoutAdjustRoutes from './routes/css/layout-adjust'
import clockStyleRoutes from './routes/css/clock-style'
import maxkbAiRoutes from './routes/js/maxkb-ai'
import searchQuoteRoutes from './routes/js/search-quote'
import fishAnimationRoutes from './routes/js/fish-animation'
import markdownEditorRoutes from './routes/js/markdown-editor'
import tocNavRoutes from './routes/js/toc-nav'
import fixedRoutes from './routes/fixed'
import freeRouter from './routes/free'
import previewRouter from './routes/preview'
import musicPlayerRoutes from './routes/js/music-player'
import hideLoginRoutes from './routes/js/hide-login'
import { mkdirSync, copyFileSync, PathLike, WriteStream, createWriteStream } from 'fs'
import '../components/services/file-order'
import fs from 'fs'
import multer from 'multer'

// 加载环境变量
config()

// 设置全局 umask
process.umask(0)

// 设置全局 multer 默认配置
const originalMulter = multer
const patchedMulter = function(options: any) {
  // 强制所有上传的文件权限为 777
  process.umask(0)
  return originalMulter(options)
}
patchedMulter.diskStorage = originalMulter.diskStorage
// @ts-ignore
global.multer = patchedMulter



const app = express()

// 添加全局 CORS 中间件
app.use(cors({
  origin: '*',  // 允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 解析 JSON
app.use(express.json())

// 创建必要的目录
try {
  // 创建数据目录
  mkdirSync(join(__dirname, '../data'), { recursive: true })
  // 创建鼠标指针图片目录
  const mouseCursorDir = join(__dirname, '../custom/helper/mouse')
  mkdirSync(mouseCursorDir, { recursive: true })
  console.log('Mouse cursor directory created at:', mouseCursorDir)
  // 创建Logo图片目录
  const logoDir = join(__dirname, '../custom/helper/logo')
  mkdirSync(logoDir, { recursive: true })
  console.log('Logo directory created at:', logoDir)
  // 创建MaxKB图标目录并复制默认图标
  const maxkbDir = join(__dirname, '../custom/helper/maxkb')
  mkdirSync(maxkbDir, { recursive: true })
  console.log('MaxKB directory created at:', maxkbDir)
  
  // 复制默认图标
  const defaultLogoSrc = join(__dirname, '../../frontend/src/assets/logo.gif')
  const defaultLogoDest = join(maxkbDir, 'logo.gif')
  try {
    copyFileSync(defaultLogoSrc, defaultLogoDest)
    console.log('Default logo copied to:', defaultLogoDest)
  } catch (error: any) {
    // 忽略错误，因为文件会由 docker-entrypoint.sh 处理
    console.log('跳过复制默认logo (将由启动脚本处理)')
  }
} catch (error) {
  console.error('Error creating directories:', error)
}

// 静态文件服务
app.use(express.static(join(__dirname, '../public')))

// 为上传的文件提供静态服务
const customDir = join(__dirname, '../custom')
console.log('Setting up static file service for custom directory:', customDir)
app.use('/custom', express.static(customDir))

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// 定义错误处理中间件的类型
interface ErrorWithStack extends Error {
  stack?: string;
}

// 路由
app.use('/api', userRoutes)
app.use('/api/css/xiantiao', xiantiaoRoutes)
app.use('/api/css/card-hover', cardHoverRoutes)
app.use('/api/css/gradient-bg', gradientBgRoutes)
app.use('/api/css/mouse-cursor', mouseCursorRoutes)
app.use('/api/css/global-font', globalFontRoutes)
app.use('/api/css/custom-logo', customLogoRoutes)
app.use('/api/css/layout-adjust', layoutAdjustRoutes)
app.use('/api/css/clock-style', clockStyleRoutes)
app.use('/api/js/maxkb-ai', maxkbAiRoutes)
app.use('/api/js/search-quote', searchQuoteRoutes)
app.use('/api/js/fish-animation', fishAnimationRoutes)
app.use('/api/js/markdown-editor', markdownEditorRoutes)
app.use('/api/js/toc-nav', tocNavRoutes)
app.use('/api/fixed', fixedRoutes)
app.use('/api/free', freeRouter)
app.use('/api/preview', previewRouter)
app.use('/api/js/music-player', musicPlayerRoutes)
app.use('/api/js/hide-login', hideLoginRoutes)

// 添加 markdown-editor 的路由
app.use('/custom/helper/md', express.static(join(__dirname, '../custom/helper/md')));
app.use('/custom/helper/md', markdownEditorRoutes);

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error handling request:', req.method, req.url)
  console.error('Error details:', err)
  
  if (err.stack) {
    console.error(err.stack)
  }
  
  res.status(500).json({ 
    success: false,
    message: '服务器错误',
    error: err.message 
  })
})

const port = process.env.BACKEND_PORT || 3001

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

export default app 