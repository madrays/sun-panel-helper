<template>
  <div class="css-detail">
    <div class="detail-header">
      <div class="title-section">
        <h2>自定义Logo</h2>
        <p class="description">为面板添加自定义Logo图片和样式</p>
      </div>
      <div class="action-buttons">
        <el-button 
          :type="isDeployed ? 'success' : 'primary'"
          @click="handleDeploy"
        >
          {{ isDeployed ? '重新部署' : '部署' }}
        </el-button>
        <el-button 
          v-if="isDeployed"
          type="danger"
          @click="handleUndeploy"
        >
          取消部署
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="detail-content">
      <div class="params-section">
        <h3>参数设置</h3>
        <Params
          v-model="params"
          @deploy="handleDeploy"
          @reset="handleReset"
        />
      </div>
      <div class="preview-section">
        <h3>实时预览</h3>
        <Preview :params="params" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Preview from './preview.vue'
import Params from './params.vue'
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

// 组件状态
const isDeployed = ref(false)

// 默认参数
const defaultParams: CustomLogoParams = {
  pcLogo: '',
  pcWidth: 250,
  pcHeight: 250,
  pcMarginTop: -70,
  mobileLogo: '',
  mobileWidth: 200,
  mobileHeight: 150,
  mobileMarginTop: -30,
  tabletLogo: '',
  tabletWidth: 200,
  tabletHeight: 200,
  tabletMarginTop: -50
}

const params = ref<CustomLogoParams>({ ...defaultParams })

// 初始化时检查部署状态
onMounted(async () => {
  try {
    const response = await fetch('/api/css/custom-logo/deployed')
    const data = await response.json()
    isDeployed.value = data.deployed
  } catch (error) {
    console.error('检查部署状态失败:', error)
  }
})

// 部署处理
const handleDeploy = async () => {
  try {
    // 调用部署API
    await fetch('/api/css/custom-logo/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params.value)
    })
    isDeployed.value = true
    ElMessage.success('部署成功')
  } catch (error) {
    console.error('部署失败:', error)
    ElMessage.error('部署失败')
  }
}

// 取消部署处理
const handleUndeploy = async () => {
  try {
    // 调用取消部署API
    await fetch('/api/css/custom-logo/undeploy', {
      method: 'POST'
    })
    const response = await fetch('/api/css/custom-logo/deployed')
    const data = await response.json()
    isDeployed.value = data.deployed
    if (!isDeployed.value) {
      ElMessage.success('取消部署成功')
    } else {
      ElMessage.error('取消部署失败')
    }
  } catch (error) {
    console.error('取消部署失败:', error)
    ElMessage.error('取消部署失败')
  }
}

// 重置处理
const handleReset = () => {
  params.value = { ...defaultParams }
}
</script>

<style scoped>
.css-detail {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
  background: var(--bg-base);
}

.detail-header {
  margin-bottom: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex-shrink: 0;
}

.detail-header .title-section {
  flex: 1;
  min-width: 300px;
}

.detail-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 8px;
}

.description {
  color: #606266;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.detail-content {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(600px, 2fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin-bottom: 0;
}

.preview-section,
.params-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0;
}

.preview-section {
  height: fit-content;
}

.params-section {
  height: 100%;
  overflow: auto;
}

.preview-section h3,
.params-section h3 {
  margin: 0;
  padding: 12px 18px;
  font-size: 1rem;
  color: #2c3e50;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
  background: white;
  position: sticky;
  top: 0;
  z-index: 1;
}

@media (max-width: 1200px) {
  .detail-content {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "preview"
      "params";
    overflow-y: auto;
  }

  .preview-section {
    grid-area: preview;
    height: auto;
    min-height: 500px;
    overflow: auto;
  }

  .params-section {
    grid-area: params;
    height: auto;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .css-detail {
    padding: 16px;
  }

  .detail-header {
    flex-direction: column;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 