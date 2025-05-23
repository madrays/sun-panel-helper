<template>
  <div class="css-detail">
    <!-- 头部区域 -->
    <div class="detail-header">
      <div class="title-section">
        <h2>鱼群动画</h2>
        <p class="description">为面板添加底部鱼群动画效果</p>
      </div>
      <div class="action-buttons">
        <el-button 
          :type="isDeployed ? 'success' : 'primary'"
          @click="handleDeploy"
          :loading="deploying"
        >
          {{ isDeployed ? '重新部署' : '部署' }}
        </el-button>
        <el-button 
          v-if="isDeployed"
          type="danger"
          @click="handleUndeploy"
        >
          取消部署
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="detail-content">
      <!-- 参数配置区域 -->
      <div class="params-section">
        <h3>参数配置</h3>
        <el-form label-position="top">
          <el-form-item label="鱼群数量">
            <el-slider 
              v-model="params.fishCount" 
              :min="1"
              :max="10"
              :step="0.5"
              @change="updatePreview"
            />
          </el-form-item>
          <el-form-item label="水面位置">
            <el-slider 
              v-model="params.heightRate" 
              :min="0.3"
              :max="0.7"
              :step="0.01"
              @change="updatePreview"
            />
          </el-form-item>
          <el-form-item label="鱼群颜色">
            <el-color-picker 
              v-model="params.fishColor" 
              :predefine="['hsl(0, 0%, 95%)', '#409EFF', '#67C23A', '#E6A23C', '#F56C6C']"
              @change="updatePreview"
            />
            <div class="param-tip">水面下的鱼群会自动呈现透明效果</div>
          </el-form-item>
          <el-form-item label="整体透明度">
            <el-slider 
              v-model="params.opacity" 
              :min="0.1"
              :max="1"
              :step="0.01"
              @change="updatePreview"
            />
          </el-form-item>
          <el-form-item label="游动速度">
            <el-slider 
              v-model="params.speedRate" 
              :min="0.1"
              :max="1.1"
              :step="0.1"
              @change="updatePreview"
            />
            <div class="param-tip">默认为0.9，可调整鱼群游动速度以适应不同分辨率</div>
          </el-form-item>
          <el-form-item label="层级(z-index)">
            <el-input-number 
              v-model="params.zIndex" 
              :min="0"
              :max="99999"
              @change="updatePreview"
              size="large"
              controls-position="right"
              style="width: 100%"
            />
            <div class="param-tip">控制鱼群在页面中的层级，值越大越靠前</div>
          </el-form-item>
        </el-form>

        <el-divider>功能说明</el-divider>
        
        <div class="feature-list">
          <div class="feature-item">
            <el-icon><Pointer /></el-icon>
            <div class="feature-info">
              <h4>鱼群游动效果</h4>
              <p>鱼群会自动游动，并在水面上下呈现不同的视觉效果</p>
            </div>
          </div>
          <div class="feature-item">
            <el-icon><Monitor /></el-icon>
            <div class="feature-info">
              <h4>自适应布局</h4>
              <p>自动适应不同屏幕宽度，鱼群数量会根据宽度动态调整</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 预览区域 -->
      <div class="preview-section">
        <h3>效果预览</h3>
        <div class="preview-container">
          <div class="preview-bg"></div>
          <div id="preview-fish-container" class="fish-container">
            <canvas ref="previewCanvas" width="800" height="200"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Pointer, Monitor } from '@element-plus/icons-vue'

const isDeployed = ref(false)
const deploying = ref(false)
const previewCanvas = ref<HTMLCanvasElement | null>(null)

// 默认参数
const defaultParams = {
  fishCount: 3,
  heightRate: 0.5,
  fishColor: 'hsl(0, 0%, 95%)',
  opacity: 0.37,
  speedRate: 0.9,
  zIndex: 9999
}

const params = reactive({ ...defaultParams })

// 预览渲染器
let previewRenderer: any = null
// 全局配置对象引用
let previewConfig: any = null
// 保存原始方法
let originalMethods: any = {
  fishInit: null,
  fishControlStatus: null,
  pointInterfere: null,
  pointUpdateSelf: null,
  pointUpdateNeighbors: null
}

// 加载脚本
const loadScript = () => {
  const script = document.createElement('script')
  script.src = '/api/js/fish-animation/template.js'
  script.onload = () => {
    // 延迟初始化，确保 DOM 已经准备好
    setTimeout(initPreview, 0)
  }
  document.head.appendChild(script)
}

