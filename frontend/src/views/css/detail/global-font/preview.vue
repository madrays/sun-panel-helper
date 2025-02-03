<template>
  <div class="preview-container">
    <div class="preview-header">
      <h3>实时预览</h3>
      <div class="current-font">当前字体：{{ params.fontFamily }}</div>
    </div>
    
    <div class="preview-content">
      <div class="preview-text" :style="previewStyle">
        <p class="text-lg">春风得意马蹄疾，一日看尽长安花。</p>
        <p class="text-md">The quick brown fox jumps over the lazy dog.</p>
        <p class="text-sm">0123456789</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'

interface GlobalFontParams {
  fontFamily: string
}

const props = defineProps<{
  params: GlobalFontParams
}>()

const previewStyle = computed(() => ({
  fontFamily: props.params.fontFamily
}))

// 加载预设字体
const loadPresetFonts = async () => {
  const presetFonts = [
    { name: '江湖风古体', url: '/custom/helper/font/江湖风古体.ttf' },
    { name: '马赛克MC风', url: '/custom/helper/font/马赛克MC风.ttf' },
    { name: '猫啃圆珠体', url: '/custom/helper/font/猫啃圆珠体.ttf' }
  ]

  for (const font of presetFonts) {
    try {
      const fontFace = new FontFace(font.name, `url("${font.url}")`)
      await fontFace.load()
      document.fonts.add(fontFace)
    } catch (error) {
      console.error(`加载预设字体失败: ${font.name}`, error)
    }
  }
}

// 加载已上传字体
const loadUploadedFonts = async () => {
  try {
    const response = await fetch('/api/css/global-font/fonts')
    const data = await response.json()
    if (data.success) {
      const loadFontPromises = data.fonts.map(async (font: any) => {
        try {
          const fontFace = new FontFace(font.name, `url("/custom/helper/font/${font.id}")`)
          await fontFace.load()
          document.fonts.add(fontFace)
        } catch (error) {
          console.error(`加载上传字体失败: ${font.name}`, error)
        }
      })
      await Promise.all(loadFontPromises)
    }
  } catch (error) {
    console.error('加载字体列表失败:', error)
  }
}

// 监听字体变化
watch(() => props.params.fontFamily, async (newFont) => {
  if (newFont) {
    // 确保字体已加载
    await loadUploadedFonts()
  }
})

onMounted(async () => {
  await loadPresetFonts()
  await loadUploadedFonts()
})
</script>

<style>
/* 确保字体文件加载后立即应用 */
.preview-text {
  font-display: swap !important;
}
</style>

<style scoped>
.preview-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.preview-header h3 {
  margin: 0;
  font-size: 14px;
  color: #2c3e50;
}

.current-font {
  margin-top: 4px;
  font-size: 12px;
  color: #606266;
}

.preview-content {
  flex: 1;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.preview-text {
  text-align: center;
}

.text-lg {
  font-size: 24px;
  line-height: 1.5;
  margin: 0 0 16px;
  color: #2c3e50;
}

.text-md {
  font-size: 18px;
  line-height: 1.5;
  margin: 0 0 16px;
  color: #2c3e50;
}

.text-sm {
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .preview-container {
    height: auto;
    min-height: 240px;
  }
  
  .text-lg {
    font-size: 20px;
  }
  
  .text-md {
    font-size: 16px;
  }
  
  .text-sm {
    font-size: 14px;
  }
}
</style> 