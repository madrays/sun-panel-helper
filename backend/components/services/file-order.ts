import { readFile, writeFile } from 'fs/promises';
import { readFileSync } from 'fs';
import { join } from 'path';
import chokidar from 'chokidar';

// 读取组件顺序配置
const orderConfig = JSON.parse(
  readFileSync(join(__dirname, '../config/order.json'), 'utf-8')
);

// 文件路径
const CSS_FILE = join('custom', 'index.css');
const JS_FILE = join('custom', 'index.js');

// 记录上一次的内容
let lastCSSContent = '';
let lastJSContent = '';

/**
 * 重新排序CSS组件
 */
async function reorderCSS() {
  try {
    console.log('开始重排CSS组件...');
    const content = await readFile(CSS_FILE, 'utf-8');
    
    // 如果内容没有变化，直接返回
    if (content === lastCSSContent) {
      console.log('CSS内容未变化，跳过重排');
      return;
    }
    
    const components = new Map();
    
    console.log('正在提取CSS组件...');
    // 提取所有组件代码
    for (const name of orderConfig.css) {
      const startMark = `/* Sun-Panel-Helper CSS Start: ${name} */`;
      const endMark = `/* Sun-Panel-Helper CSS End: ${name} */`;
      
      const startIndex = content.indexOf(startMark);
      if (startIndex !== -1) {
        const endIndex = content.indexOf(endMark) + endMark.length;
        components.set(name, content.slice(startIndex, endIndex));
        console.log(`- 找到组件: ${name}`);
      }
    }

    if (components.size === 0) {
      console.log('没有找到任何CSS组件，跳过重排');
      return;
    }

    console.log(`共找到 ${components.size} 个CSS组件，开始重新排序...`);

    // 移除所有组件代码
    let newContent = content;
    for (const code of components.values()) {
      newContent = newContent.replace(code, '');
    }

    // 按顺序重新插入组件
    console.log('按配置顺序重新插入组件:');
    let insertPoint = newContent.indexOf('*/\n\n') + 4;
    for (const name of orderConfig.css) {
      if (components.has(name)) {
        const code = components.get(name);
        newContent = newContent.slice(0, insertPoint) + '\n\n' + code + newContent.slice(insertPoint);
        insertPoint += code.length + 2;
        console.log(`- 插入组件: ${name}`);
      }
    }

    // 清理多余的空行
    newContent = newContent.replace(/\n{3,}/g, '\n\n');

    // 写入前记录新内容
    lastCSSContent = newContent.trim() + '\n';
    await writeFile(CSS_FILE, lastCSSContent);
    console.log('CSS组件重排完成！');
  } catch (error) {
    console.error('重排CSS顺序失败:', error);
  }
}

/**
 * 重新排序JS组件
 */
async function reorderJS() {
  try {
    console.log('开始重排JS组件...');
    const content = await readFile(JS_FILE, 'utf-8');
    
    // 如果内容没有变化，直接返回
    if (content === lastJSContent) {
      console.log('JS内容未变化，跳过重排');
      return;
    }
    
    const components = new Map();
    
    console.log('正在提取JS组件...');
    // 提取所有组件代码
    for (const name of orderConfig.js) {
      const startMark = `/* Sun-Panel-Helper JS Start: ${name} */`;
      const endMark = `/* Sun-Panel-Helper JS End: ${name} */`;
      
      const startIndex = content.indexOf(startMark);
      if (startIndex !== -1) {
        const endIndex = content.indexOf(endMark) + endMark.length;
        components.set(name, content.slice(startIndex, endIndex));
        console.log(`- 找到组件: ${name}`);
      }
    }

    if (components.size === 0) {
      console.log('没有找到任何JS组件，跳过重排');
      return;
    }

    console.log(`共找到 ${components.size} 个JS组件，开始重新排序...`);

    // 移除所有组件代码
    let newContent = content;
    for (const code of components.values()) {
      newContent = newContent.replace(code, '');
    }

    // 按顺序重新插入组件
    console.log('按配置顺序重新插入组件:');
    let insertPoint = newContent.indexOf('*/\n\n') + 4;
    for (const name of orderConfig.js) {
      if (components.has(name)) {
        const code = components.get(name);
        newContent = newContent.slice(0, insertPoint) + '\n\n' + code + newContent.slice(insertPoint);
        insertPoint += code.length + 2;
        console.log(`- 插入组件: ${name}`);
      }
    }

    // 清理多余的空行
    newContent = newContent.replace(/\n{3,}/g, '\n\n');

    // 写入前记录新内容
    lastJSContent = newContent.trim() + '\n';
    await writeFile(JS_FILE, lastJSContent);
    console.log('JS组件重排完成！');
  } catch (error) {
    console.error('重排JS顺序失败:', error);
  }
}

// 启动文件监控
const watcher = chokidar.watch([CSS_FILE, JS_FILE], {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 3000,    // 等待3秒文件稳定
    pollInterval: 500            // 每500ms检查一次
  }
});

// 添加延迟执行
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

watcher
  .on('change', async (path) => {
    console.log(`\n检测到文件变动: ${path}`);
    console.log('等待文件写入完成...');
    await delay(2000);
    
    if (path.endsWith('index.css')) {
      await reorderCSS();
    } else if (path.endsWith('index.js')) {
      await reorderJS();
    }
  });

console.log('文件顺序监控已启动，等待文件变动...'); 
console.log('文件顺序监控已启动'); 