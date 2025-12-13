<template>
  <div class="weather-detail">
    <!-- 头部区域 -->
    <div class="detail-header">
      <div class="title-section">
        <h2>智能天气助手</h2>
        <p class="description">多源数据融合的AI智能天气生活助手</p>
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
      <!-- 参数配置区域 -->
      <div class="params-section">
        <h3>参数配置</h3>
        <el-form label-position="top" :model="params" :rules="rules" ref="formRef">
          
          <el-divider content-position="left">基础API配置</el-divider>
          
          <el-form-item label="和风天气 API Key" prop="qweatherApiKey">
            <el-input v-model="params.qweatherApiKey" placeholder="请输入和风天气API Key" show-password />
            <div class="param-tip">前往 <a href="https://id.qweather.com/" target="_blank">和风天气控制台</a> 获取 (每月限额免费)</div>
          </el-form-item>

          <el-form-item label="和风天气 API Host" prop="qweatherApiHost">
            <el-input v-model="params.qweatherApiHost" placeholder="例如: devapi.qweather.com" />
            <div class="param-tip">通常为 devapi.qweather.com (开发版) 或 api.qweather.com (商业版)</div>
          </el-form-item>

          <el-form-item label="高德地图 API Key" prop="amapApiKey">
            <el-input v-model="params.amapApiKey" placeholder="请输入高德地图API Key" show-password />
            <div class="param-tip">前往 <a href="https://lbs.amap.com/" target="_blank">高德开放平台</a> 获取 (Web服务类型)</div>
          </el-form-item>

          <el-divider content-position="left">AI助手配置</el-divider>

          <el-form-item label="AI API URL" prop="openaiBaseUrl">
            <el-input v-model="params.openaiBaseUrl" placeholder="例如: https://api-inference.modelscope.cn/v1" />
            <div class="param-tip">OpenAI格式的API接口地址</div>
          </el-form-item>

          <el-form-item label="AI API Key" prop="openaiApiKey">
            <el-input v-model="params.openaiApiKey" placeholder="请输入AI API Key" show-password />
            <div class="param-tip">推荐使用 <a href="https://www.modelscope.cn" target="_blank">魔搭社区</a> 提供的免费API</div>
          </el-form-item>

          <el-form-item label="AI 模型名称" prop="openaiModel">
            <el-input v-model="params.openaiModel" placeholder="例如: Qwen/Qwen3-VL-235B-A22B-Instruct" />
          </el-form-item>

          <el-divider content-position="left">个人特征配置 (用于AI定制建议)</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="年龄" prop="userProfile.age">
                <el-input-number v-model="params.userProfile.age" :min="1" :max="120" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="userProfile.gender">
                <el-select v-model="params.userProfile.gender" style="width: 100%">
                  <el-option label="男" value="男" />
                  <el-option label="女" value="女" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="通勤时间" prop="userProfile.commuteDays">
            <el-input v-model="params.userProfile.commuteDays" placeholder="例如: 周一至周五" />
          </el-form-item>

          <el-form-item label="通勤方式" prop="userProfile.commuteMethod">
            <el-input v-model="params.userProfile.commuteMethod" placeholder="例如: 地铁、公交、驾车" />
          </el-form-item>

          <el-form-item label="核心需求" prop="userProfile.coreNeeds">
            <el-input v-model="params.userProfile.coreNeeds" type="textarea" :rows="2" placeholder="例如: 舒适生活、高效出行、健康防护" />
          </el-form-item>

          <el-divider content-position="left">默认位置</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
               <el-form-item label="默认坐标 (经度,纬度)" prop="defaultLocation">
                  <el-input v-model="params.defaultLocation" placeholder="116.41,39.92" />
               </el-form-item>
            </el-col>
            <el-col :span="12">
               <el-form-item label="位置名称" prop="defaultLocationName">
                  <el-input v-model="params.defaultLocationName" placeholder="北京" />
               </el-form-item>
            </el-col>
          </el-row>

        </el-form>
      </div>

      <!-- 预览区域 -->
      <div class="preview-section">
        <h3>效果预览</h3>
        <div class="preview-container">
           <div class="placeholder-wrapper">
              <img src="/images/weather-preview.png" alt="Weather Preview" class="preview-image" />
              <div class="placeholder-text">
                <p>此组件依赖第三方API，无法在本地实时预览。</p>
                <p>部署后，它将在您的面板右下角通过悬浮图标展示。</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const isDeployed = ref(false)
const deploying = ref(false)
const formRef = ref()

// 默认参数
const defaultParams = {
  qweatherApiKey: '',
  qweatherApiHost: 'devapi.qweather.com',
  amapApiKey: '',
  openaiApiKey: '',
  openaiModel: 'Qwen/Qwen2.5-7B-Instruct',
  openaiBaseUrl: 'https://api.siliconflow.cn/v1',
  userProfile: {
    age: 26,
    gender: '男',
    commuteDays: '周一至周五',
    commuteMethod: '地铁',
    coreNeeds: '舒适生活、便利出行'
  },
  defaultLocation: '116.41,39.92',
  defaultLocationName: '北京'
}

const params = reactive({ ...defaultParams })

const rules = {
  qweatherApiKey: [{ required: true, message: '请输入和风天气API Key', trigger: 'blur' }],
  qweatherApiHost: [{ required: true, message: '请输入和风天气API Host', trigger: 'blur' }],
  amapApiKey: [{ required: true, message: '请输入高德地图API Key', trigger: 'blur' }],
  openaiApiKey: [{ required: true, message: '请输入AI API Key', trigger: 'blur' }]
}

// 检查部署状态
const checkDeployment = async () => {
  try {
    const res = await fetch('/api/js/weather/deployed')
    const data = await res.json()
    isDeployed.value = data.deployed
  } catch (error) {
    console.error('检查部署状态失败:', error)
  }
}

// 重置处理
const handleReset = () => {
  Object.assign(params, defaultParams)
}

// 部署处理
const handleDeploy = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        deploying.value = true
        const res = await fetch('/api/js/weather/deploy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
        const data = await res.json()
        if (!res.ok) {
          if (data.errors) {
            ElMessage.error(data.errors.join('\n'))
          } else {
            ElMessage.error(data.error || '部署失败')
          }
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
  })
}

// 取消部署处理
const handleUndeploy = async () => {
  try {
    await fetch('/api/js/weather/undeploy', {
      method: 'POST'
    })
    const response = await fetch('/api/js/weather/deployed')
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

// 加载保存的配置
const loadConfig = async () => {
  try {
    const res = await fetch('/api/js/weather/config')
    if (res.ok) {
      const data = await res.json()
      // 如果有保存的配置，则覆盖默认值
      if (Object.keys(data).length > 0) {
        Object.assign(params, data)
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

onMounted(async () => {
  await loadConfig()
  await checkDeployment()
})
</script>

<style scoped>
.weather-detail {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
  background: var(--bg-base);
}

/* 头部样式 */
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

/* 内容布局 */
.detail-content {
  display: grid;
  grid-template-columns: minmax(400px, 1fr) minmax(400px, 1fr);
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

.param-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

.param-tip a {
  color: var(--el-color-primary);
  text-decoration: none;
}

/* 预览窗口样式 */
.preview-container {
  width: 100%;
  height: 500px;
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-wrapper {
  text-align: center;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.placeholder-text p {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin: 5px 0;
}

.preview-section h3 {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-section h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

@media (max-width: 1024px) {
  .detail-content {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "params"
      "preview";
  }
}
</style>
