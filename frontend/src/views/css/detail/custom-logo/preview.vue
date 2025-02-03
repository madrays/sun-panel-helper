<template>
  <div class="preview-container">
    <div class="preview-header">
      <div class="preview-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>当前Logo预览效果</span>
      </div>
    </div>
    
    <div class="preview-content">
      <!-- 电脑端预览 -->
      <div class="device-preview">
        <div class="device-label">
          <el-icon><Monitor /></el-icon>
          <span>电脑端</span>
        </div>
        <div class="logo-container">
          <img 
            v-if="params.pcLogo"
            :src="params.pcLogo" 
            :style="pcLogoStyle"
            alt="PC Logo预览"
            class="logo-image"
          />
          <div v-else class="empty-logo">
            <el-icon><Picture /></el-icon>
            <span>请上传Logo</span>
          </div>
        </div>
      </div>

      <!-- 手机端预览 -->
      <div class="device-preview">
        <div class="device-label">
          <el-icon><Iphone /></el-icon>
          <span>手机端</span>
        </div>
        <div class="logo-container">
          <img 
            v-if="getMobileLogo"
            :src="getMobileLogo" 
            :style="mobileLogoStyle"
            alt="Mobile Logo预览"
            class="logo-image"
          />
          <div v-else class="empty-logo">
            <el-icon><Picture /></el-icon>
            <span>使用电脑端Logo</span>
          </div>
        </div>
      </div>

      <!-- 平板端预览 -->
      <div class="device-preview">
        <div class="device-label">
          <el-icon><Monitor /></el-icon>
          <span>平板端</span>
        </div>
        <div class="logo-container">
          <img 
            v-if="getTabletLogo"
            :src="getTabletLogo" 
            :style="tabletLogoStyle"
            alt="Tablet Logo预览"
            class="logo-image"
          />
          <div v-else class="empty-logo">
            <el-icon><Picture /></el-icon>
            <span>使用电脑端Logo</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Monitor, Iphone, Picture, InfoFilled } from '@element-plus/icons-vue'

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

const props = defineProps<{
  params: CustomLogoParams
}>()

// PC端样式
const pcLogoStyle = computed(() => ({
  width: `${props.params.pcWidth}px`,
  height: `${props.params.pcHeight}px`,
  marginTop: `${props.params.pcMarginTop}px`
}))

// 手机端样式
const mobileLogoStyle = computed(() => ({
  width: `${props.params.mobileWidth}px`,
  height: `${props.params.mobileHeight}px`,
  marginTop: `${props.params.mobileMarginTop}px`
}))

// 平板端样式
const tabletLogoStyle = computed(() => ({
  width: `${props.params.tabletWidth}px`,
  height: `${props.params.tabletHeight}px`,
  marginTop: `${props.params.tabletMarginTop}px`
}))

// 获取手机端Logo（如果没有设置则使用PC端Logo）
const getMobileLogo = computed(() => 
  props.params.mobileLogo || props.params.pcLogo
)

// 获取平板端Logo（如果没有设置则使用PC端Logo）
const getTabletLogo = computed(() => 
  props.params.tabletLogo || props.params.pcLogo
)
</script>

<style scoped>
.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.preview-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.preview-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-color-primary);
  font-size: 14px;
}

.preview-content {
  flex: 1;
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  overflow-y: auto;
  min-height: 0;
}

.device-preview {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 240px;
  height: fit-content;
}

.device-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
}

.logo-container {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 160px;
}

.logo-image {
  object-fit: contain;
  transition: all 0.3s ease;
}

.empty-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
}

.empty-logo .el-icon {
  font-size: 32px;
}

.empty-logo span {
  font-size: 14px;
}

@media (max-width: 768px) {
  .preview-content {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }
  
  .device-preview {
    padding: 16px;
    min-height: 200px;
  }
  
  .logo-container {
    padding: 16px;
  }
}
</style> 