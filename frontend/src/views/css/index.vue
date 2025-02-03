<template>
  <div class="css-library">
    <div class="page-header">
      <h2>CSS 样式库</h2>
      <p class="description">独立的CSS样式组件，支持参数配置和实时预览</p>
    </div>

    <div class="card-grid" ref="cardGrid">
      <!-- 装饰线条卡片 -->
      <div 
        class="card-wrapper"
        draggable="true"
        @dragstart="handleDragStart($event, 'xiantiao')"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop="handleDrop($event, 'xiantiao')"
      >
        <XiantiaoCard 
          :is-deployed="deployedComponents.includes('xiantiao')"
          @click="handleCardClick('xiantiao')"
        />
      </div>

      <!-- 卡片悬停动画卡片 -->
      <div 
        class="card-wrapper"
        draggable="true"
        @dragstart="handleDragStart($event, 'card-hover')"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop="handleDrop($event, 'card-hover')"
      >
        <CardHoverCard 
          :is-deployed="deployedComponents.includes('card-hover')"
          @click="handleCardClick('card-hover')"
        />
      </div>

      <!-- 渐变背景卡片 -->
      <div 
        class="card-wrapper"
        draggable="true"
        @dragstart="handleDragStart($event, 'gradient-bg')"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop="handleDrop($event, 'gradient-bg')"
      >
        <GradientBgCard 
          :is-deployed="deployedComponents.includes('gradient-bg')"
          @click="handleCardClick('gradient-bg')"
        />
      </div>

      <!-- 鼠标指针卡片 -->
      <div 
        class="card-wrapper"
        draggable="true"
        @dragstart="handleDragStart($event, 'mouse-cursor')"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop="handleDrop($event, 'mouse-cursor')"
      >
        <MouseCursorCard 
          :is-deployed="deployedComponents.includes('mouse-cursor')"
          @click="handleCardClick('mouse-cursor')"
        />
      </div>

      <!-- 全局字体卡片 -->
      <div
        class="card-wrapper"
        draggable="true"
        @dragstart="handleDragStart($event, 'global-font')"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop="handleDrop($event, 'global-font')"
      >
        <GlobalFontCard
          :deployed="deployedComponents.includes('global-font')"
          @click="handleCardClick('global-font')"
        />
      </div>

      <!-- 自定义Logo卡片 -->
      <div 
        class="card-wrapper"
        draggable="true"
        @dragstart="handleDragStart($event, 'custom-logo')"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop="handleDrop($event, 'custom-logo')"
      >
        <CustomLogoCard 
          :is-deployed="deployedComponents.includes('custom-logo')"
          @click="handleCardClick('custom-logo')"
        />
      </div>

      <!-- 布局调整卡片 -->
      <div 
        class="card-wrapper"
        draggable="true"
        @dragstart="handleDragStart($event, 'layout-adjust')"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop="handleDrop($event, 'layout-adjust')"
      >
        <LayoutAdjustCard 
          :is-deployed="deployedComponents.includes('layout-adjust')"
          @click="handleCardClick('layout-adjust')"
        />
      </div>

      <!-- 时钟样式卡片 -->
      <div 
        class="card-wrapper"
        draggable="true"
        @dragstart="handleDragStart($event, 'clock-style')"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop="handleDrop($event, 'clock-style')"
      >
        <ClockStyleCard 
          :is-deployed="deployedComponents.includes('clock-style')"
          @click="handleCardClick('clock-style')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import XiantiaoCard from './preview/XiantiaoCard.vue'
import CardHoverCard from './preview/CardHoverCard.vue'
import GradientBgCard from './preview/GradientBgCard.vue'
import MouseCursorCard from './preview/MouseCursorCard.vue'
import GlobalFontCard from './preview/GlobalFontCard.vue'
import CustomLogoCard from './preview/CustomLogoCard.vue'
import LayoutAdjustCard from './preview/LayoutAdjustCard.vue'
import ClockStyleCard from './preview/ClockStyleCard.vue'

