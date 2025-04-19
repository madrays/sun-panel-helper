import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { readFileSync } from 'fs'
// Removed: import { footerTemplate } from './template'

// 运行时已在backend目录下，使用join拼接路径
const outputPath = join('custom', 'index.js')

// 组件标记
const startMark = '/* Sun-Panel-Helper JS Start: lifeline-footer */'
const endMark = '/* Sun-Panel-Helper JS End: lifeline-footer */'

// Define interfaces (keep as is)
interface SocialLink {
  title: string;
  url: string;
  icon: string;
  enabled: boolean;
  isCustomIcon?: boolean;
  customIconCode?: string;
  name?: string;
}

interface FooterConfig {
  siteLaunchDate?: string;
  enableUptime: boolean;
  enableSocialLinks: boolean;
  enableCustomContent: boolean;
  enableHelperAd: boolean;
  enableTime?: boolean;
  uptimePrefix?: string;
  moduleOrder?: string[];
  customContent?: {
    text: string;
    enabled: boolean;
  };
  socialLinks?: SocialLink[];
  textColor?: string;
  accentColor?: string;
}

// 读取组件顺序配置
let orderConfig: any = { js: [] }
try {
  orderConfig = JSON.parse(
    readFileSync(join(__dirname, '../../../config/order.json'), 'utf-8')
  )
} catch (error) {
  console.error('读取组件顺序配置失败:', error)
}

/**
 * 生成头部注释
 */
function generateHeaderComment(): string {
  const now = new Date()
  return `/* Sun-Panel-Helper JS */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致功能冲突或程序异常 */
/* 上次更新：${now.toLocaleString('zh-CN')} */\n`
}

/**
 * 更新头部注释中的时间
 */
function updateHeaderTime(content: string): string {
  const now = new Date()
  const pattern = /\/\* 上次更新：.*? \*\//
  return content.replace(pattern, `/* 上次更新：${now.toLocaleString('zh-CN')} */`)
}

