// ====================== FREEWIDGETS脚本 开始 ======================// ====================== FREEWIDGETS脚本 开始 ======================

// 组件配置管理类
class ConfigManager {
    constructor(onConfigLoaded) {
        this.currentConfig = null;
        this.defaultConfigPath = '/custom/helper/freewidgets/setting/setting1.json';
        this.configPaths = [
            '/custom/helper/freewidgets/setting/setting1.json',
            '/custom/helper/freewidgets/setting/setting2.json',
            '/custom/helper/freewidgets/setting/setting3.json',
            '/custom/helper/freewidgets/setting/setting4.json',
            '/custom/helper/freewidgets/setting/setting5.json'
        ];
        
        // API前缀配置 (这里的值会在部署时被替换)
        this.apiPrefix = window.FREEWIDGETS_API_PREFIX || '/api';
        
        this.onConfigLoaded = onConfigLoaded;
        const lastConfig = localStorage.getItem('selected_config');
        this.currentConfigPath = lastConfig || this.defaultConfigPath;
        
        this.createSettingsButton();
        this.loadConfig().then(config => {
            if (this.onConfigLoaded) {
                this.onConfigLoaded(config);
            }
        });
    }

    async loadConfig() {
        try {
            console.log('开始加载配置:', this.currentConfigPath);
            const response = await fetch(this.currentConfigPath);
            
            if (!response.ok) {
                throw new Error(`加载配置失败: ${response.statusText}`);
            }
            
            this.currentConfig = await response.json();
            console.log('配置加载成功:', this.currentConfig);
            
            return this.currentConfig;
        } catch (error) {
            console.error('加载配置错误:', error);
            if (this.currentConfigPath !== this.defaultConfigPath) {
                console.log('尝试加载默认配置...');
                this.currentConfigPath = this.defaultConfigPath;
                return this.loadConfig();
            }
            this.currentConfig = { widgets: [] };
            return this.currentConfig;
        }
    }

    createSettingsButton() {
        const settingsButton = document.createElement('button');
        settingsButton.innerHTML = '⚙️';
        settingsButton.style.cssText = `
            position: fixed;
            top: -25px;
            right: 140px;
            width: 30px;
            height: 30px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            z-index: 10000;
            font-size: 16px;
            transition: top 0.3s ease;
        `;
        
        // 创建触发区域
        const triggerArea = document.createElement('div');
        triggerArea.style.cssText = `
            position: fixed;
            top: 0;
            right: 120px;
            width: 70px;
            height: 40px;
            z-index: 9999;
            pointer-events: none;
        `;
        
        // 创建实际的鼠标检测区域
        const hitArea = document.createElement('div');
        hitArea.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            pointer-events: auto;
        `;
        triggerArea.appendChild(hitArea);
        
        // 显示按钮的函数
        const showButton = () => {
            settingsButton.style.top = '10px';
        };
        
        // 隐藏按钮的函数
        const hideButton = () => {
            settingsButton.style.top = '-25px';
        };
        
        // 绑定事件监听
        hitArea.addEventListener('mouseenter', showButton);
        hitArea.addEventListener('mouseleave', hideButton);
        settingsButton.addEventListener('mouseenter', showButton);
        settingsButton.addEventListener('mouseleave', hideButton);
        
        settingsButton.addEventListener('click', () => {
            this.showSettingsMenu();
        });
        
        document.body.appendChild(triggerArea);
        document.body.appendChild(settingsButton);
    }

    showSettingsMenu() {
        const existingMenu = document.querySelector('.settings-menu');
        if (existingMenu) {
            document.body.removeChild(existingMenu);
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'settings-menu';
        menu.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 8px;
            z-index: 10001;
            min-width: 300px;
            color: #fff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: opacity 0.3s ease;
        `;

        const title = document.createElement('h3');
        title.textContent = '组件设置';
        title.style.cssText = `
            margin: 0 0 15px 0;
            color: #fff;
            font-size: 16px;
            font-weight: 500;
        `;

        const configSection = document.createElement('div');
        configSection.style.marginBottom = '20px';

        const configLabel = document.createElement('div');
        configLabel.textContent = '选择配置文件:';
        configLabel.style.marginBottom = '10px';

        const configButtons = document.createElement('div');
        configButtons.style.display = 'flex';
        configButtons.style.flexDirection = 'column';
        configButtons.style.gap = '10px';

        this.configPaths.forEach((path, index) => {
            const configContainer = document.createElement('div');
            configContainer.style.cssText = `
                display: flex;
                gap: 10px;
                align-items: center;
                position: relative;
            `;

            const button = document.createElement('button');
            button.textContent = `配置${index + 1}`;
            
            // 判断是否为当前选中的配置
            const isCurrentConfig = path === this.currentConfigPath;
            
            button.style.cssText = `
                flex: 1;
                padding: 8px;
                background: ${isCurrentConfig ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
                border: ${isCurrentConfig ? '1px solid rgba(255, 255, 255, 0.5)' : 'none'};
                border-radius: 4px;
                color: white;
                cursor: pointer;
                text-align: left;
                position: relative;
                font-weight: ${isCurrentConfig ? '500' : 'normal'};
            `;
            
            // 添加保存按钮（仅对配置3-5显示，且必须是当前选中的配置）
            if (index >= 2) {
                const saveButton = document.createElement('button');
                saveButton.textContent = '保存';
                saveButton.style.cssText = `
                    padding: 6px 12px;
                    background: rgba(82, 196, 26, 0.2);
                    border: 1px solid rgba(82, 196, 26, 0.3);
                    border-radius: 4px;
                    color: #52c41a;
                    cursor: ${isCurrentConfig ? 'pointer' : 'not-allowed'};
                    font-size: 12px;
                    min-width: 50px;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    opacity: ${isCurrentConfig ? '1' : '0.5'};
                `;
                
                // 只有当前选中的配置才能点击保存
                saveButton.disabled = !isCurrentConfig;
                
                saveButton.onclick = async (e) => {
                    e.stopPropagation();
                    try {
                        const originalText = saveButton.textContent;  // 在这里定义
                        
                        const widgets = document.querySelectorAll('.widget-container');
                        const config = {
                            widgets: Array.from(widgets).map(widget => {
                                const iframe = widget.querySelector('iframe');
                                return {
                                    name: widget.dataset.widgetName,
                                    url: iframe.src,
                                    position: {
                                        top: parseInt(widget.style.top),
                                        left: parseInt(widget.style.left),
                                        width: widget.style.width,
                                        height: widget.style.height,
                                        isScrollMode: widget.classList.contains('scroll-mode'),
                                        isPinned: widget.classList.contains('pinned')
                                    }
                                };
                            })
                        };

                        console.log('准备保存配置:', {
                            configIndex: index + 1,
                            config: config,
                            apiUrl: `${this.apiPrefix}/api/free/freewidgets/save-config`
                        });

                        // 显示保存中状态
                        saveButton.textContent = '保存中...';
                        saveButton.disabled = true;
                        
                        // 修改 API 路径
                        const response = await fetch(`${this.apiPrefix}/api/free/freewidgets/save-config`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                configIndex: index + 1,
                                config: config
                            })
                        });

                        const responseData = await response.json();
                        console.log('保存配置响应:', responseData);

                        if (!response.ok) {
                            throw new Error(responseData.message || '保存失败');
                        }

                        // 显示成功提示
                        saveButton.textContent = '✓ 已保存';
                        saveButton.style.background = 'rgba(82, 196, 26, 0.3)';
                        
                        // 创建成功提示
                        const successToast = document.createElement('div');
                        successToast.style.cssText = `
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            background: rgba(82, 196, 26, 0.9);
                            color: white;
                            padding: 12px 20px;
                            border-radius: 4px;
                            z-index: 10002;
                            font-size: 14px;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                            transition: all 0.3s ease;
                        `;
                        successToast.textContent = `配置${index + 1}保存成功！`;
                        document.body.appendChild(successToast);

                        console.log('配置保存成功:', {
                            configIndex: index + 1,
                            timestamp: new Date().toISOString(),
                            widgetsCount: config.widgets.length
                        });
                        
                        // 3秒后移除提示
                        setTimeout(() => {
                            successToast.style.opacity = '0';
                            setTimeout(() => successToast.remove(), 300);
                        }, 3000);

                        // 恢复按钮状态
                        setTimeout(() => {
                            saveButton.textContent = originalText;
                            saveButton.style.background = 'rgba(82, 196, 26, 0.2)';
                            saveButton.disabled = false;
                        }, 3000);

                    } catch (error) {
                        console.error('保存配置失败:', {
                            error: error.message,
                            configIndex: index + 1,
                            timestamp: new Date().toISOString()
                        });

                        saveButton.textContent = '✕ 失败';
                        saveButton.style.background = 'rgba(255, 77, 79, 0.2)';
                        saveButton.style.borderColor = 'rgba(255, 77, 79, 0.3)';
                        saveButton.style.color = '#ff4d4f';
                        
                        // 创建错误提示
                        const errorToast = document.createElement('div');
                        errorToast.style.cssText = `
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            background: rgba(255, 77, 79, 0.9);
                            color: white;
                            padding: 12px 20px;
                            border-radius: 4px;
                            z-index: 10002;
                            font-size: 14px;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                            transition: all 0.3s ease;
                        `;
                        errorToast.textContent = `配置${index + 1}保存失败: ${error.message}`;
                        document.body.appendChild(errorToast);
                        
                        // 3秒后移除提示
                        setTimeout(() => {
                            errorToast.style.opacity = '0';
                            setTimeout(() => errorToast.remove(), 300);
                        }, 3000);

                        setTimeout(() => {
                            saveButton.textContent = originalText;
                            saveButton.style.background = 'rgba(82, 196, 26, 0.2)';
                            saveButton.style.borderColor = 'rgba(82, 196, 26, 0.3)';
                            saveButton.style.color = '#52c41a';
                            saveButton.disabled = false;
                        }, 3000);
                    }
                };
                
                configContainer.appendChild(saveButton);
            } else {
                // 为配置1-2添加提示文本
                const tipText = document.createElement('span');
                tipText.textContent = '默认';
                tipText.style.cssText = `
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.45);
                    padding: 4px 8px;
                `;
                configContainer.appendChild(tipText);
            }
            
