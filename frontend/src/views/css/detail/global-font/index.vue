<template>
  <div class="css-detail">
    <!-- 标题区域 -->
    <div class="detail-header">
      <h2>全局字体</h2>
      <div class="header-actions">
        <el-button
          type="primary"
          :loading="loading"
          @click="handleDeploy"
          v-if="!deployed"
        >
          部署
        </el-button>
        <template v-else>
          <el-button
            type="success"
            :loading="loading"
            @click="handleDeploy"
          >
            重新部署
          </el-button>
          <el-button
            type="danger"
            :loading="loading"
            @click="handleUndeploy"
          >
            取消部署
          </el-button>
        </template>
        <el-button
          type="info"
          plain
          @click="handleReset"
        >
          重置
        </el-button>
      </div>
    </div>

    <!-- 重要提示 -->
    <el-alert
      type="warning"
      :closable="false"
      show-icon
    >
      <template #title>
        重要提示：使用此功能前请确保字体文件拥有合法授权！
      </template>
      <template #default>
        <p>1. 请确保您使用的字体文件具有合法的使用授权</p>
        <p>2. 建议使用包含完整中文字符的字体，以确保显示效果</p>
        <p>3. 支持 TTF、OTF 格式的字体文件，单个文件不超过 50MB</p>
      </template>
    </el-alert>

    <!-- 内容区域 -->
    <div class="detail-content">
      <!-- 参数调整区域 -->
      <div class="params-section">
        <Params v-model="params" />
      </div>
      
      <!-- 预览区域 -->
      <div class="preview-section">
        <Preview :params="params" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Preview from './preview.vue'
import Params from './params.vue'

interface GlobalFontParams {
  fontFamily: string
}

const params = ref<GlobalFontParams>({
  fontFamily: '江湖风古体'
})

const deployed = ref(false)
const loading = ref(false)

// 检查部署状态
const checkDeployStatus = async () => {
  try {
    const response = await fetch('/api/css/global-font/deployed')
    const data = await response.json()
    if (data.success) {
      deployed.value = data.deployed
    }
  } catch (error) {
    console.error('检查部署状态失败:', error)
  }
}

// 部署
const handleDeploy = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/css/global-font/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params.value)
    })
    const data = await response.json()
    if (data.success) {
      ElMessage.success('部署成功')
      deployed.value = true
    } else {
      ElMessage.error(data.error || '部署失败')
    }
  } catch (error) {
    console.error('部署失败:', error)
    ElMessage.error('部署失败')
  } finally {
    loading.value = false
  }
}

// 取消部署
const handleUndeploy = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/css/global-font/undeploy', {
      method: 'POST'
    })
    const data = await response.json()
    if (data.success) {
      ElMessage.success('已取消部署')
      deployed.value = false
    } else {
      ElMessage.error(data.error || '取消部署失败')
    }
  } catch (error) {
    console.error('取消部署失败:', error)
    ElMessage.error('取消部署失败')
  } finally {
    loading.value = false
  }
}

// 重置参数
const handleReset = () => {
  params.value = {
    fontFamily: '江湖风古体'
  }
}

onMounted(() => {
  checkDeployStatus()
})
</script>

<style scoped>
.css-detail {
  padding: 24px;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.detail-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-top: 24px;
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

@media (max-width: 1200px) {
  .detail-content {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "preview"
      "params";
  }

  .preview-section {
    grid-area: preview;
  }

  .params-section {
    grid-area: params;
  }
}

@media (max-width: 768px) {
  .css-detail {
    padding: 16px;
    gap: 16px;
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .el-button {
    flex: 1;
  }
}
</style> 