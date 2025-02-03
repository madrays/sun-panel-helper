<template>
  <div class="css-detail">
    <!-- 头部区域 -->
    <div class="detail-header">
      <div class="title-section">
        <h2>搜索框随机一言</h2>
        <p class="description">为搜索框添加随机一言占位符，让搜索框更有趣</p>
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
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="detail-content">
      <!-- 说明区域 -->
      <div class="params-section">
        <h3>功能说明</h3>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Aim /></el-icon>
            </div>
            <div class="feature-info">
              <h4>智能匹配</h4>
              <p>自动识别并匹配页面中的搜索框，无需手动配置</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="feature-info">
              <h4>多源支持</h4>
              <p>支持多个一言API源，自动容错和切换</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><RefreshRight /></el-icon>
            </div>
            <div class="feature-info">
              <h4>自动更新</h4>
              <p>页面加载时自动获取最新一言内容</p>
            </div>
          </div>
        </div>

        <el-divider>API 数据源</el-divider>
        
        <div class="api-list">
          <div class="api-item">
            <div class="api-status success"></div>
            <div class="api-info">
              <h4>一言(Hitokoto)</h4>
              <p>https://v1.hitokoto.cn/</p>
            </div>
          </div>
          <div class="api-item">
            <div class="api-status"></div>
            <div class="api-info">
              <h4>一言(Ian)</h4>
              <p>https://yyapi.xpdbk.com/api/ian</p>
            </div>
          </div>
          <div class="api-item">
            <div class="api-status"></div>
            <div class="api-info">
              <h4>一言(Nxvav)</h4>
              <p>https://api.nxvav.cn/api/yiyan</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 预览区域 -->
      <div class="preview-section">
        <h3>效果预览</h3>
        <div class="preview-container">
          <div class="preview-header">
            <div class="browser-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="browser-bar">
              <div class="browser-icon">
                <el-icon><Monitor /></el-icon>
              </div>
              <span>localhost:3000</span>
            </div>
          </div>
          <div class="preview-content">
            <div class="search-group">
              <el-input 
                placeholder="请输入搜索内容"
                class="preview-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <div class="search-hint">
                <el-icon><Loading /></el-icon>
                <span>自动获取一言中...</span>
              </div>
            </div>
          </div>
        </div>
        <div class="preview-note">
          <el-alert
            type="info"
            :closable="false"
            show-icon
          >
            预览效果仅供参考，部署后将自动获取随机一言内容
          </el-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Loading, Monitor, Aim, Connection, RefreshRight } from '@element-plus/icons-vue'

const isDeployed = ref(false)
const deploying = ref(false)

// 检查部署状态
const checkDeployment = async () => {
  try {
    const res = await fetch('/api/js/search-quote/deployed')
    const data = await res.json()
    isDeployed.value = data.deployed
  } catch (error) {
    console.error('检查部署状态失败:', error)
  }
}

// 部署处理
const handleDeploy = async () => {
  try {
    deploying.value = true
    const res = await fetch('/api/js/search-quote/deploy', {
      method: 'POST'
    })
    const data = await res.json()
    if (data.success) {
      isDeployed.value = true
      ElMessage.success('部署成功')
    } else {
      ElMessage.error(data.error || '部署失败')
    }
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
    const res = await fetch('/api/js/search-quote/undeploy', {
      method: 'POST'
    })
    const data = await res.json()
    if (data.success) {
      isDeployed.value = false
      ElMessage.success('取消部署成功')
    } else {
      ElMessage.error(data.error || '取消部署失败')
    }
  } catch (error) {
    console.error('取消部署失败:', error)
    ElMessage.error('取消部署失败')
  }
}

onMounted(() => {
  checkDeployment()
})
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.title-section h2 {
  font-size: 24px;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.title-section .description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.detail-content {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(600px, 2fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.params-section, .preview-section {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  overflow: auto;
}

.params-section h3, .preview-section h3 {
  font-size: 18px;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  font-weight: 500;
}

.preview-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.preview-header {
  background: #f5f5f5;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.browser-dots {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.browser-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff5f56;
}

.browser-dots span:nth-child(2) {
  background: #ffbd2e;
}

.browser-dots span:nth-child(3) {
  background: #27c93f;
}

.browser-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.browser-icon {
  color: var(--el-text-color-secondary);
}

.preview-content {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.search-group {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.search-hint .el-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.preview-note {
  width: 100%;
  max-width: 400px;
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
    align-items: flex-start;
    gap: 16px;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 功能列表样式 */
.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.feature-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.feature-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.feature-info p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

/* API列表样式 */
.api-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.api-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
}

.api-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-text-color-placeholder);
}

.api-status.success {
  background: var(--el-color-success);
}

.api-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.api-info p {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
}
</style> 