import { Router, Request, Response } from 'express';
import multer from 'multer';
import { join } from 'path';
import { mkdir, readdir, stat, unlink } from 'fs/promises';
import { validateParams, generateJS, deploy, undeploy, isDeployed } from '../../../components/js/maxkb-ai/service';
import type { MaxkbAiParams } from '../../../components/js/maxkb-ai/types';

const router = Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = join('custom', 'helper', 'maxkb');
    try {
      await mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = file.originalname.split('.').pop();
    cb(null, `maxkb-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 上传图片
router.post('/upload', async (req: Request, res: Response) => {
  const uploadMiddleware = upload.single('file');
  
  try {
    await new Promise((resolve, reject) => {
      uploadMiddleware(req as any, res as any, (err: any) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    if (!req.file) {
      throw new Error('没有上传文件');
    }

    res.json({
      success: true,
      url: `/custom/helper/maxkb/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    });
  }
});

// 获取历史图标列表
router.get('/logos', async (_req: Request, res: Response) => {
  try {
    const uploadDir = join('custom', 'helper', 'maxkb');
    const files = await readdir(uploadDir);
    const logos = await Promise.all(
      files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map(async (file) => {
          const stats = await stat(join(uploadDir, file));
          return {
            name: file,
            path: `/custom/helper/maxkb/${file}`,
            uploadTime: stats.mtime.toISOString()
          };
        })
    );
    
    res.json({ logos: logos.sort((a, b) => b.uploadTime.localeCompare(a.uploadTime)) });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取图标列表失败'
    });
  }
});

// 删除图标
router.delete('/logos/:name', async (req: Request, res: Response) => {
  try {
    const fileName = decodeURIComponent(req.params.name);
    if (fileName === 'logo.gif') {
      return res.status(400).json({ 
        success: false, 
        error: '不能删除默认图标' 
      });
    }
    const filePath = join('custom', 'helper', 'maxkb', fileName);
    await unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '删除图标失败'
    });
  }
});

// 部署组件
router.post('/deploy', async (req: Request, res: Response) => {
  try {
    const params = req.body as MaxkbAiParams;
    console.log('Received params:', params);

    const errors = validateParams(params);
    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return res.status(400).json({ success: false, errors });
    }

    const js = generateJS(params);
    await deploy(js);
    res.json({ success: true });
  } catch (error) {
    console.error('Deploy error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '部署失败'
    });
  }
});

// 取消部署
router.post('/undeploy', async (_req: Request, res: Response) => {
  try {
    await undeploy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '取消部署失败'
    });
  }
});

// 检查部署状态
router.get('/deployed', async (_req: Request, res: Response) => {
  try {
    const deployed = await isDeployed();
    res.json({ deployed });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '检查部署状态失败'
    });
  }
});

export default router; 