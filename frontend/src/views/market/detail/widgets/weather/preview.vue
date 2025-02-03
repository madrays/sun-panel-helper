<template>
  <div class="preview-container">
    <iframe 
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
  keys: string[]
  location: string
}

const props = defineProps<{
  widget: Widget
  config: Config
}>()

const emit = defineEmits(['update:modelValue'])

// 监听配置变化，直接修改 HTML 文件内容
watch(() => props.config, async (newConfig) => {
  const response = await fetch(props.widget.url)
  let html = await response.text()
  
  // 找到 WEATHER_API 配置部分并替换
  const apiConfigRegex = /(const WEATHER_API = {[\s\S]*?keys:\s*\[)[^\]]*(\][\s\S]*?location:\s*')[^']*('[\s\S]*?};)/
  const newApiConfig = `$1'${newConfig.keys[0]}','${newConfig.keys[1]}'$2${newConfig.location}$3`
  
  // 替换配置
  html = html.replace(apiConfigRegex, newApiConfig)
  
  // 保存修改后的文件
  await axios.post('/api/preview/weather-widget', { html })
}, { deep: true })

// 初始化时读取当前配置
onMounted(async () => {
  const response = await fetch(props.widget.url)
  const html = await response.text()
  
  // 从 HTML 中提取配置
  const keysMatch = html.match(/keys:\s*\[\s*'([^']*)',\s*'([^']*)'\s*\]/s)
  const locationMatch = html.match(/location:\s*'([^']*)'/s)
  
  if (keysMatch && locationMatch) {
    const keys = [keysMatch[1], keysMatch[2]]
    const location = locationMatch[1]
    
    // 更新父组件的配置
    emit('update:modelValue', {
      keys,
      location
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
  height: 100%;
  border: none;
}
</style> 