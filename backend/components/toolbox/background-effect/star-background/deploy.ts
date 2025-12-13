import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { readFileSync, existsSync } from 'fs';

const outputPath = join('custom', 'index.js'); // 指向项目根目录下的 custom/index.js
const componentName = 'star-background';
const startMark = `/* Sun-Panel-Helper JS Start: ${componentName} */`;
const endMark = `/* Sun-Panel-Helper JS End: ${componentName} */`;

// 获取部署顺序配置
let orderConfig: any = { js: [] };
try {
    orderConfig = JSON.parse(readFileSync(join(__dirname, '../../../config/order.json'), 'utf-8'));
} catch (error) {
    console.error('读取组件顺序配置失败:', error);
}

/**
 * 检查是否有其他背景特效已部署
 * @returns {Promise<string | null>} 返回已部署的特效名称，否则返回 null
 */
async function getDeployedEffectName(): Promise<string | null> {
    try {
        const content = await readFile(outputPath, 'utf-8');
        // 检查其他可能的背景特效
        const otherEffects = [
            'particle-background',
            'gradient-background'
            // 添加其他可能的特效
        ];

        for (const effect of otherEffects) {
            const effectStartMark = `/* Sun-Panel-Helper JS Start: ${effect} */`;
            if (content.includes(effectStartMark)) {
                return effect;
            }
        }

        // 检查自己是否已部署
        if (content.includes(startMark)) {
            return componentName;
        }
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            console.error('读取 custom/index.js 检查其他特效时出错:', error);
        }
        // 文件不存在或读取错误，视为没有其他特效部署
    }
    return null;
}

/**
 * 生成头部注释
 */
function generateHeaderComment(): string {
    const now = new Date();
    return `/* Sun-Panel-Helper JS */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致功能冲突或程序异常 */
/* 上次更新：${now.toLocaleString('zh-CN')} */\n`;
}

/**
 * 更新头部注释中的时间
 */
function updateHeaderTime(content: string): string {
    const now = new Date();
    const pattern = /\/\* 上次更新：.*? \*\//;
    return content.replace(pattern, `/* 上次更新：${now.toLocaleString('zh-CN')} */`);
}

/**
 * 生成星空背景特效的JS代码
 */
function generateStarBackgroundScript(): string {
    return `(function() {
    function createStarBackground() {
        // 创建星星
        const stars = [];
        const starCount = 20;
        const colors = ['255,255,255'];

        // 创建星星 DOM 元素
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star-lite';
            document.body.appendChild(star);
            stars.push({
                element: star,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 4 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.3
            });
        }

        // 添加样式
        const style = document.createElement('style');
        style.textContent = \`
            body {
                background-color: #1a1a1a;
                overflow: hidden;
            }
            .star-lite {
                position: fixed;
                border-radius: 50%;
                pointer-events: none;
                animation: twinkle-star 1s ease-in-out infinite;
            }
            @keyframes twinkle-star {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
        \`;
        document.head.appendChild(style);

        // 更新星星位置和样式
        function updateStars() {
            stars.forEach(star => {
                star.element.style.left = star.x + 'px';
                star.element.style.top = star.y + 'px';
                star.element.style.width = star.size + 'px';
                star.element.style.height = star.size + 'px';
                star.element.style.backgroundColor = \`rgba(\${star.color},\${star.opacity})\`;
                
                // 移动星星：向右下角方向移动（x增加，y减小）
                star.x += 0.8;
                star.y -= 0.8;

                // 如果星星超出视图，则随机从左边缘或底部边缘重新出现
                if (star.x > window.innerWidth || star.y < 0) {
                    if (Math.random() < 0.5) {
                        // 从左边缘进入：x为0，y随机
                        star.x = 0;
                        star.y = Math.random() * window.innerHeight;
                    } else {
                        // 从底部边缘进入：y为窗口高度，x随机
                        star.x = Math.random() * window.innerWidth;
                        star.y = window.innerHeight;
                    }
                }
            });
            requestAnimationFrame(updateStars);
        }

        // 处理窗口大小变化
        window.addEventListener('resize', () => {
            stars.forEach(star => {
                if (star.x > window.innerWidth) star.x = Math.random() * window.innerWidth;
                if (star.y > window.innerHeight) star.y = Math.random() * window.innerHeight;
            });
        });

        // 开始动画
        updateStars();
    }

    // 启动
    createStarBackground();
})();void 0;`;
}

