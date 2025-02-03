<template>
  <div class="preview-container">
    <div 
      class="preview-content"
      :class="{ 'mobile-view': currentDevice === 'mobile' }"
    >
      <!-- 模拟内容背景 -->
      <div class="mock-content">
        <div class="sunpanel-pattern">
          <div class="pattern-circle"></div>
          <div class="pattern-line"></div>
          <div class="pattern-line short"></div>
        </div>
      </div>

      <!-- 悬浮按钮 -->
      <div 
        class="float-button"
        :style="buttonStyle"
      >
        <img :src="params.logoPath" alt="AI助手">
      </div>

      <!-- 位置指示器 -->
      <div class="position-indicators">
        <div 
          v-for="pos in positions" 
          :key="pos"
          class="indicator"
          :class="[pos, { active: isPositionActive(pos) }]"
        ></div>
      </div>
    </div>

    <div class="preview-note">
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        预览效果仅供参考，实际显示效果会根据网站布局自动调整
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MaxkbAiParams, Position } from '@/types/js/maxkb-ai';

const props = defineProps<{
  params: MaxkbAiParams,
  currentDevice: 'pc' | 'mobile'
}>();

const positions: Position[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

// 计算按钮样式
const buttonStyle = computed(() => {
  const config = props.currentDevice === 'pc' ? props.params.pc : props.params.mobile;
  const style: Record<string, string> = {
    width: `${config.size.width}px`,
    height: `${config.size.height}px`,
  };

  // 根据位置设置样式
  switch (config.position) {
    case 'top-left':
      style.top = `${config.offset.y}px`;
      style.left = `${config.offset.x}px`;
      break;
    case 'top-right':
      style.top = `${config.offset.y}px`;
      style.right = `${config.offset.x}px`;
      break;
    case 'bottom-left':
      style.bottom = `${config.offset.y}px`;
      style.left = `${config.offset.x}px`;
      break;
    case 'bottom-right':
      style.bottom = `${config.offset.y}px`;
      style.right = `${config.offset.x}px`;
      break;
  }

  return style;
});

// 判断当前位置是否激活
const isPositionActive = (position: Position) => {
  const config = props.currentDevice === 'pc' ? props.params.pc : props.params.mobile;
  return config.position === position;
};
</script>

<style scoped>
.preview-container {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-content {
  height: 570px;
  background: white;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.preview-content.mobile-view {
  width: 325px;   
  height: 570px;
  margin: 0 auto;
  border: 12px solid #2c3e50;
  border-radius: 32px;
}

.mock-content {
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.sunpanel-pattern {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.pattern-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.pattern-line {
  height: 12px;
  width: 100%;
  background: white;
  border-radius: 6px;
  opacity: 0.8;
}

.pattern-line.short {
  width: 60%;
}

.float-button {
  position: absolute;
  z-index: 10;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.float-button:hover {
  transform: scale(1.1);
}

.float-button img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.position-indicators {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.indicator {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  opacity: 0.3;
}

.indicator.active {
  background: var(--el-color-primary);
  opacity: 1;
}

.indicator.top-left { top: 12px; left: 12px; }
.indicator.top-right { top: 12px; right: 12px; }
.indicator.bottom-left { bottom: 12px; left: 12px; }
.indicator.bottom-right { bottom: 12px; right: 12px; }

.preview-note {
  flex-shrink: 0;
}
</style> 