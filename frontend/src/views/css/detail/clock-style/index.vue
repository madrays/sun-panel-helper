<template>
  <div class="css-detail">
    <div class="detail-header">
      <div class="title-section">
        <h2>时钟样式</h2>
        <p class="description">优化时钟显示效果，支持调整Logo位置，美化整体布局</p>
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
      <!-- 参数调整区域 -->
      <div class="params-section">
        <h3>参数设置</h3>
        <Params
          v-model="params"
          @change="handleParamsChange"
          @deploy="handleDeploy"
          @reset="handleReset"
        />
      </div>

      <!-- 预览区域 -->
      <div class="preview-section">
        <h3>预览效果</h3>
        <Preview v-model="params" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Preview from './preview.vue'
import Params from './params.vue'
import { ElMessage } from 'element-plus'

interface ClockStyleParams {
  logoMarginTop: number
  logoMarginLeft: number
}

// 组件状态
const isDeployed = ref(false)

// 参数状态
const params = ref<ClockStyleParams>({
  logoMarginTop: 20,
  logoMarginLeft: 20
})

// 初始化时检查部署状态
onMounted(async () => {
  await checkDeployStatus()
})

// 检查部署状态
async function checkDeployStatus() {
  try {
    const response = await fetch('/api/css/clock-style/deployed')
    if (!response.ok) throw new Error('检查部署状态失败')
    const data = await response.json()
    isDeployed.value = data.deployed
  } catch (error) {
    console.error('检查部署状态失败:', error)
  }
}

// 参数更新处理
function handleParamsChange() {
  // 可以在这里添加实时预览相关逻辑
}

// 部署处理
async function handleDeploy() {
  try {
    const response = await fetch('/api/css/clock-style/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params.value)
    })
    
    if (!response.ok) throw new Error('部署失败')
    
    const data = await response.json()
    if (data.success) {
      isDeployed.value = true
      ElMessage.success(isDeployed.value ? '重新部署成功' : '部署成功')
    } else {
      throw new Error(data.message || '部署失败')
    }
  } catch (error) {
    console.error('部署失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '部署失败')
  }
}

// 取消部署处理
async function handleUndeploy() {
  try {
    const response = await fetch('/api/css/clock-style/undeploy', {
      method: 'POST'
    })
    
    if (!response.ok) throw new Error('取消部署失败')
    
    const data = await response.json()
    if (data.success) {
      isDeployed.value = false
      ElMessage.success('取消部署成功')
    } else {
      throw new Error(data.message || '取消部署失败')
    }
  } catch (error) {
    console.error('取消部署失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '取消部署失败')
  }
}

// 重置处理
function handleReset() {
  params.value = {
    logoMarginTop: 20,
    logoMarginLeft: 20
  }
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
  max-height: 800px;
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

.preview-section {
  height: 100%;
  max-height: none;
}

.params-section {
  height: 100%;
  overflow: auto;
  margin: 0;
}

.preview-section h3,
.params-section h3 {
  margin: 0;
  padding: 12px 16px;
  font-size: 1rem;
  color: #2c3e50;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

@media (max-width: 1200px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .preview-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .css-detail {
    padding: 16px;
    height: auto;
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