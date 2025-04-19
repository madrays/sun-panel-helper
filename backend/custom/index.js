/* Sun-Panel-Helper JS */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致功能冲突或程序异常 */
/* 上次更新：2025/4/19 17:16:48 */

/* Sun-Panel-Helper JS Start: icp-footer */
(function() {
    // 创建页脚样式
    function createIcpFooterStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .custom-footer.icp-footer-container {
                color: rgba(245, 18, 79, 0.96);
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
                color: rgba(245, 18, 79, 0.96);
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
                color: rgba(8, 59, 242, 1);
                background-color: rgba(255, 255, 255, 0.1);
            }
            .custom-footer.icp-footer-container .separator {
                margin: 0 10px;
                color: rgba(238, 234, 6, 1);
                opacity: 0.8;
                font-weight: 300;
            }
            .custom-footer.icp-footer-container svg {
                display: inline-block;
                vertical-align: middle;
            }
            .custom-footer.icp-footer-container svg path {
                fill: rgba(245, 18, 79, 0.96);
                transition: fill 0.3s ease;
            }
            .custom-footer.icp-footer-container a:hover svg path {
                fill: rgba(8, 59, 242, 1);
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
        `;
        document.head.appendChild(style);
    }

    // 创建页脚HTML
    function createIcpFooterHTML() {
        const footerHTML = `<a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" class="icp-link" title="工信部备案信息"><svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:-3px;margin-right:6px;"><path d="M511.427 965.399c170.24-67.637 283.732-164.508 340.479-283.733 73.37-142.153 90.565-306.087 56.746-499.254L511.427 58.028 114.774 188.144c-33.818 187.435-17.196 351.37 51.015 493.522C227.694 801.465 341.76 897.762 511.427 965.4zM216.23 659.312c-62.478-124.384-79.1-266.537-51.014-431.618l345.638-112.92 345.637 112.92c22.355 164.508 5.732 306.087-56.746 425.886C748.73 755.609 651.86 835.283 510.28 897.762c-146.165-56.747-243.035-142.153-294.05-238.45z"></path><path d="M279.282 620.334v-252.78h47.575v252.78h-47.575z m244.182-93.43l45.856 15.475c-6.879 27.514-18.916 47.576-34.965 61.906-16.623 13.183-37.258 20.062-63.052 20.062-31.526 0-57.32-11.464-77.382-34.392-20.062-22.355-30.38-53.88-30.38-94.578 0-42.416 10.318-75.089 30.38-98.016 20.062-23.502 47.003-34.965 79.675-34.965 28.66 0 52.16 9.17 70.503 27.513 10.89 10.89 18.916 26.367 24.074 46.429l-47.002 12.037c-2.293-13.183-8.598-23.501-17.769-30.953-8.598-7.451-19.489-11.463-32.099-11.463-17.77 0-31.526 6.878-42.99 20.061-10.89 13.184-16.622 34.965-16.622 65.345 0 32.099 5.731 54.454 16.622 68.784 10.891 13.756 24.648 20.061 41.27 20.061 12.61 0 23.501-4.585 32.673-13.183 10.317-7.452 17.196-21.208 21.208-40.124z m86.553 93.43v-252.78h76.235c28.66 0 47.575 1.147 56.746 4.013 13.184 4.012 24.648 12.037 33.82 24.647 8.597 12.61 13.756 28.66 13.756 49.295 0 15.476-2.293 28.087-8.025 38.978-5.159 10.89-12.037 18.915-20.062 25.22s-16.623 10.318-24.647 12.037c-11.464 2.293-27.514 4.013-49.868 4.013h-30.38v95.724l-47.575-1.147z m48.148-210.363v71.65h25.794c18.916 0 31.526-1.147 37.831-4.013 6.305-2.293 11.464-6.878 14.903-12.61 4.013-5.732 5.732-12.037 5.732-19.489 0-9.171-2.293-17.196-7.451-22.355-5.16-6.305-11.464-9.17-18.916-11.463-5.732-1.147-17.196-1.72-33.818-1.72h-24.075z"></path></svg> 111111111111</a> <span class="separator">|</span> <a href="http://www.beian.gov.cn" target="_blank" rel="noopener noreferrer" class="gongan-link" title="公安备案信息"><svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="vertical-align:-3px;margin-right:6px;"><path d="M524.8 1024h-26.112c-4.096 0-7.68-0.512-11.264-2.048l-4.608-1.536C1.536 836.096 61.952 281.6 62.464 275.968l2.56-22.528c2.048-15.36 14.848-27.648 30.72-28.16l22.528-1.024c9.216-0.512 58.88-6.656 66.56-73.728l2.048-16.384c1.536-11.776 9.216-22.016 20.48-26.112l15.36-5.632C417.28 30.72 470.016 11.264 484.864 5.632l1.024-0.512C491.008 2.048 496.64 0 502.784 0h8.192c12.8 0 12.8 0 289.792 101.888l15.36 5.632c11.264 4.096 19.456 14.336 20.992 26.624l2.048 16.384c7.68 67.072 56.832 73.216 66.56 73.728l22.528 1.024c15.872 0.512 28.672 12.8 30.72 28.16l2.56 22.528c0.512 5.632 60.928 560.64-420.352 744.448l-4.608 1.536c-3.584 1.536-7.68 2.048-11.776 2.048z m-19.968-64h13.824c179.2-69.12 297.472-202.24 351.744-395.776 37.376-134.144 29.696-252.416 27.648-276.48-39.936-3.584-110.592-33.28-122.88-126.464C589.824 93.184 524.8 69.12 509.952 64.512h-0.512l-0.512 0.512c-10.24 4.096-56.832 20.992-261.12 96.256-12.288 92.16-80.384 122.88-122.88 126.464-2.048 24.064-9.728 142.336 27.648 276.992C207.36 758.272 325.632 891.392 504.832 960z"></path><path d="M660.48 723.968c-4.096 0-8.704-1.024-12.288-3.072l-135.68-71.68-135.68 71.68c-9.216 4.608-19.968 4.096-28.16-2.048s-12.288-15.872-10.752-26.112l26.112-151.552L253.44 434.176c-7.168-7.168-9.728-17.92-6.656-27.136 3.072-9.728 11.264-16.896 21.504-17.92l152.064-22.016 68.096-137.728c4.608-9.216 13.824-14.848 24.064-14.848s19.456 5.632 24.064 14.848l68.096 137.728 152.064 22.016c10.24 1.536 18.432 8.704 21.504 17.92 3.072 9.728 0.512 20.48-6.656 27.136L660.48 541.184l26.112 151.552c1.536 10.24-2.56 19.968-10.752 26.112-4.608 3.072-9.728 5.12-15.36 5.12zM512 592.384c4.096 0 8.704 1.024 12.288 3.072l100.352 52.736-18.944-112.128c-1.536-8.704 1.536-17.408 7.68-23.552l81.408-79.36-112.128-16.384c-8.704-1.024-16.384-6.656-19.968-14.336L512 301.056l-50.176 101.888c-4.096 7.68-11.264 13.312-19.968 14.336l-112.128 16.384 81.408 79.36c6.144 6.144 9.216 14.848 7.68 23.552l-18.944 112.128 100.352-52.736c3.072-2.56 7.68-3.584 11.776-3.584z"></path></svg> 2222222222</a>`;
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
})();
/* Sun-Panel-Helper JS End: icp-footer */

/* Sun-Panel-Helper JS Start: star-background */
(function() {
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
        style.textContent = `
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
        `;
        document.head.appendChild(style);

        // 更新星星位置和样式
        function updateStars() {
            stars.forEach(star => {
                star.element.style.left = star.x + 'px';
                star.element.style.top = star.y + 'px';
                star.element.style.width = star.size + 'px';
                star.element.style.height = star.size + 'px';
                star.element.style.backgroundColor = `rgba(${star.color},${star.opacity})`;
                
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
})();void 0;
/* Sun-Panel-Helper JS End: star-background */
