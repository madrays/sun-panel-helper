import { Router } from 'express'
import multer from 'multer'
import { resolve } from 'path'
import { readdir, unlink } from 'fs/promises'
import { deploy, undeploy, isDeployed, validateParams, generateCSS } from '../../../components/css/global-font/service'
import type { GlobalFontParams } from '../../../components/css/global-font/types'
import { logger } from '../../utils/logger'

const router = Router()

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = resolve(__dirname, '../../../custom/helper/font')
    logger.info(`Storing font file in directory: ${path}`)
    cb(null, path)
  },
  filename: (req, file, cb) => {
    // 使用时间戳和随机数生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = file.originalname.match(/\.(ttf|otf)$/i)?.[0] || '.ttf'
    const filename = `font-${uniqueSuffix}${ext}`
    logger.info(`Generated filename: ${filename} for original file: ${file.originalname}`)
    cb(null, filename)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许 .ttf 和 .otf 文件
    if (!file.originalname.match(/\.(ttf|otf)$/)) {
      logger.warn(`Rejected font upload: ${file.originalname} - Invalid file type`)
      cb(new Error('只支持 .ttf 和 .otf 格式的字体文件'))
      return
    }
    logger.info(`Accepted font upload: ${file.originalname}`)
    cb(null, true)
  }
})

// 部署组件
router.post('/deploy', async (req, res) => {
  try {
    const params = req.body as GlobalFontParams
    logger.info('Validating global font parameters:', params)
    
    const errors = validateParams(params)
    if (errors.length > 0) {
      logger.warn('Parameter validation failed:', errors)
      return res.status(400).json({
        success: false,
        errors
      })
    }

    logger.info('Deploying global font component')
    await deploy(params)
    logger.info('Global font component deployed successfully')
    res.json({ success: true })
  } catch (error) {
    logger.error('Failed to deploy global font component:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '部署失败'
    })
  }
})

// 取消部署
router.post('/undeploy', async (req, res) => {
  try {
    logger.info('Undeploying global font component')
    await undeploy()
    logger.info('Global font component undeployed successfully')
    res.json({ success: true })
  } catch (error) {
    logger.error('Failed to undeploy global font component:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '取消部署失败'
    })
  }
})

// 检查部署状态
router.get('/deployed', async (req, res) => {
  try {
    logger.info('Checking global font component deployment status')
    const deployed = await isDeployed()
    logger.info(`Global font component deployment status: ${deployed}`)
    res.json({ 
      success: true,
      deployed 
    })
  } catch (error) {
    logger.error('Failed to check global font component deployment status:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '检查部署状态失败'
    })
  }
})

// 上传字体
router.post('/upload', async (req, res) => {
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

    // 获取原始文件名（不包含扩展名）
    const originalName = req.file.originalname.replace(/\.(ttf|otf)$/i, '')
    logger.info(`Font uploaded successfully. Original name: ${originalName}, File: ${req.file.filename}`)

    res.json({
      success: true,
      name: originalName,
      id: req.file.filename,
      originalName: originalName
    })
  } catch (error) {
    logger.error('Failed to upload font:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    })
  }
})

// 获取已上传的字体列表
router.get('/fonts', async (req, res) => {
  try {
    const dir = resolve(__dirname, '../../../custom/helper/font')
    logger.info(`Reading fonts from directory: ${dir}`)
    
    // 检查目录是否存在
    try {
      await readdir(dir)
    } catch (error) {
      logger.error('Directory does not exist or cannot be accessed:', error)
      throw new Error(`无法访问目录: ${dir}`)
    }
    
    const files = await readdir(dir)
    logger.info(`Found ${files.length} files in directory`)
    
    const fonts = files
      .filter(file => /\.(ttf|otf)$/i.test(file))
      .map(file => {
        // 从文件名中提取原始名称
        const originalName = file.replace(/^font-\d+-\d+/, '').replace(/\.(ttf|otf)$/i, '')
        return {
          id: file,
          name: originalName || file.replace(/\.(ttf|otf)$/i, ''),
          createdAt: new Date().toISOString()
        }
      })

    logger.info(`Found ${fonts.length} fonts:`, fonts)
    res.json({
      success: true,
      fonts
    })
  } catch (error) {
    logger.error('Failed to get font list:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取字体列表失败'
    })
  }
})

// 删除字体
router.delete('/fonts/:id', async (req, res) => {
  try {
    const fontPath = resolve(__dirname, '../../../custom/helper/font', req.params.id)
    logger.info(`Deleting font: ${fontPath}`)
    
    await unlink(fontPath)
    logger.info('Font deleted successfully')
    
    res.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete font:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除失败'
    })
  }
})

export default router 