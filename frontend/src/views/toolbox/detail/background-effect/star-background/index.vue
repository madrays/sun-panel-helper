<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 定义API响应类型
interface ApiResponse<T = any> {
  success: boolean
  message?: string
  deployed?: boolean
  isDeployed?: boolean
  error?: string
  [key: string]: any
}

// 路由
const router = useRouter()

// 状态
const loading = ref(false)
const isDeployed = ref(false)
const deployLoading = ref(false)
const undeployLoading = ref(false)
const previewLoading = ref(false)
const previewHtml = ref('')

// 获取特效状态
const fetchStatus = async () => {
  try {
    loading.value = true
    const response = await axios.get<ApiResponse>('/api/toolbox/background-effect/star-background/status')
    if (response.data.success) {
      isDeployed.value = response.data.isDeployed || false
    } else {
      ElMessage.error('获取特效状态失败：' + response.data.message)
    }
  } catch (error: any) {
    console.error('获取特效状态失败', error)
    ElMessage.error('获取特效状态失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 部署特效
const deployEffect = async () => {
  try {
    deployLoading.value = true
    const response = await axios.post<ApiResponse>('/api/toolbox/background-effect/star-background/deploy')
    
    if (response.data.success) {
      ElMessage.success('背景特效部署成功')
      isDeployed.value = true
    } else if (response.data.error === 'ANOTHER_EFFECT_DEPLOYED') {
      ElMessageBox.confirm(
        '当前已有其他背景特效部署，是否取消其他特效部署并应用当前特效？',
        '确认',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          // 尝试部署，后端会自动处理冲突
          const deployRes = await axios.post<ApiResponse>('/api/toolbox/background-effect/star-background/deploy?force=true')
          if (deployRes.data.success) {
            ElMessage.success('部署成功')
            isDeployed.value = true
          } else {
            ElMessage.error('部署失败: ' + (deployRes.data.message || '未知错误'))
          }
        } catch (e: any) {
          console.error('处理特效冲突失败:', e)
          if (e.response && e.response.data) {
            ElMessage.error('操作失败: ' + (e.response.data.message || '请重试'))
          } else {
            ElMessage.error('操作失败，请重试')
          }
        }
      }).catch(() => {
        // 用户取消
      })
    } else {
      // 显示后端返回的具体错误信息
      ElMessage.error('部署失败：' + (response.data.message || '未知错误'))
    }
  } catch (error: any) {
    console.error('部署失败', error)
    // 改进错误处理，尝试从错误响应中获取更多信息
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.message || '未知错误'
      const errorCode = error.response.data.error
      
      // 检查是否是互斥错误
      if (errorCode === 'ANOTHER_EFFECT_DEPLOYED') {
        ElMessageBox.confirm(
          '当前已有其他背景特效部署，是否取消其他特效部署并应用当前特效？',
          '确认',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(async () => {
          try {
            const deployRes = await axios.post<ApiResponse>('/api/toolbox/background-effect/star-background/deploy?force=true')
            if (deployRes.data.success) {
              ElMessage.success('部署成功')
              isDeployed.value = true
            } else {
              ElMessage.error('部署失败: ' + (deployRes.data.message || '未知错误'))
            }
          } catch (e: any) {
            console.error('处理特效冲突失败:', e)
            ElMessage.error('操作失败，请重试')
          }
        }).catch(() => {
          // 用户取消
        })
        return
      }
      
      // 显示详细错误信息
      ElMessage.error('部署失败: ' + errorMessage)
    } else {
      ElMessage.error('部署失败，请稍后重试')
    }
  } finally {
    deployLoading.value = false
  }
}

// 取消部署
const undeployEffect = async () => {
  try {
    undeployLoading.value = true
    const response = await axios.post<ApiResponse>('/api/toolbox/background-effect/star-background/undeploy')
    
    if (response.data.success) {
      ElMessage.success('已取消部署')
      isDeployed.value = false
    } else {
      ElMessage.error('取消部署失败: ' + (response.data.message || '未知错误'))
    }
  } catch (error: any) {
    console.error('取消部署失败', error)
    if (error.response && error.response.data) {
      ElMessage.error('取消部署失败: ' + (error.response.data.message || '未知错误'))
    } else {
      ElMessage.error('取消部署失败，请稍后重试')
    }
  } finally {
    undeployLoading.value = false
  }
}

// 确认取消部署
const confirmUndeploy = () => {
  ElMessageBox.confirm(
    '确定要取消部署此背景特效吗？',
    '取消部署',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      undeployEffect()
    })
    .catch(() => {})
}

// 加载预览
const loadPreview = async () => {
  try {
    previewLoading.value = true
    const response = await axios.get('/api/toolbox/background-effect/star-background/preview', {
      responseType: 'text'
    })
    previewHtml.value = response.data as string
  } catch (error: any) {
    console.error('加载预览失败', error)
    ElMessage.error('加载预览失败: ' + (error.message || '未知错误'))
  } finally {
    previewLoading.value = false
  }
}

onMounted(() => {
  fetchStatus()
  loadPreview() 
})
</script>

