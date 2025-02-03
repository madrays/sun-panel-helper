import { Router, Request, Response } from 'express'
import multer from 'multer'
import { resolve } from 'path'
import { readdir, unlink } from 'fs/promises'
import { deploy, undeploy, isDeployed, validateParams, generateCSS } from '../../../components/css/mouse-cursor/service'
import type { MouseCursorParams } from '../../../components/css/mouse-cursor/types'
import { logger } from '../../utils/logger'

const router = Router()

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = resolve(__dirname, '../../../custom/helper/mouse')
    logger.info(`Storing file in directory: ${path}`)
    cb(null, path)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = file.originalname.split('.').pop()
    const filename = `mouse-${uniqueSuffix}.${ext}`
    logger.info(`Generated filename: ${filename} for original file: ${file.originalname}`)
    cb(null, filename)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    // 扩展支持的 MIME 类型
    const supportedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/svg+xml',
      'image/bmp'
    ]

    if (!supportedMimes.includes(file.mimetype)) {
      logger.warn(`Rejected file upload: ${file.originalname} - Invalid file type: ${file.mimetype}`)
      cb(new Error('不支持的图片格式，仅支持 JPG、JPEG、PNG、GIF、WEBP、ICO、SVG、BMP 格式'))
      return
    }
    logger.info(`Accepted file upload: ${file.originalname} - Type: ${file.mimetype}`)
    cb(null, true)
  }
})

// 部署组件
router.post('/deploy', async (req, res) => {
  try {
    const params = req.body as MouseCursorParams
    logger.info('Validating mouse cursor parameters:', params)
    
    const errors = validateParams(params)
    if (errors.length > 0) {
      logger.warn('Parameter validation failed:', errors)
      return res.status(400).json({
        success: false,
        errors
      })
    }

    logger.info('Deploying mouse cursor component')
    await deploy(params)
    logger.info('Mouse cursor component deployed successfully')
    res.json({ success: true })
  } catch (error) {
    logger.error('Failed to deploy mouse cursor component:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '部署失败'
    })
  }
})

// 取消部署
router.post('/undeploy', async (req, res) => {
  try {
    logger.info('Undeploying mouse cursor component')
    await undeploy()
    logger.info('Mouse cursor component undeployed successfully')
    res.json({ success: true })
  } catch (error) {
    logger.error('Failed to undeploy mouse cursor component:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '取消部署失败'
    })
  }
})

// 检查部署状态
router.get('/deployed', async (req, res) => {
  try {
    logger.info('Checking mouse cursor component deployment status')
    const deployed = await isDeployed()
    logger.info(`Mouse cursor component deployment status: ${deployed}`)
    res.json({ 
      success: true,
      deployed 
    })
  } catch (error) {
    logger.error('Failed to check mouse cursor component deployment status:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '检查部署状态失败'
    })
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
      logger.warn('No file received in upload request')
      throw new Error('未接收到文件')
    }

    const fileUrl = `/custom/helper/mouse/${req.file.filename}`
    logger.info(`File uploaded successfully: ${fileUrl}`)

    res.json({
      success: true,
      url: fileUrl,
      name: req.file.originalname,
      id: req.file.filename
    })
  } catch (error) {
    logger.error('Failed to upload file:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    })
  }
})

// 获取已上传的图片列表
router.get('/images', async (req, res) => {
  try {
    const dir = resolve(__dirname, '../../../custom/helper/mouse')
    logger.info(`Reading images from directory: ${dir}`)
    
    // 检查目录是否存在
    try {
      await readdir(dir)
    } catch (error) {
      logger.error('Directory does not exist or cannot be accessed:', error)
      throw new Error(`无法访问目录: ${dir}`)
    }
    
    const files = await readdir(dir)
    logger.info(`Found ${files.length} files in directory`)
    
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp|ico|svg|bmp)$/i.test(file))
      .map(file => ({
        id: file,
        name: file,
        url: `/custom/helper/mouse/${file}`,
        createdAt: new Date().toISOString()
      }))

    logger.info(`Found ${images.length} images:`, images)
    res.json({
      success: true,
      images
    })
  } catch (error) {
    logger.error('Failed to get image list:', error)
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
    const filePath = resolve(__dirname, '../../../custom/helper/mouse', id)
    logger.info(`Deleting image: ${filePath}`)
    
    await unlink(filePath)
    logger.info('Image deleted successfully')
    
    res.json({
      success: true
    })
  } catch (error) {
    logger.error('Failed to delete image:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除失败'
    })
  }
})

export default router 