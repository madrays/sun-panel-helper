import { join } from 'path';
import fs from 'fs/promises';
import type { FishAnimationParams } from './types';

const DEPLOY_PATH = join(__dirname, '../../../custom/index.js');

// 生成组件代码
export function generateJS(params: FishAnimationParams): string {
    return `/* Sun-Panel-Helper JS Start: fish-animation */
// ====================== 鱼群动画系统 开始 ======================
window.SunPanelFish = (function() {
    // 配置参数
    const config = {
        fishCount: ${params.fishCount},
        heightRate: ${params.heightRate},
        fishColor: '${params.fishColor}',
        opacity: ${params.opacity},
        speedRate: ${params.speedRate},
        zIndex: ${params.zIndex}
    };

    // ... (其余代码从模板中读取)
`;
}

// 部署组件
export async function deploy(js: string): Promise<void> {
    try {
        // 定义标记
        const startMarker = '/* Sun-Panel-Helper JS Start: fish-animation */';
        const endMarker = '/* Sun-Panel-Helper JS End: fish-animation */';
        const systemEndMarker = '// ====================== 鱼群动画系统 结束 ======================';

        // 读取模板文件
        const templatePath = join(__dirname, 'template.js');
        let template = await fs.readFile(templatePath, 'utf8');
        
        // 提取配置对象
        const configMatch = js.match(/const config = {[\s\S]+?};/);
        if (!configMatch) {
            throw new Error('无法找到配置对象');
        }
        
        // 替换配置部分
        template = template.replace(
            /const config = {[\s\S]+?};/,
            configMatch[0]
        );

        // 移除模板中的系统结束标记
        template = template.replace(systemEndMarker, '');

        // 读取当前的 index.js
        let content = await fs.readFile(DEPLOY_PATH, 'utf8');
        
        // 检查是否已经部署
        if (content.includes(startMarker)) {
            // 替换现有部署
            const start = content.indexOf(startMarker);
            const end = content.indexOf(endMarker) + endMarker.length;
            content = content.slice(0, start) + startMarker + '\n' + template + systemEndMarker + '\n' + endMarker + content.slice(end);
        } else {
            // 新部署
            content += '\n' + startMarker + '\n' + template + systemEndMarker + '\n' + endMarker + '\n';
        }

        // 更新时间戳
        const timestamp = new Date().toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
        }).replace(/\//g, '/');
        content = content.replace(
            /\/\* 上次更新：.*?\*\//,
            `/* 上次更新：${timestamp} */`
        );

        // 写入文件
        await fs.writeFile(DEPLOY_PATH, content, 'utf8');
    } catch (error) {
        console.error('Deploy error:', error);
        throw error;
    }
}

// 验证参数
export function validateParams(params: FishAnimationParams): string[] {
    const errors: string[] = [];
    
    if (typeof params.fishCount !== 'number' || params.fishCount < 1 || params.fishCount > 10) {
        errors.push('鱼群数量必须在1-10之间');
    }
    
    if (typeof params.heightRate !== 'number' || params.heightRate < 0.3 || params.heightRate > 0.7) {
        errors.push('水面位置必须在0.3-0.7之间');
    }
    
    if (typeof params.opacity !== 'number' || params.opacity < 0.1 || params.opacity > 1) {
        errors.push('透明度必须在0.1-1之间');
    }
    
    if (typeof params.speedRate !== 'number' || params.speedRate < 0.1 || params.speedRate > 1.1) {
        errors.push('游动速度必须在0.1-1.1之间');
    }
    
    if (typeof params.zIndex !== 'number' || params.zIndex < 0 || params.zIndex > 99999) {
        errors.push('层级(z-index)必须在0-99999之间');
    }
    
    return errors;
}

// 检查是否已部署
export async function isDeployed(): Promise<boolean> {
    try {
        const content = await fs.readFile(DEPLOY_PATH, 'utf8');
        return content.includes('/* Sun-Panel-Helper JS Start: fish-animation */');
    } catch {
        return false;
    }
}

// 取消部署
export async function undeploy(): Promise<void> {
    try {
        let content = await fs.readFile(DEPLOY_PATH, 'utf8');
        
        if (content.includes('/* Sun-Panel-Helper JS Start: fish-animation */')) {
            const startMarker = '/* Sun-Panel-Helper JS Start: fish-animation */';
            const endMarker = '/* Sun-Panel-Helper JS End: fish-animation */';
            const start = content.indexOf(startMarker);
            const end = content.indexOf(endMarker) + endMarker.length;
            
            content = content.slice(0, start) + content.slice(end);
            
            // 更新时间戳
            const timestamp = new Date().toLocaleString('zh-CN', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false 
            }).replace(/\//g, '/');
            content = content.replace(
                /\/\* 上次更新：.*?\*\//,
                `/* 上次更新：${timestamp} */`
            );
            
            await fs.writeFile(DEPLOY_PATH, content, 'utf8');
        }
    } catch (error) {
        console.error('Undeploy error:', error);
        throw error;
    }
} 