<template>
  <div class="footer-detail-container">
    <div class="page-header">
      <div class="back-button" @click="router.push('/dashboard/toolbox/background-effect')">
        <i class="fas fa-arrow-left"></i> 返回
      </div>
      <h1 class="page-title">星空背景特效</h1>
      <div class="deploy-actions">
        <el-button 
          v-if="!isDeployed" 
          type="primary" 
          :loading="deployLoading" 
          @click="deployEffect"
        >
          部署特效
        </el-button>
        <el-button-group v-else>
          <el-button 
            type="primary" 
            :loading="deployLoading" 
            @click="deployEffect"
          >
            重新部署
          </el-button>
          <el-button 
            type="danger" 
            :loading="undeployLoading" 
            @click="confirmUndeploy"
          >
            取消部署
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="content-layout">
      <div class="config-section">
        <!-- 特效说明卡片 -->
        <el-card shadow="never" class="config-card">
          <template #header>
            <div class="card-header">
              <span>特效说明</span>
            </div>
          </template>
          
          <div class="instructions-list">
            <div class="instruction-item">
              <div class="instruction-icon">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="instruction-content">
                <h3>特效内容</h3>
                <p>这是一款轻量级的星空背景特效，为您的网站增添梦幻星空效果。特效会在网站背景生成流动的星星，营造出浩瀚宇宙的氛围。</p>
              </div>
            </div>
            <div class="instruction-item">
              <div class="instruction-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="instruction-content">
                <h3>兼容性</h3>
                <p>此背景特效兼容现代浏览器，包括Chrome、Firefox、Edge等。在移动设备上也可以正常工作。</p>
              </div>
            </div>
            <div class="instruction-item">
              <div class="instruction-icon">
                <i class="fas fa-exchange-alt"></i>
              </div>
              <div class="instruction-content">
                <h3>切换特效</h3>
                <p>一次只能激活一种背景特效。如果您部署了新的背景特效，之前的背景特效将自动被取消。</p>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 特效信息卡片 -->
        <el-card shadow="never" class="footer-info-card">
          <div class="footer-info">
            <h3>星空背景特效</h3>
            <p class="footer-description">梦幻星空效果，为您的网站增添浩瀚宇宙氛围，打造独特视觉体验。</p>
            
            <div class="author-tags">
              <div class="author-tag">
                <i class="fas fa-user"></i>
                <span>作者：madrays</span>
              </div>
              <div class="author-tag">
                <i class="fas fa-code"></i>
                <span>开发：madrays</span>
              </div>
              <div class="author-tag">
                <i class="fas fa-calendar"></i>
                <span>更新：2025-04-19</span>
              </div>
            </div>
            
            <div class="footer-features">
              <h4>特性</h4>
              <ul>
                <li>流畅的星星动画，星星会从左下方流向右上方</li>
                <li>星星闪烁效果，增强视觉体验</li>
                <li>深色背景，突出星星效果</li>
                <li>轻量级设计，不影响网站加载速度</li>
                <li>兼容各主流浏览器和移动设备</li>
              </ul>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="preview-module-section">
        <el-card shadow="never" class="preview-card">
          <template #header>
            <div class="card-header">
              <span>效果预览</span>
            </div>
          </template>
          
          <div class="preview-container">
            <div class="preview-info">
              <div class="effect-features">
                <div class="feature-item">
                  <i class="fas fa-star"></i>
                  <span>动态星星流动效果</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-asterisk"></i>
                  <span>星星闪烁动画</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-moon"></i>
                  <span>深色宇宙背景</span>
                </div>
              </div>
              <div class="preview-instructions">
                <p>演示：下方区域展示星空背景效果</p>
              </div>
            </div>
            
            <div class="site-preview">
              <div class="site-content">
                <iframe 
                  v-if="previewHtml" 
                  class="preview-iframe" 
                  :srcdoc="previewHtml" 
                  frameborder="0"
                ></iframe>
                <div v-else-if="previewLoading" class="preview-loading">
                  <el-icon class="is-loading"><i class="el-icon-loading"></i></el-icon>
                  <span>加载预览中...</span>
                </div>
                <div v-else class="preview-error">
                  <i class="fas fa-exclamation-circle"></i>
                  <span>预览加载失败</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer-detail-container {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  font-size: 14px;
  color: #409EFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.back-button i {
  margin-right: 5px;
}

.page-title {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.config-card, .preview-card, .footer-info-card {
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 特效说明 */
.instructions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.instruction-item {
  display: flex;
  gap: 15px;
}

.instruction-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f7ff;
  border-radius: 50%;
  color: #409EFF;
  font-size: 18px;
}

.instruction-content h3 {
  margin: 0 0 5px;
  font-size: 16px;
  color: #303133;
}

.instruction-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

/* 特效信息 */
.footer-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #303133;
}

.footer-description {
  margin: 0 0 15px;
  color: #606266;
  font-size: 14px;
}

.author-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.author-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #606266;
}

.footer-features h4 {
  font-size: 16px;
  margin: 0 0 10px;
  color: #303133;
}

.footer-features ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
}

.footer-features li {
  margin-bottom: 5px;
}

/* 预览模块 */
.preview-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.preview-info {
  margin-bottom: 15px;
}

.effect-features {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  background-color: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
}

.preview-instructions {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.site-preview {
  height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;
  margin-bottom: 15px;
}

.site-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-loading,
.preview-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 14px;
  color: #909399;
}

.preview-loading i,
.preview-error i {
  font-size: 24px;
  margin-bottom: 10px;
}

.action-notice {
  margin-top: 10px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
}
</style> 