// 初始化预览
const initPreview = () => {
  if (!previewCanvas.value) return
  
  const container = document.getElementById('preview-fish-container')
  if (!container) return

  // 使用 SunPanelFish 命名空间下的组件
  if (!window.SunPanelFish) {
    console.error('SunPanelFish not found')
    return
  }

  // 保存原始方法
  if (window.SunPanelFish.FISH && window.SunPanelFish.FISH.prototype) {
    originalMethods.fishInit = window.SunPanelFish.FISH.prototype.init;
    originalMethods.fishControlStatus = window.SunPanelFish.FISH.prototype.controlStatus;
  }
  
  if (window.SunPanelFish.SURFACE_POINT && window.SunPanelFish.SURFACE_POINT.prototype) {
    originalMethods.pointInterfere = window.SunPanelFish.SURFACE_POINT.prototype.interfere;
    originalMethods.pointUpdateSelf = window.SunPanelFish.SURFACE_POINT.prototype.updateSelf;
    originalMethods.pointUpdateNeighbors = window.SunPanelFish.SURFACE_POINT.prototype.updateNeighbors;
  }

  // 创建一个新的配置对象，包含所有参数
  previewConfig = {
    fishCount: params.fishCount,
    heightRate: params.heightRate,
    fishColor: params.fishColor,
    opacity: params.opacity,
    speedRate: params.speedRate,
    zIndex: params.zIndex
  };
  
  // 直接替换模板中的方法，使其使用我们的配置对象
  patchFishMethods();

  // 创建预览渲染器实例
  const renderer = Object.create(window.SunPanelFish.RENDERER)
  
  // 先创建并添加 canvas
  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  type Renderer = {
    $window: Window
    $document: HTMLElement
    $container: HTMLElement
    $canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    FISH_COUNT: number
    INIT_HEIGHT_RATE: number
    points: any[]
    fishes: any[]
    watchIds: number[]
    width: number
    height: number
    reverse: boolean
    render: () => void
    controlStatus: () => void
    setup: () => void
    reconstructMethods: () => void
    bindEvent: () => void
  }

  Object.assign(renderer as Renderer, {
    $window: window,
    $document: document.body,
    $container: container,
    $canvas: canvas,
    context: ctx,
    FISH_COUNT: params.fishCount,
    INIT_HEIGHT_RATE: params.heightRate,
    points: [],
    fishes: [],
    watchIds: [],
    width: container.offsetWidth,
    height: container.offsetHeight,
    reverse: false,
    render: function(this: Renderer) {
      requestAnimationFrame(this.render.bind(this))
      this.controlStatus()
      this.context.clearRect(0, 0, this.width, this.height)
      this.context.fillStyle = params.fishColor // 使用自定义颜色

      for(let i = 0, count = this.fishes.length; i < count; i++) {
        this.fishes[i].render(this.context)
      }
      this.context.save()
      this.context.globalCompositeOperation = 'xor'
      this.context.beginPath()
      this.context.moveTo(0, this.reverse ? 0 : this.height)

      for(let i = 0, count = this.points.length; i < count; i++) {
        this.points[i].render(this.context)
      }
      this.context.lineTo(this.width, this.reverse ? 0 : this.height)
      this.context.closePath()
      this.context.fill()
      this.context.restore()
    }
  })

  // 设置初始透明度
  container.style.opacity = params.opacity.toString()
  
  // 设置初始z-index
  container.style.zIndex = params.zIndex.toString()

  // 确保所有依赖都已加载
  if (window.SunPanelFish.SURFACE_POINT && window.SunPanelFish.FISH) {
    previewRenderer = renderer as Renderer
    previewRenderer.reconstructMethods()
    previewRenderer.setup()
    previewRenderer.bindEvent()
    previewRenderer.render()
  }
}

