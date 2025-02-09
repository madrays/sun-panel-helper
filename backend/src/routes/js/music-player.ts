import { Router } from 'express';
import { deployMusicPlayer, undeploy, isDeployed } from '../../../components/js/music-player/service';

const router = Router();

// 检查部署状态 - 路径应该是 /deployed
router.get('/deployed', async (req, res) => {
  try {
    const deployed = await isDeployed();
    res.json({ deployed });  // 返回格式要和其他组件一致
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '检查部署状态失败'
    });
  }
});

// 部署
router.post('/deploy', async (req, res) => {
  try {
    const config = req.body;
    await deployMusicPlayer(config);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 取消部署
router.post('/undeploy', async (req, res) => {
  try {
    await undeploy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

export default router; 