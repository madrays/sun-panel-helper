import express, { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { formatISO } from 'date-fns'
import archiver from 'archiver'
import extract from 'extract-zip'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'

const router = Router()
const dataDir = path.join(__dirname, '../../data')
const customDir = path.join(__dirname, '../../custom')
const backupDir = path.join(__dirname, '../../backups')

// 确保备份目录存在
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
}

// 备份配置文件存储路径
const BACKUP_CONFIG_PATH = path.join(backupDir, 'backup-config.json')

// 备份配置结构
interface BackupConfig {
  backups: {
    [id: string]: {
      note?: string
    }
  }
}

// 加载备份配置
function loadBackupConfig(): BackupConfig {
  try {
    if (fs.existsSync(BACKUP_CONFIG_PATH)) {
      const content = fs.readFileSync(BACKUP_CONFIG_PATH, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('Failed to load backup config:', error)
  }
  
  // 默认配置
  return { backups: {} }
}

// 保存备份配置
function saveBackupConfig(config: BackupConfig) {
  try {
    fs.writeFileSync(BACKUP_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to save backup config:', error)
  }
}

// 获取备份配置中的备注
function getBackupNote(backupId: string): string | undefined {
  const config = loadBackupConfig()
  return config.backups[backupId]?.note
}

// 设置备份备注
function setBackupNote(backupId: string, note: string) {
  const config = loadBackupConfig()
  
  if (!config.backups[backupId]) {
    config.backups[backupId] = {}
  }
  
  config.backups[backupId].note = note
  saveBackupConfig(config)
}

// 删除备份备注
function deleteBackupNote(backupId: string) {
  const config = loadBackupConfig()
  
  if (config.backups[backupId]) {
    delete config.backups[backupId]
    saveBackupConfig(config)
  }
}

// 获取所有备份
router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(backupDir)
    const backupFiles = files.filter(file => file.endsWith('.zip'))
    
    const backups = backupFiles.map(file => {
      const stats = fs.statSync(path.join(backupDir, file))
      const id = path.basename(file, '.zip')
      const type = file.startsWith('configs') ? 'configs' : 'deployment'
      
      return {
        id,
        name: file,
        size: stats.size,
        created: stats.mtime.toISOString(),
        type,
        note: getBackupNote(id)
      }
    })
    
    res.json({
      success: true,
      data: backups
    })
  } catch (error) {
    console.error('Error getting backups:', error)
    res.status(500).json({
      success: false,
      message: '获取备份列表失败'
    })
  }
})

// 创建配置文件备份
router.post('/configs', async (req, res) => {
  try {
    const timestamp = formatISO(new Date()).replace(/[:\.]/g, '-')
    const backupFileName = `configs-${timestamp}.zip`
    const backupPath = path.join(backupDir, backupFileName)
    
    const output = fs.createWriteStream(backupPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    output.on('close', () => {
      // 检查备份数量，保留最新的100个
      cleanupBackups('configs', 100)
      
      res.json({
        success: true,
        message: '配置文件备份成功',
        backup: {
          id: backupFileName.replace('.zip', ''),
          name: backupFileName,
          size: archive.pointer(),
          created: new Date(),
          type: 'configs'
        }
      })
    })
    
    archive.on('error', (err: Error) => {
      throw err
    })
    
    archive.pipe(output)
    
    // 添加整个data目录
    archive.directory(dataDir, 'data')
    
    await archive.finalize()
  } catch (error: any) {
    console.error('Error creating config backup:', error)
    res.status(500).json({
      success: false,
      message: '创建配置备份失败',
      error: error.message
    })
  }
})

// 创建部署文件备份
router.post('/deployment', async (req, res) => {
  try {
    const timestamp = formatISO(new Date()).replace(/[:\.]/g, '-')
    const backupFileName = `deployment-${timestamp}.zip`
    const backupPath = path.join(backupDir, backupFileName)
    
    const output = fs.createWriteStream(backupPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    output.on('close', () => {
      // 检查备份数量，保留最新的100个
      cleanupBackups('deployment', 100)
      
      res.json({
        success: true,
        message: '部署文件备份成功',
        backup: {
          id: backupFileName.replace('.zip', ''),
          name: backupFileName,
          size: archive.pointer(),
          created: new Date(),
          type: 'deployment'
        }
      })
    })
    
    archive.on('error', (err: Error) => {
      throw err
    })
    
    archive.pipe(output)
    
    // 添加index.css和index.js
    archive.file(path.join(customDir, 'index.css'), { name: 'index.css' })
    archive.file(path.join(customDir, 'index.js'), { name: 'index.js' })
    
    await archive.finalize()
  } catch (error: any) {
    console.error('Error creating deployment backup:', error)
    res.status(500).json({
      success: false,
      message: '创建部署文件备份失败',
      error: error.message
    })
  }
})

// 恢复配置文件
router.post('/restore/:id', async (req, res) => {
  try {
    const { id } = req.params
    const backupPath = path.join(backupDir, `${id}.zip`)
    
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: '备份文件不存在'
      })
    }
    
    const extractDir = path.join(backupDir, 'temp-extract')
    
    // 确保临时目录存在并为空
    if (fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true, force: true })
    }
    fs.mkdirSync(extractDir, { recursive: true })
    
    // 解压缩备份
    await extract(backupPath, { dir: extractDir })
    
    if (id.startsWith('configs')) {
      // 恢复配置文件
      if (fs.existsSync(path.join(extractDir, 'data'))) {
        // 先备份当前配置，以防恢复失败
        const timestamp = formatISO(new Date()).replace(/[:\.]/g, '-')
        const autoBackupFileName = `configs-auto-before-restore-${timestamp}.zip`
        const autoBackupPath = path.join(backupDir, autoBackupFileName)
        
        const output = fs.createWriteStream(autoBackupPath)
        const archive = archiver('zip', { zlib: { level: 9 } })
        
        archive.directory(dataDir, 'data')
        archive.pipe(output)
        await archive.finalize()
        
        // 复制文件到data目录
        copyFolderRecursiveSync(path.join(extractDir, 'data'), path.dirname(dataDir))
      }
    } else if (id.startsWith('deployment')) {
      // 恢复部署文件
      if (fs.existsSync(path.join(extractDir, 'index.css')) && fs.existsSync(path.join(extractDir, 'index.js'))) {
        // 先备份当前部署文件，以防恢复失败
        const timestamp = formatISO(new Date()).replace(/[:\.]/g, '-')
        const autoBackupFileName = `deployment-auto-before-restore-${timestamp}.zip`
        const autoBackupPath = path.join(backupDir, autoBackupFileName)
        
        const output = fs.createWriteStream(autoBackupPath)
        const archive = archiver('zip', { zlib: { level: 9 } })
        
        archive.file(path.join(customDir, 'index.css'), { name: 'index.css' })
        archive.file(path.join(customDir, 'index.js'), { name: 'index.js' })
        archive.pipe(output)
        await archive.finalize()
        
        // 复制文件到custom目录
        fs.copyFileSync(path.join(extractDir, 'index.css'), path.join(customDir, 'index.css'))
        fs.copyFileSync(path.join(extractDir, 'index.js'), path.join(customDir, 'index.js'))
      }
    }
    
    // 清理临时目录
    fs.rmSync(extractDir, { recursive: true, force: true })
    
    res.json({
      success: true,
      message: '恢复成功'
    })
  } catch (error: any) {
    console.error('Error restoring backup:', error)
    res.status(500).json({
      success: false,
      message: '恢复备份失败',
      error: error.message
    })
  }
})

