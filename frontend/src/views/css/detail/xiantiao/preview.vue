<template>
  <div class="preview-container">
    <div class="preview-card" :style="cardStyle">
      <div class="preview-content">
        <div class="github-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
        </div>
        <div class="app-icon-info-text-box">
          <div class="app-icon-info-text-box-title" :style="titleStyle">
            <span>App</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 从父组件接收参数
const props = defineProps<{
  params: {
    cardBackground: string
    cardOpacity: number
    beforeCircleColor: string
    beforeCircleShadowColor: string
    beforeCircleSize: number
    beforeCircleTop: number
    beforeCircleRight: number
    afterCircleColor: string
    afterCircleSize: number
    afterCircleTop: number
    afterCircleRight: number
    afterCircleBorderWidth: number
    blurAmount: number
  }
}>()

// 计算卡片样式
const cardStyle = computed(() => ({
  backgroundColor: props.params.cardBackground,
  opacity: props.params.cardOpacity,
  backdropFilter: `blur(${props.params.blurAmount}px)`
}))

// 计算标题样式
const titleStyle = computed(() => {
  // 参数转换：将部署参数转换为预览参数
  const previewParams = {
    beforeCircleTop: props.params.beforeCircleTop - 38, // 调整前置圆形的垂直位置补偿
    beforeCircleRight: props.params.beforeCircleRight - 0, // 前置圆形水平位置不需要补偿
    afterCircleTop: props.params.afterCircleTop - 19, // 调整后置圆形的垂直位置补偿
    afterCircleRight: props.params.afterCircleRight + 10 // 调整后置圆形的水平位置补偿
  }

  // 反向计算：预览时显示的尺寸应该是实际部署尺寸的 0.825 倍（33/40）
  const sizeRatio = 0.825
  const displaySize = Math.round(props.params.afterCircleSize * sizeRatio)

  return {
    '--before-circle-color': props.params.beforeCircleColor,
    '--before-circle-shadow-color': props.params.beforeCircleShadowColor,
    '--before-circle-size': `${props.params.beforeCircleSize}px`,
    '--before-circle-top': `${previewParams.beforeCircleTop}px`,
    '--before-circle-right': `${previewParams.beforeCircleRight}px`,
    '--after-circle-color': props.params.afterCircleColor,
    '--after-circle-size': `${displaySize}px`, // 使用缩小后的尺寸
    '--after-circle-top': `${previewParams.afterCircleTop}px`,
    '--after-circle-right': `${previewParams.afterCircleRight}px`,
    '--after-circle-border-width': `${props.params.afterCircleBorderWidth}px`
  }
})
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

.preview-card {
  width: 220px;
  height: 60px;
  padding: 8px 12px;
  background: white;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.preview-content {
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

.github-icon svg {
  width: 100%;
  height: 100%;
}

.app-icon-info-text-box {
  flex: 1;
  min-width: 0;
}

.app-icon-info-text-box-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  padding: 0.25rem 0;
  position: relative;
}

.app-icon-info-text-box-title::before {
  content: "";
  position: absolute;
  width: var(--before-circle-size);
  height: var(--before-circle-size);
  border-radius: 60%;
  background: var(--before-circle-color);
  box-shadow: -8px 21px 0 var(--before-circle-shadow-color);
  z-index: -1;
  right: var(--before-circle-right);
  top: var(--before-circle-top);
  pointer-events: none;
}

.app-icon-info-text-box-title::after {
  content: "";
  position: absolute;
  width: var(--after-circle-size);
  height: var(--after-circle-size);
  border: var(--after-circle-border-width) solid var(--after-circle-color);
  border-radius: 70%;
  z-index: -1;
  top: var(--after-circle-top);
  right: var(--after-circle-right);
  pointer-events: none;
}
</style>

