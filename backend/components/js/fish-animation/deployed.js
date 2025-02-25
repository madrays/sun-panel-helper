// ====================== 鱼群动画系统 开始 ======================
window.SunPanelFish = (function() {
    // 配置参数
    const config = {
            fishCount: 3,
            heightRate: 0.5,
            fishColor: 'hsl(0, 0%, 95%)',
            opacity: 0.37,
            speedRate: 0.2,
            zIndex: 999
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
            this.fy = this.renderer.height * this.ACCELARATION_RATE * ((this.renderer.height - this.height - y) >= 0 ? -1 : 1) * Math.abs(velocity) * config.speedRate;
        },

        updateSelf: function() {
            this.fy += this.SPRING_CONSTANT * (this.initHeight - this.height) * config.speedRate;
            this.fy *= this.SPRING_FRICTION;
            this.height += this.fy;
        },

        updateNeighbors: function() {
            if(this.previous) {
                this.force.previous = this.WAVE_SPREAD * (this.height - this.previous.height) * config.speedRate;
            }
            if(this.next) {
                this.force.next = this.WAVE_SPREAD * (this.height - this.next.height) * config.speedRate;
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
            this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1) * config.speedRate;

            if(this.renderer.reverse) {
                this.y = this.getRandomValue(this.renderer.height * 1 / 10, this.renderer.height * 4 / 10);
                this.vy = this.getRandomValue(2, 5) * config.speedRate;
                this.ay = this.getRandomValue(0.05, 0.2) * config.speedRate;
            } else {
                this.y = this.getRandomValue(this.renderer.height * 6 / 10, this.renderer.height * 9 / 10);
                this.vy = this.getRandomValue(-5, -2) * config.speedRate;
                this.ay = this.getRandomValue(-0.2, -0.05) * config.speedRate;
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
                    this.vy -= this.GRAVITY * config.speedRate;
                    this.isOut = true;
                } else {
                    if(this.isOut) {
                        this.ay = this.getRandomValue(0.05, 0.2) * config.speedRate;
                    }
                    this.isOut = false;
                }
            } else {
                if(this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
                    this.vy += this.GRAVITY * config.speedRate;
                    this.isOut = true;
                } else {
                    if(this.isOut) {
                        this.ay = this.getRandomValue(-0.2, -0.05) * config.speedRate;
                    }
                    this.isOut = false;
                }
            }
            if(!this.isOut) {
                this.theta += (Math.PI / 20) * config.speedRate;
                this.theta %= Math.PI * 2;
                this.phi += (Math.PI / 30) * config.speedRate;
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
            this.context.moveTo(0, this.height);

            for(var i = 0, count = this.points.length; i < count; i++) {
                this.points[i].render(this.context);
            }
            this.context.lineTo(this.width, this.height);
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
                zIndex: config.zIndex.toString(),
                opacity: config.opacity.toString(),
                bottom: "0",
                left: "0",
                right: "0",
                overflow: "hidden",
                pointerEvents: "all",     // 改为 all 确保捕获所有鼠标事件
                touchAction: "none"       // 防止触摸事件被浏览器处理
            });
            
            // 确保父元素不会阻止鼠标事件
            if (wallpaperDiv) {
                wallpaperDiv.style.pointerEvents = "all";
                // 遍历所有父元素，确保它们不会阻止事件
                let parent = wallpaperDiv.parentElement;
                while (parent && parent !== document.body) {
                    parent.style.pointerEvents = "all";
                    parent = parent.parentElement;
                }
            }
            
            // 添加事件监听器到 document，以确保即使有覆盖元素也能捕获事件
            const handleMouseMove = (e) => {
                const container = document.querySelector('.fishcontainer');
                if (!container) return;
                
                const rect = container.getBoundingClientRect();
                if (e.clientY >= rect.top && e.clientY <= rect.bottom &&
                    e.clientX >= rect.left && e.clientX <= rect.right) {
                    // 在容器范围内时触发事件
                    if (RENDERER.moveEpicenter) {
                        RENDERER.moveEpicenter(e);
                    }
                }
            };

            // 移除之前的事件监听器
            document.removeEventListener('mousemove', handleMouseMove);

            // 添加新的事件监听器
            document.addEventListener('mousemove', handleMouseMove, { passive: true });
            
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
                container.style.zIndex = config.zIndex.toString();
            }
            // 重新初始化鱼群以应用新的速度
            if (RENDERER.setup) {
                RENDERER.setup();
            }
        }
    };
})();

// 启动初始化
window.SunPanelFish.init();
 // ====================== 鱼群动画系统 结束 ======================