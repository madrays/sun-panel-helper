import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { readFileSync } from 'fs';

const outputPath = join('custom', 'index.js'); // 指向项目根目录下的 custom/index.js
const componentName = 'icp-footer';
const startMark = `/* Sun-Panel-Helper JS Start: ${componentName} */`;
const endMark = `/* Sun-Panel-Helper JS End: ${componentName} */`;

// ICP配置接口 (与 index.ts 保持一致)
interface IcpConfig {
    icpNumber: string;
    gonganNumber?: string;
    gonganLink?: string;
    textColor?: string;
    linkColor?: string;
    separatorColor?: string; // 添加分隔符颜色字段
}

// 读取其他页脚的 deploy.ts，用于检查互斥
// 注意：这种直接导入可能在某些构建或打包工具中需要特殊处理
// 这里假设可以直接访问
const otherFooters = [
    { name: 'lifeline-footer', path: '../lifeline-footer/deploy.js' }, // 使用编译后的 .js
    // 如果还有其他页脚，在这里添加
];

// 获取部署顺序配置
let orderConfig: any = { js: [] };
try {
    orderConfig = JSON.parse(readFileSync(join(__dirname, '../../../config/order.json'), 'utf-8'));
} catch (error) {
    console.error('读取组件顺序配置失败:', error);
}

/**
 * 检查是否有其他页脚已部署
 * @returns {Promise<string | null>} 返回已部署的页脚名称，否则返回 null
 */