// 修补鱼群方法，使其使用我们的配置对象
const patchFishMethods = () => {
  if (!window.SunPanelFish) return;
  
  // 修改FISH.prototype.init
  if (window.SunPanelFish.FISH && window.SunPanelFish.FISH.prototype && originalMethods.fishInit) {
    window.SunPanelFish.FISH.prototype.init = function() {
      this.direction = Math.random() < 0.5;
      this.x = this.direction ? (this.renderer.width + this.renderer.THRESHOLD) : -this.renderer.THRESHOLD;
      this.previousY = this.y;
      this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1) * previewConfig.speedRate;

      if(this.renderer.reverse) {
        this.y = this.getRandomValue(this.renderer.height * 1 / 10, this.renderer.height * 4 / 10);
        this.vy = this.getRandomValue(2, 5) * previewConfig.speedRate;
        this.ay = this.getRandomValue(0.05, 0.2) * previewConfig.speedRate;
      } else {
        this.y = this.getRandomValue(this.renderer.height * 6 / 10, this.renderer.height * 9 / 10);
        this.vy = this.getRandomValue(-5, -2) * previewConfig.speedRate;
        this.ay = this.getRandomValue(-0.2, -0.05) * previewConfig.speedRate;
      }
      this.isOut = false;
      this.theta = 0;
      this.phi = 0;
    };
  }
  
  // 修改FISH.prototype.controlStatus
  if (window.SunPanelFish.FISH && window.SunPanelFish.FISH.prototype && originalMethods.fishControlStatus) {
    window.SunPanelFish.FISH.prototype.controlStatus = function(context) {
      this.previousY = this.y;
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.ay;

      if(this.renderer.reverse) {
        if(this.y > this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
          this.vy -= this.GRAVITY * previewConfig.speedRate;
          this.isOut = true;
        } else {
          if(this.isOut) {
            this.ay = this.getRandomValue(0.05, 0.2) * previewConfig.speedRate;
          }
          this.isOut = false;
        }
      } else {
        if(this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
          this.vy += this.GRAVITY * previewConfig.speedRate;
          this.isOut = true;
        } else {
          if(this.isOut) {
            this.ay = this.getRandomValue(-0.2, -0.05) * previewConfig.speedRate;
          }
          this.isOut = false;
        }
      }
      if(!this.isOut) {
        this.theta += (Math.PI / 20) * previewConfig.speedRate;
        this.theta %= Math.PI * 2;
        this.phi += (Math.PI / 30) * previewConfig.speedRate;
        this.phi %= Math.PI * 2;
      }
      
      // 这是关键部分 - 生成波纹效果
      this.renderer.generateEpicenter(this.x + (this.direction ? -1 : 1) * this.renderer.THRESHOLD, this.y, this.y - this.previousY);
      
      // 这是关键部分 - 当鱼游出屏幕时重新初始化
      if((this.vx > 0 && this.x > this.renderer.width + this.renderer.THRESHOLD) || 
         (this.vx < 0 && this.x < -this.renderer.THRESHOLD)) {
        this.init();
      }
    };
  }
  
  // 修改SURFACE_POINT.prototype方法
  if (window.SunPanelFish.SURFACE_POINT && window.SunPanelFish.SURFACE_POINT.prototype) {
    if (originalMethods.pointInterfere) {
      window.SunPanelFish.SURFACE_POINT.prototype.interfere = function(y, velocity) {
        // 添加速度限制，防止水面波动过大
        const limitedVelocity = Math.max(-10, Math.min(10, velocity));
        const speedFactor = Math.min(2.0, previewConfig.speedRate); // 限制最大速度因子
        
        this.fy = this.renderer.height * this.ACCELARATION_RATE * 
          ((this.renderer.height - this.height - y) >= 0 ? -1 : 1) * 
          Math.abs(limitedVelocity) * speedFactor;
      };
    }
    
    if (originalMethods.pointUpdateSelf) {
      window.SunPanelFish.SURFACE_POINT.prototype.updateSelf = function() {
        const speedFactor = Math.min(2.0, previewConfig.speedRate); // 限制最大速度因子
        
        this.fy += this.SPRING_CONSTANT * (this.initHeight - this.height) * speedFactor;
        this.fy *= this.SPRING_FRICTION;
        this.height += this.fy;
      };
    }
    
    if (originalMethods.pointUpdateNeighbors) {
      window.SunPanelFish.SURFACE_POINT.prototype.updateNeighbors = function() {
        const speedFactor = Math.min(2.0, previewConfig.speedRate); // 限制最大速度因子
        
        if(this.previous) {
          this.force.previous = this.WAVE_SPREAD * (this.height - this.previous.height) * speedFactor;
        }
        if(this.next) {
          this.force.next = this.WAVE_SPREAD * (this.height - this.next.height) * speedFactor;
        }
      };
    }
  }
};

