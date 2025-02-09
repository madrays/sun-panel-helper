import { Router } from 'express';
import { deployHideLogin, undeploy, isDeployed } from '../../../components/js/hide-login/service';

const router = Router();

router.get('/deployed', async (req, res) => {
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

router.post('/deploy', async (req, res) => {
  try {
    await deployHideLogin();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

router.post('/undeploy', async (req, res) => {
  try {
    await undeploy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

export default router; 