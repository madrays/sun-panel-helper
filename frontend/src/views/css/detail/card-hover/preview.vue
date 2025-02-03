<template>
  <div class="preview-container">
    <div class="preview-area">
      <div class="preview-guide">
        <div class="guide-icon">
          <el-icon><Mouse /></el-icon>
        </div>
        <p>将鼠标移到卡片上查看动画效果</p>
      </div>
      <div 
        class="item-card"
        :style="cardStyle"
        :data-enable-scale="params.enableScale"
      >
        <div class="item-card-content">
          <div class="github-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
            </svg>
          </div>
          <div class="app-icon-info-text-box">
            <div class="app-icon-info-text-box-title">
              卡片悬停动画
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Mouse } from '@element-plus/icons-vue'

interface CardHoverParams {
  cardBackground: string
  enableScale: boolean
  scaleSize: number
  scaleDelay: number
  shakeDegree: number
  shakeSpeed: number
}

const props = defineProps<{
  params: CardHoverParams
}>()

const cardStyle = computed(() => ({
  '--shake-degree': `${props.params.shakeDegree}deg`,
  '--shake-speed': `${props.params.shakeSpeed}s`,
  '--scale-size': props.params.scaleSize,
  '--scale-delay': `${props.params.scaleDelay}s`,
  'background': props.params.cardBackground
}))
</script>

<style scoped>
.preview-container {
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.preview-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.preview-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #606266;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.preview-guide .guide-icon {
  font-size: 1.5rem;
  animation: float 2s ease-in-out infinite;
}

.preview-guide p {
  font-size: 0.9rem;
  margin: 0;
}

.item-card {
  width: 220px;
  height: 60px;
  padding: 8px 12px;
  background: white;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  transform-origin: center center;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.item-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.item-card:hover + .preview-guide {
  opacity: 0;
}

.item-card-content {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.github-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f8fa;
  border-radius: 6px;
  padding: 5px;
  color: #24292f;
  flex-shrink: 0;
}

.app-icon-info-text-box {
  flex: 1;
  min-width: 0;
}

.app-icon-info-text-box-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

/* 基础悬停动画 */
.item-card:hover {
  animation: cardShake var(--shake-speed, 0.5s) ease-in-out forwards;
}

/* 启用放大时的动画 */
.item-card:hover[data-enable-scale="true"] {
  animation: 
    cardScale var(--shake-speed, 0.5s) forwards,
    cardShakeWithScale var(--shake-speed, 0.5s) var(--scale-delay, 0.2s) ease-in-out forwards;
}

@keyframes cardScale {
  to { 
    transform: scale(var(--scale-size, 1.05)); 
  }
}

/* 基础摇晃动画（不放大） */
@keyframes cardShake {
  0%, 100% { 
    transform: rotate(0); 
  }
  25% { 
    transform: rotate(var(--shake-degree, 10deg)); 
  }
  50% { 
    transform: rotate(calc(var(--shake-degree, 10deg) * -1)); 
  }
  75% { 
    transform: rotate(calc(var(--shake-degree, 10deg) * 0.25)); 
  }
  85% { 
    transform: rotate(calc(var(--shake-degree, 10deg) * -0.25)); 
  }
}

/* 带放大效果的摇晃动画 */
@keyframes cardShakeWithScale {
  0%, 100% { 
    transform: scale(var(--scale-size, 1.05)) rotate(0); 
  }
  25% { 
    transform: scale(var(--scale-size, 1.05)) rotate(var(--shake-degree, 10deg)); 
  }
  50% { 
    transform: scale(var(--scale-size, 1.05)) rotate(calc(var(--shake-degree, 10deg) * -1)); 
  }
  75% { 
    transform: scale(var(--scale-size, 1.05)) rotate(calc(var(--shake-degree, 10deg) * 0.25)); 
  }
  85% { 
    transform: scale(var(--scale-size, 1.05)) rotate(calc(var(--shake-degree, 10deg) * -0.25)); 
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
</style> 