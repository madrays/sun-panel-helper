<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import SocialistValuesPreview from '../../../category/click-effect/components/SocialistValuesPreview.vue'

// 定义API响应类型
interface ApiResponse<T = any> {
  success: boolean
  message?: string
  deployed?: boolean
  isDeployed?: boolean
  error?: string
  [key: string]: any
}

const router = useRouter()

const loading = ref(false)
const isDeployed = ref(false)
const deployLoading = ref(false)
const undeployLoading = ref(false)

// 获取特效状态
const fetchStatus = async () => {
  try {
    loading.value = true
    const response = await axios.get<ApiResponse>('/api/toolbox/click-effect/socialist-values/status')
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
    const response = await axios.post<ApiResponse>('/api/toolbox/click-effect/socialist-values/deploy')
    
    if (response.data.success) {
      ElMessage.success('点击特效部署成功')
      isDeployed.value = true
    } else if (response.data.error === 'ANOTHER_EFFECT_DEPLOYED') {
      ElMessageBox.confirm(
        '当前已有其他点击特效部署，是否取消其他特效部署并应用当前特效？',
        '确认',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          // 尝试部署，后端会自动处理冲突
          const deployRes = await axios.post<ApiResponse>('/api/toolbox/click-effect/socialist-values/deploy?force=true')
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
          '当前已有其他点击特效部署，是否取消其他特效部署并应用当前特效？',
          '确认',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(async () => {
          try {
            const deployRes = await axios.post<ApiResponse>('/api/toolbox/click-effect/socialist-values/deploy?force=true')
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
    const response = await axios.post<ApiResponse>('/api/toolbox/click-effect/socialist-values/undeploy')
    
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
    '确定要取消部署此点击特效吗？',
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

onMounted(() => {
  fetchStatus()
})
</script>

<template>
  <div class="footer-detail-container">
    <div class="page-header">
      <div class="back-button" @click="router.push('/dashboard/toolbox/category/click-effect')">
        <i class="fas fa-arrow-left"></i> 返回
      </div>
      <h1 class="page-title">社会主义核心价值观点击特效</h1>
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
                <p>当访问者在您的网站点击鼠标时，将会显示社会主义核心价值观的词汇，包括富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善。</p>
              </div>
            </div>
            <div class="instruction-item">
              <div class="instruction-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="instruction-content">
                <h3>兼容性</h3>
                <p>此点击特效兼容现代浏览器，包括Chrome、Firefox、Edge等。在移动设备上也可以正常工作。</p>
              </div>
            </div>
            <div class="instruction-item">
              <div class="instruction-icon">
                <i class="fas fa-exchange-alt"></i>
              </div>
              <div class="instruction-content">
                <h3>切换特效</h3>
                <p>一次只能激活一种点击特效。如果您部署了新的点击特效，之前的点击特效将自动被取消。</p>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 特效信息卡片 -->
        <el-card shadow="never" class="footer-info-card">
          <div class="footer-info">
            <h3>社会主义核心价值观点击特效</h3>
            <p class="footer-description">美观大方的点击特效，展示社会主义核心价值观，丰富网站交互体验。</p>
            
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
                <li>社会主义核心价值观词汇展示</li>
                <li>美观的点击动画和上升效果</li>
                <li>鼠标移动轨迹跟随特效</li>
                <li>支持左键和右键点击</li>
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
                  <i class="fas fa-mouse-pointer"></i>
                  <span>左键点击显示核心价值观词汇</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-hand-point-right"></i>
                  <span>右键点击也有不同效果</span>
                </div>
                <div class="feature-item">
                  <i class="fas fa-magic"></i>
                  <span>鼠标移动轨迹跟随特效</span>
                </div>
              </div>
              <div class="preview-instructions">
                <p>演示：请尝试在下方区域内点击鼠标左键或右键</p>
              </div>
            </div>
            
            <div class="site-preview">
              <div class="site-content">
                <!-- 使用预览组件 -->
                <SocialistValuesPreview />
              </div>
            </div>
            
            <div class="action-notice">
              <el-alert
                title="以上为预览效果，部署后点击特效将在您网站的所有页面生效"
                type="info"
                :closable="false"
                show-icon
              />
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
  font-size: 24px;
  color: #409EFF;
  flex-shrink: 0;
}

.instruction-content h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
}

.instruction-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

/* 预览区域 */
.preview-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-info {
  margin-bottom: 20px;
}

.effect-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.feature-item {
  display: flex;
  align-items: center;
  background-color: #f0f7ff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.feature-item i {
  margin-right: 8px;
  color: #409EFF;
}

.preview-instructions {
  font-size: 14px;
  color: #606266;
  margin-top: 10px;
}

.site-preview {
  height: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  overflow: hidden;
}

.site-content {
  flex: 1;
  background: linear-gradient(
    to bottom,
    rgba(245, 247, 250, 0.5) 10%,
    rgba(245, 247, 250, 0.3) 20%,
    rgba(245, 247, 250, 0.1) 30%
  );
  position: relative;
}

.action-notice {
  margin-top: 15px;
}

/* 特效信息卡片 */
.footer-info {
  padding: 10px 0;
}

.footer-info h3 {
  font-size: 16px;
  margin: 0 0 10px;
  color: #303133;
  font-weight: 600;
}

.footer-description {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
}

.author-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.author-tag {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
}

.author-tag i {
  margin-right: 5px;
  color: #409EFF;
}

.footer-features h4 {
  font-size: 15px;
  margin: 0 0 10px;
  color: #303133;
}

.footer-features ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  line-height: 1.6;
}

.footer-features li {
  margin-bottom: 5px;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
}
</style> 