<template>
  <div class="css-detail">
    <div class="detail-header">
      <div class="title-section">
        <h2>隐藏登录按钮</h2>
        <p class="description">在公开模式下隐藏登录按钮，需要手动添加 /login 进入登录页面</p>
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

    <div class="detail-content">
      <div class="preview-section">
        <h3>效果预览</h3>
        <Preview />
      </div>
      <div class="info-section">
        <h3>使用说明</h3>
        <div class="info-content">
          <el-alert
            type="success"
            :closable="false"
            show-icon
          >
            <template #title>
              作者信息
            </template>
            <div class="author-info">
              <p>作者：<a href="https://blog.ymz.icu/" target="_blank">与末</a></p>
              <p>优化适配：madrays</p>
            </div>
          </el-alert>

          <div class="guide-section">
            <h4>功能说明</h4>
            <ul>
              <li>部署后将自动隐藏页面右下角的登录按钮</li>
              <li>适用于需要隐藏登录入口的公开展示场景</li>
              <li>登录页面仍可通过手动添加 <code>/login</code> 访问</li>
              <li>无需任何配置，一键部署即可生效</li>
            </ul>
          </div>

          <div class="guide-section">
            <h4>注意事项</h4>
            <ul>
              <li>此组件不会影响登录功能的正常使用</li>
              <li>仅隐藏登录按钮，不会增加实际的安全性</li>
              <li>建议配合其他安全措施一起使用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Preview from './preview.vue'

// 组件状态
const isDeployed = ref(false)
const deploying = ref(false)

// 初始化时检查部署状态
onMounted(async () => {
  try {
    const response = await fetch('/api/js/hide-login/deployed')
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
    const res = await fetch('/api/js/hide-login/deploy', {
      method: 'POST'
    })
    if (!res.ok) throw new Error('部署失败')
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
    await fetch('/api/js/hide-login/undeploy', {
      method: 'POST'
    })
    const response = await fetch('/api/js/hide-login/deployed')
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
</script>

<style scoped>
/* 使用与其他组件相同的基础样式 */
.css-detail {
  padding: 20px;
  height: calc(100vh - 100px);
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
  grid-template-columns: minmax(600px, 2fr) minmax(300px, 1fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.preview-section,
.info-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-section h3,
.info-section h3 {
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

.info-content {
  padding: 20px;
  overflow-y: auto;
}

.author-info {
  padding: 4px 0;
}

.author-info p {
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.5;
}

.author-info a {
  color: #f56c6c;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.author-info a:hover {
  color: #ff7875;
  text-decoration: underline;
}

.guide-section {
  margin-top: 20px;
}

.guide-section h4 {
  font-size: 15px;
  color: #2c3e50;
  margin: 0 0 12px;
}

.guide-section ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.guide-section li {
  margin-bottom: 8px;
}

.guide-section code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  color: #f56c6c;
  font-family: monospace;
}

@media (max-width: 1200px) {
  .detail-content {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "preview"
      "info";
    overflow-y: auto;
  }

  .preview-section {
    grid-area: preview;
  }

  .info-section {
    grid-area: info;
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