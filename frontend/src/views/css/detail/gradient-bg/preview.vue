<template>
  <div class="preview-container">
    <div class="preview-area">
      <div class="gradient-box" :style="previewStyle">
        <div class="preview-content">
          <div class="preview-text">渐变背景预览</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface GradientBgParams {
  color1: string
  color2: string
  color3: string
  color4: string
  angle: number
  duration: number
}

const props = defineProps<{
  params: GradientBgParams
}>()

const previewStyle = computed(() => ({
  '--gradient-bg': `linear-gradient(${props.params.angle}deg, ${props.params.color1}, ${props.params.color2}, ${props.params.color3}, ${props.params.color4})`,
  '--animation-duration': `${props.params.duration}s`
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
  height: 100%;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-box {
  width: 100%;
  height: 100%;
  min-height: 240px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  background: var(--gradient-bg);
  background-size: 400% 400%;
  animation: gradientBg var(--animation-duration) ease-in-out infinite;
}

.preview-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-text {
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: 0.8;
}

@keyframes gradientBg {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style> 