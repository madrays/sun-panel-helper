import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import { LayoutAdjustParams } from './types';

const CONFIG_PATH = 'custom/config';
const CONFIG_FILE = 'layout-adjust.json';
const CSS_PATH = 'custom';
const CSS_FILE = 'index.css';

const startMark = '/* Sun-Panel-Helper CSS Start: layout-adjust */';
const endMark = '/* Sun-Panel-Helper CSS End: layout-adjust */';

// 读取组件顺序配置
const orderConfig = JSON.parse(
  readFileSync(join(__dirname, '../../config/order.json'), 'utf-8')
);

// 确保配置目录存在
async function ensureConfigDir() {
  if (!existsSync(CONFIG_PATH)) {
    await mkdir(CONFIG_PATH, { recursive: true });
  }
}

// 确保CSS目录存在
async function ensureCssDir() {
  if (!existsSync(CSS_PATH)) {
    await mkdir(CSS_PATH, { recursive: true });
  }
}

// 保存配置
async function saveConfig(params: LayoutAdjustParams) {
  await ensureConfigDir();
  await writeFile(join(CONFIG_PATH, CONFIG_FILE), JSON.stringify(params, null, 2));
}

// 读取配置
async function readConfig(): Promise<LayoutAdjustParams | null> {
  try {
    const content = await readFile(join(CONFIG_PATH, CONFIG_FILE), 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// 生成CSS内容
function generateCss(params: LayoutAdjustParams): string {
  const now = new Date();
  const timestamp = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');

  return `${startMark}
/* Sun-Panel-Helper CSS */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致样式冲突或程序异常 */
/* 上次更新：${now.toLocaleString('zh-CN')} */

${params.showClock ? '' : `
.clock,
.clock-time,
.clock-date,
.clock-week,
.divider {
  display: none !important;
}`}

.search-container {
  margin-top: ${params.searchMarginTop}px !important;
}

.system-monitor {
  margin-top: ${params.systemMarginTop}px !important;
}
${endMark}
`;
}

// 从CSS文件中移除组件
async function removeFromCss(): Promise<string> {
  try {
    const cssPath = join(CSS_PATH, CSS_FILE);
    if (!existsSync(cssPath)) {
      return '';
    }

    let content = await readFile(cssPath, 'utf-8');
    const startIndex = content.indexOf(startMark);
    if (startIndex === -1) return content;

    const endIndex = content.indexOf(endMark);
    if (endIndex === -1) return content;

    return content.slice(0, startIndex) + content.slice(endIndex + endMark.length);
  } catch (error) {
    return '';
  }
}

// 部署
export async function deploy(css: string): Promise<void> {
  try {
    console.log('部署路径:', join(CSS_PATH, CSS_FILE));
    
    // 1. 确保部署目录存在
    await ensureCssDir();

    // 2. 读取现有文件
    let content = '';
    let isAlreadyDeployed = false;
    try {
      content = await readFile(join(CSS_PATH, CSS_FILE), 'utf-8');
      console.log('读取现有文件成功');
      // 检查是否已部署
      isAlreadyDeployed = content.includes(startMark);
      if (isAlreadyDeployed) {
        console.log('检测到已部署，将更新现有部署');
      }
    } catch (error) {
      // 文件不存在时创建空文件
      console.log('文件不存在,将创建新文件');
      content = '';
    }

    // 3. 如果已部署，移除旧的组件代码，但保留头部注释
    if (isAlreadyDeployed) {
      const startIndex = content.indexOf(startMark);
      const endIndex = content.indexOf(endMark, startIndex) + endMark.length;
      if (startIndex !== -1 && endIndex !== -1) {
        content = content.slice(0, startIndex).trim() + content.slice(endIndex).trim();
      }
    }

    // 4. 如果没有头部注释，添加头部注释；否则只更新时间
    if (!content.includes('/* Sun-Panel-Helper CSS */')) {
      content = generateCss(await readConfig() || { showClock: false, searchMarginTop: 0, systemMarginTop: 0 });
    } else {
      content = updateHeaderTime(content.trim());
    }

    // 获取插入位置
    const order = orderConfig.css;
    const currentIndex = order.indexOf('layout-adjust');
    let insertIndex = content.length;  // 默认插入到末尾

    // 先找前面最后一个已部署的组件
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevComponent = order[i];
      const prevMark = `/* Sun-Panel-Helper CSS End: ${prevComponent} */`;
      const prevIndex = content.lastIndexOf(prevMark);
      if (prevIndex !== -1) {
        insertIndex = prevIndex + prevMark.length;
        break;
      }
    }

    // 如果前面没找到，就找后面第一个已部署的组件
    if (insertIndex === content.length) {
      for (let i = currentIndex + 1; i < order.length; i++) {
        const nextComponent = order[i];
        const nextMark = `/* Sun-Panel-Helper CSS Start: ${nextComponent} */`;
        const nextIndex = content.indexOf(nextMark);
        if (nextIndex !== -1) {
          insertIndex = nextIndex;
          break;
        }
      }
    }

    // 在正确的位置插入组件代码
    const newCode = `${startMark}\n${css.trim()}\n${endMark}`;
    content = content.slice(0, insertIndex) + (insertIndex === content.length ? '\n\n' : '') + newCode + (insertIndex === content.length ? '' : '\n\n') + content.slice(insertIndex);

    // 写入文件
    await writeFile(join(CSS_PATH, CSS_FILE), content.trim() + '\n', 'utf-8');
    console.log(isAlreadyDeployed ? '更新部署成功' : '新部署成功');
  } catch (error) {
    console.error('部署CSS失败:', error);
    throw error;
  }
}

// 取消部署
export async function undeploy(): Promise<void> {
  try {
    console.log('准备取消部署，路径:', join(CSS_PATH, CSS_FILE));
    
    // 1. 读取现有文件
    let content = '';
    try {
      content = await readFile(join(CSS_PATH, CSS_FILE), 'utf-8');
      console.log('成功读取现有文件');
    } catch (error) {
      console.log('文件不存在，无需取消部署');
      return;
    }

    // 2. 检查是否包含组件代码
    if (!content.includes(startMark)) {
      console.log('文件中不包含该组件代码，无需取消部署');
      return;
    }

    // 3. 移除组件代码块（包括注释标记）
    const startIndex = content.indexOf(startMark);
    const endIndex = content.indexOf(endMark, startIndex) + endMark.length;
    if (startIndex !== -1 && endIndex !== -1) {
      // 删除组件代码块和周围的空行
      content = content.slice(0, startIndex).trim() + '\n\n' + content.slice(endIndex).trim();
    }

    // 4. 更新时间
    content = updateHeaderTime(content.trim());

    // 5. 写入文件，确保文件末尾只有一个换行符
    await writeFile(join(CSS_PATH, CSS_FILE), content.trim() + '\n', 'utf-8');
    console.log('取消部署成功');
  } catch (error) {
    console.error('取消部署CSS失败:', error);
    throw error;
  }
}

// 检查部署状态
export async function isDeployed(): Promise<boolean> {
  try {
    const cssPath = join(CSS_PATH, CSS_FILE);
    if (!existsSync(cssPath)) {
      return false;
    }

    const content = await readFile(cssPath, 'utf-8');
    return content.includes(startMark) && content.includes(endMark);
  } catch (error) {
    return false;
  }
}

/**
 * 更新头部注释的时间
 */
function updateHeaderTime(content: string): string {
  const now = new Date();
  const timeStr = now.toLocaleString('zh-CN');
  return content.replace(
    /\/\* 上次更新：.*?\*\//, 
    `/* 上次更新：${timeStr} */`
  );
} 