export default {
  name: 'CSSLibrary',
  components: {
    XiantiaoCard,
    CardHoverCard,
    GradientBgCard,
    MouseCursorCard,
    GlobalFontCard,
    CustomLogoCard,
    LayoutAdjustCard,
    ClockStyleCard
  },
  data() {
    return {
      deployedComponents: [], // 已部署的组件列表
      cardOrder: ['xiantiao', 'card-hover', 'gradient-bg', 'mouse-cursor', 'layout-adjust', 'custom-logo', 'global-font', 'clock-style'], // 卡片顺序
      draggedCard: null, // 当前拖拽的卡片
      deployedList: {
        xiantiao: false,
        'card-hover': false,
        'gradient-bg': false,
        'mouse-cursor': false,
        'layout-adjust': false,
        'custom-logo': false,
        'global-font': false,
        'clock-style': false
      }
    }
  },
  methods: {
    handleCardClick(componentId) {
      this.$router.push(`/dashboard/css/${componentId}`)
    },
    handleDragStart(event, componentId) {
      this.draggedCard = componentId
      event.target.classList.add('dragging')
    },
    handleDragEnd(event) {
      event.target.classList.remove('dragging')
      this.draggedCard = null
    },
    handleDrop(event, targetId) {
      event.preventDefault()
      if (!this.draggedCard || this.draggedCard === targetId) return

      // 更新卡片顺序
      const newOrder = [...this.cardOrder]
      const draggedIndex = newOrder.indexOf(this.draggedCard)
      const targetIndex = newOrder.indexOf(targetId)
      
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, this.draggedCard)
      
      this.cardOrder = newOrder
      
      // 保存新的顺序到本地存储
      localStorage.setItem('cssCardOrder', JSON.stringify(newOrder))
    },
    // 检查组件部署状态
    async checkDeployment() {
      try {
        // 检查 xiantiao 部署状态
        const xiantiaoRes = await fetch('/api/css/xiantiao/deployed')
        const xiantiaoData = await xiantiaoRes.json()
        
        // 检查 card-hover 部署状态
        const cardHoverRes = await fetch('/api/css/card-hover/deployed')
        const cardHoverData = await cardHoverRes.json()

        // 检查 gradient-bg 部署状态
        const gradientBgRes = await fetch('/api/css/gradient-bg/deployed')
        const gradientBgData = await gradientBgRes.json()

        // 检查 mouse-cursor 部署状态
        const mouseCursorRes = await fetch('/api/css/mouse-cursor/deployed')
        const mouseCursorData = await mouseCursorRes.json()
        
        // 检查 global-font 部署状态
        const globalFontRes = await fetch('/api/css/global-font/deployed')
        const globalFontData = await globalFontRes.json()
        
        // 检查 custom-logo 部署状态
        const customLogoRes = await fetch('/api/css/custom-logo/deployed')
        const customLogoData = await customLogoRes.json()
        
        // 检查 layout-adjust 部署状态
        const layoutAdjustRes = await fetch('/api/css/layout-adjust/deployed')
        const layoutAdjustData = await layoutAdjustRes.json()
        
        // 检查 clock-style 部署状态
        const clockStyleRes = await fetch('/api/css/clock-style/deployed')
        const clockStyleData = await clockStyleRes.json()
        
        // 更新部署状态列表
        this.deployedComponents = [
          ...(xiantiaoData.deployed ? ['xiantiao'] : []),
          ...(cardHoverData.deployed ? ['card-hover'] : []),
          ...(gradientBgData.deployed ? ['gradient-bg'] : []),
          ...(mouseCursorData.deployed ? ['mouse-cursor'] : []),
          ...(globalFontData.deployed ? ['global-font'] : []),
          ...(customLogoData.deployed ? ['custom-logo'] : []),
          ...(layoutAdjustData.deployed ? ['layout-adjust'] : []),
          ...(clockStyleData.deployed ? ['clock-style'] : [])
        ]
      } catch (error) {
        console.error('Failed to check deployment status:', error)
      }
    }
  },
  created() {
    // 从本地存储加载卡片顺序
    const savedOrder = localStorage.getItem('cssCardOrder')
    if (savedOrder) {
      this.cardOrder = JSON.parse(savedOrder)
    }
    
    // 检查初始部署状态
    this.checkDeployment()
    
    // 定期检查部署状态
    this.deploymentTimer = setInterval(() => {
      this.checkDeployment()
    }, 30000) // 每30秒检查一次
  },
  beforeUnmount() {
    // 清理定时器
    if (this.deploymentTimer) {
      clearInterval(this.deploymentTimer)
    }
  }
}
</script>

<style scoped>
.css-library {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 8px;
}

.description {
  color: #606266;
  font-size: 0.9rem;
  margin: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 12px 0;
}

.card-wrapper {
  cursor: move;
  transition: transform 0.2s;
}

.card-wrapper.dragging {
  opacity: 0.5;
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style> 