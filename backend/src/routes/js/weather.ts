import { Router, Request, Response } from 'express';
import axios from 'axios';
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

// 获取保存的配置（过滤敏感信息）
router.get('/config', async (_req: Request, res: Response) => {
    try {
        const config = await loadConfig();
        if (!config) {
            return res.json({});
        }

        // 过滤掉敏感的 API Key，只返回非敏感配置
        const safeConfig = {
            defaultLocation: config.defaultLocation,
            defaultLocationName: config.defaultLocationName,
            transparency: config.transparency,
            textColor: config.textColor,
            userProfile: config.userProfile,
            // 标记 API 是否已配置（不暴露实际值）
            hasQweatherApi: !!(config.qweatherApiKey && config.qweatherApiHost),
            hasAmapApi: !!config.amapApiKey,
            hasOpenaiApi: !!(config.openaiApiKey && config.openaiBaseUrl)
        };

        res.json(safeConfig);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '获取配置失败'
        });
    }
});

// ==================== 天气 API 代理（隐藏 API Key） ====================

// 加载配置获取 API Key
async function getWeatherConfig(): Promise<Partial<WeatherParams> | null> {
    try {
        return await loadConfig();
    } catch {
        return null;
    }
}

// 代理天气查询 API
router.get('/api/weather', async (req: Request, res: Response) => {
    try {
        const config = await getWeatherConfig();
        if (!config?.qweatherApiKey || !config?.qweatherApiHost) {
            return res.status(400).json({
                success: false,
                message: '天气 API 配置不完整'
            });
        }

        const { location, type = 'now' } = req.query;
        if (!location) {
            return res.status(400).json({
                success: false,
                message: '缺少位置参数'
            });
        }

        // 构建和风天气 API 请求
        const url = `https://${config.qweatherApiHost}/v7/weather/${type}?location=${location}&key=${config.qweatherApiKey}`;

        const response = await axios.get(url, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Weather API proxy error:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || '天气数据获取失败'
        });
    }
});

// 代理城市搜索 API
router.get('/api/city-search', async (req: Request, res: Response) => {
    try {
        const config = await getWeatherConfig();
        if (!config?.qweatherApiKey) {
            return res.status(400).json({
                success: false,
                message: '天气 API 配置不完整'
            });
        }

        const { keyword } = req.query;
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: '缺少搜索关键词'
            });
        }

        // 构建城市搜索 API 请求
        const url = `https://geoapi.qweather.com/v2/city/lookup?location=&keyword=${keyword}&key=${config.qweatherApiKey}`;

        const response = await axios.get(url, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('City search API proxy error:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || '城市搜索失败'
        });
    }
});

// 代理高德地理编码 API（包括 IP 定位）
router.get('/api/geo', async (req: Request, res: Response) => {
    try {
        const config = await getWeatherConfig();
        if (!config?.amapApiKey) {
            return res.status(400).json({
                success: false,
                message: '地图 API 配置不完整'
            });
        }

        const { source, address } = req.query;

        let url: string;

        // IP 定位
        if (source === 'ip') {
            url = `https://restapi.amap.com/v3/ip?key=${config.amapApiKey}`;
        }
        // 地理编码
        else if (address) {
            url = `https://restapi.amap.com/v3/geocode/geo?address=${address}&output=json&key=${config.amapApiKey}`;
        }
        // 逆地理编码
        else if (req.query.location) {
            url = `https://restapi.amap.com/v3/geocode/regeo?key=${config.amapApiKey}&location=${req.query.location}&extensions=base`;
        }
        else {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }

        const response = await axios.get(url, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Geo API proxy error:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || '地理编码失败'
        });
    }
});

// 代理 AI 建议 API
router.post('/api/ai-advice', async (req: Request, res: Response) => {
    try {
        const config = await getWeatherConfig();

        if (!config?.openaiApiKey || !config?.openaiBaseUrl) {
            return res.status(400).json({
                success: false,
                message: 'AI API 配置不完整'
            });
        }

        const { weather, location } = req.body;
        if (!weather) {
            return res.status(400).json({
                success: false,
                message: '缺少天气数据'
            });
        }

        // 构建用户画像
        const profile = config.userProfile;
        const prompt = `根据以下信息，直接给出5条简短建议，每条不超过30字。

用户：${profile?.age}岁${profile?.gender}，通勤方式：${profile?.commuteMethod}
位置：${location}
天气：${weather}

请严格按以下格式返回，不要有任何思考过程或额外内容：

出行准备建议：[建议内容]
着装建议：[建议内容]
健康防护建议：[建议内容]
户外活动可行性建议：[建议内容]
通勤/交通提醒：[建议内容]`;

        // 调用 AI API
        const url = `${config.openaiBaseUrl.replace(/\/$/, '')}/chat/completions`;

        // 检测是否是推理模型（会消耗大量 tokens 在思考过程）
        const modelName = (config.openaiModel || 'Qwen/Qwen2.5-7B-Instruct').toLowerCase();
        const isReasoningModel = modelName.includes('deepseek-v3') ||
                                  modelName.includes('deepseek-r1') ||
                                  modelName.includes('gemini-2.5') ||
                                  modelName.includes('o1') ||
                                  modelName.includes('o3');

        // 推理模型需要更多 tokens（思考过程会消耗 400-600 tokens）
        // 实际输出 5 条建议大约需要 150-200 tokens
        const maxTokens = isReasoningModel ? 2000 : 500;

        const requestBody: any = {
            model: config.openaiModel || 'Qwen/Qwen2.5-7B-Instruct',
            messages: [
                { role: 'system', content: '你是天气生活助手。直接输出建议，不要思考过程，不要解释，严格按用户要求的格式返回。' },
                { role: 'user', content: prompt }
            ],
            max_tokens: maxTokens,
            temperature: 0.5
        };

        // DeepSeek 推理模型：尝试限制推理 tokens
        if (modelName.includes('deepseek')) {
            requestBody.reasoning = { max_tokens: 800 };
        }

        const response = await axios.post(url, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openaiApiKey}`
            }
        });

        const aiContent = response.data.choices?.[0]?.message?.content;

        if (aiContent && aiContent.trim()) {
            res.json({
                success: true,
                advice: aiContent,
                source: 'ai'
            });
        } else {
            res.json({
                success: true,
                advice: '暂无建议',
                source: 'empty'
            });
        }
    } catch (error: any) {
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || 'AI 建议获取失败',
            source: 'error'
        });
    }
});

export default router;
