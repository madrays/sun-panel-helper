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

      <el-form-item label="备用API密钥">
        <el-input 
          v-model="config.keys[1]"
          placeholder="请输入备用API密钥"
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
  location: string
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
    const locationMatch = html.match(/location:\s*'([^']*)'/)
    
    if (keysMatch && locationMatch) {
      emit('update:modelValue', {
        keys: [keysMatch[1], keysMatch[2]],
        location: locationMatch[1]
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
      currentKeyIndex: 0,
      baseUrl: 'https://devapi.qweather.com/v7',
      location: '${config.location}',
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
  margin-bottom: 20px;
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