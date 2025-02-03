import { Router, Request, Response } from 'express';
import { generateJS, deploy, undeploy, isDeployed, validateParams } from '../../../components/js/fish-animation/service';
import type { FishAnimationParams } from '../../../components/js/fish-animation/types';
import { join } from 'path';
import fs from 'fs/promises';

const router = Router();

// 获取模板文件
router.get('/template.js', (_req, res) => {
  try {
    const templatePath = join(__dirname, '../../../components/js/fish-animation/template.js');
    res.sendFile(templatePath);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '获取模板失败'
    });
  }
});

// 部署组件
router.post('/deploy', async (req: Request, res: Response) => {
  try {
    const params = req.body as FishAnimationParams;
    
    // 验证参数
    const errors = validateParams(params);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const js = generateJS(params);
    const templatePath = join(__dirname, '../../../components/js/fish-animation/template.js');
    const deployPath = join(__dirname, '../../../components/js/fish-animation/deployed.js');

    const template = await fs.readFile(templatePath, 'utf8');
    const configuredTemplate = template.replace(
        /const config = {[^}]+}/,
        `const config = {
            fishCount: ${params.fishCount},
            heightRate: ${params.heightRate},
            fishColor: '${params.fishColor}',
            opacity: ${params.opacity}
        }`
    );
    await fs.writeFile(deployPath, configuredTemplate);

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