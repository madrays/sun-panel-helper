import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { readFileSync } from 'fs';

// 运行时已在backend目录下，使用join拼接路径
const outputPath = join('custom', 'index.js');

// 组件标记
const startMark = '/* Sun-Panel-Helper JS Start: hide-login */';
const endMark = '/* Sun-Panel-Helper JS End: hide-login */';

// 读取组件顺序配置
const orderConfig = JSON.parse(
  readFileSync(join(__dirname, '../../config/order.json'), 'utf-8')
);

function generateHeaderComment(): string {
  const now = new Date();
  return `/* Sun-Panel-Helper JS */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致功能冲突或程序异常 */
/* 上次更新：${now.toLocaleString('zh-CN')} */\n`;
}

function updateHeaderTime(content: string): string {
  const now = new Date();
  const timeStr = now.toLocaleString('zh-CN');
  return content.replace(
    /\/\* 上次更新：.*?\*\//,
    `/* 上次更新：${timeStr} */`
  );
}

export async function deploy(js: string): Promise<void> {
  try {
    console.log('部署路径:', outputPath);
    await mkdir(dirname(outputPath), { recursive: true });

    let content = '';
    let isAlreadyDeployed = false;
    try {
      content = await readFile(outputPath, 'utf-8');
      isAlreadyDeployed = content.includes(startMark);
    } catch (error) {
      console.log('文件不存在,将创建新文件');
    }

    if (isAlreadyDeployed) {
      const startIndex = content.indexOf(startMark);
      const endIndex = content.indexOf(endMark, startIndex) + endMark.length;
      if (startIndex !== -1 && endIndex !== -1) {
        content = content.slice(0, startIndex).trim() + content.slice(endIndex).trim();
      }
    }

    if (!content.includes('/* Sun-Panel-Helper JS */')) {
      content = generateHeaderComment() + (content ? content.trim() + '\n\n' : '');
    } else {
      content = updateHeaderTime(content.trim());
    }

    const order = orderConfig.js;
    const currentIndex = order.indexOf('hide-login');
    let insertIndex = content.length;

    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevComponent = order[i];
      const prevMark = `/* Sun-Panel-Helper JS End: ${prevComponent} */`;
      const prevIndex = content.lastIndexOf(prevMark);
      if (prevIndex !== -1) {
        insertIndex = prevIndex + prevMark.length;
        break;
      }
    }

    if (insertIndex === content.length) {
      for (let i = currentIndex + 1; i < order.length; i++) {
        const nextComponent = order[i];
        const nextMark = `/* Sun-Panel-Helper JS Start: ${nextComponent} */`;
        const nextIndex = content.indexOf(nextMark);
        if (nextIndex !== -1) {
          insertIndex = nextIndex;
          break;
        }
      }
    }

    const wrappedJs = `;/* Safety */
(function() {
    try {
        ${js.trim()}
    } catch(e) {
        console.error('[Sun-Panel-Helper] Error in hide-login:', e);
    }
})();`;
    const newCode = `${startMark}\n${wrappedJs}\n${endMark}`;
    content = content.slice(0, insertIndex) + (insertIndex === content.length ? '\n\n' : '') + newCode + (insertIndex === content.length ? '' : '\n\n') + content.slice(insertIndex);

    await writeFile(outputPath, content.trim() + '\n', 'utf-8');
    console.log(isAlreadyDeployed ? '更新部署成功' : '新部署成功');
  } catch (error) {
    console.error('部署JS失败:', error);
    throw error;
  }
}

export async function undeploy(): Promise<void> {
  try {
    console.log('准备取消部署，路径:', outputPath);

    let content = '';
    try {
      content = await readFile(outputPath, 'utf-8');
    } catch (error) {
      console.log('文件不存在，无需取消部署');
      return;
    }

    if (!content.includes(startMark)) {
      console.log('文件中不包含该组件代码，无需取消部署');
      return;
    }

    const startIndex = content.indexOf(startMark);
    const endIndex = content.indexOf(endMark, startIndex) + endMark.length;
    if (startIndex !== -1 && endIndex !== -1) {
      content = content.slice(0, startIndex) + content.slice(endIndex).replace(/^\n+/, '');
    }

    content = updateHeaderTime(content.trim());
    await writeFile(outputPath, content, 'utf-8');
    console.log('取消部署成功');
  } catch (error) {
    console.error('取消部署JS失败:', error);
    throw error;
  }
}

export async function isDeployed(): Promise<boolean> {
  try {
    const content = await readFile(outputPath, 'utf-8');
    return content.includes(startMark);
  } catch (error) {
    return false;
  }
} 