async function getDeployedFooterName(): Promise<string | null> {
    try {
        const content = await readFile(outputPath, 'utf-8');
        for (const footer of otherFooters) {
            const footerStartMark = `/* Sun-Panel-Helper JS Start: ${footer.name} */`;
            if (content.includes(footerStartMark)) {
                return footer.name;
            }
        }
        // 检查自己是否已部署 (虽然 deploy 函数里会检查，但这里也加一层)
        if (content.includes(startMark)) {
            return componentName;
        }

    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            console.error('读取 custom/index.js 检查其他页脚时出错:', error);
        }
        // 文件不存在或读取错误，视为没有其他页脚部署
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
 * 生成 ICP 页脚的 JS 代码
 */
function generateIcpFooterScript(config: IcpConfig): string {
    const icpNumber = config.icpNumber || '';
    const gonganNumber = config.gonganNumber || '';
    const gonganLink = config.gonganLink || 'http://www.beian.gov.cn';
    const textColor = config.textColor || '#909399'; // 默认灰色
    const linkColor = config.linkColor || '#409EFF'; // 默认蓝色
    const separatorColor = config.separatorColor || '#DCDFE6'; // 默认分隔符颜色

    // 使用与前端预览一致的ICP图标
    const icpIconSvg = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:-3px;margin-right:6px;"><path d="M511.427 965.399c170.24-67.637 283.732-164.508 340.479-283.733 73.37-142.153 90.565-306.087 56.746-499.254L511.427 58.028 114.774 188.144c-33.818 187.435-17.196 351.37 51.015 493.522C227.694 801.465 341.76 897.762 511.427 965.4zM216.23 659.312c-62.478-124.384-79.1-266.537-51.014-431.618l345.638-112.92 345.637 112.92c22.355 164.508 5.732 306.087-56.746 425.886C748.73 755.609 651.86 835.283 510.28 897.762c-146.165-56.747-243.035-142.153-294.05-238.45z"></path><path d="M279.282 620.334v-252.78h47.575v252.78h-47.575z m244.182-93.43l45.856 15.475c-6.879 27.514-18.916 47.576-34.965 61.906-16.623 13.183-37.258 20.062-63.052 20.062-31.526 0-57.32-11.464-77.382-34.392-20.062-22.355-30.38-53.88-30.38-94.578 0-42.416 10.318-75.089 30.38-98.016 20.062-23.502 47.003-34.965 79.675-34.965 28.66 0 52.16 9.17 70.503 27.513 10.89 10.89 18.916 26.367 24.074 46.429l-47.002 12.037c-2.293-13.183-8.598-23.501-17.769-30.953-8.598-7.451-19.489-11.463-32.099-11.463-17.77 0-31.526 6.878-42.99 20.061-10.89 13.184-16.622 34.965-16.622 65.345 0 32.099 5.731 54.454 16.622 68.784 10.891 13.756 24.648 20.061 41.27 20.061 12.61 0 23.501-4.585 32.673-13.183 10.317-7.452 17.196-21.208 21.208-40.124z m86.553 93.43v-252.78h76.235c28.66 0 47.575 1.147 56.746 4.013 13.184 4.012 24.648 12.037 33.82 24.647 8.597 12.61 13.756 28.66 13.756 49.295 0 15.476-2.293 28.087-8.025 38.978-5.159 10.89-12.037 18.915-20.062 25.22s-16.623 10.318-24.647 12.037c-11.464 2.293-27.514 4.013-49.868 4.013h-30.38v95.724l-47.575-1.147z m48.148-210.363v71.65h25.794c18.916 0 31.526-1.147 37.831-4.013 6.305-2.293 11.464-6.878 14.903-12.61 4.013-5.732 5.732-12.037 5.732-19.489 0-9.171-2.293-17.196-7.451-22.355-5.16-6.305-11.464-9.17-18.916-11.463-5.732-1.147-17.196-1.72-33.818-1.72h-24.075z"></path></svg>`;

    // 使用与前端预览一致的公安图标
    const gonganIconSvg = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:-3px;margin-right:6px;"><path d="M524.8 1024h-26.112c-4.096 0-7.68-0.512-11.264-2.048l-4.608-1.536C1.536 836.096 61.952 281.6 62.464 275.968l2.56-22.528c2.048-15.36 14.848-27.648 30.72-28.16l22.528-1.024c9.216-0.512 58.88-6.656 66.56-73.728l2.048-16.384c1.536-11.776 9.216-22.016 20.48-26.112l15.36-5.632C417.28 30.72 470.016 11.264 484.864 5.632l1.024-0.512C491.008 2.048 496.64 0 502.784 0h8.192c12.8 0 12.8 0 289.792 101.888l15.36 5.632c11.264 4.096 19.456 14.336 20.992 26.624l2.048 16.384c7.68 67.072 56.832 73.216 66.56 73.728l22.528 1.024c15.872 0.512 28.672 12.8 30.72 28.16l2.56 22.528c0.512 5.632 60.928 560.64-420.352 744.448l-4.608 1.536c-3.584 1.536-7.68 2.048-11.776 2.048z m-19.968-64h13.824c179.2-69.12 297.472-202.24 351.744-395.776 37.376-134.144 29.696-252.416 27.648-276.48-39.936-3.584-110.592-33.28-122.88-126.464C589.824 93.184 524.8 69.12 509.952 64.512h-0.512l-0.512 0.512c-10.24 4.096-56.832 20.992-261.12 96.256-12.288 92.16-80.384 122.88-122.88 126.464-2.048 24.064-9.728 142.336 27.648 276.992C207.36 758.272 325.632 891.392 504.832 960z"></path><path d="M660.48 723.968c-4.096 0-8.704-1.024-12.288-3.072l-135.68-71.68-135.68 71.68c-9.216 4.608-19.968 4.096-28.16-2.048s-12.288-15.872-10.752-26.112l26.112-151.552L253.44 434.176c-7.168-7.168-9.728-17.92-6.656-27.136 3.072-9.728 11.264-16.896 21.504-17.92l152.064-22.016 68.096-137.728c4.608-9.216 13.824-14.848 24.064-14.848s19.456 5.632 24.064 14.848l68.096 137.728 152.064 22.016c10.24 1.536 18.432 8.704 21.504 17.92 3.072 9.728 0.512 20.48-6.656 27.136L660.48 541.184l26.112 151.552c1.536 10.24-2.56 19.968-10.752 26.112-4.608 3.072-9.728 5.12-15.36 5.12zM512 592.384c4.096 0 8.704 1.024 12.288 3.072l100.352 52.736-18.944-112.128c-1.536-8.704 1.536-17.408 7.68-23.552l81.408-79.36-112.128-16.384c-8.704-1.024-16.384-6.656-19.968-14.336L512 301.056l-50.176 101.888c-4.096 7.68-11.264 13.312-19.968 14.336l-112.128 16.384 81.408 79.36c6.144 6.144 9.216 14.848 7.68 23.552l-18.944 112.128 100.352-52.736c3.072-2.56 7.68-3.584 11.776-3.584z"></path></svg>`;

    // 公安备案HTML - 添加SVG和样式增强
    const gonganHtml = gonganNumber
        ? `<a href="${gonganLink}" target="_blank" rel="noopener noreferrer" class="gongan-link" title="公安备案信息">${gonganIconSvg} ${gonganNumber}</a>`
        : '';

    // ICP备案HTML - 添加SVG
    const icpHtml = icpNumber
        ? `<a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" class="icp-link" title="工信部备案信息">${icpIconSvg} ${icpNumber}</a>`
        : '';

    // 结合两部分
    let combinedHtml = '';
    if (icpHtml && gonganHtml) {
        combinedHtml = `${icpHtml} <span class="separator">|</span> ${gonganHtml}`;
    } else {
        combinedHtml = icpHtml || gonganHtml; // 如果只有一个，直接显示
    }

    // 脚本主体
    return `(function() {
    // 创建页脚样式
    function createIcpFooterStyles() {
        const style = document.createElement('style');
        style.textContent = \`
            .custom-footer.icp-footer-container {
                color: ${textColor};
                padding: 10px 0;
                text-align: center;
                font-family: 'Noto Sans SC', 'Microsoft YaHei', 'Segoe UI', sans-serif !important;
                font-size: 13px;
                line-height: 1.6;
                width: 100%;
                box-sizing: border-box;
                background-color: transparent;
            }
            .custom-footer.icp-footer-container * {
                font-family: 'Noto Sans SC', 'Microsoft YaHei', 'Segoe UI', sans-serif !important;
                box-sizing: border-box;
            }
            .custom-footer.icp-footer-container a {
                color: ${textColor};
                text-decoration: none;
                transition: color 0.3s ease, background-color 0.3s ease;
                margin: 0 5px;
                display: inline-flex;
                align-items: center;
                font-weight: 500;
                padding: 4px 8px;
                border-radius: 4px;
                background-color: rgba(255, 255, 255, 0.05);
            }
            .custom-footer.icp-footer-container a:hover {
                color: ${linkColor};
                background-color: rgba(255, 255, 255, 0.1);
            }
            .custom-footer.icp-footer-container .separator {
                margin: 0 10px;
                color: ${separatorColor};
                opacity: 0.8;
                font-weight: 300;
            }
            .custom-footer.icp-footer-container svg {
                display: inline-block;
                vertical-align: middle;
            }
            .custom-footer.icp-footer-container svg path {
                fill: ${textColor};
                transition: fill 0.3s ease;
            }
            .custom-footer.icp-footer-container a:hover svg path {
                fill: ${linkColor};
            }
            @media (max-width: 768px) {
                .custom-footer.icp-footer-container {
                    font-size: 12px;
                    padding: 8px 0;
                }
                .custom-footer.icp-footer-container .separator {
                    margin: 0 6px;
                }
            }
        \`;
        document.head.appendChild(style);
    }

    // 创建页脚HTML
    function createIcpFooterHTML() {
        const footerHTML = \`${combinedHtml}\`;
        return footerHTML;
    }

    // 向页脚注入内容
    function injectIcpFooterContent(footer) {
        // 添加特定类名以应用样式
        footer.classList.add('icp-footer-container');

        if (!footer.hasChildNodes() || footer.dataset.footerInjected !== 'true') {
            footer.innerHTML = createIcpFooterHTML();
            footer.dataset.footerInjected = 'true'; // 标记已注入
        }
    }

    // 查找并处理页脚
    function processIcpFooters() {
        const footerElements = document.querySelectorAll('.custom-footer');
        footerElements.forEach(footer => {
            injectIcpFooterContent(footer);
        });
    }

    // 使用MutationObserver监听DOM变化
    function setupIcpMutationObserver() {
        const footerObserver = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                processIcpFooters();
            });
        });

        // 开始观察整个文档的变化
        footerObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 初始化页脚
    function initIcpFooter() {
        // 添加样式
        createIcpFooterStyles();

        // 处理现有页脚
        processIcpFooters();

        // 设置MutationObserver以处理动态添加的页脚
        setupIcpMutationObserver();
    }

    // 当DOM加载完成后初始化页脚
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initIcpFooter);
    } else {
        initIcpFooter();
    }
})();`;
}

/**
 * 检查此组件是否已部署
 */
export async function isDeployed(): Promise<boolean> {
    try {
        const content = await readFile(outputPath, 'utf-8');
        return content.includes(startMark);
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            console.error(`检查 ${componentName} 部署状态时读取文件失败:`, error);
        }
        return false; // 文件不存在或读取失败视为未部署
    }
}

