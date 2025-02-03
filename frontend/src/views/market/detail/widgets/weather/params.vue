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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

interface Config {
  keys: string[]
  location: string
}

const props = defineProps<{
  modelValue: Config
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Config): void
  (e: 'guide'): void
}>()

const config = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 从 HTML 文件读取配置
onMounted(async () => {
  try {
    const response = await fetch('/custom/helper/weather-widget/weather-widget.html')
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

const updatePreview = () => {
  emit('update:modelValue', config.value)
}

const showGuide = () => {
  emit('guide')
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
</style> 