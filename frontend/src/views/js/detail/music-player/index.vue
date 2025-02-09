<template>
  <div class="css-detail">
    <div class="detail-header">
      <div class="title-section">
        <h2>音乐播放器</h2>
        <p class="description">优雅的MYHK音乐播放器，支持自定义播放器</p>
      </div>
      <div class="action-buttons">
        <el-button 
          :type="isDeployed ? 'success' : 'primary'"
          @click="handleDeploy"
          :loading="deploying"
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
        />
      </div>
      <div class="preview-section">
        <h3>实时预览</h3>
        <Preview 
          :params="params"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Preview from './preview.vue'
import Params from './params.vue'
import { ElMessage } from 'element-plus'
import type { MusicPlayerConfig } from '@/types/js/music-player'
import { defaultParams } from '@/types/js/music-player'

// 组件状态
const isDeployed = ref(false)
const deploying = ref(false)

// 参数
const params = ref<MusicPlayerConfig>({ ...defaultParams })

// 初始化时检查部署状态
onMounted(async () => {
  try {
    const response = await fetch('/api/js/music-player/deployed')
    const data = await response.json()
    isDeployed.value = data.deployed
  } catch (error) {
    console.error('检查部署状态失败:', error)
  }
})

// 部署处理
const handleDeploy = async () => {
  try {
    deploying.value = true
    console.log('Deploying params:', params.value)

    const res = await fetch('/api/js/music-player/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params.value)
    })

    const data = await res.json()
    if (!res.ok) {
      ElMessage.error(data.error || '部署失败')
      return
    }

    isDeployed.value = true
    ElMessage.success('部署成功')
  } catch (error) {
    console.error('部署失败:', error)
    ElMessage.error('部署失败')
  } finally {
    deploying.value = false
  }
}

// 取消部署处理
const handleUndeploy = async () => {
  try {
    await fetch('/api/js/music-player/undeploy', {
      method: 'POST'
    })
    const response = await fetch('/api/js/music-player/deployed')
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
/* 使用与 MaxKB AI 相同的样式 */
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 0;
}

.title-section {
  flex: 1;
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
  align-items: center;
}

.detail-content {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(600px, 2fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.preview-section,
.params-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
    min-height: 500px;
  }

  .params-section {
    grid-area: params;
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