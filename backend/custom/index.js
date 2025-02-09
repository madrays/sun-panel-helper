/* Sun-Panel-Helper JS */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致功能冲突或程序异常 */
/* 上次更新：2025/2/8 14:45:32 */

/* Sun-Panel-Helper JS Start: fish-animation */
// ====================== 鱼群动画系统 开始 ======================
window.SunPanelFish = (function() {
    // 配置参数
    const config = {
        fishCount: 3,
        heightRate: 0.5,
        fishColor: 'hsl(0, 0%, 95%)',
        opacity: 0.37
    };

    // 定义构造函数
    function SURFACE_POINT(renderer, x) {
        this.renderer = renderer;
        this.x = x;
        this.init();
    }

    // 设置完整的原型
    SURFACE_POINT.prototype = {
        SPRING_CONSTANT: 0.03,
        SPRING_FRICTION: 0.9,
        WAVE_SPREAD: 0.3,
        ACCELARATION_RATE: 0.01,

        init: function() {
            this.initHeight = this.renderer.height * this.renderer.INIT_HEIGHT_RATE;
            this.height = this.initHeight;
            this.fy = 0;
            this.force = {previous: 0, next: 0};
        },

        setPreviousPoint: function(previous) {
            this.previous = previous;
        },

        setNextPoint: function(next) {
            this.next = next;
        },

        interfere: function(y, velocity) {
            this.fy = this.renderer.height * this.ACCELARATION_RATE * ((this.renderer.height - this.height - y) >= 0 ? -1 : 1) * Math.abs(velocity);
        },

        updateSelf: function() {
            this.fy += this.SPRING_CONSTANT * (this.initHeight - this.height);
            this.fy *= this.SPRING_FRICTION;
            this.height += this.fy;
        },

        updateNeighbors: function() {
            if(this.previous) {
                this.force.previous = this.WAVE_SPREAD * (this.height - this.previous.height);
            }
            if(this.next) {
                this.force.next = this.WAVE_SPREAD * (this.height - this.next.height);
            }
        },

        render: function(context) {
            if(this.previous) {
                this.previous.height += this.force.previous;
                this.previous.fy += this.force.previous;
            }
            if(this.next) {
                this.next.height += this.force.next;
                this.next.fy += this.force.next;
            }
            context.lineTo(this.x, this.renderer.height - this.height);
        }
    };

    function FISH(renderer) {
        this.renderer = renderer;
        this.init();
    }

    // 设置完整的原型
    FISH.prototype = {
        GRAVITY: 0.4,

        init: function() {
            this.direction = Math.random() < 0.5;
            this.x = this.direction ? (this.renderer.width + this.renderer.THRESHOLD) : -this.renderer.THRESHOLD;
            this.previousY = this.y;
            this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1);

            if(this.renderer.reverse) {
                this.y = this.getRandomValue(this.renderer.height * 1 / 10, this.renderer.height * 4 / 10);
                this.vy = this.getRandomValue(2, 5);
                this.ay = this.getRandomValue(0.05, 0.2);
            } else {
                this.y = this.getRandomValue(this.renderer.height * 6 / 10, this.renderer.height * 9 / 10);
                this.vy = this.getRandomValue(-5, -2);
                this.ay = this.getRandomValue(-0.2, -0.05);
            }
            this.isOut = false;
            this.theta = 0;
            this.phi = 0;
        },

        getRandomValue: function(min, max) {
            return min + (max - min) * Math.random();
        },

        reverseVertical: function() {
            this.isOut = !this.isOut;
            this.ay *= -1;
        },

        controlStatus: function(context) {
            this.previousY = this.y;
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.ay;

            if(this.renderer.reverse) {
                if(this.y > this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
                    this.vy -= this.GRAVITY;
                    this.isOut = true;
                } else {
                    if(this.isOut) {
                        this.ay = this.getRandomValue(0.05, 0.2);
                    }
                    this.isOut = false;
                }
            } else {
                if(this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
                    this.vy += this.GRAVITY;
                    this.isOut = true;
                } else {
                    if(this.isOut) {
                        this.ay = this.getRandomValue(-0.2, -0.05);
                    }
                    this.isOut = false;
                }
            }
            if(!this.isOut) {
                this.theta += Math.PI / 20;
                this.theta %= Math.PI * 2;
                this.phi += Math.PI / 30;
                this.phi %= Math.PI * 2;
            }
            this.renderer.generateEpicenter(this.x + (this.direction ? -1 : 1) * this.renderer.THRESHOLD, this.y, this.y - this.previousY);

            if(this.vx > 0 && this.x > this.renderer.width + this.renderer.THRESHOLD || this.vx < 0 && this.x < -this.renderer.THRESHOLD) {
                this.init();
            }
        },

        render: function(context) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(Math.PI + Math.atan2(this.vy, this.vx));
            context.scale(1, this.direction ? 1 : -1);
            context.beginPath();
            context.moveTo(-30, 0);
            context.bezierCurveTo(-20, 15, 15, 10, 40, 0);
            context.bezierCurveTo(15, -10, -20, -15, -30, 0);
            context.fill();

            context.save();
            context.translate(40, 0);
            context.scale(0.9 + 0.2 * Math.sin(this.theta), 1);
            context.beginPath();
            context.moveTo(0, 0);
            context.quadraticCurveTo(5, 10, 20, 8);
            context.quadraticCurveTo(12, 5, 10, 0);
            context.quadraticCurveTo(12, -5, 20, -8);
            context.quadraticCurveTo(5, -10, 0, 0);
            context.fill();
            context.restore();

            context.save();
            context.translate(-3, 0);
            context.rotate((Math.PI / 3 + Math.PI / 10 * Math.sin(this.phi)) * (this.renderer.reverse ? -1 : 1));
            context.beginPath();

            if(this.renderer.reverse) {
                context.moveTo(5, 0);
                context.bezierCurveTo(10, 10, 10, 30, 0, 40);
                context.bezierCurveTo(-12, 25, -8, 10, 0, 0);
            } else {
                context.moveTo(-5, 0);
                context.bezierCurveTo(-10, -10, -10, -30, 0, -40);
                context.bezierCurveTo(12, -25, 8, -10, 0, 0);
            }
            context.closePath();
            context.fill();
            context.restore();
            context.restore();
            this.controlStatus(context);
        }
    };

    // 渲染器对象
    var RENDERER = {
        POINT_INTERVAL: 5,
        FISH_COUNT: config.fishCount,
        MAX_INTERVAL_COUNT: 50,
        INIT_HEIGHT_RATE: config.heightRate,
        THRESHOLD: 50,
        
        init: function() {
            this.setParameters();
            this.reconstructMethods();
            this.setup();
            this.bindEvent();
            this.render();
        },
        
        setParameters: function() {
            this.$window = window;
            this.$document = document.body;
            this.$container = document.getElementById('jsi-flying-fish-container');
            this.$canvas = document.createElement('canvas');
            this.$container.appendChild(this.$canvas);
            this.context = this.$canvas.getContext('2d');
            this.points = [];
            this.fishes = [];
            this.watchIds = [];
        },

        reconstructMethods: function() {
            this.watchWindowSize = this.watchWindowSize.bind(this);
            this.jdugeToStopResize = this.jdugeToStopResize.bind(this);
            this.startEpicenter = this.startEpicenter.bind(this);
            this.moveEpicenter = this.moveEpicenter.bind(this);
            this.reverseVertical = this.reverseVertical.bind(this);
            this.render = this.render.bind(this);
        },

        setup: function() {
            this.points.length = 0;
            this.fishes.length = 0;
            this.watchIds.length = 0;
            this.intervalCount = this.MAX_INTERVAL_COUNT;
            this.width = this.$container.offsetWidth;
            this.height = this.$container.offsetHeight;
            this.fishCount = Math.ceil(this.FISH_COUNT * (this.width / 1000));
            this.$canvas.width = this.width;
            this.$canvas.height = this.height;
            this.reverse = false;
            
            while(this.fishes.length < this.fishCount) {
                this.fishes.push(new FISH(this));
            }
            this.createSurfacePoints();
        },

        createSurfacePoints: function() {
            var count = Math.round(this.width / this.POINT_INTERVAL);
            this.pointInterval = this.width / (count - 1);
            this.points.push(new SURFACE_POINT(this, 0));
            
            for(var i = 1; i < count; i++) {
                var point = new SURFACE_POINT(this, i * this.pointInterval),
                    previous = this.points[i - 1];
                
                point.setPreviousPoint(previous);
                previous.setNextPoint(point);
                this.points.push(point);
            }
        },

        watchWindowSize: function() {
            this.clearTimer();
            this.tmpWidth = window.innerWidth;
            this.tmpHeight = window.innerHeight;
            this.watchIds.push(setTimeout(this.jdugeToStopResize, 200));
        },

        clearTimer: function() {
            while(this.watchIds.length > 0) {
                clearTimeout(this.watchIds.pop());
            }
        },

        jdugeToStopResize: function() {
            var width = window.innerWidth,
                height = window.innerHeight,
                stopped = (width == this.tmpWidth && height == this.tmpHeight);
            
            this.tmpWidth = width;
            this.tmpHeight = height;
            
            if(stopped) {
                this.setup();
            }
        },

        bindEvent: function() {
            let resizeTimeout;
            window.addEventListener('resize', () => {
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }
                resizeTimeout = setTimeout(() => {
                    this.width = this.$container.offsetWidth;
                    this.height = this.$container.offsetHeight;
                    this.$canvas.width = this.width;
                    this.$canvas.height = this.height;
                    this.setup();
                }, 100);
            });

            this.$container.onclick = this.reverseVertical;
            this.$container.onmouseenter = this.startEpicenter;
            this.$container.addEventListener('mousemove', this.moveEpicenter);
        },

        getAxis: function(event) {
            var offset = this.getOffset(this.$container);
            return {
                x: event.clientX - offset.left + this.$document.scrollLeft,
                y: event.clientY - offset.top + this.$document.scrollTop
            };
        },

        getOffset: function(Node, offset) {
            if (!offset) {
                offset = {};
                offset.top = 0;
                offset.left = 0;
            }
            if (Node == document.body) {
                return offset;
            }
            offset.top += Node.offsetTop;
            offset.left += Node.offsetLeft;
            return this.getOffset(Node.parentNode, offset);
        },

        startEpicenter: function(event) {
            this.axis = this.getAxis(event);
        },

        moveEpicenter: function(event) {
            var axis = this.getAxis(event);
            
            if(!this.axis) {
                this.axis = axis;
            }
            this.generateEpicenter(axis.x, axis.y, axis.y - this.axis.y);
            this.axis = axis;
        },

        generateEpicenter: function(x, y, velocity) {
            if(y < this.height / 2 - this.THRESHOLD || y > this.height / 2 + this.THRESHOLD) {
                return;
            }
            var index = Math.round(x / this.pointInterval);
            
            if(index < 0 || index >= this.points.length) {
                return;
            }
            this.points[index].interfere(y, velocity);
        },

        reverseVertical: function() {
            this.reverse = !this.reverse;
            
            for(var i = 0, count = this.fishes.length; i < count; i++) {
                this.fishes[i].reverseVertical();
            }
        },

        controlStatus: function() {
            for(var i = 0, count = this.points.length; i < count; i++) {
                this.points[i].updateSelf();
            }
            for(var i = 0, count = this.points.length; i < count; i++) {
                this.points[i].updateNeighbors();
            }
            if(this.fishes.length < this.fishCount) {
                if(--this.intervalCount == 0) {
                    this.intervalCount = this.MAX_INTERVAL_COUNT;
                    this.fishes.push(new FISH(this));
                }
            }
        },

        render: function() {
            requestAnimationFrame(this.render);
            this.controlStatus();
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.fillStyle = config.fishColor;

            for(var i = 0, count = this.fishes.length; i < count; i++) {
                this.fishes[i].render(this.context);
            }
            this.context.save();
            this.context.globalCompositeOperation = 'xor';
            this.context.beginPath();
            this.context.moveTo(0, this.reverse ? 0 : this.height);

            for(var i = 0, count = this.points.length; i < count; i++) {
                this.points[i].render(this.context);
            }
            this.context.lineTo(this.width, this.reverse ? 0 : this.height);
            this.context.closePath();
            this.context.fill();
            this.context.restore();
        }
    };

    // 初始化函数
    function initFishBackground() {
        const addFishBackground = (wallpaperDiv) => {
            if (!wallpaperDiv || wallpaperDiv.querySelector('.fishcontainer')) {
                return;
            }

            var newDiv = document.createElement("div");
            Object.assign(newDiv, {
                id: "jsi-flying-fish-container",
                className: "fishcontainer"
            });
            
            Object.assign(newDiv.style, {
                width: "100vw",
                height: "200px",
                position: "fixed",
                zIndex: "0",
                opacity: config.opacity.toString(),
                bottom: "0",
                left: "0",
                right: "0",
                overflow: "hidden"
            });
            
            wallpaperDiv.appendChild(newDiv);
            RENDERER.init();
            
            // 标记鱼群背景初始化完成
            if (window.initStatus) {
                window.initStatus.fishBackgroundReady = true;
                if (typeof window.checkInit === 'function') {
                    window.checkInit();
                }
            }
        };

        // 监视DOM变化
        const fishObserver = new MutationObserver(() => {
            const wallpaperDiv = document.querySelector('.cover.wallpaper');
            addFishBackground(wallpaperDiv);
        });

        fishObserver.observe(document.body, { childList: true, subtree: true });
        
        // 初始检查
        const wallpaperDiv = document.querySelector('.cover.wallpaper');
        addFishBackground(wallpaperDiv);
    }

    // 返回公共接口
    return {
        init: initFishBackground,
        RENDERER: RENDERER,
        SURFACE_POINT: SURFACE_POINT,
        FISH: FISH,
        updateConfig: function(newConfig) {
            Object.assign(config, newConfig);
            // 更新渲染器参数
            RENDERER.FISH_COUNT = config.fishCount;
            RENDERER.INIT_HEIGHT_RATE = config.heightRate;
            // 如果已经初始化了，更新容器样式
            const container = document.querySelector('.fishcontainer');
            if (container) {
                container.style.opacity = config.opacity.toString();
            }
        }
    };
})();