/**
 * 检查此组件是否已部署
 */
export async function isDeployed(): Promise<boolean> {
    try {
        // 检查index.js是否存在
        if (!existsSync(outputPath)) {
            return false;
        }

        // 检查是否在index.js中包含了该特效的标记
        const indexContent = await readFile(outputPath, 'utf-8');
        return indexContent.includes(startMark);
    } catch (error: any) {
        console.error(`检查 ${componentName} 部署状态时出错:`, error);
        return false;
    }
}

/**
 * 部署背景特效
 */
export async function deploy(): Promise<{ success: boolean, message?: string, error?: string }> {
    // 部署前检查互斥
    const deployedEffect = await getDeployedEffectName();
    if (deployedEffect && deployedEffect !== componentName) {
        return {
            success: false,
            message: `无法部署，当前已有背景特效 "${deployedEffect}" 正在使用。请先取消部署其他特效。`,
            error: 'ANOTHER_EFFECT_DEPLOYED'
        };
    }

    try {
        // 读取或创建index.js
        let existingContent = '';
        try {
            existingContent = await readFile(outputPath, 'utf-8');
            // 如果文件存在但没有标准头部，添加头部
            if (!existingContent.trim().startsWith('/* Sun-Panel-Helper JS */')) {
                existingContent = generateHeaderComment() + existingContent;
            } else {
                // 更新时间戳
                existingContent = updateHeaderTime(existingContent);
            }
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                console.log(`${outputPath} 不存在，将创建新文件。`);
                existingContent = generateHeaderComment();
            } else {
                console.error(`读取 ${outputPath} 失败:`, error);
                return { success: false, message: `读取 ${outputPath} 失败` };
            }
        }

        // 直接使用完整的JS代码
        const jsCode = generateStarBackgroundScript();

        // 查找组件标记位置
        const startIndex = existingContent.indexOf(startMark);
        const endIndex = existingContent.indexOf(endMark);

        let finalContent = '';
        const wrappedJs = `;/* Safety */
(function() {
    try {
        ${jsCode}
    } catch(e) {
        console.error('[Sun-Panel-Helper] Error in star-background:', e);
    }
})();`;
        const blockToAdd = `${startMark}\n${wrappedJs}\n${endMark}`;

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            // 如果已存在，替换原有内容
            console.log(`${componentName}: 更新现有部署`);
            finalContent =
                existingContent.substring(0, startIndex) +
                blockToAdd +
                existingContent.substring(endIndex + endMark.length);
        } else {
            // 新部署 - 使用与页脚组件相同的顺序处理逻辑
            console.log(`${componentName}: 执行新部署`);
            const order = orderConfig.js || [];
            const currentIndex = order.indexOf(componentName);
            let insertPos = -1;

            // 寻找前一个组件的结束位置
            if (currentIndex > 0) {
                for (let i = currentIndex - 1; i >= 0; i--) {
                    const prevComp = order[i];
                    const prevEndMark = `/* Sun-Panel-Helper JS End: ${prevComp} */`;
                    const prevMarkIndex = existingContent.lastIndexOf(prevEndMark);
                    if (prevMarkIndex !== -1) {
                        insertPos = prevMarkIndex + prevEndMark.length;
                        break;
                    }
                }
            }

            // 如果没找到前面的组件，使用头部注释后的位置
            if (insertPos === -1) {
                const headerEndMatch = existingContent.match(/\/\* 上次更新：.*? \*\/[\r\n]*/);
                insertPos = headerEndMatch ? (headerEndMatch.index ?? 0) + headerEndMatch[0].length : 0;
            }

            // 检查是否需要插入到后面组件的前面
            if (currentIndex !== -1 && currentIndex < order.length - 1) {
                let nextMarkIndex = -1;
                for (let i = currentIndex + 1; i < order.length; i++) {
                    const nextComp = order[i];
                    const nextStartMark = `/* Sun-Panel-Helper JS Start: ${nextComp} */`;
                    nextMarkIndex = existingContent.indexOf(nextStartMark, insertPos);
                    if (nextMarkIndex !== -1) {
                        insertPos = nextMarkIndex;
                        break;
                    }
                }
                if (nextMarkIndex === -1) insertPos = existingContent.length;
            } else {
                insertPos = existingContent.length;
            }

            // 拼接最终内容
            const before = existingContent.substring(0, insertPos);
            const after = existingContent.substring(insertPos);
            finalContent = `${before.trimEnd()}\n\n${blockToAdd}\n\n${after.trimStart()}`.trim();

            // 确保有头部注释
            if (!finalContent.startsWith('/* Sun-Panel-Helper JS */')) {
                finalContent = generateHeaderComment() + finalContent;
            }
        }

        // 写入最终文件
        try {
            await mkdir(dirname(outputPath), { recursive: true });
            await writeFile(outputPath, finalContent + '\n', 'utf-8');
            console.log(`${componentName}: 部署成功`);
            return { success: true };
        } catch (error) {
            console.error(`${componentName}: 写入 ${outputPath} 失败:`, error);
            return { success: false, message: `写入 ${outputPath} 失败` };
        }
    } catch (error) {
        console.error('部署特效失败:', error);
        return {
            success: false,
            message: '部署特效失败',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * 取消部署特效
 */
export async function undeploy(): Promise<{ success: boolean, message?: string }> {
    try {
        let content = '';
        try {
            content = await readFile(outputPath, 'utf-8');
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                console.log('文件不存在，无需取消部署');
                return { success: true, message: '文件不存在，无需取消部署' };
            } else {
                throw error;
            }
        }

        const startIndex = content.indexOf(startMark);
        if (startIndex === -1) {
            console.log(`${componentName} 未部署，无需取消部署`);
            return { success: true, message: '组件未部署，无需取消部署' };
        }

        const endIndex = content.indexOf(endMark, startIndex);
        if (endIndex !== -1) {
            // 删除组件代码块
            const before = content.substring(0, startIndex);
            const after = content.substring(endIndex + endMark.length);
            content = (before.trimEnd() + after.trimStart()).trim();

            // 处理头部注释
            const headerPattern = /^\s*\/\* Sun-Panel-Helper JS \*\/[\s\S]*?\/\* 上次更新：.*? \*\/\s*$/;
            if (headerPattern.test(content)) {
                content = updateHeaderTime(generateHeaderComment());
            } else if (content.trim() === '') {
                content = generateHeaderComment();
            } else {
                content = updateHeaderTime(content);
            }

            // 写回文件
            await writeFile(outputPath, content + '\n', 'utf-8');

            console.log(`${componentName}: 取消部署成功`);
            return { success: true };
        } else {
            console.warn(`${componentName}: 找到开始标记但未找到结束标记。`);
            return {
                success: false,
                message: '找到开始标记但未找到结束标记，文件可能已损坏，请手动检查 custom/index.js'
            };
        }
    } catch (error) {
        console.error(`${componentName}: 取消部署失败:`, error);
        return { success: false, message: '取消部署操作失败' };
    }
}

/**
 * 获取预览代码
 */
export async function getPreviewHtml(): Promise<string> {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>星空背景特效预览</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      height: 100vh;
      font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
    }
    .preview-area {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .instruction {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px;
      color: #fff;
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.6);
      z-index: 10;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="preview-area">
    <div class="instruction">星空背景特效预览</div>
  </div>
  <script>
    ${generateStarBackgroundScript()}
  </script>
</body>
</html>
`;
} 