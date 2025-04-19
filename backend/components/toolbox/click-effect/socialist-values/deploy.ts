import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { readFileSync, existsSync } from 'fs';

const outputPath = join('custom', 'index.js'); // 指向项目根目录下的 custom/index.js
const componentName = 'socialist-values';
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
 * 检查是否有其他点击特效已部署
 * @returns {Promise<string | null>} 返回已部署的特效名称，否则返回 null
 */
async function getDeployedEffectName(): Promise<string | null> {
    try {
        const content = await readFile(outputPath, 'utf-8');
        // 检查其他可能的点击特效 (此处可以扩展)
        const otherEffects = [
            'click-effect-1',
            'click-effect-2'
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
 * 生成社会主义核心价值观点击特效的JS代码
 */
function generateSocialistValuesScript(): string {
    return `(function () {
    // 左键点击索引
    var a_idx = 0;
    // 右键点击索引
    var b_idx = 0;
    
    // 文本内容数组 - 原始社会主义核心价值观词汇
    var leftClickTexts = [
        "富强", "民主", "文明", "和谐", 
        "自由", "平等", "公正", "法治", 
        "爱国", "敬业", "诚信", "友善"
    ];
    
    // 右键点击也使用相同的词汇，保持一致性
    var rightClickTexts = leftClickTexts;
    
    // 左键点击符号数组，可随机选择
    var leftSymbols = ["✨", "🌟", "💫", "⭐", "🌠", "🌈"];
    
    // 右键点击符号数组，可随机选择
    var rightSymbols = ["🍀", "🌸", "🌺", "🌻", "🌹", "🌷"];
    
    // 文字颜色数组 - 使用柔和的颜色
    var textColors = [
        "#ff7eb9", "#ff65a3", "#7afcff", "#feff9c", 
        "#fff740", "#ff65a3", "#a2a2fb", "#96f7d2"
    ];

    // 左键点击效果
    window.onclick = function (event) {
        createClickEffect(event, leftClickTexts, a_idx, leftSymbols, textColors, "left");
        a_idx = (a_idx + 1) % leftClickTexts.length;
    };

    // 右键点击效果
    window.oncontextmenu = function (event) {
        event.preventDefault(); // 阻止默认右键菜单
        createClickEffect(event, rightClickTexts, b_idx, rightSymbols, textColors, "right");
        b_idx = (b_idx + 1) % rightClickTexts.length;
        return false;
    };

    // 创建点击效果
    function createClickEffect(event, textArray, idx, symbolArray, colorArray, clickType) {
        // 随机选择符号
        var symbol = symbolArray[Math.floor(Math.random() * symbolArray.length)];
        
        // 创建元素
        var element = document.createElement("div");
        element.className = "click-effect-" + clickType;
        
        // 随机选择颜色
        var color = colorArray[Math.floor(Math.random() * colorArray.length)];
        
        // 设置内容 - 使用优美的格式但保留原始词汇
        var displayText = symbol + " " + textArray[idx] + " " + symbol;
        
        // 添加到页面
        document.body.appendChild(element);
        element.innerHTML = displayText;
        
        // 随机配置
        var size = 14 + Math.floor(Math.random() * 8);
        var initialScale = 0.4 + Math.random() * 0.6;
        var finalScale = 1.0 + Math.random() * 0.5;
        var x = event.clientX;
        var y = event.clientY;
        var randomAngle = Math.random() * 40 - 20; // -20 到 20 度
        var moveDistance = 80 + Math.random() * 60; // 移动距离
        
        // 初始样式 - 简化样式，无背景但保留精美效果
        element.style.cssText = \`
            position: fixed;
            z-index: 9999;
            left: \${x}px;
            top: \${y}px;
            font-size: \${size}px;
            font-weight: bold;
            color: \${color};
            pointer-events: none;
            transform: translate(-50%, -50%) scale(\${initialScale}) rotate(0deg);
            opacity: 0;
            text-shadow: 0 2px 10px rgba(0,0,0,0.15);
            white-space: nowrap;
            user-select: none;
            transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
        \`;
        
        // 强制重排，确保动画生效
        void element.offsetWidth;
        
        // 动画效果
        setTimeout(() => {
            element.style.opacity = "1";
            element.style.transform = \`
                translate(-50%, calc(-50% - \${moveDistance}px)) 
                scale(\${finalScale}) 
                rotate(\${randomAngle}deg)
            \`;
            
            // 淡出并移除
            setTimeout(() => {
                element.style.opacity = "0";
                setTimeout(() => {
                    if (element.parentNode) {
                        document.body.removeChild(element);
                    }
                }, 200);
            }, 600);
        }, 10);
    }

    // 添加鼠标跟随效果
    function addMouseTrail() {
        const trailContainer = document.createElement('div');
        trailContainer.className = 'mouse-trail-container';
        trailContainer.style.cssText = \`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
        \`;
        document.body.appendChild(trailContainer);
        
        const createTrailDot = () => {
            const dot = document.createElement('div');
            dot.className = 'trail-dot';
            dot.style.cssText = \`
                position: absolute;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                box-shadow: 0 0 10px rgba(100, 230, 255, 0.8);
                transform: translate(-50%, -50%);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.1s ease;
            \`;
            trailContainer.appendChild(dot);
            return dot;
        };
        
        const dots = Array.from({ length: 12 }, createTrailDot);
        const positions = Array(dots.length).fill({ x: 0, y: 0 });
        let mouseX = 0, mouseY = 0;
        let isMoving = false;
        let timeout;
        
        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMoving = true;
            clearTimeout(timeout);
            
            dots.forEach(dot => {
                dot.style.opacity = '1';
            });
            
            timeout = setTimeout(() => {
                isMoving = false;
                dots.forEach(dot => {
                    dot.style.opacity = '0';
                });
            }, 100);
        });
        
        function updateTrail() {
            if (isMoving) {
                // 将新位置添加到数组开头
                positions.unshift({ x: mouseX, y: mouseY });
                // 移除最后一个位置以保持数组长度不变
                positions.pop();
            }
            
            // 更新每个点的位置
            dots.forEach((dot, i) => {
                const pos = positions[i] || positions[positions.length - 1];
                const delayFactor = i * 2;
                
                // 使颜色随索引变化
                const hue = (i * 30) % 360;
                dot.style.background = \`hsla(\${hue}, 100%, 70%, \${0.7 - i * 0.05})\`;
                dot.style.width = \`\${Math.max(4, 12 - i)}px\`;
                dot.style.height = \`\${Math.max(4, 12 - i)}px\`;
                dot.style.boxShadow = \`0 0 \${8 - i * 0.6}px hsla(\${hue}, 100%, 70%, 0.8)\`;
                
                // 应用延迟后的位置
                dot.style.transform = \`translate(\${pos.x}px, \${pos.y}px)\`;
            });
            
            requestAnimationFrame(updateTrail);
        }
        
        updateTrail();
    }
    
    // 初始化
    function init() {
        // 添加鼠标跟随效果
        addMouseTrail();
        
        // 添加全局样式
        const style = document.createElement('style');
        style.textContent = \`
            .click-effect-left, .click-effect-right {
                font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
                text-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            @keyframes floatUp {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-60px) scale(1.6); opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
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
        
        // 检查是否在index.js中引用了该脚本
        const indexContent = await readFile(outputPath, 'utf-8');
        return indexContent.includes(startMark);
    } catch (error: any) {
        console.error(`检查 ${componentName} 部署状态时出错:`, error);
        return false;
    }
}

/**
 * 部署点击特效
 */
export async function deploy(): Promise<{success: boolean, message?: string, error?: string}> {
    // 部署前检查互斥
    const deployedEffect = await getDeployedEffectName();
    if (deployedEffect && deployedEffect !== componentName) {
        return {
            success: false,
            message: `无法部署，当前已有特效 "${deployedEffect}" 正在使用。请先取消部署其他特效。`,
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
        const jsCode = generateSocialistValuesScript();
        
        // 查找组件标记位置
        const startIndex = existingContent.indexOf(startMark);
        const endIndex = existingContent.indexOf(endMark);
        
        let finalContent = '';
        const blockToAdd = `${startMark}\n${jsCode}\n${endMark}`;

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
export async function undeploy(): Promise<{success: boolean, message?: string}> {
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
  <title>社会主义核心价值观点击特效预览</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #f5f5f5;
      font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
    }
    .preview-area {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #fff;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .instruction {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
      color: #666;
      text-align: center;
      padding: 10px;
      border-radius: 4px;
      background-color: rgba(255, 255, 255, 0.8);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      pointer-events: none;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="preview-area">
    <div class="instruction">在此区域点击鼠标左键或右键查看效果</div>
  </div>
  <script>
    ${generateSocialistValuesScript()}
  </script>
</body>
</html>
`;
} 