// 启动初始化
window.SunPanelFish.init();
 // ====================== 鱼群动画系统 结束 ======================
/* Sun-Panel-Helper JS End: fish-animation */

/* Sun-Panel-Helper JS Start: search-quote */
// 定义一个函数，用于获取随机句子并更新占位符
function updatePlaceholder() {
    // 定义接口列表
    const apiUrls = [
        'https://v1.hitokoto.cn/',
        'https://yyapi.xpdbk.com/api/ian',
        'https://api.nxvav.cn/api/yiyan'
    ];

    // 定义一个函数来尝试获取句子
    const fetchRandomSentence = (index) => {
        if (index >= apiUrls.length) {
            console.error('所有接口均获取句子失败');
            return;
        }

        fetch(apiUrls[index])
            .then(response => response.json())
            .then(data => {
                const sentence = data.hitokoto || data.content || data.data;
                if (sentence) {
                    const inputElements = document.querySelectorAll('input[placeholder="请输入搜索内容"]');
                    if (inputElements.length > 0) {
                        inputElements.forEach(input => {
                            input.placeholder = sentence;
                        });
                    }
                } else {
                    fetchRandomSentence(index + 1);
                }
            })
            .catch(error => {
                console.error('获取句子时出错:', error);
                fetchRandomSentence(index + 1);
            });
    };

    // 开始尝试获取句子
    fetchRandomSentence(0);
}

// 页面加载时自动调用替换函数
window.onload = updatePlaceholder;
/* Sun-Panel-Helper JS End: search-quote */

/* Sun-Panel-Helper JS Start: toc-nav */
// 目录导航组件
(function() {
  // 创建命名空间
  const SunPanelTOC = {
    // =========== Config Start ===========
    // ------------------------------------
    // 配置项
    config: {
      scrollOffset: 80,
      displayStyle: 'auto',
      mobileWidth: 800,
      domId: 'sun-panel-toc-dom',
      svgTocMobileBtn: '<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"><path fill="currentColor" d="M17.5 4.5c-1.95 0-4.05.4-5.5 1.5c-1.45-1.1-3.55-1.5-5.5-1.5c-1.45 0-2.99.22-4.28.79C1.49 5.62 1 6.33 1 7.14v11.28c0 1.3 1.22 2.26 2.48 1.94c.98-.25 2.02-.36 3.02-.36c1.56 0 3.22.26 4.56.92c.6.3 1.28.3 1.87 0c1.34-.67 3-.92 4.56-.92c1 0 2.04.11 3.02.36c1.26.33 2.48-.63 2.48-1.94V7.14c0-.81-.49-1.52-1.22-1.85c-1.28-.57-2.82-.79-4.27-.79M21 17.23c0 .63-.58 1.09-1.2.98c-.75-.14-1.53-.2-2.3-.2c-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5c.92 0 1.83.09 2.7.28c.46.1.8.51.8.98z"/><path fill="currentColor" d="M13.98 11.01c-.32 0-.61-.2-.71-.52c-.13-.39.09-.82.48-.94c1.54-.5 3.53-.66 5.36-.45c.41.05.71.42.66.83s-.42.71-.83.66c-1.62-.19-3.39-.04-4.73.39c-.08.01-.16.03-.23.03m0 2.66c-.32 0-.61-.2-.71-.52c-.13-.39.09-.82.48-.94c1.53-.5 3.53-.66 5.36-.45c.41.05.71.42.66.83s-.42.71-.83.66c-1.62-.19-3.39-.04-4.73.39a1 1 0 0 1-.23.03m0 2.66c-.32 0-.61-.2-.71-.52c-.13-.39.09-.82.48-.94c1.53-.5 3.53-.66 5.36-.45c.41.05.71.42.66.83s-.42.7-.83.66c-1.62-.19-3.39-.04-4.73.39a1 1 0 0 1-.23.03"/></svg>'
    },

    // 主题配置
    theme: {
      background: "rgba(42, 42, 42, 0.42)",
      text: "#ffffff",
      hover: "rgba(255, 255, 255, 0.2)",
      active: "rgba(255, 255, 255, 0.3)"
    },

    // 滚动容器的类名
    scrollContainerElementClassName: '.scroll-container',

    // 工具函数
    utils: {
      isMobile() {
        if (SunPanelTOC.config.displayStyle === 'mobile') return true
        if (SunPanelTOC.config.displayStyle === 'pc') return false
        return window.innerWidth < SunPanelTOC.config.mobileWidth
      },

      debounce(func, wait) {
        let timeout
        return function (...args) {
          clearTimeout(timeout)
          timeout = setTimeout(() => func.apply(this, args), wait)
        }
      }
    },

    // DOM 操作相关
    dom: {
      createDom() {
        // 检测是否已经存在TOC DOM，存在则删除
        const element = document.getElementById(SunPanelTOC.config.domId)
        if (element) element.remove()

        const tocDom = document.createElement('div')
        tocDom.id = SunPanelTOC.config.domId
        document.body.appendChild(tocDom)

        // ========= Add style start =========
        const style = document.createElement('style')
        const tocDomStyleId = `#${SunPanelTOC.config.domId}`
        style.textContent = `
        ${tocDomStyleId} #toc-mobile-btn {
            top: 20px !important;
            left: 20px !important;
            position: fixed;
            width: 46px;
            height: 46px;
            background-color: ${SunPanelTOC.theme.background};
            color: ${SunPanelTOC.theme.text};
            border-radius: 0.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        }

        ${tocDomStyleId} .hidden {
            display: none !important;
        }

        ${tocDomStyleId} #toc-sidebar {
            width: 40px;
            padding: 10px;
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            transition: width 0.3s ease, background-color 0.3s ease;
            border-top-right-radius: 20px;
            border-bottom-right-radius: 20px;
            background-color: none;
        }

        ${tocDomStyleId} .toc-mobile-btn-svg-container{
          width:21px;
          height:21px;
        }

        ${tocDomStyleId} .toc-sidebar-expansion {
            width: 200px !important;
            display: flex;
            background-color: ${SunPanelTOC.theme.background};
            box-shadow: 1px 0 5px ${SunPanelTOC.theme.hover};
        }

        ${tocDomStyleId} #toc-sidebar .toc-sidebar-box {
            width: 500px;
        }

        ${tocDomStyleId} .title-bar-box {
            display: flex;
            align-items: center;
            position: relative;
            cursor: pointer;
        }

        ${tocDomStyleId} .title-bar-slip {
            width: 20px;
            height: 6px;
            background-color: ${SunPanelTOC.theme.text};
            border-radius: 5px;
            margin: 15px 0;
            transition: height 0.3s ease, width 0.3s ease;
            box-shadow: 1px 0 5px ${SunPanelTOC.theme.hover};
        }

        ${tocDomStyleId} .title-bar-title {
            opacity: 0;
            white-space: nowrap;
            transition: opacity 0.3s ease, transform 0.3s ease, margin-left 0.3s ease;
            font-size: 15px;
            color: ${SunPanelTOC.theme.text};
        }

        ${tocDomStyleId} .toc-sidebar-expansion .title-bar-title {
            opacity: 1;
            margin-left: 10px;
        }

        ${tocDomStyleId} .toc-sidebar-expansion .title-bar-slip {
            box-shadow: none;
        }

        ${tocDomStyleId} .toc-sidebar-expansion .title-bar-box:hover .title-bar-slip {
            width: 40px;
        }

        ${tocDomStyleId} .toc-sidebar-expansion .title-bar-box:hover .title-bar-title {
            font-size: 20px;
        }

          `
        // 添加样式到文档头部
        tocDom.appendChild(style)

        // ========= Add style end =========

        // 添加移动端菜单按钮
        const tocMobileBtn = document.createElement('div')
        tocMobileBtn.id = 'toc-mobile-btn'
        tocMobileBtn.classList.add('backdrop-blur-[2px]')
        tocDom.appendChild(tocMobileBtn)

        const tocMobileBtnSvgcContainer = document.createElement('div')
        tocMobileBtnSvgcContainer.innerHTML = SunPanelTOC.config.svgTocMobileBtn
        tocMobileBtnSvgcContainer.classList.add('toc-mobile-btn-svg-container')
        tocMobileBtn.appendChild(tocMobileBtnSvgcContainer)

        // 创建侧边栏容器
        const sidebar = document.createElement('div')
        sidebar.id = 'toc-sidebar'

        const sidebarBox = document.createElement('div')
        sidebarBox.className = 'toc-sidebar-box'

        // 查询出所有类名包含 item-group-index- 的元素
        const items = document.querySelectorAll('[class*="item-group-index-"]')

        // 遍历并打印每个元素的完整类名
        items.forEach((item) => {
          item.classList.forEach((className) => {
            if (className.startsWith('item-group-index-')) {
              const titleBarBox = document.createElement('div')
              titleBarBox.className = 'title-bar-box'
              // titleBarBox.href = `#${item.id}`
              titleBarBox.dataset.groupClassName = className

              // 目录条
              const titleBarSlip = document.createElement('div')
              titleBarSlip.className = 'title-bar-slip'

              // 创建一个链接
              const titleBarTitle = document.createElement('div')
              titleBarTitle.className = 'title-bar-title'

              // 获取子元素中 class="group-title" 的内容
              const titleElement = item.querySelector('.group-title')
              const titleText = titleElement ? titleElement.textContent : item.id
              titleBarTitle.textContent = titleText

              titleBarBox.appendChild(titleBarSlip)
              titleBarBox.appendChild(titleBarTitle)

              sidebarBox.appendChild(titleBarBox)
            }
          })
        })

        sidebar.appendChild(sidebarBox)

        // 将侧边栏添加到页面中
        tocDom.appendChild(sidebar)

        function mobileHideSidebar() {
          sidebar.classList.remove('toc-sidebar-expansion')
          sidebar.classList.add('hidden')
        }

        function hideSidebar() {
          sidebar.classList.remove('toc-sidebar-expansion')
        }

        function showSidebar() {
          sidebar.classList.add('toc-sidebar-expansion')
          sidebar.classList.remove('hidden')
        }

        // ----------------
        // 监听宽度变化开始
        // ----------------
        function handleResize() {
          if (SunPanelTOC.utils.isMobile()) {
            tocMobileBtn.classList.remove('hidden')
            sidebar.classList.add('hidden')
          }
          else {
            tocMobileBtn.classList.add('hidden')
            sidebar.classList.remove('hidden')
          }
        }

        // 使用防抖函数包装你的处理函数
        const debouncedHandleResize = SunPanelTOC.utils.debounce(handleResize, 200)

        // 添加事件监听器
        window.addEventListener('resize', debouncedHandleResize)

        // 首次触发
        handleResize()

        // ----------------
        // 监听宽度变化结束
        // ----------------

        // 监听移动端按钮点击
        tocMobileBtn.addEventListener('click', () => {
          if (sidebar.classList.contains('toc-sidebar-expansion')) {
            // 隐藏
            mobileHideSidebar()
          }
          else {
            // 显示
            showSidebar()
          }
        })

        // 监听TOC栏失去hover
        sidebar.addEventListener('mouseleave', () => {
          if (SunPanelTOC.utils.isMobile()) {
            // 隐藏
            mobileHideSidebar()
          }
          else {
            hideSidebar()
          }
        })

        // 监听TOC栏获得hover
        sidebar.addEventListener('mouseenter', () => {
          showSidebar()
        })

        // 监听TOC点击事件
        document.querySelectorAll('.title-bar-box').forEach((box) => {
          box.addEventListener('click', function (event) {
          // 检查触发事件的元素是否有 'data-groupClassName' 属性
            if (this.dataset.groupClassName) {
            // 获取 'data-groupClass' 属性的值
              const groupClassName = this.dataset.groupClassName
              // 使用属性值作为选择器查询对应的元素
              const targetElement = document.querySelector(`.${groupClassName}`)
              if (targetElement) {
              // 获取目标元素的 'top' 坐标
                const targetTop = targetElement.offsetTop
                const scrollContainerElement = document.querySelector(SunPanelTOC.scrollContainerElementClassName)
                if (scrollContainerElement) {
                  scrollContainerElement.scrollTo({
                    top: targetTop - SunPanelTOC.config.scrollOffset,
                    behavior: 'smooth', // 平滑滚动
                  })
                }
              }
            }
          })
        })
      },

      handleResize() {
        if (SunPanelTOC.utils.isMobile()) {
          // ... 移动端处理
        } else {
          // ... PC端处理
        }
      }
    },

    // 初始化
    init() {
      const items = document.querySelectorAll('[class*="item-group-index-"]')
      if (items.length > 0) {
        SunPanelTOC.dom.createDom()
        return
      }

      const interval = setInterval(() => {
        const items = document.querySelectorAll('[class*="item-group-index-"]')
        if (items.length > 0) {
          SunPanelTOC.dom.createDom()
          clearInterval(interval)
        }
      }, 1000)
    }
  }

  // 启动
  SunPanelTOC.init()
})()
/* Sun-Panel-Helper JS End: toc-nav */

