import { Router, Request, Response } from 'express';
import { deploy, undeploy, isDeployed, validateParams, loadConfig } from '../../../components/js/weather/service';
import type { WeatherParams } from '../../../components/js/weather/types';

const router = Router();

// 部署组件
router.post('/deploy', async (req: Request, res: Response) => {
    try {
        const params = req.body as WeatherParams;

        // 验证参数
        const errors = validateParams(params);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        await deploy(params);
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

// 获取保存的配置
router.get('/config', async (_req: Request, res: Response) => {
    try {
        const config = await loadConfig();
        res.json(config || {});
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '获取配置失败'
        });
    }
});

export default router;