            // 原有的配置切换逻辑
            button.onclick = async () => {
                try {
                    console.log('切换配置到:', path);
                    this.currentConfigPath = path;
                    localStorage.setItem('selected_config', path);
                    
                    // 先禁用所有按钮
                    configButtons.querySelectorAll('button').forEach(btn => {
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                        btn.style.cursor = 'not-allowed';
                    });
                    
                    // 显示加载提示
                    const loadingText = document.createElement('div');
                    loadingText.textContent = '正在切换配置...';
                    loadingText.style.cssText = `
                        color: #fff;
                        text-align: center;
                        margin-top: 10px;
                    `;
                    configSection.appendChild(loadingText);
                    
                    // 移除现有组件
                    const containers = document.querySelectorAll('.widget-container');
                    containers.forEach(container => container.remove());
                    
                    // 重新加载配置
                    const config = await this.loadConfig();
                    
                    // 重新初始化组件
                    console.log('重新初始化组件...');
                    if (this.onConfigLoaded) {
                        this.onConfigLoaded(config);
                    }

                    // 重新创建设置菜单以更新样式
                    document.querySelector('.settings-menu')?.remove();
                    this.showSettingsMenu();

                    // 显示成功提示
                    const successToast = document.createElement('div');
                    successToast.textContent = '切换成功！';
                    successToast.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: rgba(82, 196, 26, 0.9);
                        color: white;
                        padding: 12px 20px;
                        border-radius: 4px;
                        z-index: 10002;
                        font-size: 14px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                        transition: all 0.3s ease;
                    `;
                    document.body.appendChild(successToast);
                    
                    setTimeout(() => {
                        successToast.style.opacity = '0';
                        setTimeout(() => successToast.remove(), 300);
                    }, 2000);
                    
                } catch (error) {
                    console.error('切换配置失败:', error);
                    
                    // 显示错误提示
                    const errorToast = document.createElement('div');
                    errorToast.textContent = '切换失败，请重试';
                    errorToast.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: rgba(255, 77, 79, 0.9);
                        color: white;
                        padding: 12px 20px;
                        border-radius: 4px;
                        z-index: 10002;
                        font-size: 14px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                        transition: all 0.3s ease;
                    `;
                    document.body.appendChild(errorToast);
                    
                    setTimeout(() => {
                        errorToast.style.opacity = '0';
                        setTimeout(() => errorToast.remove(), 300);
                    }, 2000);
                }
            };
            