/* Sun-Panel-Helper JS Start: fixed-widgets */
// ====================== 初始化控制 开始 ======================
// 创建一个全局初始化状态对象
window.initStatus = {
    footerReady: false
};

// 初始化检查函数
function checkInit() {
    if (window.initStatus.footerReady) {
        // 组件准备好后，执行组件移动
        const itemCardBox = document.getElementById("item-card-box");
        const weatherComponent1 = document.querySelector('.row');
        
        if (itemCardBox && weatherComponent1) {
            itemCardBox.insertAdjacentElement('beforebegin', weatherComponent1);
        }
    }
}
// ====================== 初始化控制 结束 ======================

// ====================== Widget配置说明 开始 ======================
/**
 * Widget 配置指南:
 * 
 * 1. 基础配置:
 *    {
 *        type: 'weather',           // 组件类型（用于标识）
 *        url: '/widget/url.html',   // 组件URL
 *        height: '200',             // 组件高度
 *        mobileShow: true,         // 是否在移动端显示
 *        width: '500px'            // 可选，指定组件宽度
 *    }
 * 
 * 2. 响应式行为:
 *    - PC端: 弹性布局，每个组件宽度自适应
 *    - 移动端: 只显示标记为 mobileShow: true 的组件
 * 
 * 3. 移动端显示控制:
 *    - mobileShow: true  -> 在移动端显示此组件
 *    - mobileShow: false -> 在移动端隐藏此组件（默认）
 * 
 * 4. 布局控制:
 *    - 使用 {type: 'break'} 强制换行
 *    - 可以通过设置 width 控制组件宽度
 */

// Widget配置数组
const WIDGETS = [
    {
        type: 'widget',
        url: 'https://www.widgets.link/#/tools-hot-news?contentBoxShadowColor=FFFFFF0D&ac=F0B17F00&tc=19A7CE8C&ttc=ffffff&tic=ffffff&thc=ffffff&cc=FBE8D900&bg=&_b=true',
        height: '200',
        width: '400px',
        mobileShow: true
    },
    {
        type: 'widget',
        url: 'https://www.widgets.link/#/tools-hot-news?contentBoxShadowColor=FFFFFF0D&ac=F0B17F00&tc=19A7CE8C&ttc=ffffff&tic=ffffff&thc=ffffff&cc=FBE8D900&bg=&_b=true',
        height: '200',
        width: '400px',
        mobileShow: false
    },
    { type: "break" }
]

// Widget 生成函数
function generateWidgets(widgets) {
    return widgets.map(widget => {
        // 处理换行组件
        if (widget.type === 'break') {
            return '<div class="widget-break"></div>';
        }
        
        // 处理普通组件
        return `
            <iframe 
                src="${widget.url}" 
                class="widget${widget.mobileShow ? ' show-on-mobile' : ''}" 
                style="width: ${widget.width}; ${widget.style || ''}"
                height="${widget.height}" 
                loading="lazy"
                title="${widget.type}"
                scrolling="no"
                frameborder="0"
            ></iframe>
        `;
    }).join('');
}
// ====================== Widget配置说明 结束 ======================

// ====================== 页脚处理系统 开始 ======================
const footerObserver = new MutationObserver((mutations) => {
    mutations.forEach(() => {
        const footerElements = document.querySelectorAll('.custom-footer');
        footerElements.forEach(footer => {
            if (footer && !footer.hasChildNodes()) {
                footer.innerHTML = `
                    <!-- Widget组件 -->
                    <div class="row">
                        ${generateWidgets(WIDGETS)}
                    </div>

                    <!-- 页脚 -->
<!DOCTYPE html>
<html lang="en">
<head>
    
    <meta charset="UTF-8">
    <style>
        body, html {
            margin: 0;
            padding: 0;
        }
       .site-footer1 {
            padding: 30px 0;
            text-align: center;
            color: #fff;
        }
       .footer-content {
            display: flex;
            justify-content: center;
        }
       .footer-links {
            margin: 0;
            padding: 0;
            list-style: none;
        }
       .footer-links li {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
       .footer-links a {
            text-decoration: none;
            color: inherit;
            transition: color 0.3s ease;
            display: flex;
            align-items: center;
        }
       .footer-links a:hover {
            color: #ccc;
        }
       .footer-icon {
            width: 35px;
            height: auto;
            margin-right: 15px;
        }
    </style>
    <link rel="stylesheet" href="/custom/bk.css">
    <link rel="stylesheet" href="/custom/action.css">
</head>
<body>
    <footer class="site-footer1">
        <div class="footer-content">
            <ul class="footer-links">
                <li></li>
                <li>
                    <a href="https://cocohe.cn" target="_blank" class="personal-link">
                        <img class="footer-icon" src="/uploads/2024/8/10/1985fc970e85cddfdb818d5d174fbde7.ico" alt="可可同学图标">
                        <span><font size="4" color=" #fff" style="font-family: 'STCaiyun'"><b>@ 可可同学</font></b></span>
                    </a>
                </li>
            </ul>
        </div>
        
    </footer>
    
    

<script src="/custom/toc.js"></script>     
</body>
</html>

                `;
                
                window.initStatus.footerReady = true;
                checkInit();
            }
        });
    });
});

footerObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
});
// ====================== 页脚处理系统 结束 ======================
/* Sun-Panel-Helper JS End: fixed-widgets */

/* Sun-Panel-Helper JS Start: markdown-editor */
// Sun-Panel-Helper Markdown Editor
// Author: Madrays
// Website: https://cocohe.cn
// GitHub: https://github.com/madrays

// 在文件顶部声明全局变量
let md;

