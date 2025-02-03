<template>
  <div class="widget-card" @click="handleClick">
    <!-- 应用状态标签 -->
    <div class="apply-badges">
      <el-tag v-if="isAppliedToFixed" type="success" size="small">固定</el-tag>
      <el-tag v-if="isAppliedToFree" type="success" size="small">自由</el-tag>
    </div>
    
    <!-- 预览区域 -->
    <div class="preview-section">
      <div class="preview-area">
        <iframe 
          v-if="widget.type === 'link'"
          :src="widget.url"
          frameborder="0"
          scrolling="no"
        ></iframe>
        <div 
          v-else 
          class="html-preview"
          v-html="widget.url"
        ></div>
      </div>
    </div>

    <!-- 信息区域 -->
    <div class="info-section">
      <h3>{{ widget.name }}</h3>
      <p>{{ widget.description }}</p>
      <div class="tags">
        <el-tag 
          v-for="tag in widget.tags"
          :key="tag"
          size="small"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '@/types/market'

interface Props {
  widget: Widget
  isAppliedToFixed: boolean
  isAppliedToFree: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.widget-card {
  position: relative;
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.widget-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.apply-badges {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  z-index: 1;
}

.preview-section {
  aspect-ratio: 16/9;
  background: #f5f7fa;
  overflow: hidden;
}

.preview-area {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.info-section {
  padding: 16px;
}

.info-section h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.info-section p {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style> 