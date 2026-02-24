import express from 'express'
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
import weatherRoutes from './routes/js/weather'
import fixedRoutes from './routes/fixed'
import freeRouter from './routes/free'
import previewRouter from './routes/preview'
import musicPlayerRoutes from './routes/js/music-player'
import hideLoginRoutes from './routes/js/hide-login'
import widgetsRouter from './routes/widgets'
import backupRouter from './routes/backup'
// import toolboxRouter from './routes/toolbox'
// 使用require导入解决TypeScript编译错误
const toolboxRouter = require('./routes/toolbox').default;
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
const patchedMulter = function (options: any) {
  // 强制所有上传的文件权限为 777
  process.umask(0)
  return originalMulter(options)
}
patchedMulter.diskStorage = originalMulter.diskStorage
// @ts-ignore
global.multer = patchedMulter



const app = express()

// CORS 由 nginx 统一处理，后端不再添加 CORS 头，避免重复

// 解析 JSON
app.use(express.json())

// 创建必要的目录
try {
  // 创建数据目录
  mkdirSync(join(__dirname, '../data'), { recursive: true })
  // 创建备份目录
  mkdirSync(join(__dirname, '../backups'), { recursive: true })
  // 创建鼠标指针图片目录
  const mouseCursorDir = join(__dirname, '../custom/helper/mouse')
  mkdirSync(mouseCursorDir, { recursive: true })

  // 创建Logo图片目录
  const logoDir = join(__dirname, '../custom/helper/logo')
  mkdirSync(logoDir, { recursive: true })
  // 创建MaxKB图标目录并复制默认图标
  const maxkbDir = join(__dirname, '../custom/helper/maxkb')
  mkdirSync(maxkbDir, { recursive: true })

  // 复制默认图标
  const defaultLogoSrc = join(__dirname, '../../frontend/src/assets/logo.gif')
  const defaultLogoDest = join(maxkbDir, 'logo.gif')
  try {
    copyFileSync(defaultLogoSrc, defaultLogoDest)
  } catch (error: any) {
    // 忽略错误，因为文件会由 docker-entrypoint.sh 处理
  }
} catch (error) {
  console.error('Error creating directories:', error)
}

// 静态文件服务
app.use(express.static(join(__dirname, '../public')))

// 为前端public目录提供静态文件服务
const frontendPublicDir = join(__dirname, '../../frontend/public')
// 添加对.vue文件的MIME类型支持
app.use(express.static(frontendPublicDir, {
  setHeaders: (res, path) => {
    if (path.endsWith('.vue')) {
      res.setHeader('Content-Type', 'text/plain');
    }
  }
}))

// 为上传的文件提供静态服务
const customDir = join(__dirname, '../custom')
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
app.use('/api/js/weather', weatherRoutes)
app.use('/api/fixed', fixedRoutes)
app.use('/api/free', freeRouter)
app.use('/api/preview', previewRouter)
app.use('/api/js/music-player', musicPlayerRoutes)
app.use('/api/js/hide-login', hideLoginRoutes)
app.use('/api/widgets', widgetsRouter)
app.use('/api/backup', backupRouter)
app.use('/api/toolbox', toolboxRouter)

// 添加 markdown-editor 的路由
app.use('/custom/helper/md', express.static(join(__dirname, '../custom/helper/md')));
app.use('/custom/helper/md', markdownEditorRoutes);

// 自动备份功能
// 设置每小时自动备份
let autoBackupInterval: NodeJS.Timeout | null = null;

// 启动自动备份
function startAutoBackup() {
  if (autoBackupInterval) {
    clearInterval(autoBackupInterval);
  }

  // 创建自动备份函数
  const performAutoBackup = async () => {
    try {
      // 创建配置文件备份
      const dataDir = join(__dirname, '../data');
      const customDir = join(__dirname, '../custom');
      const backupDir = join(__dirname, '../backups');

      // 确保备份目录存在
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');

      // 配置文件备份
      if (fs.existsSync(dataDir)) {
        const configBackupFileName = `configs-auto-${timestamp}.zip`;
        const configBackupPath = join(backupDir, configBackupFileName);

        // 使用archiver创建zip
        const { default: archiver } = await import('archiver');
        const configOutput = fs.createWriteStream(configBackupPath);
        const configArchive = archiver('zip', { zlib: { level: 9 } });

        configArchive.pipe(configOutput);
        configArchive.directory(dataDir, 'data');
        await configArchive.finalize();

        console.log(`自动备份配置文件成功: ${configBackupFileName}`);
      }

      // 部署文件备份
      if (fs.existsSync(join(customDir, 'index.css')) && fs.existsSync(join(customDir, 'index.js'))) {
        const deployBackupFileName = `deployment-auto-${timestamp}.zip`;
        const deployBackupPath = join(backupDir, deployBackupFileName);

        // 使用archiver创建zip
        const { default: archiver } = await import('archiver');
        const deployOutput = fs.createWriteStream(deployBackupPath);
        const deployArchive = archiver('zip', { zlib: { level: 9 } });

        deployArchive.pipe(deployOutput);
        deployArchive.file(join(customDir, 'index.css'), { name: 'index.css' });
        deployArchive.file(join(customDir, 'index.js'), { name: 'index.js' });
        await deployArchive.finalize();

        console.log(`自动备份部署文件成功: ${deployBackupFileName}`);
      }

      // 清理旧备份，保留最新的100个
      const cleanupBackups = (type: string, keepCount: number) => {
        try {
          const files = fs.readdirSync(backupDir)
            .filter(file => file.startsWith(type) && file.endsWith('.zip') && file.includes('-auto-'));

          // 按修改时间排序，最旧的优先
          files.sort((a, b) => {
            const timeA = fs.statSync(join(backupDir, a)).mtime.getTime();
            const timeB = fs.statSync(join(backupDir, b)).mtime.getTime();
            return timeA - timeB;
          });

          // 删除超出保留数量的文件
          if (files.length > keepCount) {
            const toDelete = files.slice(0, files.length - keepCount);
            toDelete.forEach(file => {
              fs.unlinkSync(join(backupDir, file));
              console.log(`删除旧自动备份: ${file}`);
            });
          }
        } catch (error) {
          console.error('清理旧备份时出错:', error);
        }
      };

      cleanupBackups('configs', 100);
      cleanupBackups('deployment', 100);

    } catch (error) {
      console.error('自动备份失败:', error);
    }
  };

  // 立即执行一次
  performAutoBackup();

  // 每小时执行一次
  autoBackupInterval = setInterval(performAutoBackup, 60 * 60 * 1000);
  console.log('自动备份已启动，每小时执行一次');
}

// 应用启动时启动自动备份
startAutoBackup();

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