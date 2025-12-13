<template>
  <div class="preview-container">
    <iframe 
      :key="previewUrl"
      :src="previewUrl"
      frameborder="0"
      class="preview-iframe"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import axios from 'axios'
import type { Widget } from '@/types/market'

interface Config {
  key: string
  host: string
  location: string
  backgroundColor?: string
  textColor?: string
}

const props = defineProps<{
  widget: Widget
  config: Config
}>()

const emit = defineEmits(['update:modelValue'])

// 初始化时读取当前配置
onMounted(async () => {
  const response = await fetch(props.widget.url)
  const html = await response.text()
  
  // 从 HTML 中提取配置 - 使用更严格的正则
  const keyMatch = html.match(/key:\s*'([^']*)'/)
  const hostMatch = html.match(/host:\s*'([^']*)'/)
  const locationMatch = html.match(/location:\s*'([^']*)'/)
  const backgroundColorMatch = html.match(/backgroundColor:\s*'([^']*)'/)
  const textColorMatch = html.match(/textColor:\s*'([^']*)'/)
  
  if (locationMatch) {
    let key = '';
    let host = '';

    // 优先匹配新版配置
    if (keyMatch) {
       key = keyMatch[1];
    } else {
       // 兼容旧版：尝试匹配 keys 数组
       const keysMatch = html.match(/keys:\s*\[\s*'([^']*)'/);
       if (keysMatch) key = keysMatch[1];
    }

    if (hostMatch) {
        host = hostMatch[1];
    } else {
        // 兼容旧版：尝试匹配 hosts 数组
        const hostsMatch = html.match(/hosts:\s*\[\s*'([^']*)'/);
        if (hostsMatch) host = hostsMatch[1];
    }

    // 更新父组件的配置
    emit('update:modelValue', {
      key,
      host,
      location: locationMatch[1],
      backgroundColor: backgroundColorMatch ? backgroundColorMatch[1] : 'rgba(0, 0, 0, 0.5)',
      textColor: textColorMatch ? textColorMatch[1] : '#ffffff'
    })
  }
})

const previewUrl = computed(() => props.widget.url)
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
  height: 260px;
  border: none;
}
</style> 