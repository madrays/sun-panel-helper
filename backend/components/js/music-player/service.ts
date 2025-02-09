import { deploy, undeploy, isDeployed } from './deploy';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { MusicPlayerConfig } from './types';

const CONFIG_FILE = join(__dirname, 'config.json');

/**
 * 读取配置
 */
function readConfig(): MusicPlayerConfig {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    const defaultConfig: MusicPlayerConfig = {
      playerId: '16698096362',
      mobileLoad: true,
      position: 'right'
    };
    writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
}

/**
 * 保存配置
 */
function saveConfig(config: MusicPlayerConfig): void {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * 生成组件代码
 */
export function generateJS(config: MusicPlayerConfig): string {
  return `// 检查 jQuery 是否已加载
if (typeof jQuery === 'undefined') {
    var script = document.createElement('script');
    script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    document.head.appendChild(script);

    script.onload = function() {
        console.log('jQuery 已成功加载');
        $(document).ready(function() {
            console.log('DOM已准备好');
        });
    };
} else {
    $(document).ready(function() {
        console.log('DOM已准备好，jQuery 已可用');
    });
}

// 音乐播放器加载
var script = document.createElement("script");
script.setAttribute("type", "text/javascript");
script.setAttribute("id", "myhk");
script.setAttribute("src", "https://myhkw.cn/api/player/${config.playerId}");
script.setAttribute("key", "${config.playerId}");
script.setAttribute("m", "${config.mobileLoad ? '1' : '0'}");
script.setAttribute("lr", "${config.position === 'left' ? 'l' : 'r'}");
document.documentElement.appendChild(script);`;
}

/**
 * 部署组件
 */
export async function deployMusicPlayer(config: MusicPlayerConfig): Promise<void> {
  saveConfig(config);
  const code = generateJS(config);
  await deploy(code);
}

export { undeploy, isDeployed };
export type { MusicPlayerConfig }; 