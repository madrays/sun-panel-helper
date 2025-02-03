<template>
  <div class="preview-container">
    <iframe 
      :src="widget.url"
      frameborder="0"
      scrolling="no"
      class="preview-iframe"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import type { WidgetConfig } from '@/types/market'

defineProps<{
  widget: WidgetConfig
}>()
</script>

<style scoped>
.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style> 