// 添加更新备份备注API
router.post('/note/:id', (req, res) => {
  const backupId = req.params.id
  const { note } = req.body
  
  try {
    // 检查备份是否存在
    const backupPath = path.join(backupDir, `${backupId}.zip`)
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: '备份不存在'
      })
    }
    
    // 保存备注
    setBackupNote(backupId, note)
    
    res.json({
      success: true,
      message: '备注更新成功'
    })
  } catch (error) {
    console.error('Error updating backup note:', error)
    res.status(500).json({
      success: false,
      message: '更新备份备注失败'
    })
  }
})

// 修改删除备份API，同时删除备注
router.delete('/:id', (req, res) => {
  const backupId = req.params.id
  const backupPath = path.join(backupDir, `${backupId}.zip`)
  
  try {
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath)
      
      // 删除关联的备注
      deleteBackupNote(backupId)
      
      res.json({
        success: true,
        message: '备份删除成功'
      })
    } else {
      res.status(404).json({
        success: false,
        message: '备份不存在'
      })
    }
  } catch (error) {
    console.error('Error deleting backup:', error)
    res.status(500).json({
      success: false,
      message: '删除备份失败'
    })
  }
})

// 启动自动备份任务
router.post('/auto-backup/start', (req, res) => {
  // 实现定时备份功能将在app.ts中添加
  res.json({
    success: true,
    message: '自动备份已启动'
  })
})

// 辅助函数：清理旧备份，保留指定数量的最新备份
function cleanupBackups(type: string, keepCount: number) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith(type) && file.endsWith('.zip') && file.includes('-auto-'))
    
    // 按修改时间排序，最旧的优先
    files.sort((a, b) => {
      const timeA = fs.statSync(path.join(backupDir, a)).mtime.getTime()
      const timeB = fs.statSync(path.join(backupDir, b)).mtime.getTime()
      return timeA - timeB
    })
    
    // 删除超出保留数量的文件
    if (files.length > keepCount) {
      const toDelete = files.slice(0, files.length - keepCount)
      toDelete.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file))
        console.log(`Deleted old auto backup: ${file}`)
      })
    }
  } catch (error) {
    console.error('Error cleaning up backups:', error)
  }
}

// 辅助函数：递归复制目录
function copyFolderRecursiveSync(source: string, target: string) {
  // 确保目标目录存在
  const targetFolder = path.join(target, path.basename(source))
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true })
  }

  // 复制文件和子目录
  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source)
    files.forEach(file => {
      const currentSource = path.join(source, file)
      if (fs.lstatSync(currentSource).isDirectory()) {
        copyFolderRecursiveSync(currentSource, targetFolder)
      } else {
        fs.copyFileSync(currentSource, path.join(targetFolder, file))
      }
    })
  }
}

export default router 