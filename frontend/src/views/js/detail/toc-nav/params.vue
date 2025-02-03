<template>
  <div class="params-form">
    <div class="form-item">
      <label>背景颜色</label>
      <el-color-picker 
        v-model="localParams.theme.background"
        show-alpha
        @change="handleChange"
      />
    </div>
    <div class="form-item">
      <label>文字颜色</label>
      <el-color-picker 
        v-model="localParams.theme.text"
        show-alpha
        @change="handleChange"
      />
    </div>
    <div class="form-item">
      <label>悬停颜色</label>
      <el-color-picker 
        v-model="localParams.theme.hover"
        show-alpha
        @change="handleChange"
      />
    </div>
    <div class="form-item">
      <label>激活颜色</label>
      <el-color-picker 
        v-model="localParams.theme.active"
        show-alpha
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TocNavParams } from '../../../../types/js/toc-nav'

const props = defineProps<{
  modelValue: TocNavParams
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TocNavParams): void
}>()

// 使用本地状态
const localParams = ref<TocNavParams>(JSON.parse(JSON.stringify(props.modelValue)))

// 监听外部变化
watch(() => props.modelValue, (newValue) => {
  localParams.value = JSON.parse(JSON.stringify(newValue))
}, { deep: true })

// 处理颜色变化
const handleChange = () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(localParams.value)))
}
</script>

<style scoped>
.params-form {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-item label {
  width: 80px;
  color: #606266;
  font-size: 14px;
}
</style> 