import { Router, Request, Response } from 'express';
import { generateJS, deploy, undeploy, isDeployed } from '../../../components/js/search-quote/service';

const router = Router();

// 部署组件
router.post('/deploy', async (_req: Request, res: Response) => {
  try {
    const js = generateJS();
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