(function() {
    // 检测是否为移动设备
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }

    // 如果是移动设备,直接返回不加载
    if (isMobileDevice()) {
        console.log('移动设备不支持此功能');
        return;
    }

    // 检查依赖
    function loadDependencies() {
        return new Promise((resolve, reject) => {
            // 按顺序加载依赖
            const dependencies = [
                {
                    type: 'style',
                    url: 'https://cdn.jsdelivr.net/npm/@mdi/font@6.5.95/css/materialdesignicons.min.css'
                },
                {
                    type: 'style',
                    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css'
                },
                {
                    type: 'script',
                    url: 'https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js'
                },
                {
                    type: 'script',
                    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'
                }
            ];

            function loadScript(url) {
                return new Promise((res, rej) => {
                    const script = document.createElement('script');
                    script.src = url;
                    script.onload = res;
                    script.onerror = rej;
                    document.head.appendChild(script);
                });
            }

            function loadStyle(url) {
                return new Promise((res, rej) => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = url;
                    link.onload = res;
                    link.onerror = rej;
                    document.head.appendChild(link);
                });
            }

            // 按顺序加载主要依赖
            Promise.all(dependencies.map(dep => {
                if (dep.type === 'script') {
                    return loadScript(dep.url);
                } else {
                    return loadStyle(dep.url);
                }
            }))
            .then(resolve)
            .catch(reject);
        });
    }

    // 用户配置
    const users = [{"username":"111","password":"333","note":""}];
    const API_PREFIX = 'http://localhost:3008/';  // 从配置中读取
    
    // 本地存储键名
    const STORAGE_KEYS = {
        NOTES: 'sun-panel-markdown-notes',
        USER: 'sun-panel-markdown-user'
    };

    // 切换编辑模式
    function toggleEditMode(enable) {
        isEditMode = enable;
        const editorContainer = document.querySelector('.editor-container');
        editorContainer.classList.toggle('edit-mode', enable);
        titleInput.readOnly = !enable;
        markdownInput.readOnly = !enable;
        saveButton.style.display = enable ? 'flex' : 'none';
        editButton.innerHTML = enable ? 
            '<span class="mdi mdi-eye"></span>预览' : 
            '<span class="mdi mdi-pencil"></span>编辑';
    }

    // 初始化 markdown-it
    function initializeMarkdownIt() {
        md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true,
            highlight: function (str, lang) {
                // 如果指定了语言且该语言存在
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(str, { language: lang }).value;
                    } catch (__) {}
                }
                
                // 自动检测语言
                try {
                    const detectedLang = detectLanguage(str);
                    return hljs.highlight(str, { language: detectedLang }).value;
                } catch (__) {}
                
                // 如果都失败了，使用普通转义
                return md.utils.escapeHtml(str);
            }
        });

        // 修改渲染规则
        md.renderer.rules.heading_open = function(tokens, idx) {
            const tag = tokens[idx].tag;
            const styles = {
                h1: 'font-size: 2.5em; margin: 1em 0; font-weight: bold; color: #2c3e50;',
                h2: 'font-size: 2em; margin: 0.8em 0; font-weight: bold; color: #2c3e50;',
                h3: 'font-size: 1.5em; margin: 0.6em 0; font-weight: bold; color: #2c3e50;'
            };
            return `<${tag} style="${styles[tag] || ''}">`;
        };

        // 修改列表渲染规则
        md.renderer.rules.bullet_list_open = function() {
            return '<ul style="margin: 1em 0; padding-left: 2em; list-style-type: disc;">';
        };

        md.renderer.rules.ordered_list_open = function(tokens, idx) {
            let start = tokens[idx].attrGet('start');
            start = start ? ` start="${start}"` : '';
            return `<ol style="margin: 1em 0; padding-left: 2em; list-style-type: decimal;"${start}>`;
        };

        md.renderer.rules.list_item_open = function() {
            return '<li style="margin: 0.5em 0;">';
        };

        // 修改行内代码渲染规则
        md.renderer.rules.code_inline = function(tokens, idx) {
            const code = tokens[idx].content;
            return `<code class="inline-code">${md.utils.escapeHtml(code)}</code>`;
        };
    }

    // 更新预览函数
    function updatePreview() {
        try {
            const text = markdownInput.value.trim();
            if (!text) {
                preview.innerHTML = '';
                return;
            }

            preview.innerHTML = md.render(text);

            requestAnimationFrame(() => {
                handleCodeBlocks();
                handleInlineCode();
            });
        } catch (error) {
            preview.innerHTML = '<div class="error">预览更新失败</div>';
        }
    }

    // API 请求封装
    async function fetchApi(url, options = {}) {
        try {
            let apiUrl;
            if (url.startsWith('http')) {
                apiUrl = url;
            } else {
                // 移除 API_PREFIX 末尾的斜杠
                const baseUrl = API_PREFIX.replace(/\/+$/, '');
                // 移除 url 开头的斜杠
                const cleanUrl = url.replace(/^\/+/, '');
                // 拼接完整 URL
                apiUrl = `${baseUrl}/${cleanUrl}`;
            }

            const response = await fetch(apiUrl, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            // 仅在首次切换到本地存储时提示
            if (!window.localStorageMode) {
                console.warn('已切换到本地存储模式');
                window.localStorageMode = true;
            }
            
            if (url.includes('/notes/')) {
                const username = url.split('/').pop();
                const localNotes = localStorage.getItem(`notes-${username}`);
                return localNotes ? JSON.parse(localNotes) : [];
            }
            if (options.method === 'POST' && url.includes('/notes/')) {
                const username = url.split('/').pop();
                localStorage.setItem(`notes-${username}`, JSON.stringify(options.body));
                return { success: true };
            }
            return null;
        }
    }

    // 笔记存储类
    class NoteStorage {
        constructor(username, anonymous = false) {
            this.username = username;
            this.anonymous = anonymous;
            this.notes = [];
        }

        async initUser() {
            try {
                await fetchApi(`/custom/helper/md/init/${this.username}`, {
                    method: 'POST'
                });
            } catch (error) {
                throw error;
            }
        }

        async loadNotes() {
            try {
                const notes = await fetchApi(`/custom/helper/md/notes/${this.username}`);
                this.notes = notes;
                return notes;
            } catch (error) {
                const savedNotes = localStorage.getItem(`notes-${this.username}`);
                this.notes = savedNotes ? JSON.parse(savedNotes) : [];
                return this.notes;
            }
        }

        async saveNotes(notes) {
            try {
                await fetchApi(`/custom/helper/md/notes/${this.username}`, {
                    method: 'POST',
                    body: JSON.stringify(notes)
                });
                localStorage.setItem(`notes-${this.username}`, JSON.stringify(notes));
            } catch (error) {
                localStorage.setItem(`notes-${this.username}`, JSON.stringify(notes));
                throw error;
            }
        }
    }

    // 全局变量
    let noteStorage;
    let currentNoteId = null;
    let isEditMode = false;
    let notepad, openButton, closeButton, markdownInput, preview,
        saveButton, titleInput, editButton, deleteButton,
        importButton, exportButton, newNoteButton, fileList;

    // 初始化 DOM 元素引用
    function initializeDOMElements() {
        notepad = document.getElementById('notepad');
        openButton = document.getElementById('openNotepad');
        closeButton = document.getElementById('closeNotepad');
        markdownInput = document.getElementById('markdown-input');
        preview = document.getElementById('preview');
        saveButton = document.getElementById('saveNote');
        titleInput = document.getElementById('noteTitle');
        editButton = document.getElementById('editNote');
        deleteButton = document.getElementById('deleteNote');
        importButton = document.getElementById('importNote');
        exportButton = document.getElementById('exportNote');
        newNoteButton = document.getElementById('newNote');
        fileList = document.getElementById('fileList');

        // 检查必要的 DOM 元素
        const requiredElements = {
            notepad, openButton, closeButton, markdownInput, preview,
            saveButton, titleInput, editButton, deleteButton,
            importButton, exportButton, newNoteButton, fileList
        };

        for (const [name, element] of Object.entries(requiredElements)) {
            if (!element) {
                throw new Error(`必要的 DOM 元素未找到: ${name}`);
            }
        }
    }

    // 用户状态管理
    const userState = {
        currentUser: null,
        
        getCurrentUser() {
            if (!this.currentUser) {
                const stored = localStorage.getItem(STORAGE_KEYS.USER);
                if (stored) {
                    try {
                        this.currentUser = JSON.parse(stored);
                        const isValid = users.some(u => u.username === this.currentUser.username);
                        if (!isValid) {
                            this.currentUser = null;
                            localStorage.removeItem(STORAGE_KEYS.USER);
                        }
                    } catch (error) {
                        console.error('解析用户数据失败:', error);
                        this.currentUser = null;
                        localStorage.removeItem(STORAGE_KEYS.USER);
                    }
                }
            }
            return this.currentUser;
        },

        async login(username, password) {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                this.currentUser = { username };
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
                this.updateLoginButton();
                return true;
            }
            return false;
        },

        logout() {
            this.currentUser = null;
            localStorage.removeItem(STORAGE_KEYS.USER);
            this.updateLoginButton();
            
            // 修改登出逻辑，不再重新初始化编辑器
            if (notepad) {
                // 清空当前笔记
                currentNoteId = null;
                titleInput.value = '';
                markdownInput.value = '';
                preview.innerHTML = '';
                
                // 加载匿名模式的笔记
                noteStorage = new NoteStorage('anonymous');
                noteStorage.loadNotes().then(notes => {
                    renderNoteList(notes);
                    if (notes.length > 0) {
                        loadNote(notes[0].id);
                    }
                });
            }
        },

        // 新增：更新登录按钮状态
        updateLoginButton() {
            const loginBtn = document.getElementById('loginBtn');
            if (!loginBtn) return;

            if (this.currentUser) {
                loginBtn.innerHTML = `
                    <span class="mdi mdi-account-check"></span>${this.currentUser.username}
                    <span class="mdi mdi-chevron-down"></span>
                `;
                loginBtn.onclick = (e) => {
                    e.stopPropagation();
                    // 移除可能存在的旧菜单
                    const oldMenu = document.querySelector('.login-menu');
                    if (oldMenu) oldMenu.remove();

                    const menu = document.createElement('div');
                    menu.className = 'login-menu';
                    menu.innerHTML = '<div class="login-menu-item logout"><span class="mdi mdi-logout"></span>登出</div>';
                    
                    // 修改菜单定位和样式
                    Object.assign(menu.style, {
                        position: 'fixed', // 改为 fixed 定位
                        backgroundColor: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                        zIndex: '10000',
                        padding: '4px 0',
                        minWidth: '100px', // 减小最小宽度
                        width: 'auto' // 自适应宽度
                    });

                    menu.querySelector('.logout').onclick = (e) => {
                        e.stopPropagation();
                        this.logout();
                        menu.remove();
                    };

                    // 点击其他地方关闭菜单
                    const closeMenu = (e) => {
                        if (!menu.contains(e.target) && !loginBtn.contains(e.target)) {
                            menu.remove();
                            document.removeEventListener('click', closeMenu);
                        }
                    };
                    document.addEventListener('click', closeMenu);

                    // 将菜单添加到 body
                    document.body.appendChild(menu);
                    
                    // 调整菜单位置
                    const btnRect = loginBtn.getBoundingClientRect();
                    menu.style.top = `${btnRect.bottom + 5}px`;
                    menu.style.left = `${btnRect.right - menu.offsetWidth}px`;
                };
            } else {
                loginBtn.innerHTML = '<span class="mdi mdi-account"></span>登录';
                loginBtn.onclick = () => {
                    const loginDialog = document.getElementById('loginDialog');
                    if (loginDialog) loginDialog.classList.add('show');
                };
            }
        }
    };

    // 修改悬浮按钮样式
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                background-color: var(--bg-color);
            }

            :root {
                --primary-color: #2563eb;
                --primary-hover: #1d4ed8;
                --bg-color: #f8fafc;
                --surface-color: #ffffff;
                --text-primary: #1e293b;
                --text-secondary: #64748b;
                --border-color: #e2e8f0;
                --hover-bg: #f1f5f9;
            }

            .floating-button {
                position: fixed;
                bottom: 150px;  /* 改为距底部150px */
                right: 0px;   
                transform: none;
                width: 70px;
                height: 70px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 9999;
                background: none;
                border: none;
                outline: none;
                filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
            }

            .floating-button span {
                font-size: 48px;
                color: white;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                animation: noteAnimation 3s ease-in-out infinite;
                transform-origin: center;
            }

            @keyframes noteAnimation {
                0% {
                    transform: translateY(0) rotate(0);
                    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
                }
                25% {
                    transform: translateY(-5px) rotate(-5deg);
                    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.4));
                }
                50% {
                    transform: translateY(0) rotate(0);
                    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
                }
                75% {
                    transform: translateY(-3px) rotate(3deg);
                    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.4));
                }
                100% {
                    transform: translateY(0) rotate(0);
                    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
                }
            }

            .notepad {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 95%;
                max-width: 1400px;
                height: 90vh;
                background: var(--surface-color);
                border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .notepad.show {
                opacity: 1;
            }

            .notepad-header {
                padding: 16px;
                background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .header-title {
                display: flex;
                align-items: center;
            }

            .header-title h2 {
                color: white;
                font-weight: 600;
                font-size: 1.5rem;
            }

            .author-links {
                display: inline-flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 4px 12px;
                border-radius: 20px;
                margin-left: 16px;
                -webkit-backdrop-filter: blur(4px);
                backdrop-filter: blur(4px);
                white-space: nowrap;
            }

            .author {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9rem;
                font-style: italic;
            }

            .author-links a {
                color: rgba(255, 255, 255, 0.9);
                text-decoration: none;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                border-radius: 4px;
            }

            .author-links .divider {
                color: rgba(255, 255, 255, 0.3);
                margin: 0 4px;
            }

            .header-buttons {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .action-button {
                background: rgba(255, 255, 255, 0.1);
                -webkit-backdrop-filter: blur(4px);
                backdrop-filter: blur(4px);
                border-radius: 8px;
                border: none;
                padding: 8px 16px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
            }

            .action-button:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }

            .close-button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: white;
                padding: 4px 8px;
            }

            .notepad-container {
                display: flex;
                height: calc(100% - 64px);
                overflow: hidden;
            }

            .file-list {
                width: 250px;
                min-width: 250px;
                flex-shrink: 0;
                border-right: 1px solid var(--border-color);
                background: var(--bg-color);
                display: flex;
                flex-direction: column;
                max-height: 100%;
                overflow: hidden;
                z-index: 2;
                transform: translate3d(0, 0, 0);
            }

            .file-list-header {
                padding: 16px;
                border-bottom: 1px solid var(--border-color);
                background: var(--surface-color);
                flex-shrink: 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 1;
            }

            .new-note-btn {
                background: var(--primary-color);
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s ease;
            }

            .new-note-btn:hover {
                background: var(--primary-hover);
                transform: translateY(-1px);
            }

            .file-list-content {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 8px;
                background: var(--bg-color);
                max-height: calc(100% - 60px);
                transform: translate3d(0, 0, 0);
            }

            .file-item {
                margin: 4px 0;
                padding: 10px 12px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                background: var(--surface-color);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                transform: translate3d(0, 0, 0);
                transition: transform 0.2s ease, background-color 0.2s ease;
            }

            .file-info {
                flex: 1;
                min-width: 0;
            }

            .file-title {
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: var(--text-primary);
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
            }

            .file-date {
                font-size: 12px;
                color: var(--text-secondary);
                margin-top: 2px;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
            }

            .file-item:hover {
                background: var(--hover-bg);
                transform: translate3d(2px, 0, 0);
            }

            .file-item.active {
                background: var(--primary-color);
                transform: translate3d(0, 0, 0);
            }

            .file-item span.mdi {
                font-size: 18px;
                color: #666;
            }

            .file-item.active span.mdi {
                color: white;
            }

            .editor-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-width: 0;
                overflow: hidden;
                background: var(--surface-color);
                transform: translate3d(0, 0, 0);
            }

            .editor-header {
                padding: 16px;
                border-bottom: 1px solid #eee;
            }

            .title-input {
                width: 100%;
                padding: 8px;
                font-size: 1.25rem;
                border: none;
                border-bottom: 2px solid transparent;
                transition: all 0.2s ease;
                color: var(--text-primary);
            }

            .title-input:focus {
                border-bottom-color: var(--primary-color);
            }

            .editor-toolbar {
                display: flex;
                gap: 8px;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }

            .toolbar-btn {
                background: none;
                border: none;
                padding: 8px;
                border-radius: 6px;
                cursor: pointer;
                color: #666;
                transition: all 0.2s ease;
            }

            .toolbar-btn:hover {
                background: var(--hover-bg);
                transform: translateY(-1px);
            }

            .toolbar-btn span {
                font-size: 18px;
            }

            .editor-section {
                flex: 1;
                overflow-y: auto;
                min-height: 0;
                display: flex;
                flex-direction: column;
            }

            #markdown-input {
                width: 100%;
                height: 100%;
                border: none;
                resize: none;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
                line-height: 1.6;
                padding: 20px;
            }

            #markdown-input:focus {
                outline: none;
            }

            .preview-section {
                flex: 1;
                overflow-y: auto;
                min-height: 0;
                padding: 20px;
                background: var(--bg-color);
                border-radius: 8px;
                margin: 16px;
                box-shadow: none;
                transform: translate3d(0, 0, 0);
            }

            #preview {
                padding: 10px;
                max-width: 100%;
                overflow-wrap: break-word;
                transform: translate3d(0, 0, 0);
            }

            /* 代码块样式 */
            .code-block {
                position: relative;
                margin: 16px 0;
                background-color: #282c34 !important;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding-top: 32px;
                width: 100%;
            }

            .code-block pre {
                margin: 0 !important;
                padding: 16px !important;
                padding-right: 48px !important;
                background-color: transparent !important;
                overflow: auto !important;
                max-height: 300px;
                width: auto !important;
                min-width: 100% !important;
                display: block !important;
                white-space: pre !important;
            }

            .code-block code {
                background-color: transparent !important;
                padding: 0 !important;
                font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Menlo', monospace !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                tab-size: 4;
                color: #abb2bf !important;
                white-space: pre !important;
                display: inline-block !important;
                min-width: fit-content !important;
            }

            /* 滚动条样式 */
            .code-block pre::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }

            .code-block pre::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 3px;
            }

            .code-block pre::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
            }

            .code-block pre::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .code-block pre::-webkit-scrollbar-corner {
                background: transparent;
            }

            .code-block .hljs {
                background: transparent !important;
                padding: 0 !important;
                color: #abb2bf !important;
                -webkit-backdrop-filter: none !important;
                backdrop-filter: none !important;
                text-rendering: optimizeLegibility !important;
                letter-spacing: 0 !important;
                transform: none !important;
                z-index: 6;
            }

            /* 展开/折叠按钮 */
            .code-block .expand-button {
                position: absolute;
                top: 8px;
                right: 88px;  /* 移到复制按钮左边 */
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                color: #abb2bf;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                opacity: 0;
                transition: all 0.2s ease;
                z-index: 2;
            }

            .code-block:hover .expand-button {
                opacity: 1;
            }

            .code-block .expand-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* 复制按钮 */
            .code-block .copy-button {
                position: absolute;
                top: 8px;
                right: 8px;
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                color: #abb2bf;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                opacity: 0;
                transition: all 0.2s ease;
                z-index: 2;
            }

            .code-block:hover .copy-button {
                opacity: 1;
            }

            .copy-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* 滚动条样式 */
            .code-block pre::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }

            .code-block pre::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 4px;
            }

            .code-block pre::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }

            .code-block pre::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .code-block pre::-webkit-scrollbar-corner {
                background: transparent;
            }

            .code-language {
                position: absolute;
                top: 8px;
                left: 8px;
                padding: 4px 8px;
                font-size: 12px;
                color: #abb2bf;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 2;
                user-select: none;
            }

            .code-language:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .code-block .hljs {
                background: transparent !important;
                padding: 0 !important;
                color: #abb2bf !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }

            /* 语言选择下拉菜单 */
            .language-dropdown {
                position: fixed;
                background: #282c34;
                border: 1px solid #4b5263;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                min-width: 120px;
                max-height: 300px;
                overflow-y: auto;
                z-index: 10000;
            }

            .language-item {
                padding: 8px 12px;
                color: #abb2bf;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                font-size: 12px;
                user-select: none;
            }

            .language-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .language-item.active {
                background: rgba(97, 175, 239, 0.2);
                color: #61afef;
            }

            /* 确保下拉菜单在滚动时保持可见 */
            .code-block {
                position: relative;
            }

            .code-language {
                position: absolute;
                top: 8px;
                left: 8px;
                z-index: 2;
            }

            /* 代码对话框 */
            .code-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .code-dialog-content {
                background: white;
                padding: 24px;
                border-radius: 8px;
                width: 90%;
                max-width: 600px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .code-dialog h3 {
                margin: 0 0 16px 0;
                color: #2c3e50;
            }

            .code-dialog select {
                width: 100%;
                padding: 8px;
                margin-bottom: 16px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }

            .code-dialog textarea {
                width: 100%;
                height: 200px;
                padding: 12px;
                margin-bottom: 16px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
                resize: vertical;
            }

            .dialog-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            .dialog-buttons button {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
            }

            .dialog-buttons .cancel-btn {
                background: #f8f9fa;
                border: 1px solid #ddd;
            }

            .dialog-buttons .confirm-btn {
                background: #1a73e8;
                color: white;
            }

            /* 删除对话框 */
            .delete-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .delete-dialog.show {
                display: flex;
            }

            .delete-dialog-content {
                background: white;
                padding: 24px;
                border-radius: 8px;
                max-width: 400px;
                width: 90%;
            }

            .delete-dialog-buttons {
                display: flex;
                gap: 12px;
                margin-top: 20px;
                justify-content: flex-end;
            }

            .delete-dialog-buttons button {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
            }

            .delete-dialog-buttons .confirm-delete {
                background-color: #dc3545;
                color: white;
            }

            .delete-dialog-buttons .cancel-delete {
                background-color: #f8f9fa;
                border: 1px solid #ddd;
            }

            /* 通知提示 */
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 24px;
                border-radius: 4px;
                background: #10b981;
                color: white;
                font-size: 14px;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                z-index: 10000;
            }

            .notification.show {
                opacity: 1;
                transform: translateY(0);
            }

            .notification.error {
                background: #ef4444;
            }

            /* 编辑模式样式 */
            .editor-container.edit-mode .editor-toolbar {
                display: flex;
            }

            .editor-container:not(.edit-mode) .editor-toolbar {
                display: none;
            }

            .editor-container:not(.edit-mode) #saveNote {
                display: none;
            }

            .editor-container:not(.edit-mode) .editor-section {
                display: none;
            }

            .editor-container:not(.edit-mode) .preview-section {
                height: calc(100% - 60px);
                border-top: none;
            }

            .title-input[readonly],
            #markdown-input[readonly] {
                background-color: transparent;
                cursor: default;
            }

            .title-input[readonly] {
                border-color: transparent;
            }

            #deleteNote {
                background: rgba(250, 60, 60, 0.9) !important;
                color: white !important;
            }

            #deleteNote:hover {
                background: rgba(240, 80, 80, 0.95) !important;
            }

            #deleteNote span {
                color: white !important;
            }

            /* 美化滚动条 */
            .file-list-content::-webkit-scrollbar {
                width: 6px;
            }

            .file-list-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .file-list-content::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 3px;
            }

            .file-list-content::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 0, 0, 0.2);
            }

            /* 优化文件列表布局 */
            .file-info {
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }

            .file-title {
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .file-date {
                font-size: 12px;
                color: var(--text-secondary);
                margin-top: 2px;
            }

            .file-item.active .file-date {
                color: rgba(255, 255, 255, 0.8);
            }

            /* 美化代码块滚动条 */
            .code-block pre::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }

            .code-block pre::-webkit-scrollbar-track {
                background: transparent;
            }

            .code-block pre::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
            }

            .code-block pre::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            /* 文件列表滚动条 */
            .file-list-content::-webkit-scrollbar {
                width: 6px;
            }

            .file-list-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .file-list-content::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 3px;
            }

            .file-list-content::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 0, 0, 0.2);
            }

            /* 修复字体渲染 */
            .notepad * {
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
                text-rendering: optimizeLegibility !important;
            }

            /* 修复列表标题样式 */
            .file-list-header h3 {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            /* 代码块样式优化 */
            .code-block {
                position: relative;
                margin: 16px 0;
                background-color: #282c34 !important;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding-top: 32px;
                width: 100%;
            }

            .code-block pre {
                margin: 0 !important;
                padding: 16px !important;
                padding-right: 48px !important;
                background-color: transparent !important;
                overflow: auto !important;
                max-height: 300px;
                width: auto !important;
                min-width: 100% !important;
                display: block !important;
                white-space: pre !important;
            }

            .code-block code {
                background-color: transparent !important;
                padding: 0 !important;
                font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Menlo', monospace !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                tab-size: 4;
                color: #abb2bf !important;
                white-space: pre !important;
                display: inline-block !important;
                min-width: fit-content !important;
            }

            .code-block .hljs {
                background: transparent !important;
                padding: 0 !important;
                color: #abb2bf !important;
                -webkit-backdrop-filter: none !important;
                backdrop-filter: none !important;
                text-rendering: optimizeLegibility !important;
                letter-spacing: 0 !important;
            }

            /* 代码块按钮样式 */
            .code-block .expand-button,
            .code-block .copy-button,
            .code-block .code-language {
                position: absolute;
                top: 8px;
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                color: #ffffff !important;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s ease;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            .code-block .code-language {
                left: 8px;
                z-index: 2;
            }

            .code-block .expand-button {
                right: 88px;
                opacity: 0;
            }

            .code-block .copy-button {
                right: 8px;
                opacity: 0;
            }

            .code-block:hover .expand-button,
            .code-block:hover .copy-button {
                opacity: 1;
            }

            .code-block .expand-button:hover,
            .code-block .copy-button:hover,
            .code-block .code-language:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* 文件列表样式优化 */
            .file-list-header h3 {
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            .file-item {
                margin: 4px 0;
                padding: 10px 12px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                background: var(--surface-color);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                transform: translate3d(0, 0, 0);
                transition: transform 0.2s ease, background-color 0.2s ease;
                will-change: transform, background-color;
            }

            .file-item.active {
                background: var(--primary-color);
                transform: translate3d(0, 0, 0);
            }

            .file-item.active .file-title,
            .file-item.active .file-date,
            .file-item.active .mdi {
                color: white !important;
            }

            /* 代码块样式优化 */
            .code-block {
                position: relative;
                margin: 16px 0;
                background-color: #282c34 !important;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding-top: 32px;
                width: 100%;
            }

            .code-block pre {
                margin: 0 !important;
                padding: 16px !important;
                padding-right: 48px !important;
                background-color: transparent !important;
                overflow: auto !important;
                max-height: 300px;
                width: auto !important;
                min-width: 100% !important;
                display: block !important;
                white-space: pre !important;
            }

            .code-block code {
                background-color: transparent !important;
                padding: 0 !important;
                font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Menlo', monospace !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                tab-size: 4;
                color: #abb2bf !important;
                white-space: pre !important;
                display: inline-block !important;
                min-width: fit-content !important;
            }

            /* 删除按钮样式 */
            #deleteNote {
                background: rgba(250, 60, 60, 0.9) !important;
                color: white !important;
            }

            #deleteNote:hover {
                background: rgba(240, 80, 80, 0.95) !important;
            }

            #deleteNote span {
                color: white !important;
            }

            /* 确保所有文本渲染清晰 */
            * {
                text-rendering: optimizeLegibility;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            /* 移除所有可能导致模糊的属性 */
            .preview-section,
            #preview,
            .file-list,
            .file-list-content,
            .editor-container,
            .code-block,
            .code-block pre,
            .code-block code {
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                filter: none !important;
            }

            /* 修复单行代码样式 */
            .inline-code {
                background-color: #282c34 !important;
                color: #e06c75 !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Menlo', monospace !important;
                font-size: 0.9em !important;
                white-space: pre-wrap !important;
                display: inline !important;
            }

            .inline-code-wrapper {
                position: relative !important;
                display: inline-flex !important;  /* 改为inline-flex */
                align-items: center !important;
                margin: 0 2px !important;
                padding-right: 24px !important;
            }

            .inline-copy-button {
                position: absolute !important;
                right: 2px !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                width: 20px !important;
                height: 20px !important;
                min-width: 20px !important;  /* 添加最小宽度 */
                padding: 2px !important;
                border: none !important;
                background: rgba(255, 255, 255, 0.9) !important;
                border-radius: 3px !important;
                cursor: pointer !important;
                opacity: 0;
                transition: opacity 0.2s ease !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 14px !important;
                color: #666 !important;
                z-index: 2 !important;
                pointer-events: auto !important;  /* 确保按钮可点击 */
            }

            .inline-code-wrapper:hover .inline-copy-button {
                opacity: 1 !important;
            }

            .inline-copy-button:hover {
                background: rgba(255, 255, 255, 1) !important;
            }

            /* 重新设计行内代码样式 */
            .inline-code-container {
                position: relative;
                display: inline-block;
                margin: 0 2px;
            }

            .inline-code {
                background-color: #282c34;
                color: #e06c75;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                font-size: 0.9em;
                white-space: pre-wrap;
            }

            .inline-copy-btn {
                position: absolute;
                right: -22px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 3px;
                cursor: pointer;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: #666;
                z-index: 100;
                padding: 0;
            }

            .inline-code-container:hover .inline-copy-btn {
                display: flex;
            }

            .inline-copy-btn:hover {
                background: #f5f5f5;
            }

            .inline-copy-btn.success {
                color: #10b981;
            }

            .inline-copy-btn.error {
                color: #ef4444;
            }

            /* 登录对话框样式 */
            .login-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .login-dialog.show {
                display: flex;
            }

            .login-dialog-content {
                background: white;
                padding: 24px;
                border-radius: 8px;
                width: 300px;
            }

            .login-form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .login-form input {
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            .login-buttons {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .login-buttons button {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
            }

            .login-buttons button:first-child {
                background: var(--primary-color);
                color: white;
            }

            .login-buttons button:last-child {
                background: #f8f9fa;
                border: 1px solid #ddd;
            }

            /* 登录菜单样式 */
            .login-menu {
                padding: 8px 0;
                min-width: 120px;
            }

            .login-menu-item {
                padding: 8px 16px;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .login-menu-item:hover {
                background-color: #f5f5f5;
            }

            .login-menu-item.logout {
                color: #dc2626;
            }

            #loginBtn {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    // 注入HTML结构
    function injectHTML() {
        const container = document.createElement('div');
        container.innerHTML = `
            <div class="floating-button" id="openNotepad">
                <span class="mdi mdi-notebook-edit"></span>
            </div>

            <div class="notepad" id="notepad">
                <div class="notepad-header">
                    <div class="header-title">
                        <h2>Sun-Panel-Helper随手记</h2>
                        <div class="author-links">
                            <span class="author">by 
                                <a href="https://github.com/madrays" target="_blank">Madrays</a>
                            </span>
                            <span class="divider">|</span>
                            <a href="https://cocohe.cn" target="_blank" class="blog-link">
                                <span class="mdi mdi-web"></span>Blog
                            </a>
                        </div>
                    </div>
                    <div class="header-buttons">
                        <button class="action-button" id="loginBtn">
                            <span class="mdi mdi-account"></span>登录
                        </button>
                        <button class="action-button" id="editNote">
                            <span class="mdi mdi-pencil"></span>编辑
                        </button>
                        <button class="action-button" id="deleteNote">
                            <span class="mdi mdi-delete"></span>删除
                        </button>
                        <button class="action-button" id="importNote">
                            <span class="mdi mdi-file-import"></span>导入
                        </button>
                        <button class="action-button" id="exportNote">
                            <span class="mdi mdi-file-export"></span>导出
                        </button>
                        <button class="action-button" id="saveNote">
                            <span class="mdi mdi-content-save"></span>保存
                        </button>
                        <button class="close-button" id="closeNotepad">×</button>
                    </div>
                </div>
                <div class="notepad-container">
                    <div class="file-list">
                        <div class="file-list-header">
                            <h3>随手记列表</h3>
                            <button class="new-note-btn" id="newNote">
                                <span class="mdi mdi-plus"></span>新建
                            </button>
                        </div>
                        <div class="file-list-content" id="fileList">
                            <!-- 文件列表将通过 JavaScript 动态添加 -->
                        </div>
                    </div>
                    <div class="editor-container">
                        <div class="editor-header">
                            <input type="text" id="noteTitle" placeholder="输入标题..." class="title-input" readonly>
                            <div class="editor-toolbar">
                                <button class="toolbar-btn" data-format="**" title="粗体">
                                    <span class="mdi mdi-format-bold"></span>
                                </button>
                                <button class="toolbar-btn" data-format="*" title="斜体">
                                    <span class="mdi mdi-format-italic"></span>
                                </button>
                                <button class="toolbar-btn" id="inlineCodeBtn" title="行内代码">
                                    <span class="mdi mdi-code-tags"></span>
                                </button>
                                <button class="toolbar-btn" id="codeBlockBtn" title="代码块">
                                    <span class="mdi mdi-code-braces"></span>
                                </button>
                                <button class="toolbar-btn" data-format="# " title="标题">
                                    <span class="mdi mdi-format-header-1"></span>
                                </button>
                                <button class="toolbar-btn" data-format="- " title="列表">
                                    <span class="mdi mdi-format-list-bulleted"></span>
                                </button>
                                <button class="toolbar-btn" data-format="1. " title="数字列表">
                                    <span class="mdi mdi-format-list-numbered"></span>
                                </button>
                            </div>
                        </div>
                        <div class="editor-section">
                            <textarea id="markdown-input" placeholder="在这里输入 Markdown 文本..." readonly></textarea>
                        </div>
                        <div class="preview-section">
                            <div id="preview"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="code-dialog" id="codeDialog" style="display: none;">
                <div class="code-dialog-content">
                    <h3>插入代码</h3>
                    <label for="languageSelect">选择代码语言：</label>
                    <select id="languageSelect">
                        <option value="javascript">JavaScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="bash">Bash</option>
                        <option value="yaml">YAML</option>
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                        <option value="sql">SQL</option>
                    </select>
                    <textarea id="codeInput" placeholder="在这里输入代码..."></textarea>
                    <div class="dialog-buttons">
                        <button class="cancel-btn">取消</button>
                        <button class="confirm-btn">插入</button>
                    </div>
                </div>
            </div>
            
            <!-- 登录对话框 -->
            <div class="login-dialog" id="loginDialog">
                <div class="login-dialog-content">
                    <h3>用户登录</h3>
                    <div class="login-form">
                        <input type="text" id="username" placeholder="用户名" />
                        <input type="password" id="password" placeholder="密码" />
                        <div class="login-buttons">
                            <button id="loginButton">登录</button>
                            <button id="cancelLogin">取消</button>
                        </div>
                    </div>
                </div>
            </div>`;
            
        document.body.appendChild(container);
    }

    // 事件处理函数定义
    function handleOpenClick(e) {
        e.stopPropagation();
        notepad.style.display = 'block';
        setTimeout(() => notepad.classList.add('show'), 0);
        
        if (currentNoteId && noteStorage.notes.find(n => n.id === currentNoteId)) {
            loadNote(currentNoteId);
        } else if (noteStorage.notes.length > 0) {
            loadNote(noteStorage.notes[0].id);
        } else {
            createNewNote();
        }
    }

    function handleCloseClick() {
        notepad.classList.remove('show');
        setTimeout(() => {
            notepad.style.display = 'none';
        }, 300);
    }

    function handleMarkdownInput() {
        console.log('编辑器内容变化');
        if (markdownInputTimeout) {
            clearTimeout(markdownInputTimeout);
        }
        markdownInputTimeout = setTimeout(() => {
            console.log('触发保存...');
            updatePreview();
            saveNote();
        }, 1000);
    }

    function handleTitleInput() {
        console.log('标题变化');
        if (titleInputTimeout) {
            clearTimeout(titleInputTimeout);
        }
        titleInputTimeout = setTimeout(() => {
            console.log('触发保存...');
            saveNote();
        }, 1000);
    }

    function handleSaveClick() {
        saveNote();
        toggleEditMode(false);
    }

    function handleEditClick() {
        toggleEditMode(!isEditMode);
    }

    function handleDeleteClick() {
        showDeleteDialog();
    }

    function handleNewNoteClick() {
        createNewNote();
    }

    function handleImportClick() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md';
        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    const content = await file.text();
                    createNewNote();
                    markdownInput.value = content;
                    titleInput.value = file.name.replace('.md', '');
                    updatePreview();
                    saveNote();
                    showNotification('导入成功');
                } catch (err) {
                    console.error('导入失败:', err);
                    showNotification('导入失败', 'error');
                }
            }
        };
        input.click();
    }

    function handleExportClick() {
        if (!currentNoteId) {
            showNotification('没有可导出的笔记', 'error');
            return;
        }

        const title = titleInput.value || '未命名笔记';
        const content = markdownInput.value;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('导出成功');
    }

    // 防抖定时器
    let markdownInputTimeout = null;
    let titleInputTimeout = null;

    // 修改事件监听器绑定函数
    function bindEventListeners() {
        // 移除日志
        // console.log('绑定事件监听器...');
        
        // 确保所有元素都存在
        if (!notepad || !openButton || !closeButton || !markdownInput || !preview || 
            !saveButton || !titleInput || !editButton || !deleteButton || 
            !importButton || !exportButton || !newNoteButton || !fileList) {
            throw new Error('必要的 DOM 元素未找到，无法绑定事件');
        }
        
        // 移除旧的事件监听器
        const elements = [openButton, closeButton, markdownInput, titleInput, 
                        saveButton, editButton, deleteButton, newNoteButton,
                        importButton, exportButton];
        
        elements.forEach(element => {
            if (element && element.parentNode) {
                const clone = element.cloneNode(true);
                element.parentNode.replaceChild(clone, element);
            }
        });

        // 重新获取元素引用
        initializeDOMElements();

        // 绑定新的事件监听器
        openButton.addEventListener('click', handleOpenClick);
        closeButton.addEventListener('click', handleCloseClick);
        markdownInput.addEventListener('input', handleMarkdownInput);
        titleInput.addEventListener('input', handleTitleInput);
        saveButton.addEventListener('click', handleSaveClick);
        editButton.addEventListener('click', handleEditClick);
        deleteButton.addEventListener('click', handleDeleteClick);
        newNoteButton.addEventListener('click', handleNewNoteClick);
        importButton.addEventListener('click', handleImportClick);
        exportButton.addEventListener('click', handleExportClick);

        // 点击外部关闭记事本
        window.addEventListener('click', handleOutsideClick);

        // 阻止记事本内部点击事件冒泡
        notepad.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        console.log('事件监听器绑定完成');
    }

    // 修改初始化顺序
    async function initializeEditor() {
        try {
            // 检查必要的全局对象
            if (!window.markdownit || !window.hljs) {
                throw new Error('必要的依赖未加载');
            }

            // 初始化 markdown-it
            initializeMarkdownIt();
            
            // 注入 HTML
            injectHTML();

            // 等待一小段时间确保 DOM 完全加载
            await new Promise(resolve => setTimeout(resolve, 100));

            // 初始化 DOM 元素
            initializeDOMElements();

            // 获取当前用户
            const user = userState.getCurrentUser();
            const username = user ? user.username : 'anonymous';
            console.log('当前用户:', username);

            // 初始化笔记存储
            noteStorage = new NoteStorage(username);

            // 绑定事件监听器
            bindEventListeners();

            // 初始化用户和加载笔记
            await noteStorage.initUser();
            const notes = await noteStorage.loadNotes();

            renderNoteList(notes);

            if (notes.length > 0) {
                loadNote(notes[0].id);
            }

            // 初始化登录相关元素
            initializeLoginElements();

            // 初始化工具栏
            initializeToolbar();
            
            // 初始化代码对话框
            initializeCodeDialog();
        } catch (error) {
            throw error;
        }
    }

    // 初始化登录相关元素
    function initializeLoginElements() {
        const loginDialog = document.getElementById('loginDialog');
        const loginBtn = document.getElementById('loginBtn');
        const loginButton = document.getElementById('loginButton');
        const cancelLogin = document.getElementById('cancelLogin');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (!loginDialog || !loginBtn || !loginButton || !cancelLogin || 
            !usernameInput || !passwordInput) {
            console.warn('登录相关元素未找到，跳过登录功能初始化');
            return;
        }

        // 初始化登录按钮状态
        userState.updateLoginButton();

        loginButton.addEventListener('click', async () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            if (await userState.login(username, password)) {
                loginDialog.classList.remove('show');
                // 清空输入框
                usernameInput.value = '';
                passwordInput.value = '';
                
                // 创建新的笔记存储实例
                noteStorage = new NoteStorage(username);
                await noteStorage.loadNotes();
                renderNoteList(noteStorage.notes);
                if (noteStorage.notes.length > 0) {
                    loadNote(noteStorage.notes[0].id);
                }
                
                showNotification('登录成功');
            } else {
                alert('用户名或密码错误');
            }
        });

        cancelLogin.addEventListener('click', () => {
            loginDialog.classList.remove('show');
            // 清空输入框
            usernameInput.value = '';
            passwordInput.value = '';
        });
    }

    // 启动编辑器
    console.log('开始加载编辑器...');
    loadDependencies()
        .then(() => {
            console.log('依赖加载完成，注入样式...');
            injectStyles();
            return new Promise(resolve => setTimeout(resolve, 100)); // 等待样式加载
        })
        .then(() => {
            console.log('初始化编辑器...');
            return initializeEditor().catch(err => {
                console.error('编辑器初始化失败:', err);
                // 尝试使用本地存储模式
                return initializeEditor('anonymous');
            });
        })
        .catch(err => {
            console.error('编辑器启动失败:', err);
        });

    // 渲染文件列表
    function renderNoteList(notes) {
        fileList.innerHTML = '';
        notes.forEach(note => {
            const fileItem = document.createElement('div');
            fileItem.className = `file-item ${note.id === currentNoteId ? 'active' : ''}`;
            
            const date = new Date(note.updated || note.created);
            const formattedDate = date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            fileItem.innerHTML = `
                <span class="mdi mdi-file-document-outline"></span>
                <div class="file-info">
                    <div class="file-title">${note.title || '未命名笔记'}</div>
                    <div class="file-date">${formattedDate}</div>
                </div>
            `;
            fileItem.addEventListener('click', () => loadNote(note.id));
            fileList.appendChild(fileItem);
        });
    }

    // 加载笔记
    function loadNote(id) {
        const notes = noteStorage.notes;
        const note = notes.find(n => n.id === id);
        if (note) {
            currentNoteId = id;
            titleInput.value = note.title || '';
            markdownInput.value = note.content || '';
            preview.innerHTML = '';
            
            requestAnimationFrame(() => {
                updatePreview();
            });
            
            renderNoteList(notes);
            toggleEditMode(false);
        }
    }

    // 创建新笔记
    function createNewNote() {
        const newNote = {
            id: Date.now().toString(),
            title: '',
            content: '',
            created: new Date().toISOString()
        };
        noteStorage.notes.unshift(newNote);
        saveNotes();
        loadNote(newNote.id);
        toggleEditMode(true);
    }

    // 保存笔记
    async function saveNote() {
        if (!currentNoteId) {
            createNewNote();
            return;
        }

        try {
            const noteIndex = noteStorage.notes.findIndex(n => n.id === currentNoteId);
            if (noteIndex !== -1) {
                noteStorage.notes[noteIndex] = {
                    ...noteStorage.notes[noteIndex],
                    title: titleInput.value,
                    content: markdownInput.value,
                    updated: new Date().toISOString()
                };

                try {
                    await noteStorage.saveNotes(noteStorage.notes);
                } catch (error) {
                    localStorage.setItem(`notes-${noteStorage.username}`, JSON.stringify(noteStorage.notes));
                }

                renderNoteList(noteStorage.notes);
                showNotification('保存成功');
            }
        } catch (error) {
            showNotification('保存失败', 'error');
        }
    }

    // 保存所有笔记到本地存储
    function saveNotes() {
        try {
            localStorage.setItem(`notes-${noteStorage.username}`, JSON.stringify(noteStorage.notes));
        } catch (error) {
            console.error('本地保存失败:', error);
            showNotification('本地保存失败', 'error');
        }
    }

    // 显示通知
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 显示删除对话框
    function showDeleteDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'delete-dialog';
        dialog.innerHTML = `
            <div class="delete-dialog-content">
                <h3>确认删除</h3>
                <p>确定要删除这个笔记吗？此操作不可撤销。</p>
                <div class="delete-dialog-buttons">
                    <button class="cancel-delete">取消</button>
                    <button class="confirm-delete">删除</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        
        setTimeout(() => dialog.classList.add('show'), 0);
        
        dialog.querySelector('.cancel-delete').onclick = () => {
            dialog.remove();
        };
        
        dialog.querySelector('.confirm-delete').onclick = () => {
            deleteCurrentNote();
            dialog.remove();
        };
    }

    // 删除当前笔记
    async function deleteCurrentNote() {
        if (!currentNoteId) return;
        
        try {
            // 从本地数组中删除
            const index = noteStorage.notes.findIndex(n => n.id === currentNoteId);
            if (index !== -1) {
                noteStorage.notes.splice(index, 1);
                
                // 同步到服务器
                try {
                    await noteStorage.saveNotes(noteStorage.notes);
                    console.log('笔记已从服务器删除');
                } catch (error) {
                    console.error('服务器删除失败:', error);
                    // 继续执行本地删除
                }
                
                // 更新UI
                if (noteStorage.notes.length > 0) {
                    loadNote(noteStorage.notes[0].id);
                } else {
                    currentNoteId = null;
                    titleInput.value = '';
                    markdownInput.value = '';
                    updatePreview();
                }
                renderNoteList(noteStorage.notes);
                showNotification('删除成功');
            }
        } catch (error) {
            console.error('删除笔记失败:', error);
            showNotification('删除失败', 'error');
        }
    }

    // 处理代码块
    function handleCodeBlocks() {
        document.querySelectorAll('#preview pre code').forEach(code => {
            const pre = code.parentElement;
            if (pre.parentElement.classList.contains('code-block')) return;

            // 创建代码块包装器
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            // 添加展开/折叠按钮
            const expandButton = document.createElement('button');
            expandButton.className = 'expand-button';
            expandButton.innerHTML = '<span class="mdi mdi-arrow-expand"></span>展开';
            
            expandButton.addEventListener('click', () => {
                const isExpanded = pre.style.maxHeight !== 'none';
                pre.style.maxHeight = isExpanded ? 'none' : '300px';
                expandButton.innerHTML = isExpanded ? 
                    '<span class="mdi mdi-arrow-collapse"></span>折叠' : 
                    '<span class="mdi mdi-arrow-expand"></span>展开';
            });
            
            wrapper.appendChild(expandButton);

            let language = '';
            code.classList.forEach(cls => {
                if (cls.startsWith('language-')) {
                    language = cls.replace('language-', '');
                }
            });

            const langLabel = document.createElement('div');
            langLabel.className = 'code-language';
            langLabel.textContent = language || 'text';
            wrapper.insertBefore(langLabel, pre);

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '<span class="mdi mdi-content-copy"></span>复制';
            
            copyButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(code.textContent);
                    copyButton.innerHTML = '<span class="mdi mdi-check"></span>已复制';
                    setTimeout(() => {
                        copyButton.innerHTML = '<span class="mdi mdi-content-copy"></span>复制';
                    }, 2000);
                } catch (err) {
                    console.error('复制失败:', err);
                    copyButton.innerHTML = '<span class="mdi mdi-alert"></span>复制失败';
                    setTimeout(() => {
                        copyButton.innerHTML = '<span class="mdi mdi-content-copy"></span>复制';
                    }, 2000);
                }
            });

            wrapper.appendChild(copyButton);
        });
    }

    // 代码处理函数
    function handleInlineCode() {
        document.querySelectorAll('#preview code:not(pre code)').forEach(code => {
            // 如果代码已经被处理过，跳过
            if (code.parentNode.classList.contains('inline-code-container')) {
                return;
            }

            // 创建容器
            const container = document.createElement('span');
            container.className = 'inline-code-container';
            
            // 包装代码元素
            code.parentNode.insertBefore(container, code);
            container.appendChild(code);

            // 创建复制按钮
            const copyBtn = document.createElement('button');
            copyBtn.className = 'inline-copy-btn mdi mdi-content-copy';
            copyBtn.type = 'button';
            copyBtn.title = '复制代码';
            
            // 绑定点击事件
            copyBtn.addEventListener('mousedown', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const text = code.textContent.trim();
                    await navigator.clipboard.writeText(text);
                    
                    copyBtn.className = 'inline-copy-btn mdi mdi-check';
                    copyBtn.style.color = '#10b981';
                    
                    setTimeout(() => {
                        copyBtn.className = 'inline-copy-btn mdi mdi-content-copy';
                        copyBtn.style.color = '';
                    }, 2000);
                } catch (err) {
                    console.error('复制失败:', err);
                    copyBtn.className = 'inline-copy-btn mdi mdi-alert';
                    copyBtn.style.color = '#ef4444';
                    
                    setTimeout(() => {
                        copyBtn.className = 'inline-copy-btn mdi mdi-content-copy';
                        copyBtn.style.color = '';
                    }, 2000);
                }
            });

            // 添加按钮到容器
            container.appendChild(copyBtn);
        });
    }

    // 处理点击外部事件
    function handleOutsideClick(e) {
        const shouldKeepOpen = 
            e.target.closest('.notepad') || 
            e.target.closest('.floating-button') ||
            e.target.closest('.action-button') || 
            e.target.closest('.code-dialog') || 
            e.target.closest('.delete-dialog') || 
            e.target.closest('input[type="file"]') || 
            e.target.closest('a[download]');

        if (!shouldKeepOpen && notepad.classList.contains('show')) {
            notepad.classList.remove('show');
            setTimeout(() => {
                notepad.style.display = 'none';
            }, 300);
        }
    }

    // 修改代码块处理函数
    function processCodeBlocks() {
        // 先应用高亮
        document.querySelectorAll('#preview pre code').forEach(block => {
            if (!block.classList.contains('hljs')) {
                hljs.highlightElement(block);
            }
        });

        // 处理代码块UI
        handleCodeBlocks();
        handleInlineCode();
    }

    // 修改工具栏事件绑定
    function initializeToolbar() {
        // 工具栏按钮
        document.querySelectorAll('.toolbar-btn[data-format]').forEach(button => {
            button.addEventListener('click', () => {
                if (!isEditMode) return;
                const format = button.dataset.format;
                const start = markdownInput.selectionStart;
                const end = markdownInput.selectionEnd;
                const text = markdownInput.value;
                let newText, newStart, newEnd;

                if (start === end) {
                    // 没有选中文本时的处理
                    if (format === '# ' || format === '- ' || format === '1. ') {
                        // 对于标题和列表，确保在行首
                        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
                        if (format === '1. ') {
                            const beforeText = text.slice(0, lineStart);
                            const matches = beforeText.match(/^\d+\. /gm);
                            const num = matches ? matches.length + 1 : 1;
                            newText = text.slice(0, lineStart) + `${num}. ` + text.slice(start);
                            newStart = lineStart + `${num}. `.length;
                        } else {
                            newText = text.slice(0, lineStart) + format + text.slice(start);
                            newStart = lineStart + format.length;
                        }
                        newEnd = newStart;
                    } else {
                        // 其他格式（加粗、斜体等）
                        const defaultText = {
                            '**': '粗体文本',
                            '*': '斜体文本',
                            '`': '代码'
                        }[format] || '';
                        newText = text.slice(0, start) + format + defaultText + format + text.slice(end);
                        newStart = start + format.length;
                        newEnd = newStart + defaultText.length;
                    }
                } else {
                    // 有选中文本时的处理
                    const selectedText = text.slice(start, end);
                    if (format === '# ' || format === '- ' || format === '1. ') {
                        // 对于标题和列表，处理多行
                        const lines = selectedText.split('\n');
                        const formattedLines = lines.map((line, index) => {
                            if (format === '1. ') {
                                return `${index + 1}. ${line.trim()}`;
                            }
                            return format + line.trim();
                        });
                        newText = text.slice(0, start) + formattedLines.join('\n') + text.slice(end);
                        newStart = start;
                        newEnd = start + formattedLines.join('\n').length;
                    } else {
                        // 其他格式（加粗、斜体等）
                        newText = text.slice(0, start) + format + selectedText + format + text.slice(end);
                        newStart = start + format.length;
                        newEnd = end + format.length;
                    }
                }

                markdownInput.value = newText;
                markdownInput.setSelectionRange(newStart, newEnd);
                markdownInput.focus();
                updatePreview();
                saveNote();
            });
        });

        // 代码块按钮
        const codeBlockBtn = document.getElementById('codeBlockBtn');
        if (codeBlockBtn) {
            codeBlockBtn.addEventListener('click', () => {
                if (!isEditMode) return;
                codeDialog.style.display = 'flex';
                codeInput.focus();
            });
        }

        // 行内代码按钮
        const inlineCodeBtn = document.getElementById('inlineCodeBtn');
        if (inlineCodeBtn) {
            inlineCodeBtn.addEventListener('click', () => {
                if (!isEditMode) return;
                const start = markdownInput.selectionStart;
                const end = markdownInput.selectionEnd;
                const text = markdownInput.value;
                let newText, newStart, newEnd;

                if (start === end) {
                    newText = text.slice(0, start) + '`代码`' + text.slice(end);
                    newStart = start + 1;
                    newEnd = start + 3;
                } else {
                    const selectedText = text.slice(start, end);
                    newText = text.slice(0, start) + '`' + selectedText + '`' + text.slice(end);
                    newStart = start + 1;
                    newEnd = end + 1;
                }

                markdownInput.value = newText;
                markdownInput.setSelectionRange(newStart, newEnd);
                markdownInput.focus();
                updatePreview();
                saveNote();
            });
        }
    }

    // 代码块对话框处理
    function initializeCodeDialog() {
        const codeDialog = document.getElementById('codeDialog');
        const codeInput = document.getElementById('codeInput');
        const languageSelect = document.getElementById('languageSelect');

        // 取消按钮
        codeDialog.querySelector('.cancel-btn').addEventListener('click', () => {
            codeDialog.style.display = 'none';
            codeInput.value = '';
        });

        // 确认按钮
        codeDialog.querySelector('.confirm-btn').addEventListener('click', () => {
            const code = codeInput.value.trim();
            if (code) {
                const lang = languageSelect.value;
                const codeBlock = `\`\`\`${lang}\n${code}\n\`\`\`\n`;
                
                // 插入代码块
                const start = markdownInput.selectionStart;
                markdownInput.value = 
                    markdownInput.value.slice(0, start) + 
                    codeBlock + 
                    markdownInput.value.slice(start);
                
                // 更新光标位置
                const newPosition = start + codeBlock.length;
                markdownInput.setSelectionRange(newPosition, newPosition);
                
                // 触发更新
                updatePreview();
                saveNote();
            }
            
            // 关闭对话框
            codeDialog.style.display = 'none';
            codeInput.value = '';
        });

        // 点击外部关闭
        codeDialog.addEventListener('click', (e) => {
            if (e.target === codeDialog) {
                codeDialog.style.display = 'none';
                codeInput.value = '';
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && codeDialog.style.display === 'flex') {
                codeDialog.style.display = 'none';
                codeInput.value = '';
            }
        });
    }

    // 修改加载笔记函数
    async function loadNotes() {
        try {
            // 尝试从服务器加载
            const notes = await fetchApi(`/custom/helper/md/notes/${noteStorage.username}`);
            noteStorage.notes = notes;
        } catch (error) {
            // 仅在降级到本地存储时提示
            console.warn('服务器加载失败，使用本地存储');
            const localNotes = localStorage.getItem(`notes-${noteStorage.username}`);
            noteStorage.notes = localNotes ? JSON.parse(localNotes) : [];
        }
        renderNoteList(noteStorage.notes);
    }
})();
/* Sun-Panel-Helper JS End: markdown-editor */

