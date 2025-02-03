<template>
  <div class="params-container">
    <div class="param-header">
      <div class="param-title">
        Logo设置
        <el-tooltip content="查看使用指南" placement="top">
          <el-button type="info" text @click="showGuide = true">
            <el-icon><Warning /></el-icon>
            使用指南
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="param-tabs">
      <!-- PC端标签页 -->
      <el-tab-pane name="pc">
        <template #label>
          <div class="tab-label">
            <el-icon><Monitor /></el-icon>
            <span>电脑端</span>
          </div>
        </template>
        <div class="param-content">
          <div class="upload-section">
            <div class="param-label">电脑端LOGO</div>
            <el-upload
              class="upload-button"
              action="/api/css/custom-logo/upload"
              name="file"
              :show-file-list="false"
              :on-success="handlePcUploadSuccess"
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
              :class="{ active: localParams.pcLogo === image.url }"
              @click="selectPcImage(image.url)"
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

          <!-- 尺寸和位置设置 -->
          <div class="size-settings">
            <div class="param-item">
              <div class="param-label">宽度</div>
              <div class="param-control">
                <el-slider
                  v-model="localParams.pcWidth"
                  :min="100"
                  :max="500"
                  :step="10"
                  @change="handleChange"
                />
                <div class="param-value">{{ localParams.pcWidth }}px</div>
              </div>
            </div>
            <div class="param-item">
              <div class="param-label">高度</div>
              <div class="param-control">
                <el-slider
                  v-model="localParams.pcHeight"
                  :min="100"
                  :max="500"
                  :step="10"
                  @change="handleChange"
                />
                <div class="param-value">{{ localParams.pcHeight }}px</div>
              </div>
            </div>
            <div class="param-item">
              <div class="param-label">上边距</div>
              <div class="param-control">
                <el-slider
                  v-model="localParams.pcMarginTop"
                  :min="-200"
                  :max="200"
                  :step="5"
                  @change="handleChange"
                />
                <div class="param-value">{{ localParams.pcMarginTop }}px</div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 手机端标签页 -->
      <el-tab-pane name="mobile">
        <template #label>
          <div class="tab-label">
            <el-icon><Iphone /></el-icon>
            <span>手机端</span>
          </div>
        </template>
        <div class="param-content">
          <div class="upload-section">
            <div class="param-label">手机端LOGO</div>
            <el-upload
              class="upload-button"
              action="/api/css/custom-logo/upload"
              name="file"
              :show-file-list="false"
              :on-success="handleMobileUploadSuccess"
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
              :class="{ active: localParams.mobileLogo === image.url }"
              @click="selectMobileImage(image.url)"
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

          <!-- 尺寸和位置设置 -->
          <div class="size-settings">
            <div class="param-item">
              <div class="param-label">宽度</div>
              <div class="param-control">
                <el-slider
                  v-model="localParams.mobileWidth"
                  :min="50"
                  :max="300"
                  :step="10"
                  @change="handleChange"
                />
                <div class="param-value">{{ localParams.mobileWidth }}px</div>
              </div>
            </div>
            <div class="param-item">
              <div class="param-label">高度</div>
              <div class="param-control">
                <el-slider
                  v-model="localParams.mobileHeight"
                  :min="50"
                  :max="300"
                  :step="10"
                  @change="handleChange"
                />
                <div class="param-value">{{ localParams.mobileHeight }}px</div>
              </div>
            </div>
            <div class="param-item">
              <div class="param-label">上边距</div>
              <div class="param-control">
                <el-slider
                  v-model="localParams.mobileMarginTop"
                  :min="-100"
                  :max="100"
                  :step="5"
                  @change="handleChange"
                />
                <div class="param-value">{{ localParams.mobileMarginTop }}px</div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 平板端标签页 -->
      <el-tab-pane name="tablet">
        <template #label>
          <div class="tab-label">
            <el-icon><Monitor /></el-icon>
            <span>平板端</span>
          </div>
        </template>
        <div class="param-content">
          <div class="upload-section">
            <div class="param-label">平板端LOGO</div>
            <el-upload
              class="upload-button"
              action="/api/css/custom-logo/upload"
              name="file"
              :show-file-list="false"
              :on-success="handleTabletUploadSuccess"
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
              :class="{ active: localParams.tabletLogo === image.url }"
              @click="selectTabletImage(image.url)"
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

          <!-- 尺寸和位置设置 -->
          <div class="size-settings">
            <div class="param-item">
              <div class="param-label">宽度</div>
              <div class="param-control">
                <el-slider
                  v-model="localParams.tabletWidth"
                  :min="100"
                  :max="400"
                  :step="10"
                  @change="handleChange"
                />
                <div class="param-value">{{ localParams.tabletWidth }}px</div>
              </div>
            </div>
            <div class="param-item">
              <div class="param-label">高度</div>
              <div class="param-control">
                <el-slider
                  v-model="localParams.tabletHeight"
                  :min="100"
                  :max="400"
                  :step="10"
                  @change="handleChange"
                />
                <div class="param-value">{{ localParams.tabletHeight }}px</div>
              </div>
            </div>
            <div class="param-item">
              <div class="param-label">上边距</div>
              <div class="param-control">
                <el-slider
                  v-model="localParams.tabletMarginTop"
                  :min="-150"
                  :max="150"
                  :step="5"
                  @change="handleChange"
                />
                <div class="param-value">{{ localParams.tabletMarginTop }}px</div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 使用指南对话框 -->
    <el-dialog
      v-model="showGuide"
      title="Logo设置使用指南"
      width="500px"
    >
      <div class="guide-content">
        <div class="guide-section">
          <h4>重要提示</h4>
          <ul class="guide-list">
            <li>图片格式：支持 JPG、PNG、GIF、SVG、WEBP 等常见图片格式</li>
            <li>文件大小：单个文件不超过 2MB</li>
            <li>建议尺寸：根据设备类型选择合适的尺寸</li>
            <li>透明背景：建议使用透明背景的图片以获得最佳效果</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4>操作步骤</h4>
          <ol class="guide-list">
            <li>选择设备类型（电脑端/手机端/平板端）</li>
            <li>点击"上传图片"按钮上传Logo图片</li>
            <li>在历史图片区域选择已上传的图片</li>
            <li>调整Logo的尺寸和位置</li>
            <li>可以为不同设备设置不同的Logo</li>
          </ol>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Delete, Warning, Monitor, Iphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface CustomLogoParams {
  pcLogo: string
  pcWidth: number
  pcHeight: number
  pcMarginTop: number
  mobileLogo: string
  mobileWidth: number
  mobileHeight: number
  mobileMarginTop: number
  tabletLogo: string
  tabletWidth: number
  tabletHeight: number
  tabletMarginTop: number
}