// Helper function to generate Social Links HTML
function generateSocialLinksHtml(socialLinks: SocialLink[]): string {
    if (!socialLinks || socialLinks.length === 0) {
        return '';
    }
    const linksHtml = socialLinks
        .filter(link => link.enabled)
        .map((link) => {
            let iconHtml;
            if (link.isCustomIcon && link.customIconCode) {
                // Escape potential problematic characters in customIconCode for class attribute
                const safeIconCode = link.customIconCode.replace(/\"/g, '\'').replace(/\'/g, '\\\'');
                iconHtml = `<i class="${safeIconCode}"></i>`;
            } else if (link.icon?.startsWith('fa')) {
                // Escape potential problematic characters in icon class
                const safeIconClass = link.icon.replace(/\"/g, '\'').replace(/\'/g, '\\\'');
                iconHtml = `<i class="${safeIconClass}"></i>`;
            } else if (link.icon) {
                 // Escape icon if it's text/emoji
                const safeIconText = link.icon
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\"/g, '&quot;')
                    .replace(/\'/g, '&#39;');
                 iconHtml = `<span class="custom-icon">${safeIconText}</span>`;
            } else {
                 iconHtml = '';
            }
            const linkText = link.name || link.title || 'Link';
            // Escape URL and link text for HTML attributes and content
            const escapedUrl = link.url
                .replace(/&/g, "&amp;")
                .replace(/\"/g, "&quot;")
                .replace(/\'/g, "&#39;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            const escapedText = linkText
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\"/g, '&quot;')
                .replace(/\'/g, '&#39;');

            return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${iconHtml}${escapedText}</a>`;
        })
        .join('\n                            '); // Indentation for readability

    return `<div class="link-group">\n                            ${linksHtml}\n                        </div>`;
}

// Helper function to generate Custom Content HTML
function generateCustomContentHtml(customContent: { text: string; enabled: boolean } | undefined): string {
    if (!customContent || !customContent.enabled || !customContent.text) {
        return '';
    }
    // Escape for safe HTML embedding, handle newlines
    const formattedText = customContent.text
        .replace(/&/g, '&amp; ')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&#39;')
        .replace(/\n/g, '<br>');

    return `<div class="footer-values">\n                        ${formattedText}\n                    </div>`;
}

// Removed the old processTemplate function

/**
 * Generates the complete, self-contained JavaScript code string for the lifeline footer.
 */
function generateLifelineFooterScript(config: FooterConfig): string {
    // 只处理必要的配置项，其余保持用户模板的原样
    const textColor = config.textColor || '#FFFFFF';
    const accentColor = config.accentColor || '#7ee7ff'; // 恢复为默认青色
    const uptimePrefix = config.uptimePrefix || '本站已苟活';
    const launchDate = config.siteLaunchDate || new Date().toISOString().split('T')[0];
    const formattedLaunchDate = launchDate.includes('T') ? launchDate : `${launchDate}T00:00:00+08:00`;
    
    // 处理社交链接
    let socialLinksHtml = '';
    if (config.enableSocialLinks && Array.isArray(config.socialLinks) && config.socialLinks.length > 0) {
        socialLinksHtml = config.socialLinks
            .filter(link => link.enabled)
            .map(link => {
                let iconHtml;
                if (link.isCustomIcon && link.customIconCode) {
                    iconHtml = `<i class="${link.customIconCode.replace(/"/g, '\\"')}"></i>`;
                } else if (link.icon?.startsWith('fa')) {
                    iconHtml = `<span class="${link.icon.replace(/"/g, '\\"')}"></span>`;
                } else if (link.icon) {
                    iconHtml = `<span class="custom-icon">${link.icon}</span>`;
                } else {
                    iconHtml = '';
                }
                
                return `<a href="${link.url.replace(/"/g, '\\"')}" target="_blank" rel="noopener noreferrer">
                    ${iconHtml}${link.name || link.title || 'Link'}
                </a>`;
            })
            .join('\n                            ');
    } else {
        // 默认社交链接
        socialLinksHtml = `<a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                <span class="fab fa-github"></span>GitHub
                            </a>
                            <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                                <span class="fas fa-blog"></span>博客
                            </a>`;
    }
    
    // 处理自定义内容（不添加强制的爱心图标）
    let customContentHtml = '';
    if (config.enableCustomContent && config.customContent?.enabled && config.customContent?.text) {
        customContentHtml = config.customContent.text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    } else {
        customContentHtml = '富强· 自由· 平等· 爱国· 民主· 文明· 和谐· 公正· 法治· 敬业· 诚信· 友善';
    }
    
    // 创建模块HTML对象，供后续排序使用
    const moduleHtmls: Record<string, string> = {};
    
    // 运行时间模块
    moduleHtmls['uptime'] = config.enableUptime ? `
                    <!-- 顶部行：运行时间 -->
                    <div class="top-row">
                        <div class="uptime-container">
                            <div class="uptime-title">
                                <span class="fas fa-heart-pulse"></span>
                                <span>${uptimePrefix}</span>
                            </div>
                            <div id="day_show_container" class="time-blocks">载入中...</div>
                        </div>
                    </div>` : '';
    
    // 社交链接模块
    moduleHtmls['social'] = config.enableSocialLinks ? `
                    <!-- 中间行：个人链接 -->
                    <div class="middle-row">
                        <div class="link-group">
                            ${socialLinksHtml}
                        </div>
                    </div>` : '';
    
    // 时间模块（根据 enableTime 决定是否启用）
    // 如果 enableTime 未定义（旧配置），则默认为启用
    const isTimeEnabled = config.enableTime === undefined ? true : config.enableTime;
    moduleHtmls['time'] = isTimeEnabled ? `
                    <!-- 下方行：时辰和载入时间 -->
                    <div class="bottom-row">
                        <div class="runtime-block">
                            <span class="fas fa-clock"></span>
                            <span>当前时辰：</span>
                            <a href="https://www.beijing-time.org/shichen" target="_blank" rel="noopener noreferrer">
                                <span id="time_show" class="time-number">载入中...</span>
                            </a>
                        </div>
                        
                        <div class="runtime-block">
                            <span class="fas fa-bolt"></span>
                            <span>载入耗时：</span>
                            <span id="load_show" class="time-number">载入中...</span>
                        </div>
                    </div>` : '';
    
    // 自定义内容/核心价值观模块
    moduleHtmls['values'] = (config.enableCustomContent && config.customContent?.enabled) ? `
                    <!-- 核心价值观/自定义内容 -->
                    <div class="footer-values">
                        ${customContentHtml}
                    </div>` : '';
    moduleHtmls['customContent'] = moduleHtmls['values']; // 兼容
    
    // Helper广告模块
    moduleHtmls['helper'] = config.enableHelperAd ? `
                    <!-- Helper广告 -->
                    <div class="helper-ad">
                        <a href="https://helper.cocoyoo.cn" target="_blank" rel="noopener noreferrer" class="helper-content">
                            <span class="fas fa-rocket"></span>
                            <span>本站Sun-Panel美化增强 By-</span>
                            <span class="helper-name">Sun-Panel-Helper</span>
                            <span class="helper-tagline"> - 让您的Sun-Panel锦上添花~</span>
                        </a>
                    </div>` : '';
    
    // 根据moduleOrder排序生成最终的内容HTML
    let contentHTML = '';
    const moduleOrder = config.moduleOrder || ['uptime', 'social', 'time', 'customContent', 'helper'];
    console.log('使用的模块顺序:', moduleOrder);
    moduleOrder.forEach(moduleName => {
        if (moduleHtmls[moduleName]) {
            contentHTML += moduleHtmls[moduleName];
        }
    });
    
    // 使用用户提供的模板，替换必要的配置项
    return `(function() {
    // 创建页脚样式
    function createFooterStyles() {
        const style = document.createElement('style');
        style.textContent = \`
            /* 字体定义 */
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');
            
            /* 基本样式 */
            .custom-footer {
                color: ${textColor};
                padding: 8px 0;
                text-align: center;
                font-family: 'Noto Sans SC', 'Microsoft YaHei', 'Segoe UI', sans-serif !important;
                font-size: 15px;
                line-height: 1.4;
                width: 100%;
                box-sizing: border-box;
            }

            .custom-footer * {
                font-family: 'Noto Sans SC', 'Microsoft YaHei', 'Segoe UI', sans-serif !important;
                box-sizing: border-box;
            }

            .footer-body {
                max-width: 1000px;
                margin: 0 auto;
                padding: 0 12px;
                width: 100%;
            }
            
            /* 图标样式 */
            .footer-body .fas, .footer-body .fab {
                margin-right: 4px;
                font-size: 16px;
                vertical-align: -1px;
                transition: transform 0.3s ease;
                font-family: 'Font Awesome 6 Free', 'Font Awesome 6 Brands' !important;
            }
            
            /* 自定义图标样式 */
            .footer-body .custom-icon {
                width: 18px;
                height: 18px;
                margin-right: 4px;
                vertical-align: -3px;
                border-radius: 2px;
                transition: transform 0.3s ease;
            }

            /* 链接样式 */
            .footer-body a {
                color: ${textColor};
                text-decoration: none;
                transition: all 0.3s ease;
                margin: 0 8px;
                white-space: nowrap;
                display: inline-flex;
                align-items: center;
            }

            .footer-body a:hover {
                color: ${accentColor};
                transform: translateY(-2px);
            }
            
            /* 社交链接额外样式 */
            .link-group a {
                color: ${accentColor};
            }
            
            .link-group a:hover {
                filter: brightness(1.2);
            }
            
            .footer-body a:hover .fas,
            .footer-body a:hover .fab,
            .footer-body a:hover .custom-icon {
                transform: scale(1.1);
            }
            
            /* 页脚主体布局 */
            .footer-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                width: 100%;
            }
            
            /* 运行时间样式 */
            .top-row, .middle-row, .bottom-row {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                width: 100%;
                gap: 15px;
                margin: 3px 0;
            }
            
            .runtime-block {
                display: flex;
                align-items: center;
            }
            
            .uptime-container {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .uptime-title {
                display: inline-flex;
                align-items: center;
                font-weight: 500;
            }
            
            .uptime-title .fas {
                color: ${accentColor};
                animation: heartbeat 1.3s infinite;
            }
            
            @keyframes heartbeat {
                0% { transform: scale(1); }
                15% { transform: scale(1.15); }
                30% { transform: scale(1); }
                45% { transform: scale(1.15); }
                60% { transform: scale(1); }
                100% { transform: scale(1); }
            }
            
            .time-blocks {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .time-block {
                display: flex;
                align-items: center;
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 8px;
                border-radius: 4px;
                transition: background 0.3s ease, transform 0.3s ease;
            }
            
            .time-block:hover {
                background: rgba(0, 0, 0, 0.15);
                transform: translateY(-1px);
            }
            
            .time-value {
                color: ${accentColor};
                font-weight: bold;
                font-size: 1.1em;
                margin-right: 2px;
            }
            
            .time-label {
                font-size: 0.8em;
                opacity: 0.85;
            }
            
            .time-number {
                color: ${accentColor};
                font-weight: bold;
                margin: 0 2px;
                font-size: 1.05em;
            }
            
            /* 链接块样式 */
            .links-row {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .link-group {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 0 3px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            /* 社会主义核心价值观样式 */
            .footer-values {
                font-size: 0.95em;
                opacity: 0.9;
                padding: 2px 0;
                transition: opacity 0.3s ease;
                text-align: center;
                width: 100%;
            }
            
            .footer-values:hover {
                opacity: 1;
            }
            
            .footer-body .fas.fa-heart {
                margin: 0 2px;
                color: #ff7eb8;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            /* Helper 广告样式 */
            .helper-ad {
                margin-top: 3px;
                padding: 2px 0;
                width: 100%;
                display: flex;
                justify-content: center;
            }
            
            .helper-content {
                display: inline-flex;
                align-items: center;
                background: rgba(0, 0, 0, 0.1);
                padding: 4px 12px;
                border-radius: 20px;
                transition: background 0.3s ease, transform 0.3s ease;
                flex-wrap: wrap;
                justify-content: center;
                max-width: 100%;
            }
            
            .helper-content:hover {
                background: rgba(0, 0, 0, 0.15);
                transform: translateY(-2px);
            }
            
            .helper-name {
                color: ${accentColor};
                font-weight: bold;
                font-size: 1.1em;
                letter-spacing: 0.3px;
                position: relative;
                display: inline-block;
                padding: 0 2px;
                transition: color 0.3s ease;
            }
            
            .helper-ad a:hover .helper-name {
                color: ${accentColor};
                filter: brightness(1.15);
            }
            
            .helper-tagline {
                font-style: italic;
                margin-left: 5px;
                opacity: 0.95;
            }
            
            /* 响应式修复 */
            @media (max-width: 600px) {
                .uptime-container {
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                
                .uptime-title {
                    margin-right: 0;
                }
                
                .helper-content {
                    padding: 4px 10px;
                    flex-wrap: wrap;
                    justify-content: center;
                    text-align: center;
                    width: 90%;
                }
                
                .helper-content > span {
                    margin: 2px;
                }
                
                .helper-tagline {
                    width: 100%;
                    margin-left: 0;
                    text-align: center;
                }
                
                .bottom-row {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .time-blocks {
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .time-block {
                    margin: 3px;
                }
                
                .custom-footer {
                    font-size: 14px;
                }
                
                .helper-name {
                    display: block;
                    margin: 2px auto;
                }
            }
            
            @media (max-width: 380px) {
                .link-group {
                    flex-direction: column;
                    gap: 5px;
                }
                
                .link-group a {
                    margin: 2px 0;
                }
                
                .footer-values {
                    font-size: 0.85em;
                    padding: 5px;
                    line-height: 1.5;
                }
            }
        \`;
        document.head.appendChild(style);
    }

    // 创建Font Awesome链接（如果页面中还没有）
    function addFontAwesome() {
        // 检查是否已经加载了Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
            document.head.appendChild(link);
        }
    }

    // 添加Web字体
    function addWebFonts() {
        if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
            const fontLink = document.createElement('link');
            fontLink.rel = 'preconnect';
            fontLink.href = 'https://fonts.googleapis.com';
            document.head.appendChild(fontLink);
            
            const fontLink2 = document.createElement('link');
            fontLink2.rel = 'preconnect';
            fontLink2.href = 'https://fonts.gstatic.com';
            fontLink2.crossOrigin = '';
            document.head.appendChild(fontLink2);
        }
    }

    // 创建页脚HTML
    function createFooterHTML() {
        const footerHTML = \`
            <div class="footer-body">
                <div class="footer-content">
                    ${contentHTML}
                </div>
            </div>
        \`;
        return footerHTML;
    }

    // 计算站点已运行的天数
    function calculateUptimeSinceLaunch() {
        // 使用固定的时区处理，彻底修复时区问题
        const launchDateStr = '${formattedLaunchDate}'; // 直接使用UTC+8北京时间格式
        const launchDate = new Date(launchDateStr);
        
        // 将当前时间转换为北京时间的毫秒数
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const beijingTime = new Date(utc + (3600000 * 8)); // 显式转换为北京时间
        
        const timeDifference = beijingTime - launchDate;
        
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds };
    }

    // 更新运行天数 - 时分秒放在同一行
    function updateUptimeSinceLaunch() {
        const uptimeContainer = document.getElementById('day_show_container');
        if (!uptimeContainer) return;
        
        const { days, hours, minutes, seconds } = calculateUptimeSinceLaunch();
        
        // 创建时分秒方块，数字和单位放在同一行
        const html = \`
            <div class="time-block">
                <span class="time-value">\${days}</span>
                <span class="time-label">天</span>
            </div>
            <div class="time-block">
                <span class="time-value">\${hours.toString().padStart(2, '0')}</span>
                <span class="time-label">时</span>
            </div>
            <div class="time-block">
                <span class="time-value">\${minutes.toString().padStart(2, '0')}</span>
                <span class="time-label">分</span>
            </div>
            <div class="time-block">
                <span class="time-value">\${seconds.toString().padStart(2, '0')}</span>
                <span class="time-label">秒</span>
            </div>
        \`;
        
        uptimeContainer.innerHTML = html;
    }

    // 更新当前时辰
    function updateTime() {
        const timeShow = document.getElementById('time_show');
        if (!timeShow) return;
        
        // 计算北京时间的小时
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const beijingTime = new Date(utc + (3600000 * 8));
        const hour = beijingTime.getHours(); // 北京时间的小时
        
        let text;

        // 修复时辰显示bug，确保所有时间点都有对应的时辰
        if (hour == 23 || hour == 0) {
            text = "子时";
        } else if (hour >= 1 && hour < 3) {
            text = "丑时";
        } else if (hour >= 3 && hour < 5) {
            text = "寅时";
        } else if (hour >= 5 && hour < 7) {
            text = "卯时";
        } else if (hour >= 7 && hour < 9) {
            text = "辰时";
        } else if (hour >= 9 && hour < 11) {
            text = "巳时";
        } else if (hour >= 11 && hour < 13) {
            text = "午时";
        } else if (hour >= 13 && hour < 15) {
            text = "未时";
        } else if (hour >= 15 && hour < 17) {
            text = "申时";
        } else if (hour >= 17 && hour < 19) {
            text = "酉时";
        } else if (hour >= 19 && hour < 21) {
            text = "戌时";
        } else if (hour >= 21 && hour < 23) {
            text = "亥时";
        }

        timeShow.textContent = text;
    }

    // 更新页面载入耗时
    function updateLoadTime() {
        const loadShow = document.getElementById('load_show');
        if (loadShow) {
            const loadTime = performance.now().toFixed(2); // 页面载入耗时（毫秒）
            loadShow.textContent = \`\${loadTime} ms\`;
        }
    }

    // 初始化定时器，定期更新动态内容
    function initUpdaters() {
        // 初始化更新
        ${config.enableUptime ? 'updateUptimeSinceLaunch();' : ''}
        ${isTimeEnabled ? 'updateTime();' : ''}
        ${isTimeEnabled ? 'updateLoadTime();' : ''}

        // 设置定时器，定期更新
        setInterval(() => {
            ${config.enableUptime ? 'updateUptimeSinceLaunch();' : ''}
            ${isTimeEnabled ? 'updateTime();' : ''}
        }, 1000);
    }

    // 向页脚注入内容
    function injectFooterContent(footer) {
        if (footer && (!footer.hasChildNodes() || footer.dataset.footerInjected !== 'true')) {
            footer.innerHTML = createFooterHTML();
            footer.dataset.footerInjected = 'true'; // 标记已注入
            initUpdaters(); // 初始化定时更新
        }
    }

    // 查找并处理页脚
    function processFooters() {
        const footerElements = document.querySelectorAll('.custom-footer');
        footerElements.forEach(footer => {
            injectFooterContent(footer);
        });
    }

    // 使用MutationObserver监听DOM变化
    function setupMutationObserver() {
        const footerObserver = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                processFooters();
            });
        });

        // 开始观察整个文档的变化
        footerObserver.observe(document.body, { 
            childList: true,
            subtree: true 
        });
    }

    // 初始化页脚
    function initFooter() {
        // 添加Font Awesome
        addFontAwesome();
        
        // 添加Web字体
        addWebFonts();
        
        // 添加样式
        createFooterStyles();
        
        // 处理现有页脚
        processFooters();
        
        // 设置MutationObserver以处理动态添加的页脚
        setupMutationObserver();
    }

    // 当DOM加载完成后初始化页脚
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooter);
    } else {
        initFooter();
    }
})();`;
}

// Function to read existing JS file content is implicit via deploy logic

/**
 * 检查是否有其他页脚已部署
 * @returns {Promise<string | null>} 返回已部署的页脚名称，否则返回 null
 */
async function getDeployedFooterName(): Promise<string | null> {
    try {
        const content = await readFile(outputPath, 'utf-8');
        // 检查其他页脚
        const otherFooters = [
            { name: 'icp-footer' },
            // 如果还有其他页脚，在这里添加
        ];
        
        for (const footer of otherFooters) {
            const footerStartMark = `/* Sun-Panel-Helper JS Start: ${footer.name} */`;
            if (content.includes(footerStartMark)) {
                return footer.name;
            }
        }
        
        // 检查自己是否已部署
        if (content.includes(startMark)) {
             return 'lifeline-footer';
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
 * 检查是否已部署
 */
export async function isDeployed(): Promise<boolean> {
  try {
    const content = await readFile(outputPath, 'utf-8')
    return content.includes(startMark)
  } catch (error) {
    return false
  }
}

/**
 * 部署JS
 * @param config 页脚配置对象
 */
export async function deploy(config: FooterConfig): Promise<{success: boolean, message?: string, error?: string}> {
  // 部署前检查互斥
  const deployedFooter = await getDeployedFooterName();
  if (deployedFooter && deployedFooter !== 'lifeline-footer') {
      return { 
          success: false, 
          message: `无法部署，当前已有页脚 "${deployedFooter}" 正在使用。请先取消部署其他页脚。`,
          error: 'ANOTHER_FOOTER_DEPLOYED'
      };
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
      console.log('custom/index.js 不存在，将创建新文件。');
      existingContent = generateHeaderComment();
    } else {
      console.error('读取 custom/index.js 失败:', error);
      throw new Error('读取 custom/index.js 失败');
    }
  }

  // Generate the new JS code for this component using the config
  const newJsCode = generateLifelineFooterScript(config);

  // Check if the block already exists and replace or insert
  const startIndex = existingContent.indexOf(startMark);
  const endIndex = existingContent.indexOf(endMark);
  let finalContent = '';

  const blockToAdd = `${startMark}\n${newJsCode}\n${endMark}`; // newJsCode is already trimmed

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    // Block exists, replace it
    console.log('Lifeline Footer: 更新现有部署');
    finalContent =
        existingContent.substring(0, startIndex) +
        blockToAdd +
        existingContent.substring(endIndex + endMark.length);
  } else {
    // Block doesn't exist, insert based on order
    console.log('Lifeline Footer: 执行新部署');
    const order = orderConfig.js || [];
    const currentIndex = order.indexOf('lifeline-footer');
    let insertPos = -1; // Sentinel value

    // Find position AFTER the previous component in order
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

    // If previous component not found, or it's the first, insert after header
    if (insertPos === -1) {
        const headerEndMatch = existingContent.match(/\/\* 上次更新：.*? \*\/[\r\n]*/);
        insertPos = headerEndMatch ? (headerEndMatch.index ?? 0) + headerEndMatch[0].length : 0;
    }

    // Find position BEFORE the next component (if inserting somewhere in the middle)
    if (currentIndex !== -1 && currentIndex < order.length - 1) {
        let nextMarkIndex = -1;
        for (let i = currentIndex + 1; i < order.length; i++) {
            const nextComp = order[i];
            const nextStartMark = `/* Sun-Panel-Helper JS Start: ${nextComp} */`;
            nextMarkIndex = existingContent.indexOf(nextStartMark, insertPos); // Search after the calculated insertPos
            if (nextMarkIndex !== -1) {
                 // Found the next component, insert right before it
                 insertPos = nextMarkIndex;
                 break;
            }
        }
         // If next component wasn't found, insertPos remains where it was (after previous or after header)
         // If insertPos is still the end (meaning no previous and no next found), set to end
         if (insertPos === -1) insertPos = existingContent.length;
    } else {
         // If it's the last component in order, or order is unknown, append to end
         insertPos = existingContent.length;
    }

    // Insert the block at the calculated position
    const before = existingContent.substring(0, insertPos);
    const after = existingContent.substring(insertPos);
    // Add newlines carefully
    finalContent = `${before.trimEnd()}\n\n${blockToAdd}\n\n${after.trimStart()}`.trim();

    // Ensure header is present if it wasn't the only content
    if (!finalContent.startsWith('/* Sun-Panel-Helper JS */')) {
         finalContent = generateHeaderComment() + finalContent;
    }
 }

  try {
      // Ensure directory exists
      await mkdir(dirname(outputPath), { recursive: true });
      // Write the final content
      await writeFile(outputPath, finalContent + '\n', 'utf-8'); // Ensure final newline
      console.log('Lifeline Footer: 部署成功');
      return { success: true };
  } catch (error) {
      console.error('Lifeline Footer: 写入 custom/index.js 失败:', error);
      throw new Error('写入 custom/index.js 失败');
  }
}

/**
 * 取消部署
 */
export async function undeploy(): Promise<void> {
  try {
    let content = '';
    try {
      content = await readFile(outputPath, 'utf-8');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('文件不存在，无需取消部署');
        return;
      } else {
        throw error; // Rethrow other read errors
      }
    }

    const startIndex = content.indexOf(startMark);
    if (startIndex === -1) {
      console.log('组件未部署，无需取消部署');
      return;
    }

    // 移除组件代码
    const endIndex = content.indexOf(endMark, startIndex);
    if (endIndex !== -1) {
      const before = content.substring(0, startIndex);
      const after = content.substring(endIndex + endMark.length);
      content = (before.trimEnd() + after.trimStart()).trim(); // Remove block and potentially extra newlines

      // If content is empty except for header, remove the file? Or just keep header?
      // Let's keep the header if other components might exist or to indicate helper is managing the file.
      // Check if only the header remains (potentially with whitespace)
      const headerPattern = /^\s*\/\* Sun-Panel-Helper JS \*\/[\s\S]*?\/\* 上次更新：.*? \*\/\s*$/;
      if (headerPattern.test(content)) {
         console.log('Lifeline Footer: 移除后文件只剩头部注释，保留文件。');
         // Ensure only header remains cleanly
         content = updateHeaderTime(generateHeaderComment());
      } else if (content.trim() === '') {
         console.log('Lifeline Footer: 移除后文件为空，保留空文件（含头部）。');
         content = generateHeaderComment(); // Ensure header is there
      } else {
         // Other content exists, just update time
         content = updateHeaderTime(content);
      }

      // Write the potentially modified content back
      await writeFile(outputPath, content + '\n', 'utf-8'); // Ensure final newline
      console.log('取消部署成功');
    } else {
        console.warn('Lifeline Footer: Found start marker but no end marker. File might be corrupted.');
    }
  } catch (error) {
    console.error('取消部署失败:', error);
    throw error;
  }
}