/* Sun-Panel-Helper JS Start: maxkb-ai */
(function() {
    const config = {
        chatUrl: "https://chat.xxx.com/ui/chat/xxx",
        logoPath: "/custom/helper/maxkb/logo.gif",
        pc: {"position":"bottom-right","offset":{"x":20,"y":20},"size":{"width":80,"height":80}},
        mobile: {"position":"bottom-right","offset":{"x":15,"y":90},"size":{"width":60,"height":60}}
    };

    class AIAssistant {
        constructor() {
            this.isMobile = this.checkMobile();
            this.config = config;  // 使用外部配置
            this.createStyles();
            this.createButton();
            this.createChatWindow();
            this.isOpen = false;
            this.currentSize = 'normal'; // normal, half, full
        }

        checkMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth <= 768;
        }

        createStyles() {
            const deviceConfig = this.isMobile ? this.config.mobile : this.config.pc;
            const style = document.createElement('style');
            style.textContent = `
                .ai-float-button {
                    position: fixed;
                    ${deviceConfig.position.includes('right') ? 'right' : 'left'}: ${deviceConfig.offset.x}px;
                    ${deviceConfig.position.includes('bottom') ? 'bottom' : 'top'}: ${deviceConfig.offset.y}px;
                    width: ${deviceConfig.size.width}px;
                    height: ${deviceConfig.size.height}px;
                    cursor: pointer;
                    z-index: 9998;
                    transition: transform 0.3s;
                }
                .ai-float-button:hover {
                    transform: scale(1.1);
                }
                .ai-chat-window {
                    position: fixed;
                    right: 20px;
                    bottom: 0;
                    width: 480px;
                    height: 720px;
                    background: white;
                    border-radius: 12px 12px 0 0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    display: none;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .ai-chat-window.half-screen {
                    width: 50vw;
                    height: 100vh;
                    right: 0;
                    bottom: 0;
                    border-radius: 0;
                }
                .ai-chat-window.full-screen {
                    width: 100vw;
                    height: 100vh;
                    right: 0;
                    bottom: 0;
                    border-radius: 0;
                }
                .ai-chat-header {
                    height: 40px;
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 0 10px;
                    gap: 10px;
                }
                .ai-chat-content {
                    height: calc(100% - 40px);
                    width: 100%;
                }
                .ai-chat-content iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                .ai-button {
                    padding: 6px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                }
                .ai-button:hover {
                    background: #eee;
                }
                .ai-button svg {
                    width: 20px;
                    height: 20px;
                }

                /* 移动端样式 */
                @media (max-width: 768px) {
                    .ai-float-button {
                        width: 60px;
                        height: 60px;
                        right: 15px;
                        bottom: 90px;
                    }
                    .ai-chat-window {
                        width: 100vw;
                        height: 100vh;
                        right: 0;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        border-radius: 0;
                    }
                    .ai-chat-header {
                        height: 50px;
                        padding: 0 15px;
                    }
                    .ai-chat-content {
                        height: calc(100% - 50px);
                    }
                    .ai-button {
                        padding: 8px;
                    }
                    .ai-button svg {
                        width: 24px;
                        height: 24px;
                    }
                    .resize-btn {
                        display: none !important;
                    }
                }

                /* 针对超小屏幕的额外调整 */
                @media (max-width: 320px) {
                    .ai-float-button {
                        width: 50px;
                        height: 50px;
                        right: 10px;
                        bottom: 85px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        createButton() {
            const button = document.createElement('img');
            button.className = 'ai-float-button';
            button.src = this.config.logoPath;
            button.onclick = () => this.toggleChat();
            document.body.appendChild(button);
        }

        createChatWindow() {
            const chatWindow = document.createElement('div');
            chatWindow.className = 'ai-chat-window';
            
            const header = document.createElement('div');
            header.className = 'ai-chat-header';
            
            if (!this.isMobile) {
                // Restore button
                const restoreBtn = document.createElement('button');
                restoreBtn.className = 'ai-button resize-btn';
                restoreBtn.innerHTML = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;
                restoreBtn.onclick = () => this.resize('normal');
                
                // Half screen button
                const halfScreenBtn = document.createElement('button');
                halfScreenBtn.className = 'ai-button resize-btn';
                halfScreenBtn.innerHTML = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/></svg>`;
                halfScreenBtn.onclick = () => this.resize('half');
                
                // Full screen button
                const fullScreenBtn = document.createElement('button');
                fullScreenBtn.className = 'ai-button resize-btn';
                fullScreenBtn.innerHTML = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
                fullScreenBtn.onclick = () => this.resize('full');

                header.appendChild(restoreBtn);
                header.appendChild(halfScreenBtn);
                header.appendChild(fullScreenBtn);
            }
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'ai-button';
            closeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
            closeBtn.onclick = () => this.toggleChat();
            
            header.appendChild(closeBtn);
            
            const content = document.createElement('div');
            content.className = 'ai-chat-content';
            const iframe = document.createElement('iframe');
            iframe.src = this.config.chatUrl;
            content.appendChild(iframe);
            
            chatWindow.appendChild(header);
            chatWindow.appendChild(content);
            document.body.appendChild(chatWindow);
            
            this.chatWindow = chatWindow;
        }

        toggleChat() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                if (this.isMobile) {
                    this.resize('full');  // 移动端始终全屏
                } else {
                    this.resize('normal');  // PC端恢复正常大小
                }
                this.chatWindow.style.display = 'block';
            } else {
                this.chatWindow.style.display = 'none';
            }
        }

        resize(size) {
            if (this.isMobile) {
                size = 'full'; // 移动端强制全屏
            }
            this.currentSize = size;
            this.chatWindow.className = 'ai-chat-window ' + 
                (size === 'half' ? 'half-screen' : size === 'full' ? 'full-screen' : '');
        }
    }

    // Initialize the assistant
    window.addEventListener('load', () => {
        new AIAssistant();
    });
})();
/* Sun-Panel-Helper JS End: maxkb-ai */

/* Sun-Panel-Helper JS Start: free-widgets */
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
        this.apiPrefix = 'http://localhost:3000';
        
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
/* Sun-Panel-Helper JS End: free-widgets */

/* Sun-Panel-Helper JS Start: music-player */
// 检查 jQuery 是否已加载
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
script.setAttribute("src", "https://myhkw.cn/api/player/1111");
script.setAttribute("key", "1111");
script.setAttribute("m", "0");
script.setAttribute("lr", "l");
document.documentElement.appendChild(script);
/* Sun-Panel-Helper JS End: music-player */

/* Sun-Panel-Helper JS Start: hide-login */
setInterval(function() {
    // 检查页面是否存在具有指定标题的按钮元素
    const buttons = document.querySelectorAll('.fixed-element .float-btn[title="前往登录"]');
    buttons.forEach(function(button) {
        // 删除具有指定标题的按钮的父级元素
        const parent = button.parentElement;
        if (parent) {
            parent.remove();
        }
    });
}, 100);
/* Sun-Panel-Helper JS End: hide-login */
