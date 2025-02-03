import { Router, Request, Response } from 'express'
import multer from 'multer'
import { resolve } from 'path'
import { readdir, unlink, mkdir } from 'fs/promises'
import { validateParams, generateCSS, deploy, undeploy, isDeployed } from '../../../components/css/custom-logo/service'
import type { CustomLogoParams } from '../../../components/css/custom-logo/types'
import { logger } from '../../utils/logger'

const router = Router()

// 配置multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = resolve(__dirname, '../../../custom/helper/logo')
    try {
      await mkdir(dir, { recursive: true })
    } catch (error) {
      logger.error('创建目录失败:', error)
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('只能上传图片文件'))
      return
    }
    cb(null, true)
  }
})

// 上传图片
router.post('/upload', async (req: Request, res: Response) => {
  const uploadMiddleware = upload.single('file')
  
  try {
    await new Promise((resolve, reject) => {
      uploadMiddleware(req as any, res as any, (err: any) => {
        if (err) reject(err)
        else resolve(undefined)
      })
    })

    if (!req.file) {
      throw new Error('没有上传文件')
    }

    res.json({
      success: true,
      url: `/custom/helper/logo/${req.file.filename}`,
      originalName: req.file.originalname
    })
  } catch (error) {
    logger.error('上传图片失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    })
  }
})

// 获取已上传的图片列表
router.get('/images', async (req, res) => {
  try {
    const dir = resolve(__dirname, '../../../custom/helper/logo')
    logger.info(`读取图片目录: ${dir}`)
    
    // 检查目录是否存在
    try {
      await readdir(dir)
    } catch (error) {
      logger.error('目录不存在或无法访问:', error)
      throw new Error(`无法访问目录: ${dir}`)
    }
    
    const files = await readdir(dir)
    logger.info(`找到 ${files.length} 个文件`)
    
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp|ico|svg|bmp)$/i.test(file))
      .map(file => ({
        id: file,
        name: file,
        url: `/custom/helper/logo/${file}`,
        createdAt: new Date().toISOString()
      }))

    logger.info(`找到 ${images.length} 张图片:`, images)
    res.json({
      success: true,
      images
    })
  } catch (error) {
    logger.error('获取图片列表失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取图片列表失败'
    })
  }
})

// 删除图片
router.delete('/images/:id', async (req, res) => {
  try {
    const { id } = req.params
    const filePath = resolve(__dirname, '../../../custom/helper/logo', id)
    logger.info(`删除图片: ${filePath}`)
    
    await unlink(filePath)
    logger.info('图片删除成功')
    
    res.json({
      success: true
    })
  } catch (error) {
    logger.error('删除图片失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除失败'
    })
  }
})

// 部署自定义Logo组件
router.post('/deploy', async (req, res) => {
  try {
    const params = req.body as CustomLogoParams
    const errors = validateParams(params)
    
    if (errors.length > 0) {
      res.status(400).json({ 
        success: false, 
        errors 
      })
      return
    }

    await deploy(params)
    res.json({ success: true })
  } catch (error) {
    console.error('部署自定义Logo组件失败:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

// 取消部署自定义Logo组件
router.post('/undeploy', async (req, res) => {
  try {
    await undeploy()
    res.json({ success: true })
  } catch (error) {
    console.error('取消部署自定义Logo组件失败:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

// 检查组件是否已部署
router.get('/deployed', async (req, res) => {
  try {
    const deployed = await isDeployed()
    res.json({ deployed })
  } catch (error) {
    console.error('检查自定义Logo组件部署状态失败:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    })
  }
})

export default router 