<template>
  <div class="params-form">
    <el-button 
      plain
      type="info"
      class="guide-btn"
      @click="showGuide"
    >
      <el-icon><QuestionFilled /></el-icon>
      使用说明
    </el-button>

    <el-form label-position="top">
      <el-form-item label="API密钥">
        <el-input 
          v-model="config.keys[0]"
          placeholder="请输入和风天气API密钥"
          @input="updatePreview"
        />
      </el-form-item>

      <el-form-item label="API Host">
        <el-input 
          v-model="config.hosts[0]"
          placeholder="请输入主 Key 对应的 API Host (控制台查看)"
          @input="updatePreview"
        />
      </el-form-item>

      <el-form-item label="备用API密钥">
        <el-input 
          v-model="config.keys[1]"
          placeholder="请输入备用API密钥"
          @input="updatePreview"
        />
      </el-form-item>

      <el-form-item label="备用 API Host">
        <el-input 
          v-model="config.hosts[1]"
          placeholder="请输入备用 Key 对应的 API Host (控制台查看)"
          @input="updatePreview"
        />
      </el-form-item>

      <el-form-item label="位置坐标">
        <el-input 
          v-model="config.location"
          placeholder="经度,纬度 (如: 116.41,39.92)"
          @input="updatePreview"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="背景颜色">
            <el-color-picker 
              v-model="config.backgroundColor" 
              show-alpha
              @change="updatePreview"
              style="width: 100%;" 
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文字颜色">
            <el-color-picker 
              v-model="config.textColor" 
              @change="updatePreview"
              style="width: 100%;"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="最大宽度">
        <el-input 
          v-model="config.maxWidth"
          placeholder="例如: 600px, 80%, auto"
          @input="updatePreview"
        />
      </el-form-item>
    </el-form>

    <div class="save-actions">
      <el-button 
        type="primary" 
        @click="handleSave"
        :loading="saving"
      >
        保存配置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

interface Config {
  keys: string[]
  hosts: string[]
  location: string
  backgroundColor?: string
  textColor?: string
  maxWidth?: string
}

// 定义响应数据接口
interface SaveResponse {
  success: boolean
  url: string
}

const props = defineProps<{
  modelValue: Config
  widget: { url: string }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Config): void
  (e: 'update:url', url: string): void  // 添加 url 更新事件
  (e: 'guide'): void
}>()

const config = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const saving = ref(false)

// 从 HTML 文件读取配置
onMounted(async () => {
  try {
    // 读取目录下最新的配置文件
    const response = await fetch('/api/preview/weather-widget/latest')
    const html = await response.text()
    
    // 提取配置
    const keysMatch = html.match(/keys:\s*\[\s*'([^']*)',\s*'([^']*)'\s*\]/)
    const hostsMatch = html.match(/hosts:\s*\[\s*'([^']*)',\s*'([^']*)'\s*\]/)
    const locationMatch = html.match(/location:\s*'([^']*)'/)
    const backgroundColorMatch = html.match(/backgroundColor:\s*'([^']*)'/)
    const textColorMatch = html.match(/textColor:\s*'([^']*)'/)
    const maxWidthMatch = html.match(/maxWidth:\s*'([^']*)'/)
    
    if (keysMatch && locationMatch) {
      emit('update:modelValue', {
        keys: [keysMatch[1], keysMatch[2]],
        hosts: hostsMatch ? [hostsMatch[1], hostsMatch[2]] : ['', ''],
        location: locationMatch[1],
        backgroundColor: backgroundColorMatch ? backgroundColorMatch[1] : 'rgba(0, 0, 0, 0.5)',
        textColor: textColorMatch ? textColorMatch[1] : '#ffffff',
        maxWidth: maxWidthMatch ? maxWidthMatch[1] : '600px'
      })
    }
  } catch (error) {
    console.error('读取配置失败:', error)
  }
})

// 更新预览
const updatePreview = async () => {
  try {
    // 更新预览文件
    await axios.post('/api/preview/weather-widget/preview', {
      html: generateHtml(config.value)
    })
    emit('update:modelValue', config.value)
  } catch (error) {
    console.error('更新预览失败:', error)
  }
}

const showGuide = () => {
  emit('guide')
}

// 保存配置
const handleSave = async () => {
  try {
    saving.value = true
    const timestamp = Date.now()
    const filename = `weather-${timestamp}.html`
    
    const { data } = await axios.post<SaveResponse>('/api/preview/weather-widget', {
      html: generateHtml(config.value),
      filename
    })

    if (data.success) {
      // 延迟更新 url，等文件写入完成
      setTimeout(() => {
        emit('update:url', data.url)
        ElMessage.success('配置已保存')
      }, 500)
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 生成 HTML 内容
const generateHtml = (config: Config) => {
  return `
    <!-- 天气组件配置 -->
    const WEATHER_API = {
      keys: ['${config.keys[0]}','${config.keys[1]}'],
      hosts: ['${config.hosts[0]}', '${config.hosts[1]}'],
      currentKeyIndex: 0,
      baseUrl: 'https://devapi.qweather.com/v7',
      location: '${config.location}',
      backgroundColor: '${config.backgroundColor || 'rgba(0, 0, 0, 0.5)'}',
      textColor: '${config.textColor || '#ffffff'}',
      maxWidth: '${config.maxWidth || '600px'}',
      retryDelay: 60000,
      lastFailTime: {}
    };
  `
}
</script>

<style scoped>
.params-form {
  padding: 20px;
}

.guide-btn {
  margin-bottom: 20px;
  font-size: 15px;
  height: 36px;
  padding: 0 16px;
}

:deep(.el-icon) {
  margin-right: 6px;
  font-size: 16px;
}

:deep(.el-form-item) {
  margin-bottom: 12px;
}

:deep(.el-form-item__label) {
  padding-bottom: 8px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.save-actions {
  margin-top: 20px;
  text-align: right;
}
</style> 