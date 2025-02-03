<template>
  <div class="preview-container" :style="previewStyle">
    <div class="preview-area">
      <el-alert
        v-if="showSizeWarning"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #title>
          <span class="alert-title">图片尺寸过大</span>
        </template>
        <div class="alert-content">
          <p>当前选择的图片尺寸过大，可能无法正常显示为鼠标指针。</p>
          <p>建议使用不超过 32x32 像素的图片以获得最佳兼容性。</p>
        </div>
      </el-alert>
      <div class="cursor-preview">
        <div class="cursor-box default">
          <span class="title">默认指针</span>
          <div class="image-container">
            <img :src="params.defaultCursor" alt="默认指针" />
          </div>
        </div>
        <div class="cursor-box hover">
          <span class="title">悬浮指针</span>
          <div class="image-container">
            <img :src="params.hoverCursor" alt="悬浮指针" />
          </div>
        </div>
      </div>
    </div>
    <div class="preview-text">
      鼠标移动到预览区域查看效果
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface MouseCursorParams {
  defaultCursor: string
  hoverCursor: string
}

const props = defineProps<{
  params: MouseCursorParams
}>()

const showSizeWarning = ref(false)

// 检查图片尺寸
const checkImageSize = (url: string) => {
  const img = new Image()
  img.onload = () => {
    if (img.width > 32 || img.height > 32) {
      showSizeWarning.value = true
    }
  }
  img.src = url
}

// 监听参数变化
watch(() => props.params, (newParams) => {
  showSizeWarning.value = false
  checkImageSize(newParams.defaultCursor)
  checkImageSize(newParams.hoverCursor)
}, { immediate: true, deep: true })

const previewStyle = computed(() => ({
  '--default-cursor': `url(${props.params.defaultCursor}) 0 0, default`,
  '--hover-cursor': `url(${props.params.hoverCursor}) 0 0, pointer`
}))
</script>

<style scoped>
.preview-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: visible;
  height: auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-area {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.el-alert {
  margin-bottom: 20px;
}

.alert-content {
  padding: 8px 0;
}

.alert-content p {
  margin: 6px 0;
  line-height: 1.6;
  font-size: 13px;
  color: #666;
  white-space: normal;
  word-break: break-word;
}

.cursor-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.cursor-box {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-height: 200px;
}

.cursor-box .title {
  font-size: 14px;
  color: #606266;
}

.cursor-box .image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 12px;
}

.cursor-box img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* 支持所有图片类型的显示 */
  image-rendering: auto;
  /* 对于像素图标特别处理 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.cursor-box.default {
  cursor: var(--default-cursor) !important;
}

.cursor-box.hover {
  cursor: var(--hover-cursor) !important;
}

.preview-text {
  text-align: center;
  padding: 12px;
  color: #606266;
  font-size: 14px;
  border-top: 1px solid #ebeef5;
}

.alert-title {
  font-size: 14px;
  font-weight: bold;
}

.el-alert :deep(.el-alert__content) {
  display: block;
  width: 100%;
}

@media (max-width: 768px) {
  .preview-area {
    padding: 16px;
  }

  .cursor-preview {
    grid-template-columns: 1fr;
  }

  .cursor-box {
    min-height: 180px;
  }
}
</style> 