import { Router } from 'express';
import { validateParams, deploy, undeploy, isDeployed } from '../../../components/css/layout-adjust/service';

const router = Router();

router.get('/deployed', async (req, res) => {
  try {
    const deployed = await isDeployed();
    res.json({ deployed });
  } catch (error) {
    console.error('检查组件部署状态失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    });
  }
});

router.post('/deploy', async (req, res) => {
  const params = req.body;
  const errors = validateParams(params);
  
  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  try {
    await deploy(params);
    res.json({ success: true });
  } catch (error) {
    console.error('部署布局调整组件失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    });
  }
});

router.post('/undeploy', async (req, res) => {
  try {
    await undeploy();
    res.json({ success: true });
  } catch (error) {
    console.error('取消部署布局调整组件失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误'
    });
  }
});

export default router; 