// 使用防抖优化更新预览
const debounce = (fn: Function, delay: number) => {
  let timer: number | null = null
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn.apply(null, args)
    }, delay)
  }
}

// 更新预览 - 进一步减少防抖延迟
const updatePreview = debounce(() => {
  if (!previewRenderer) return
  
  try {
    // 对鱼群数量取整，因为不能有小数个鱼
    previewRenderer.FISH_COUNT = Math.round(params.fishCount)
    previewRenderer.INIT_HEIGHT_RATE = params.heightRate
    
    const container = document.getElementById('preview-fish-container')
    if (container) {
      container.style.opacity = params.opacity.toString()
      container.style.zIndex = params.zIndex.toString()
      previewRenderer.width = container.offsetWidth
      previewRenderer.height = container.offsetHeight
    }
    
    // 更新配置对象
    if (previewConfig) {
      previewConfig.fishCount = params.fishCount;
      previewConfig.heightRate = params.heightRate;
      previewConfig.fishColor = params.fishColor;
      previewConfig.opacity = params.opacity;
      previewConfig.speedRate = params.speedRate;
      previewConfig.zIndex = params.zIndex;
      
      console.log('更新预览配置:', previewConfig);
    }
    
    // 重新初始化预览渲染器
    previewRenderer.points = [];
    previewRenderer.fishes = [];
    previewRenderer.setup();
  } catch (error) {
    console.error('更新预览失败:', error)
  }
}, 30)

// 检查部署状态
const checkDeployment = async () => {
  try {
    const res = await fetch('/api/js/fish-animation/deployed')
    const data = await res.json()
    isDeployed.value = data.deployed
  } catch (error) {
    console.error('检查部署状态失败:', error)
  }
}

// 重置处理
const handleReset = () => {
  Object.assign(params, defaultParams)
  updatePreview()
}

// 部署处理
const handleDeploy = async () => {
  try {
    deploying.value = true
    const res = await fetch('/api/js/fish-animation/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    const data = await res.json()
    if (!res.ok) {
      if (data.errors) {
        ElMessage.error(data.errors.join('\n'))
      } else {
        ElMessage.error(data.error || '部署失败')
      }
      return
    }
    isDeployed.value = true
    ElMessage.success('部署成功')
  } catch (error) {
    console.error('部署失败:', error)
    ElMessage.error('部署失败')
  } finally {
    deploying.value = false
  }
}

// 取消部署处理
const handleUndeploy = async () => {
  try {
    await fetch('/api/js/fish-animation/undeploy', {
      method: 'POST'
    })
    const response = await fetch('/api/js/fish-animation/deployed')
    const data = await response.json()
    isDeployed.value = data.deployed
    if (!isDeployed.value) {
      ElMessage.success('取消部署成功')
    } else {
      ElMessage.error('取消部署失败')
    }
  } catch (error) {
    console.error('取消部署失败:', error)
    ElMessage.error('取消部署失败')
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    SunPanelFish: {
      RENDERER: {
        prototype: {
          reconstructMethods: () => void
          setup: () => void
          bindEvent: () => void
          render: () => void
        }
      }
      SURFACE_POINT: any
      FISH: any
      init: () => void
      updateConfig?: (config: any) => void
      _getConfig?: () => any
      config?: any
    }
  }
}

onMounted(() => {
  checkDeployment()
  loadScript()
})
</script>

<style scoped>
.css-detail {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
  background: var(--bg-base);
}

/* 头部样式 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.title-section h2 {
  font-size: 24px;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.title-section .description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* 内容布局 */
.detail-content {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(600px, 2fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.params-section, .preview-section {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  overflow: auto;
}

/* 功能列表样式 */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.feature-item .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  padding: 8px;
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}

.feature-info h4 {
  margin: 0 0 4px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.feature-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

/* 预览窗口样式 */
.preview-container {
  width: 100%;
  height: 400px;
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.preview-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    #000 0%,
    #111 50%,
    #000 100%
  );
}

.fish-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: #000;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  mix-blend-mode: screen;
}

/* 预览区域标题样式 */
.preview-section h3 {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-section h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

@media (max-width: 1200px) {
  .detail-content {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "preview"
      "params";
  }

  .preview-section {
    grid-area: preview;
  }

  .params-section {
    grid-area: params;
  }
}

@media (max-width: 768px) {
  .css-detail {
    padding: 16px;
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}

.param-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}
</style> 