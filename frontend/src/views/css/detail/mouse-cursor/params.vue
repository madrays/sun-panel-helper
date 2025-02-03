<template>
  <div class="params-container">
    <!-- 默认指针设置 -->
    <div class="param-group">
      <div class="param-header">
        <div class="param-label">
          默认指针图片
          <el-tooltip
            content="查看使用指南"
            placement="top"
          >
            <el-button
              type="info"
              text
              @click="showGuide = true"
            >
              <el-icon><Warning /></el-icon>
              使用指南
            </el-button>
          </el-tooltip>
        </div>
        <el-upload
          class="upload-button"
          action="/api/css/mouse-cursor/upload"
          :show-file-list="false"
          :on-success="handleDefaultUploadSuccess"
          :before-upload="beforeUpload"
        >
          <el-button size="small" type="primary">上传图片</el-button>
        </el-upload>
      </div>
      
      <!-- 历史图片选择 -->
      <div class="history-images">
        <div 
          v-for="image in historyImages" 
          :key="image.url"
          class="image-item"
          :class="{ active: localParams.defaultCursor === image.url }"
          @click="selectDefaultImage(image.url)"
        >
          <img :src="image.url" :alt="image.name">
          <div class="image-actions">
            <el-button 
              type="danger" 
              size="small" 
              circle
              @click.stop="deleteImage(image.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- URL输入 -->
      <input
        type="text"
        class="param-input url-input"
        v-model="localParams.defaultCursor"
        @input="handleChange"
        placeholder="请输入默认指针图片URL"
      />
    </div>

    <!-- 悬浮指针设置 -->
    <div class="param-group">
      <div class="param-header">
        <div class="param-label">悬浮指针图片</div>
        <el-upload
          class="upload-button"
          action="/api/css/mouse-cursor/upload"
          :show-file-list="false"
          :on-success="handleHoverUploadSuccess"
          :before-upload="beforeUpload"
        >
          <el-button size="small" type="primary">上传图片</el-button>
        </el-upload>
      </div>
      
      <!-- 历史图片选择 -->
      <div class="history-images">
        <div 
          v-for="image in historyImages" 
          :key="image.url"
          class="image-item"
          :class="{ active: localParams.hoverCursor === image.url }"
          @click="selectHoverImage(image.url)"
        >
          <img :src="image.url" :alt="image.name">
          <div class="image-actions">
            <el-button 
              type="danger" 
              size="small" 
              circle
              @click.stop="deleteImage(image.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- URL输入 -->
      <input
        type="text"
        class="param-input url-input"
        v-model="localParams.hoverCursor"
        @input="handleChange"
        placeholder="请输入悬浮指针图片URL"
      />
    </div>

    <el-dialog
      v-model="showGuide"
      title="鼠标指针使用指南"
      width="500px"
    >
      <div class="guide-content">
        <div class="guide-section">
          <h4>重要提示</h4>
          <ul class="guide-list">
            <li>图片尺寸限制：浏览器对鼠标指针图片有严格限制，建议使用 32x32 像素或更小的图片</li>
            <li>支持格式：JPG、JPEG、PNG、GIF、WEBP、ICO、SVG、BMP</li>
            <li>文件大小：单个文件不超过 2MB</li>
            <li>像素图标效果最佳：建议使用专门设计的鼠标指针图标</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4>操作步骤</h4>
          <ol class="guide-list">
            <li>点击"上传图片"按钮上传自定义指针图片</li>
            <li>在历史图片区域选择已上传的图片</li>
            <li>鼠标悬浮可删除不需要的历史图片</li>
            <li>也可以直接输入图片URL地址</li>
          </ol>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Warning } from '@element-plus/icons-vue'

interface MouseCursorParams {
  defaultCursor: string
  hoverCursor: string
}

interface CursorImage {
  id: string
  name: string
  url: string
  createdAt: string
}

const props = defineProps<{
  modelValue: MouseCursorParams
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: MouseCursorParams): void
}>()

const defaultParams: MouseCursorParams = {
  defaultCursor: 'https://img.hi-linux.com/staticfile/P1i7yA-2024-04-26-hZZjUZ.png',
  hoverCursor: 'https://img.hi-linux.com/staticfile/hVX0Sf-2024-04-26-INwMSQ.png'
}

const localParams = ref<MouseCursorParams>({ ...defaultParams })
const historyImages = ref<CursorImage[]>([])
const showGuide = ref(false)

// 加载历史图片
const loadHistoryImages = async () => {
  try {
    const response = await fetch('/api/css/mouse-cursor/images')
    const data = await response.json()
    historyImages.value = data.images
  } catch (error) {
    console.error('加载历史图片失败:', error)
    ElMessage.error('加载历史图片失败')
  }
}

// 上传前检查
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 上传成功处理
const handleDefaultUploadSuccess = (response: any) => {
  if (response.success) {
    localParams.value.defaultCursor = response.url
    loadHistoryImages()
    handleChange()
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.error || '上传失败')
  }
}

const handleHoverUploadSuccess = (response: any) => {
  if (response.success) {
    localParams.value.hoverCursor = response.url
    loadHistoryImages()
    handleChange()
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.error || '上传失败')
  }
}

// 选择图片
const selectDefaultImage = (url: string) => {
  localParams.value.defaultCursor = url
  handleChange()
}

const selectHoverImage = (url: string) => {
  localParams.value.hoverCursor = url
  handleChange()
}

// 删除图片
const deleteImage = async (id: string) => {
  try {
    const response = await fetch(`/api/css/mouse-cursor/images/${id}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (data.success) {
      loadHistoryImages()
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(data.error || '删除失败')
    }
  } catch (error) {
    console.error('删除图片失败:', error)
    ElMessage.error('删除图片失败')
  }
}

onMounted(() => {
  localParams.value = { ...defaultParams, ...props.modelValue }
  loadHistoryImages()
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    localParams.value = { ...newValue }
  }
}, { deep: true })

function handleChange() {
  emit('update:modelValue', { ...localParams.value })
}
</script>

<style scoped>
.params-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  flex: 1;
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.param-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.param-label .el-button {
  padding: 2px 8px;
  font-size: 13px;
  height: 24px;
  color: var(--el-text-color-regular);
  font-weight: normal;
}

.param-label .el-button:hover {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
}

.param-label .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

.history-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  min-height: 100px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.image-item.active {
  border-color: var(--el-color-primary);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: white;
}

.image-actions {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.param-input {
  width: 100%;
  border: none;
  outline: none;
  background: #f5f7fa;
  border-radius: 6px;
  transition: all 0.2s;
}

.url-input {
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  color: #606266;
}

.url-input:focus {
  background: #edf2fc;
}

.url-input::placeholder {
  color: #c0c4cc;
}

.guide-content {
  padding: 0 20px;
}

.guide-section {
  margin-bottom: 24px;
}

.guide-section:last-child {
  margin-bottom: 0;
}

.guide-section h4 {
  margin: 0 0 12px;
  font-size: 15px;
  color: #2c3e50;
  font-weight: 600;
}

.guide-list {
  margin: 0;
  padding-left: 20px;
}

.guide-list li {
  margin: 8px 0;
  line-height: 1.6;
  font-size: 14px;
  color: #606266;
}

@media (max-width: 768px) {
  .param-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .upload-button {
    width: 100%;
  }

  .upload-button .el-button {
    width: 100%;
  }

  .history-images {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  }
}

@media (max-width: 480px) {
  .params-container {
    padding: 12px;
    gap: 16px;
  }

  .param-group {
    gap: 8px;
  }

  .history-images {
    padding: 8px;
    gap: 8px;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  }
}
</style> 