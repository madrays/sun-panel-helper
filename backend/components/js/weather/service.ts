import { join } from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import type { WeatherParams } from './types';

// Use process.cwd() for reliable path resolution in different environments
const PROJECT_ROOT = process.cwd();
const DEPLOY_PATH = join(PROJECT_ROOT, 'custom/index.js');
const TEMPLATE_PATH = join(PROJECT_ROOT, 'components/js/weather/template.js');
const CONFIG_PATH = join(PROJECT_ROOT, 'components/js/weather/config.json');

// Generate JS content (used for deployment logic)
export function generateJS(params: WeatherParams): string {
    return `/* Sun-Panel-Helper JS Start: weather */
// ====================== 智能天气助手 开始 ======================
// 配置已注入
`;
}

// Load saved configuration
export async function loadConfig(): Promise<Partial<WeatherParams> | null> {
    try {
        if (!existsSync(CONFIG_PATH)) {
            return null;
        }
        const data = await fs.readFile(CONFIG_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.warn('Failed to load weather config:', error);
        return null;
    }
}

// Save configuration
export async function saveConfig(params: WeatherParams): Promise<void> {
    try {
        await fs.writeFile(CONFIG_PATH, JSON.stringify(params, null, 2), 'utf8');
    } catch (error) {
        console.error('Failed to save weather config:', error);
        // Don't block deployment if save fails, but log it
    }
}

// Deploy component
export async function deploy(params: WeatherParams): Promise<void> {
    try {
        // Save config first for persistence
        await saveConfig(params);

        // Define markers
        const startMarker = '/* Sun-Panel-Helper JS Start: weather */';
        const endMarker = '/* Sun-Panel-Helper JS End: weather */';
        const systemEndMarker = '(function () {'; // We will replace the start of IIFE to inject comments if needed, or just append.

        // Actually, for this component, we are replacing the top config section.
        // Let's read the template.
        let template = await fs.readFile(TEMPLATE_PATH, 'utf8');

        // Construct the new config block
        const newConfigBlock = `    // =========== 用户配置区域 - 由 Sun-Panel-Helper 自动生成 ===========

    // 和风天气配置
    const QWEATHER_API_KEY = "${params.qweatherApiKey}";
    const QWEATHER_API_HOST = "${params.qweatherApiHost}";

    // 高德地图配置
    const AMAP_API_KEY = "${params.amapApiKey}";

    // AI助手配置
    const OPENAI_API_KEY = "${params.openaiApiKey}";
    const OPENAI_MODEL = "${params.openaiModel}";
    const OPENAI_BASE_URL = "${params.openaiBaseUrl}";

    // 个人信息配置
    const USER_PROFILE = ${JSON.stringify(params.userProfile, null, 8)};

    // 样式配置
    const VISUAL_TRANSPARENCY = ${params.transparency ?? 0.25};
    const VISUAL_TEXT_COLOR = "${params.textColor ?? '#ffffff'}";

    // 默认位置配置
    const DEFAULT_LOCATION = "${params.defaultLocation}";
    const DEFAULT_LOCATION_NAME = "${params.defaultLocationName}";

    // =========== 插件配置 - 以下配置一般无需修改 ===========`;

        // Regex to replace the original config block
        // We match from the first config line to the start of the plugin config section
        const configRegex = /\/\/ =========== 用户配置区域[\s\S]*?\/\/ =========== 插件配置 - 以下配置一般无需修改 ===========/;

        template = template.replace(configRegex, newConfigBlock);

        // Wrap in our markers
        const wrappedTemplate = `;/* Safety */
(function() {
    try {
        ${template}
    } catch(e) {
        console.error('[Sun-Panel-Helper] Error in weather:', e);
    }
})();`;
        const finalContent = `${startMarker}\n${wrappedTemplate}\n${endMarker}`;

        // Read current index.js
        let content = await fs.readFile(DEPLOY_PATH, 'utf8');

        // Check if already deployed
        if (content.includes(startMarker)) {
            // Replace existing deployment
            const start = content.indexOf(startMarker);
            const end = content.indexOf(endMarker) + endMarker.length;
            content = content.slice(0, start) + finalContent + content.slice(end);
        } else {
            // New deployment
            content += '\n' + finalContent + '\n';
        }

        // Update timestamp
        const timestamp = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/\//g, '/');

        // If index.js has a global timestamp comment, update it
        if (content.match(/\/\* 上次更新：.*?\*\//)) {
            content = content.replace(
                /\/\* 上次更新：.*?\*\//,
                `/* 上次更新：${timestamp} */`
            );
        }

        // Write file
        await fs.writeFile(DEPLOY_PATH, content, 'utf8');

    } catch (error) {
        console.error('Deploy error:', error);
        throw error;
    }
}

// Validate parameters
export function validateParams(params: WeatherParams): string[] {
    const errors: string[] = [];
    if (!params.qweatherApiKey) errors.push('请输入和风天气API Key');
    if (!params.qweatherApiHost) errors.push('请输入和风天气API Host');
    if (!params.amapApiKey) errors.push('请输入高德地图API Key');
    if (!params.openaiApiKey) errors.push('请输入AI API Key');
    // Add more validations as needed
    return errors;
}

// Check if deployed
export async function isDeployed(): Promise<boolean> {
    try {
        const content = await fs.readFile(DEPLOY_PATH, 'utf8');
        return content.includes('/* Sun-Panel-Helper JS Start: weather */');
    } catch {
        return false;
    }
}

// Undeploy
export async function undeploy(): Promise<void> {
    try {
        let content = await fs.readFile(DEPLOY_PATH, 'utf8');

        if (content.includes('/* Sun-Panel-Helper JS Start: weather */')) {
            const startMarker = '/* Sun-Panel-Helper JS Start: weather */';
            const endMarker = '/* Sun-Panel-Helper JS End: weather */';
            const start = content.indexOf(startMarker);
            const end = content.indexOf(endMarker) + endMarker.length;

            content = content.slice(0, start) + content.slice(end);

            // Update timestamp
            const timestamp = new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '/');

            if (content.match(/\/\* 上次更新：.*?\*\//)) {
                content = content.replace(
                    /\/\* 上次更新：.*?\*\//,
                    `/* 上次更新：${timestamp} */`
                );
            }

            await fs.writeFile(DEPLOY_PATH, content, 'utf8');
        }
    } catch (error) {
        console.error('Undeploy error:', error);
        throw error;
    }
}