/**
 * 部署JS
 * @param config 页脚配置对象
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function deploy(config: IcpConfig): Promise<{ success: boolean, message?: string, error?: string }> {
    // 部署前检查互斥
    const deployedFooter = await getDeployedFooterName();
    if (deployedFooter && deployedFooter !== componentName) {
        return {
            success: false,
            message: `无法部署，当前已有页脚 "${deployedFooter}" 正在使用。请先取消部署其他页脚。`,
            error: 'ANOTHER_FOOTER_DEPLOYED'
        };
    }
    if (!config.icpNumber) {
        return { success: false, message: '备案号不能为空，请输入ICP备案号后再部署。' };
    }


    let existingContent = '';
    try {
        existingContent = await readFile(outputPath, 'utf-8');
        if (!existingContent.trim().startsWith('/* Sun-Panel-Helper JS */')) {
            existingContent = generateHeaderComment() + existingContent;
        } else {
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

    const newJsCode = generateIcpFooterScript(config);
    const startIndex = existingContent.indexOf(startMark);
    const endIndex = existingContent.indexOf(endMark);
    let finalContent = '';
    const wrappedJs = `;/* Safety */
(function() {
    try {
        ${newJsCode}
    } catch(e) {
        console.error('[Sun-Panel-Helper] Error in icp-footer:', e);
    }
})();`;
    const blockToAdd = `${startMark}\n${wrappedJs}\n${endMark}`;

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        console.log(`${componentName}: 更新现有部署`);
        finalContent =
            existingContent.substring(0, startIndex) +
            blockToAdd +
            existingContent.substring(endIndex + endMark.length);
    } else {
        console.log(`${componentName}: 执行新部署`);
        const order = orderConfig.js || [];
        const currentIndex = order.indexOf(componentName);
        let insertPos = -1;

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

        if (insertPos === -1) {
            const headerEndMatch = existingContent.match(/\/\* 上次更新：.*? \*\/[\r\n]*/);
            insertPos = headerEndMatch ? (headerEndMatch.index ?? 0) + headerEndMatch[0].length : 0;
        }

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
            if (nextMarkIndex === -1) insertPos = existingContent.length; // 如果后面没找到其他组件，则追加到末尾
        } else {
            insertPos = existingContent.length;
        }

        const before = existingContent.substring(0, insertPos);
        const after = existingContent.substring(insertPos);
        finalContent = `${before.trimEnd()}\n\n${blockToAdd}\n\n${after.trimStart()}`.trim();

        if (!finalContent.startsWith('/* Sun-Panel-Helper JS */')) {
            finalContent = generateHeaderComment() + finalContent;
        }
    }

    try {
        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, finalContent + '\n', 'utf-8');
        console.log(`${componentName}: 部署成功`);
        return { success: true };
    } catch (error) {
        console.error(`${componentName}: 写入 ${outputPath} 失败:`, error);
        return { success: false, message: `写入 ${outputPath} 失败` };
    }
}

/**
 * 取消部署
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
            const before = content.substring(0, startIndex);
            const after = content.substring(endIndex + endMark.length);
            content = (before.trimEnd() + after.trimStart()).trim();

            const headerPattern = /^\s*\/\* Sun-Panel-Helper JS \*\/[\s\S]*?\/\* 上次更新：.*? \*\/\s*$/;
            if (headerPattern.test(content)) {
                content = updateHeaderTime(generateHeaderComment());
            } else if (content.trim() === '') {
                content = generateHeaderComment();
            } else {
                content = updateHeaderTime(content);
            }

            await writeFile(outputPath, content + '\n', 'utf-8');
            console.log(`${componentName}: 取消部署成功`);
            return { success: true };
        } else {
            console.warn(`${componentName}: Found start marker but no end marker.`);
            // 尝试只移除开始标记附近的内容，作为一种恢复尝试
            // 但更安全的做法是提示用户文件可能已损坏
            return { success: false, message: '找到开始标记但未找到结束标记，文件可能已损坏，请手动检查 custom/index.js' };
        }
    } catch (error) {
        console.error(`${componentName}: 取消部署失败:`, error);
        return { success: false, message: '取消部署操作失败' };
    }
}