            configContainer.appendChild(button);
            configButtons.appendChild(configContainer);
        });

        // 添加自动隐藏功能
        let hideTimeout;
        menu.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
        });
        
        menu.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                menu.style.opacity = '0';
                // 同时隐藏设置按钮
                const settingsButton = document.querySelector('button');
                if (settingsButton) {
                    settingsButton.style.top = '-25px';
                }
                setTimeout(() => {
                    if (document.body.contains(menu)) {
                        document.body.removeChild(menu);
                    }
                }, 300);
            }, 2000);
        });

        const exportButton = document.createElement('button');
        exportButton.textContent = '导出当前配置';
        exportButton.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-top: 15px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
        `;

        exportButton.onclick = () => {
            this.showExportConfig();
        };

        menu.appendChild(title);
        menu.appendChild(configSection);
        configSection.appendChild(configLabel);
        configSection.appendChild(configButtons);
        menu.appendChild(exportButton);

        document.body.appendChild(menu);
    }

    showExportConfig() {
        const widgets = document.querySelectorAll('.widget-container');
        const config = {
            widgets: Array.from(widgets).map(widget => {
                const iframe = widget.querySelector('iframe');
                return {
                    name: widget.dataset.widgetName,
                    url: iframe.src,
                    position: {
                        top: parseInt(widget.style.top),
                        left: parseInt(widget.style.left),
                        width: widget.style.width,
                        height: widget.style.height,
                        isScrollMode: widget.classList.contains('scroll-mode'),
                        isPinned: widget.classList.contains('pinned')
                    }
                };
            })
        };

        // 直接复制配置
        navigator.clipboard.writeText(JSON.stringify(config, null, 2))
            .then(() => {
                // 显示成功提示
                const toast = document.createElement('div');
                toast.textContent = '配置已复制到剪贴板！';
                toast.style.cssText = `
                    position: fixed;
                    top: 50px;
                    right: 20px;
                    background: rgba(82, 196, 26, 0.8);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 4px;
                    z-index: 10002;
                    transition: opacity 0.3s ease;
                `;
                document.body.appendChild(toast);

                // 2秒后淡出消失
                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => {
                        if (document.body.contains(toast)) {
                            document.body.removeChild(toast);
                        }
                    }, 300);
                }, 2000);
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请重试');
            });
    }
}

// 创建并初始化可拖动的组件
class DraggableWidgets {
    constructor() {
        // 检查是否为登录页面
        if (window.location.pathname.endsWith('/login')) {
            console.log('登录页面不显示组件');
            return;
        }

        // 记录初始窗口宽度和原始位置
        this.initialWidth = window.innerWidth;
        this.isHidden = false;
        this.originalPositions = new Map();
        this.savedPositions = new Map();
        this.initRetries = 0;
        this.maxRetries = 3;

        // 检查是否为移动设备
        if (this.isMobileDevice()) {
            console.log('移动设备不加载组件');
            return;
        }

        this.defaultConfig = {
            width: '280px',
            height: '180px',
            spacing: 20
        };

        // 初始化基础样式和容器
        this.initStyles();
        this.createContainer();

        // 初始化配置管理器
        this.configManager = new ConfigManager(config => {
            this.handleConfigLoaded(config);
        });
    }

    async handleConfigLoaded(config) {
        console.log('配置加载完成，开始创建组件:', config);
        
        if (!this.validateConfig(config)) {
            throw new Error('配置无效或为空');
        }

        // 确保容器存在
        if (!this.container || !document.body.contains(this.container)) {
            console.log('容器不存在或已被移除，重新创建');
            this.createContainer();
        }

        // 清空现有组件
        this.container.innerHTML = '';
        
        // 创建组件
        await this.createWidgetsWithCheck(config.widgets);
        
        // 初始化其他功能
        this.initScrollListener();
        this.initWindowResizeListener();
        this.initUrlChangeListener();
        
        console.log('组件初始化完成');
    }

    // 显示错误消息
    showErrorMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 77, 79, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
        `;
        message.textContent = '组件加载失败，请刷新页面重试';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    // 修改组件创建方法，添加检查机制
    async createWidgetsWithCheck(widgets) {
        console.log('开始创建组件:', widgets.length);
        
        if (!this.container) {
            console.error('组件容器不存在');
            return;
        }
        
        for (const widget of widgets) {
            try {
                // 验证组件配置
                if (!this.validateWidgetConfig(widget)) {
                    console.error('无效的组件配置:', widget);
                    continue;
                }

                const container = document.createElement('div');
                container.className = 'widget-container';
                container.id = `widget-${Math.random().toString(36).substr(2, 9)}`;
                
                // 保存组件名称到容器的数据属性中
                container.dataset.widgetName = widget.name;
                
                console.log('创建组件容器:', {
                    id: container.id,
                    name: widget.name
                });
                
                // 设置位置和大小（在创建 iframe 之前）
                this.setWidgetPosition(container, widget.position);
                
                // 添加到主容器
                this.container.appendChild(container);
                
                // 创建并等待 iframe 加载
                await this.createAndLoadIframe(container, widget);
                
                // 创建控制按钮
                this.createControlButtons(container);
                
                // 使组件可拖动
                this.makeDraggable(container);
                
                // 保存原始位置
                this.saveOriginalPosition(container);
                
                // 确保在视口内
                this.ensureInViewport(container);
                
                console.log('组件创建完成:', container.id);
            } catch (error) {
                console.error('创建组件失败:', error);
            }
        }
    }

    // 验证组件配置
    validateWidgetConfig(widget) {
        return (
            widget &&
            widget.name &&
            widget.url &&
            widget.position &&
            typeof widget.position.top === 'number' &&
            typeof widget.position.left === 'number' &&
            widget.position.width &&
            widget.position.height
        );
    }

    // 创建并等待 iframe 加载
    createAndLoadIframe(container, widget) {
        return new Promise(async (resolve, reject) => {
            let retryCount = 0;
            const maxRetries = 3;
            const timeoutDuration = 15000; // 增加到15秒
            
            const tryLoadIframe = async () => {
                const iframe = document.createElement('iframe');
                let timeoutId;
                
                try {
                    const loadPromise = new Promise((resolveLoad, rejectLoad) => {
                        iframe.onload = () => {
                            clearTimeout(timeoutId);
                            console.log('iframe 加载成功:', widget.url);
                            resolveLoad();
                        };
                        
                        iframe.onerror = (error) => {
                            clearTimeout(timeoutId);
                            rejectLoad(new Error(`iframe 加载失败: ${error.message}`));
                        };
                        
                        timeoutId = setTimeout(() => {
                            rejectLoad(new Error('iframe 加载超时'));
                        }, timeoutDuration);
                    });
                    
                    // 设置 iframe 属性
                    iframe.src = widget.url;
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    
                    // 添加到容器前先清除旧的 iframe
                    const oldIframe = container.querySelector('iframe');
                    if (oldIframe) {
                        container.removeChild(oldIframe);
                    }
                    container.appendChild(iframe);
                    
                    // 等待加载完成
                    await loadPromise;
                    
                    // 添加滚轮事件监听
                    iframe.addEventListener('wheel', (e) => {
                        e.stopPropagation = () => {};
                    }, { passive: true });
                    
                    // 根据模式设置 pointer-events
                    if (widget.position && widget.position.isScrollMode) {
                        iframe.style.pointerEvents = 'auto';
                    } else {
                        iframe.style.pointerEvents = 'none';
                    }
                    
                    resolve();
                } catch (error) {
                    console.warn(`iframe 加载失败 (尝试 ${retryCount + 1}/${maxRetries}):`, error);
                    
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`等待 ${retryCount * 2}秒后重试...`);
                        await new Promise(r => setTimeout(r, retryCount * 2000));
                        tryLoadIframe();
                    } else {
                        console.error('iframe 加载失败次数过多:', widget.url);
                        reject(error);
                    }
                }
            };
            
            tryLoadIframe();
        });
    }

    // 设置组件位置
    setWidgetPosition(container, position) {
        // 先设置尺寸
        container.style.width = position.width;
        container.style.height = position.height;
        
        // 设置状态类（在设置位置之前）
        container.classList.remove('scroll-mode', 'pinned');
        if (position.isScrollMode) {
            container.classList.add('scroll-mode');
        }
        if (position.isPinned) {
            container.classList.add('pinned');
        }
        
        // 一次性设置所有位置相关属性
        const scrollY = document.querySelector('.scroll-container')?.scrollTop || 0;
        const styles = {
            position: position.isScrollMode ? 'absolute' : 'fixed',
            left: `${position.left}px`,
            top: position.isScrollMode ? `${position.top}px` : `${position.top - scrollY}px`
        };
        
        // 批量应用样式
        Object.assign(container.style, styles);
        
        // 设置初始top（如果是滚动模式）
        if (position.isScrollMode) {
            container.dataset.initialTop = position.top;
        } else {
            delete container.dataset.initialTop;
        }
    }

    // 初始化窗口大小变化监听
    initWindowResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleWindowResize();
            }, 100);
        });
    }

    // 添加 URL 变化监听方法
    initUrlChangeListener() {
        // 监听 popstate 事件（浏览器前进/后退）
        window.addEventListener('popstate', () => {
            this.checkLoginPage();
        });

        // 监听 pushState 和 replaceState
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            originalPushState.apply(this, arguments);
            window.dispatchEvent(new Event('locationchange'));
        };

        history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            window.dispatchEvent(new Event('locationchange'));
        };

        window.addEventListener('locationchange', () => {
            this.checkLoginPage();
        });

        // 监听 hashchange 事件
        window.addEventListener('hashchange', () => {
            this.checkLoginPage();
        });
    }

    // 检查是否为登录页面并处理组件显示/隐藏
    checkLoginPage() {
        const isLoginPage = window.location.pathname.endsWith('/login');
        console.log('URL变化，检查是否为登录页面:', isLoginPage);

        if (isLoginPage) {
            // 隐藏所有组件
            if (this.container) {
                this.container.style.display = 'none';
                console.log('登录页面，隐藏所有组件');
            }
        } else {
            // 显示所有组件
            if (this.container) {
                this.container.style.display = '';
                console.log('非登录页面，显示所有组件');
            }
        }
    }

    // 保存原始位置
    saveOriginalPosition(container) {
        const rect = container.getBoundingClientRect();
        this.originalPositions.set(container.id, {
            top: rect.top,
            left: rect.left,
            width: container.style.width,
            height: container.style.height,
            isScrollMode: container.classList.contains('scroll-mode'),
            isPinned: container.classList.contains('pinned')
        });
    }

    // 处理窗口大小变化
    handleWindowResize() {
        const currentWidth = window.innerWidth;
        const widthRatio = currentWidth / this.initialWidth;
        console.log('窗口大小变化:', {
            currentWidth,
            initialWidth: this.initialWidth,
            widthRatio,
            isHidden: this.isHidden
        });

        // 处理缩小情况
        if (widthRatio <= 0.75) {
            if (!this.isHidden) {
                console.log('窗口缩小到75%以下，准备隐藏组件');
                document.querySelectorAll('.widget-container').forEach(container => {
                    // 只在第一次缩小时保存位置
                    if (!localStorage.getItem(`min_pos_${container.id}`)) {
                        const rect = container.getBoundingClientRect();
                        const position = {
                            top: rect.top + window.scrollY,
                            left: rect.left,
                            width: container.style.width || rect.width + 'px',
                            height: container.style.height || rect.height + 'px',
                            isScrollMode: container.classList.contains('scroll-mode'),
                            isPinned: container.classList.contains('pinned')
                        };
                        localStorage.setItem(`min_pos_${container.id}`, JSON.stringify(position));
                        console.log('保存缩小时位置:', position);
                    }
                });
                this.container.style.display = 'none';
                this.isHidden = true;
            }
        } 
        // 处理恢复情况
        else if (this.isHidden || Math.abs(widthRatio - 1) < 0.05) {
            console.log('准备恢复组件显示，当前宽度比例:', widthRatio);
            
            // 先显示容器
            this.container.style.display = '';
            this.isHidden = false;

            // 清除之前的恢复定时器
            if (this._restoreTimeout) {
                clearTimeout(this._restoreTimeout);
            }

            // 如果窗口宽度接近100%，重新加载配置
            if (Math.abs(widthRatio - 1) < 0.05) {
                console.log('窗口恢复到100%，重新加载配置...');
                // 获取当前配置路径
                const configPath = this.configManager.currentConfigPath;
                // 重新加载配置
                this.configManager.loadConfig().then(config => {
                    // 移除现有组件
                    document.querySelectorAll('.widget-container').forEach(container => {
                        container.remove();
                    });
                    // 重新创建组件
                    this.handleConfigLoaded(config);
                });
            } else {
                // 否则使用缩小时的位置
                document.querySelectorAll('.widget-container').forEach(container => {
                    const savedPosition = localStorage.getItem(`min_pos_${container.id}`);
                    if (savedPosition) {
                        const position = JSON.parse(savedPosition);
                        this.restorePosition(container, position);
                        console.log('恢复到缩小时的位置:', {
                            id: container.id,
                            position,
                            widthRatio
                        });
                    }
                });
            }
        }
    }

    // 添加恢复位置的辅助方法
    restorePosition(container, position) {
        // 一次性设置所有样式和状态
        const styles = {
            display: '',
            width: position.width,
            height: position.height,
            position: position.isScrollMode ? 'absolute' : 'fixed',
            left: `${position.left}px`,
            top: position.isScrollMode ? 
                `${position.top}px` : 
                `${position.top - window.scrollY}px`
        };
        
        // 先移除所有状态类
        container.classList.remove('scroll-mode', 'pinned');
        
        // 批量应用样式
        Object.assign(container.style, styles);
        
        // 设置状态类
        if (position.isScrollMode) {
            container.classList.add('scroll-mode');
            container.dataset.initialTop = position.top;
        } else {
            delete container.dataset.initialTop;
        }
        if (position.isPinned) {
            container.classList.add('pinned');
        }

        // 更新按钮状态
        this.updateButtonStates(container);
        
        // 确保在视口内
        this.ensureInViewport(container);
    }

    // 隐藏组件并保存当前位置
    hideWidgets() {
        const containers = document.querySelectorAll('.widget-container');
        containers.forEach(container => {
            // 保存当前位置和状态
            const rect = container.getBoundingClientRect();
            this.savedPositions.set(container.id, {
                position: container.style.cssText,
                scrollMode: container.classList.contains('scroll-mode'),
                pinned: container.classList.contains('pinned')
            });
        });
        
        this.container.style.display = 'none';
        this.isHidden = true;
    }

    // 显示组件并恢复位置
    showWidgets(positionType) {
        this.container.style.display = '';
        this.isHidden = false;

        const containers = document.querySelectorAll('.widget-container');
        containers.forEach(container => {
            let savedPosition;
            
            if (positionType === 'user') {
                // 使用用户选择的位置
                savedPosition = localStorage.getItem(`user_pos_${container.id}`);
            } else {
                // 使用缩小时的位置
                savedPosition = localStorage.getItem(`min_pos_${container.id}`);
                // 如果没有缩小时的位置，先保存当前位置
                if (!savedPosition) {
                    this.saveMinimizedPosition(container);
                    savedPosition = localStorage.getItem(`min_pos_${container.id}`);
                }
            }

            if (savedPosition) {
                const position = JSON.parse(savedPosition);
                
                // 恢复位置和尺寸
                if (position.isScrollMode) {
                    container.style.position = 'absolute';
                    container.style.top = position.top + 'px';
                } else {
                    container.style.position = 'fixed';
                    container.style.top = (position.top - window.scrollY) + 'px';
                }
                
                container.style.left = position.left + 'px';
                container.style.width = position.width;
                container.style.height = position.height;

                // 恢复状态
                container.classList.remove('scroll-mode', 'pinned');
                if (position.isScrollMode) {
                    container.classList.add('scroll-mode');
                }
                if (position.isPinned) {
                    container.classList.add('pinned');
                }

                // 更新按钮状态
                this.updateButtonStates(container);
            }
        });
    }

    // 检查是否为移动设备
    isMobileDevice() {
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            window.innerWidth <= 768
        );
    }

    // 解析URL中的尺寸参数
    parseUrlDimensions(url) {
        try {
            // 检查是否是本地文件
            if (url.startsWith('file://') || url.startsWith('/') || url.includes('://') === false) {
                return {}; // 本地文件使用默认尺寸
            }

            const urlObj = new URL(url);
            const params = new URLSearchParams(urlObj.hash.slice(1));
            const dimensions = {};

            // 解析宽度相关参数
            if (params.has('w')) {
                dimensions.width = params.get('w') + 'px';
            }
            
            // 解析高度相关参数
            if (params.has('h')) {
                dimensions.height = params.get('h') + 'px';
            }

            return dimensions;
        } catch (error) {
            console.log('URL解析失败，使用默认尺寸:', url);
            return {};  // 解析失败时使用默认尺寸
        }
    }

    // 初始化样式
    initStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .widgets-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                min-height: 100%;
                pointer-events: none;
                z-index: 1000;
            }

            .widget-container {
                position: fixed;
                z-index: 1000;
                border-radius: 20px;
                overflow: visible;
                background-color: transparent;
                user-select: none;
                touch-action: none;
                transform: translateY(0);
                transition: transform 0.3s ease;
                pointer-events: auto;
                will-change: transform;
            }

            .widget-container:hover {
                transform: translateY(-5px);
            }

            .widget-container.scroll-mode {
                position: absolute !important;
            }

            .widget-container.dragging,
            .widget-container.resizing {
                transition: none !important;
                opacity: 0.8;
                transform: none;
                pointer-events: none;
            }

            .widget-container.dragging iframe,
            .widget-container.resizing iframe {
                pointer-events: none;
            }

            .widget-container iframe {
                width: 100%;
                height: 100%;
                border: none;
                background-color: transparent;
                border-radius: 20px;
                pointer-events: none;
            }

            .widget-container.scroll-mode iframe {
                pointer-events: auto;
            }

            .widget-container .control-buttons {
                position: absolute;
                bottom: -32px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 6px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 1001;
                transition-delay: 1s;
            }

            .widget-container:hover .control-buttons {
                opacity: 1;
                transition-delay: 1s;
            }

            .widget-container .control-button {
                width: 24px;
                height: 24px;
                background: rgba(255, 255, 255, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                color: rgba(255, 255, 255, 0.85);
                font-size: 16px;
                transition: all 0.2s ease;
                pointer-events: auto;
            }

            .widget-container .control-button:hover {
                background: rgba(255, 255, 255, 0.25);
                border-color: rgba(255, 255, 255, 0.4);
            }

            .widget-container .control-button.active {
                background: rgba(255, 255, 255, 0.9);
                border-color: rgba(255, 255, 255, 1);
                color: #ff4d4f;
            }

            .widget-container .control-button.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .widget-container .resize-handle {
                position: absolute;
                width: 8px;
                height: 8px;
                background-color: rgba(255, 255, 255, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.8);
                border-radius: 2px;
                opacity: 0;
                z-index: 1001;
                transition: opacity 0.3s ease;
                pointer-events: auto;
                transition-delay: 1s;
            }

            .widget-container .resize-handle:hover {
                background-color: rgba(255, 255, 255, 0.8);
                transform: scale(1.2);
            }

            .widget-container:hover .resize-handle:not(.disabled) {
                opacity: 1;
                transition-delay: 1s;
            }

            .widget-container .resize-handle.disabled {
                display: none;
            }

            .widget-container .resize-handle.top-left {
                top: -6px;
                left: -6px;
                cursor: nw-resize;
            }

            .widget-container .resize-handle.top-right {
                top: -6px;
                right: -6px;
                cursor: ne-resize;
            }

            .widget-container .resize-handle.bottom-left {
                bottom: -6px;
                left: -6px;
                cursor: sw-resize;
            }

            .widget-container .resize-handle.bottom-right {
                bottom: -6px;
                right: -6px;
                cursor: se-resize;
            }

            .widget-container.resizing {
                transition: none !important;
                opacity: 0.8;
                pointer-events: none;
            }

            .widget-container.resizing iframe {
                pointer-events: none;
            }

            .widget-container .tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                top: -25px;
                left: 50%;
                transform: translateX(-50%);
                transition: all 0.2s ease;
                pointer-events: none;
            }

            .widget-container .control-button:hover .tooltip {
                opacity: 1;
                visibility: visible;
                transform: translateX(-50%) translateY(-2px);
            }

            .widget-container iframe {
                width: 100%;
                height: 100%;
                border: none;
                background-color: transparent;
                border-radius: 20px;
                pointer-events: none;
            }

            .widget-container.scroll-mode iframe {
                pointer-events: auto;
            }

            .widget-container.dragging {
                opacity: 0.8;
            }

            .widget-container .delete-button {
                color: #ff4d4f;
                font-size: 14px;
                margin-right: 8px;
            }

            .widget-container .delete-button:hover {
                color: #ff7875;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // 创建容器
    createContainer() {
        console.log('创建组件容器...');
        // 先检查是否已存在容器
        let container = document.querySelector('.widgets-container');
        if (container) {
            console.log('找到现有容器，清空内容');
            container.innerHTML = '';
            this.container = container;
            return;
        }

        // 创建新容器
        container = document.createElement('div');
        container.className = 'widgets-container';
        document.body.appendChild(container);
        this.container = container;
        console.log('创建新容器完成');
    }

    // 初始化滚动监听
    initScrollListener() {
        let lastScrollY = 0;
        let ticking = false;

        const updatePositions = (scrollY) => {
            const delta = scrollY - lastScrollY;
            
            // 只在有实际滚动时更新
            if (delta !== 0) {
                document.querySelectorAll('.widget-container.scroll-mode').forEach(container => {
                    if (!container.classList.contains('pinned')) {
                        const initialTop = parseFloat(container.dataset.initialTop) || 0;
                        container.style.top = (initialTop - scrollY) + 'px';
                    }
                });
                
                lastScrollY = scrollY;
            }
            ticking = false;
        };

        // 监听滚动事件
        const scrollHandler = (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = e.target.scrollTop || 0;
                    updatePositions(scrollY);
                });
                ticking = true;
            }
        };

        // 查找主滚动容器
        const findMainScrollContainer = () => {
            const container = document.querySelector('.scroll-container.absolute.w-full.h-full.overflow-auto');
            if (container) {
                console.log('找到主滚动容器:', container);
                container.addEventListener('scroll', scrollHandler, { passive: true });
                return true;
            }
            return false;
        };

        // 立即尝试查找
        if (!findMainScrollContainer()) {
            // 如果没找到，设置一个短暂的轮询
            const checkInterval = setInterval(() => {
                if (findMainScrollContainer()) {
                    clearInterval(checkInterval);
                }
            }, 500);

            // 5秒后停止检查
            setTimeout(() => {
                clearInterval(checkInterval);
            }, 5000);
        }
    }

    // 切换滚动模式
    toggleScrollMode(container, scrollToggle) {
        const rect = container.getBoundingClientRect();
        const scrollY = document.querySelector('.scroll-container')?.scrollTop || 0;
        
        container.classList.toggle('scroll-mode');
        
        if (container.classList.contains('scroll-mode')) {
            // 切换到绝对定位，保持视觉位置不变
            const absoluteTop = rect.top + scrollY;
            container.style.position = 'absolute';
            container.style.top = absoluteTop + 'px';
            container.style.left = rect.left + 'px';
            container.dataset.initialTop = absoluteTop;
            
            // 启用iframe的pointer-events
            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.style.pointerEvents = 'auto';
            }
        } else {
            // 切换回固定定位，保持视觉位置不变
            const currentTop = rect.top;
            container.style.position = 'fixed';
            container.style.top = currentTop + 'px';
            container.style.left = rect.left + 'px';
            delete container.dataset.initialTop;
            
            // 禁用iframe的pointer-events
            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.style.pointerEvents = 'none';
            }
        }
        
        // 更新按钮状态
        this.updateButtonStates(container);
    }

    // 创建控制按钮
    createControlButtons(container) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'control-buttons';
        container.appendChild(buttonsContainer);

        // 创建删除按钮
        const deleteButton = document.createElement('div');
        deleteButton.className = 'control-button delete-button';
        deleteButton.innerHTML = '✕';
        buttonsContainer.appendChild(deleteButton);

        // 创建滚动模式切换按钮
        const scrollToggle = document.createElement('div');
        scrollToggle.className = 'control-button scroll-toggle';
        scrollToggle.innerHTML = '⇅';
        buttonsContainer.appendChild(scrollToggle);

        // 创建固定按钮
        const pinButton = document.createElement('div');
        pinButton.className = 'control-button pin-button';
        pinButton.innerHTML = '📍';
        buttonsContainer.appendChild(pinButton);

        // 创建拖动手柄
        const moveHandle = document.createElement('div');
        moveHandle.className = 'control-button move-handle';
        moveHandle.innerHTML = '✥';
        buttonsContainer.appendChild(moveHandle);

        // 创建缩放手柄
        const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            container.appendChild(handle);
            this.makeResizable(container, handle, pos);
        });

        // 更新按钮状态
        this.updateButtonStates(container);

        // 添加事件监听器
        scrollToggle.addEventListener('click', () => {
            if (container.classList.contains('pinned')) {
                container.classList.remove('pinned');
            }
            this.toggleScrollMode(container, scrollToggle);
            this.updateButtonStates(container);
            this.saveUserPosition(container);
        });

        pinButton.addEventListener('click', () => {
            if (container.classList.contains('scroll-mode')) {
                container.classList.remove('scroll-mode');
            }
            container.classList.toggle('pinned');
            this.updateButtonStates(container);
            this.saveUserPosition(container);
        });

        deleteButton.addEventListener('click', () => {
            if (confirm('确定要删除此组件吗？')) {
                localStorage.removeItem(`user_pos_${container.id}`);
                localStorage.removeItem(`min_pos_${container.id}`);
                localStorage.removeItem(`hide_${container.id}`);
                container.remove();
                this.updateConfig();
            }
        });

        return moveHandle;
    }

    // 修改缩放功能
    makeResizable(container, handle, position) {
        let startX, startY, startWidth, startHeight;
        let initialRect;
        let iframeElement;

        const resizeStart = (e) => {
            // 在滚动模式或固定模式下禁止调整大小
            if (container.classList.contains('scroll-mode') || container.classList.contains('pinned')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            container.classList.add('resizing');
            initialRect = container.getBoundingClientRect();
            iframeElement = container.querySelector('iframe');

            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }

            startWidth = initialRect.width;
            startHeight = initialRect.height;

            document.addEventListener('mousemove', resize);
            document.addEventListener('touchmove', resize, { passive: false });
            document.addEventListener('mouseup', resizeEnd);
            document.addEventListener('touchend', resizeEnd);
        };

        const resize = (e) => {
            if (!container.classList.contains('resizing')) return;

            e.preventDefault();
            e.stopPropagation();

            let currentX, currentY;
            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX;
                currentY = e.touches[0].clientY;
            } else {
                currentX = e.clientX;
                currentY = e.clientY;
            }

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = initialRect.left;
            let newTop = initialRect.top;

            // 根据不同的调整柄位置计算新的尺寸和位置
            if (position.includes('right')) {
                newWidth = Math.max(200, startWidth + deltaX);
            }
            if (position.includes('bottom')) {
                newHeight = Math.max(100, startHeight + deltaY);
            }
            if (position.includes('left')) {
                newWidth = Math.max(200, startWidth - deltaX);
                if (newWidth !== startWidth) {
                    newLeft = initialRect.left + deltaX;
                }
            }
            if (position.includes('top')) {
                newHeight = Math.max(100, startHeight - deltaY);
                if (newHeight !== startHeight) {
                    newTop = initialRect.top + deltaY;
                }
            }

            // 更新尺寸和位置
            container.style.width = `${newWidth}px`;
            container.style.height = `${newHeight}px`;
            container.style.left = `${newLeft}px`;
            container.style.top = `${newTop}px`;

            // 计算缩放比例
            const scale = newWidth / parseInt(container.dataset.baseWidth || startWidth);
            
            // 更新 iframe URL
            if (iframeElement && iframeElement.src) {
                const url = new URL(iframeElement.src);
                if (url.hash.includes('count-down')) {
                    url.hash = url.hash.replace(/s=[\d.]+/, `s=${scale.toFixed(2)}`);
                    iframeElement.src = url.toString();
                } else if (url.hash.includes('sentence')) {
                    const fontSize = Math.round(14 * scale);
                    url.hash = url.hash.replace(/fz=\d+/, `fz=${fontSize}`);
                    url.hash = url.hash.replace(/as=\d+/, `as=${fontSize}`);
                    iframeElement.src = url.toString();
                }
            }

            this.ensureInViewport(container);
        };

        const resizeEnd = () => {
            container.classList.remove('resizing');
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('touchmove', resize);
            document.removeEventListener('mouseup', resizeEnd);
            document.removeEventListener('touchend', resizeEnd);

            this.saveUserPosition(container);
        };

        handle.addEventListener('mousedown', resizeStart);
        handle.addEventListener('touchstart', resizeStart, { passive: false });

        // 更新调整手柄的显示状态
        const updateHandleVisibility = () => {
            if (container.classList.contains('scroll-mode') || container.classList.contains('pinned')) {
                handle.classList.add('disabled');
            } else {
                handle.classList.remove('disabled');
            }
        };

        // 监听模式变化
        const observer = new MutationObserver(() => {
            updateHandleVisibility();
        });
        observer.observe(container, { attributes: true, attributeFilter: ['class'] });

        // 初始状态
        updateHandleVisibility();
    }

    // 使组件可拖动
    makeDraggable(container) {
        const moveHandle = container.querySelector('.move-handle');
        if (!moveHandle) return;

        let startX, startY, initialLeft, initialTop;
        let originalTransform;

        const dragStart = (e) => {
            if (container.classList.contains('pinned') || container.classList.contains('scroll-mode')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            // 保存原始变换
            originalTransform = container.style.transform;
            // 暂时移除变换效果
            container.style.transform = 'none';
            
            container.classList.add('dragging');
            const rect = container.getBoundingClientRect();
            
            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }

            initialLeft = rect.left;
            initialTop = rect.top;
        };

        const drag = (e) => {
            if (!container.classList.contains('dragging')) return;

            e.preventDefault();
            e.stopPropagation();

            let currentX, currentY;
            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX;
                currentY = e.touches[0].clientY;
            } else {
                currentX = e.clientX;
                currentY = e.clientY;
            }

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            container.style.left = `${initialLeft + deltaX}px`;
            container.style.top = `${initialTop + deltaY}px`;

            this.ensureInViewport(container);
        };

        const dragEnd = () => {
            if (!container.classList.contains('dragging')) return;
            
            container.classList.remove('dragging');
            // 恢复原始变换
            container.style.transform = originalTransform;
            
            // 等待变换动画完成后保存位置
            setTimeout(() => {
                this.saveUserPosition(container);
            }, 300); // 与CSS动画时间相匹配
        };

        // 绑定事件监听器
        moveHandle.addEventListener('mousedown', (e) => {
            dragStart(e);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', () => {
                dragEnd();
                document.removeEventListener('mousemove', drag);
            });
        });

        moveHandle.addEventListener('touchstart', (e) => {
            dragStart(e);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('touchend', () => {
                dragEnd();
                document.removeEventListener('touchmove', drag);
            });
        }, { passive: false });
    }

    // 修改保存位置方法
    savePosition(container) {
        const rect = container.getBoundingClientRect();
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const isScrollMode = container.classList.contains('scroll-mode');
        const isPinned = container.classList.contains('pinned');
        
        const position = {
            top: isScrollMode ? (rect.top + scrollY) : rect.top,
            left: rect.left,
            width: container.style.width,
            height: container.style.height,
            isScrollMode,
            isPinned
        };
        
        // 保存到 localStorage，使用特殊前缀标识这是隐藏时的位置
        localStorage.setItem(`hide_${container.id}`, JSON.stringify(position));
    }

    // 修改加载位置方法
    loadPosition(container) {
        const savedPosition = localStorage.getItem(container.id);
        if (savedPosition) {
            const { top, left, width, height, isScrollMode, isPinned } = JSON.parse(savedPosition);
            
            // 恢复尺寸
            if (width && height) {
                container.style.width = width;
                container.style.height = height;
                
                // 更新 iframe 内容的缩放
                const iframe = container.querySelector('iframe');
                if (iframe) {
                    const scale = parseInt(width) / parseInt(container.dataset.baseWidth);
                    const url = new URL(iframe.src);
                    
                    if (url.hash.includes('count-down')) {
                        url.hash = url.hash.replace(/s=[\d.]+/, `s=${scale.toFixed(2)}`);
                    } else if (url.hash.includes('sentence')) {
                        const fontSize = Math.round(14 * scale);
                        url.hash = url.hash.replace(/fz=\d+/, `fz=${fontSize}`);
                        url.hash = url.hash.replace(/as=\d+/, `as=${fontSize}`);
                    }
                    
                    // 强制重新加载 iframe
                    const newUrl = url.toString();
                    if (iframe.src !== newUrl) {
                        iframe.src = newUrl;
                    }
                }
            }
            
            // 恢复位置和状态
            if (isScrollMode) {
                container.classList.add('scroll-mode');
                container.style.position = 'absolute';
                container.style.top = top + 'px';
                container.dataset.initialTop = top;
                container.querySelector('.scroll-toggle').classList.add('active');
                container.querySelector('.scroll-toggle .tooltip').textContent = '固定在视口';
                
                // 禁用拖动和固定按钮
                const moveHandle = container.querySelector('.move-handle');
                moveHandle.style.opacity = '0.5';
                moveHandle.style.cursor = 'not-allowed';
                moveHandle.title = '滚动模式下无法移动';
                
                const pinButton = container.querySelector('.pin-button');
                pinButton.style.opacity = '0.5';
                pinButton.style.cursor = 'not-allowed';
                pinButton.title = '滚动模式下无法固定';
            } else {
                container.style.position = 'fixed';
                container.style.top = top + 'px';
                container.querySelector('.scroll-toggle .tooltip').textContent = '跟随页面';
            }
            
            container.style.left = left + 'px';
            
            if (isPinned) {
                container.classList.add('pinned');
                container.querySelector('.pin-button').classList.add('active');
                container.querySelector('.move-handle').style.cursor = 'not-allowed';
                container.querySelector('.pin-button .tooltip').textContent = '取消固定';
                
                // 禁用滚动模式按钮
                const scrollToggle = container.querySelector('.scroll-toggle');
                scrollToggle.style.opacity = '0.5';
                scrollToggle.style.cursor = 'not-allowed';
                scrollToggle.title = '固定状态下无法切换滚动模式';
            }

            // 确保在视口范围内
            this.ensureInViewport(container);
        }
    }

    // 确保组件在视口内（不保存位置）
    ensureInViewport(container) {
        const rect = container.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // 处理水平位置
        if (rect.right > window.innerWidth) {
            container.style.left = Math.max(0, maxX) + 'px';
        }
        if (rect.left < 0) {
            container.style.left = '0px';
        }

        // 处理垂直位置
        if (container.classList.contains('scroll-mode')) {
            const absoluteTop = rect.top + scrollY;
            if (absoluteTop < scrollY) {
                container.style.top = scrollY + 'px';
            }
        } else {
            if (rect.top < 0) {
                container.style.top = '0px';
            }
            if (rect.bottom > window.innerHeight) {
                container.style.top = Math.max(0, maxY) + 'px';
            }
        }
    }

    // 保存用户选择的位置（防抖）
    saveUserPosition(container) {
        if (this._saveTimeout) {
            clearTimeout(this._saveTimeout);
        }
        
        // 获取当前变换状态
        const transform = window.getComputedStyle(container).transform;
        const matrix = new DOMMatrix(transform);
        const translateY = matrix.m42; // 获取Y轴变换值
        
        this._saveTimeout = setTimeout(() => {
            const rect = container.getBoundingClientRect();
            // 计算实际位置（考虑变换）
            const position = {
                top: rect.top + window.scrollY - translateY, // 减去变换的影响
                left: rect.left,
                width: container.style.width || rect.width + 'px',
                height: container.style.height || rect.height + 'px',
                isScrollMode: container.classList.contains('scroll-mode'),
                isPinned: container.classList.contains('pinned')
            };
            
            console.log('保存用户选择的位置:', {
                id: container.id,
                position,
                rect,
                transform: translateY
            });
            
            localStorage.setItem(`user_pos_${container.id}`, JSON.stringify(position));
        }, 100);
    }

    // 保存缩小时的位置（仅在首次缩小到70%时保存）
    saveMinimizedPosition(container) {
        // 检查是否已经有保存的缩小位置
        const existingPosition = localStorage.getItem(`min_pos_${container.id}`);
        console.log('检查已存在的缩小位置:', {
            id: container.id,
            existingPosition
        });

        if (!existingPosition) {
            const rect = container.getBoundingClientRect();
            const position = {
                top: rect.top + window.scrollY,  // 保存相对于文档顶部的绝对位置
                left: rect.left,
                width: container.style.width,
                height: container.style.height,
                isScrollMode: container.classList.contains('scroll-mode'),
                isPinned: container.classList.contains('pinned')
            };
            
            console.log('保存缩小时的位置:', {
                id: container.id,
                position,
                rect,
                scrollY: window.scrollY
            });
            
            // 保存缩小时的位置（70%宽度时的位置）
            localStorage.setItem(`min_pos_${container.id}`, JSON.stringify(position));
        }
    }

    // 更新按钮状态的方法
    updateButtonStates(container) {
        const moveHandle = container.querySelector('.move-handle');
        const scrollToggle = container.querySelector('.scroll-toggle');
        const pinButton = container.querySelector('.pin-button');
        const deleteButton = container.querySelector('.delete-button');
        
        const isScrollMode = container.classList.contains('scroll-mode');
        const isPinned = container.classList.contains('pinned');
        
        // 重置所有按钮状态
        [moveHandle, scrollToggle, pinButton, deleteButton].forEach(button => {
            if (button) {
                button.classList.remove('disabled', 'active');
                button.style.cursor = 'pointer';
            }
        });
        
        if (isScrollMode) {
            // 滚动模式下禁用移动、固定和删除
            moveHandle.classList.add('disabled');
            pinButton.classList.add('disabled');
            deleteButton.classList.add('disabled');
            scrollToggle.classList.add('active');
        } else if (isPinned) {
            // 固定模式下禁用移动、滚动和删除
            moveHandle.classList.add('disabled');
            scrollToggle.classList.add('disabled');
            deleteButton.classList.add('disabled');
            pinButton.classList.add('active');
        } else {
            // 正常模式下启用所有按钮
            moveHandle.style.cursor = 'move';
        }
        
        // 更新缩放手柄状态
        const resizeHandles = container.querySelectorAll('.resize-handle');
        resizeHandles.forEach(handle => {
            if (isScrollMode || isPinned) {
                handle.classList.add('disabled');
            } else {
                handle.classList.remove('disabled');
            }
        });
    }

    // 添加更新配置的方法
    updateConfig() {
        const widgets = document.querySelectorAll('.widget-container');
        const config = {
            widgets: Array.from(widgets).map(widget => {
                const iframe = widget.querySelector('iframe');
                return {
                    name: widget.dataset.widgetName,
                    url: iframe.src,
                    position: {
                        top: parseInt(widget.style.top),
                        left: parseInt(widget.style.left),
                        width: widget.style.width,
                        height: widget.style.height,
                        isScrollMode: widget.classList.contains('scroll-mode'),
                        isPinned: widget.classList.contains('pinned')
                    }
                };
            })
        };

        if (this.configManager) {
            this.configManager.currentConfig = config;
        }
    }

    // 只修改验证配置的方法
    validateConfig(config) {
        if (!config || !Array.isArray(config.widgets)) {
            console.log('配置格式无效:', config);
            return false;
        }

        return config.widgets.every(widget => {
            const isValid = widget.name && // 添加name验证
                widget.url && 
                widget.position &&
                typeof widget.position.top === 'number' &&
                typeof widget.position.left === 'number' &&
                widget.position.width &&
                widget.position.height;

            if (!isValid) {
                console.log('无效的组件配置:', widget);
            }
            return isValid;
        });
    }
}

// 自动初始化
window.addEventListener('DOMContentLoaded', () => {
    new DraggableWidgets();
});   
// ====================== FREEWIDGETS脚本 结束 ======================// ====================== FREEWIDGETS脚本 结束 ======================