<template>
  <div class="css-detail">
    <div class="header">
      <div class="title-section">
        <h2>布局调整</h2>
        <p class="description">调整页面布局,包括时钟、搜索栏和系统信息的位置</p>
      </div>
      <div class="action-buttons">
        <el-button
          type="primary"
          :loading="deploying"
          @click="handleDeploy"
          v-if="!isDeployed"
        >
          部署
        </el-button>
        <template v-else>
          <el-button
            type="primary"
            :loading="deploying"
            @click="handleDeploy"
          >
            重新部署
          </el-button>
          <el-button
            type="danger"
            :loading="undeploying"
            @click="handleUndeploy"
          >
            取消部署
          </el-button>
        </template>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="params-section">
        <Params
          v-model="params"
          @update:modelValue="handleParamsChange"
        />
      </div>
      <div class="preview-section">
        <Preview :params="params" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import Params from './params.vue';
import Preview from './preview.vue';

interface LayoutAdjustParams {
  showClock: boolean
  searchMarginTop: number
  systemMarginTop: number
}

const isDeployed = ref(false);
const deploying = ref(false);
const undeploying = ref(false);

// 默认参数
const defaultParams: LayoutAdjustParams = {
  showClock: true,
  searchMarginTop: 0,
  systemMarginTop: 0
};

const params = ref<LayoutAdjustParams>({ ...defaultParams });

// 检查部署状态
async function checkDeployStatus() {
  try {
    const response = await fetch('/api/css/layout-adjust/deployed');
    const data = await response.json();
    isDeployed.value = data.deployed;
  } catch (error) {
    console.error('检查部署状态失败:', error);
    ElMessage.error('检查部署状态失败');
  }
}

// 部署
async function handleDeploy() {
  deploying.value = true;
  try {
    const response = await fetch('/api/css/layout-adjust/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params.value)
    });
    const data = await response.json();
    if (data.success) {
      ElMessage.success('部署成功');
      isDeployed.value = true;
    } else {
      throw new Error(data.error || '部署失败');
    }
  } catch (error) {
    console.error('部署失败:', error);
    ElMessage.error('部署失败');
  } finally {
    deploying.value = false;
  }
}

// 取消部署
async function handleUndeploy() {
  undeploying.value = true;
  try {
    const response = await fetch('/api/css/layout-adjust/undeploy', {
      method: 'POST'
    });
    const data = await response.json();
    if (data.success) {
      ElMessage.success('取消部署成功');
      isDeployed.value = false;
      params.value = { ...defaultParams };
    } else {
      throw new Error(data.error || '取消部署失败');
    }
  } catch (error) {
    console.error('取消部署失败:', error);
    ElMessage.error('取消部署失败');
  } finally {
    undeploying.value = false;
  }
}

// 重置参数
function handleReset() {
  params.value = { ...defaultParams };
}

// 参数变化
function handleParamsChange(newParams: LayoutAdjustParams) {
  params.value = newParams;
}

onMounted(() => {
  checkDeployStatus();
});
</script>

<style scoped>
.css-detail {
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.main-content {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 20px;
}

.preview-section,
.params-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .preview-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .css-detail {
    padding: 16px;
    gap: 16px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .action-buttons {
    width: 100%;
  }

  .action-buttons .el-button {
    flex: 1;
  }
}
</style> 