interface LogoImage {
  id: string
  name: string
  url: string
  createdAt: string
}

const props = defineProps<{
  modelValue: CustomLogoParams
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CustomLogoParams): void
}>()

// 当前激活的标签页
const activeTab = ref('pc')

// 本地参数
const localParams = ref<CustomLogoParams>({ ...props.modelValue })

// 历史图片列表
const historyImages = ref<LogoImage[]>([])

// 使用指南对话框
const showGuide = ref(false)

// 加载历史图片
const loadHistoryImages = async () => {
  try {
    const response = await fetch('/api/css/custom-logo/images')
    const data = await response.json()
    if (data.success) {
      historyImages.value = data.images
    } else {
      throw new Error(data.error || '加载失败')
    }
  } catch (error) {
    console.error('加载历史图片失败:', error)
    ElMessage.error('加载历史图片失败')
  }
}

// 监听父组件参数变化
watch(() => props.modelValue, (newValue) => {
  localParams.value = { ...newValue }
}, { deep: true })

// 参数变化处理
const handleChange = () => {
  emit('update:modelValue', { ...localParams.value })
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isImage = /^image\/(jpeg|png|gif|svg\+xml|webp)$/.test(file.type)
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 上传成功处理
const handlePcUploadSuccess = (response: any) => {
  if (response.success) {
    localParams.value.pcLogo = response.url
    loadHistoryImages()
    handleChange()
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.error || '上传失败')
  }
}

const handleMobileUploadSuccess = (response: any) => {
  if (response.success) {
    localParams.value.mobileLogo = response.url
    loadHistoryImages()
    handleChange()
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.error || '上传失败')
  }
}

const handleTabletUploadSuccess = (response: any) => {
  if (response.success) {
    localParams.value.tabletLogo = response.url
    loadHistoryImages()
    handleChange()
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.error || '上传失败')
  }
}

// 选择图片
const selectPcImage = (url: string) => {
  localParams.value.pcLogo = url
  handleChange()
}

const selectMobileImage = (url: string) => {
  localParams.value.mobileLogo = url
  handleChange()
}

const selectTabletImage = (url: string) => {
  localParams.value.tabletLogo = url
  handleChange()
}

// 删除图片
const deleteImage = async (id: string) => {
  try {
    const response = await fetch(`/api/css/custom-logo/images/${id}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (data.success) {
      await loadHistoryImages()
      ElMessage.success('删除成功')
    } else {
      throw new Error(data.error || '删除失败')
    }
  } catch (error) {
    console.error('删除图片失败:', error)
    ElMessage.error('删除失败')
  }
}

// 初始化加载历史图片
loadHistoryImages()
</script>

<style scoped>
.params-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.param-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
  height: 48px;
  display: flex;
  align-items: center;
}

.param-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
}

.param-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  order: -1;
}

:deep(.el-tabs__nav-wrap) {
  display: flex;
  justify-content: center;
}

:deep(.el-tabs__nav) {
  border: none;
  background: #fff;
  border-radius: 8px;
  padding: 4px;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  width: 360px;
}

:deep(.el-tabs__item) {
  flex: 1;
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  padding: 0;
  transition: all 0.3s;
  border-radius: 6px;
  margin: 0 2px;
  text-align: center;
}

:deep(.el-tabs__item.is-active) {
  font-weight: 500;
  background: var(--el-color-primary);
  color: white;
}

:deep(.el-tabs__item:hover) {
  color: var(--el-color-primary);
}

:deep(.el-tabs__item.is-active:hover) {
  color: white;
}

:deep(.el-tabs__active-bar) {
  display: none;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
}

.param-content {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}

.upload-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.param-label {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.history-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.image-item {
  aspect-ratio: 1;
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.image-item:hover {
  border-color: var(--el-color-primary);
}

.image-item.active {
  border-color: var(--el-color-primary);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.size-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-control {
  display: flex;
  align-items: center;
  gap: 16px;
}

.param-value {
  min-width: 60px;
  text-align: right;
  color: #606266;
  font-size: 14px;
}

:deep(.el-slider) {
  flex: 1;
}

.guide-content {
  padding: 16px;
}

.guide-section {
  margin-bottom: 20px;
}

.guide-section h4 {
  margin: 0 0 12px;
  color: #2c3e50;
  font-size: 16px;
}

.guide-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.guide-list li {
  margin-bottom: 8px;
}

.tab-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  padding: 0 8px;
}

.tab-label .el-icon {
  font-size: 16px;
  margin-right: 2px;
}
</style> 