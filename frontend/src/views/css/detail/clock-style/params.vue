<template>
  <div class="params-editor">
    <el-form label-position="top">
      <el-form-item label="Logo上边距 (px)">
        <el-slider
          v-model="modelValue.logoMarginTop"
          :min="0"
          :max="1200"
          :step="10"
          show-input
          :show-input-controls="true"
          input-size="small"
          @change="handleParamsChange"
        />
      </el-form-item>
      
      <el-form-item label="Logo左边距 (px)">
        <el-slider
          v-model="modelValue.logoMarginLeft"
          :min="0"
          :max="2000"
          :step="10"
          show-input
          :show-input-controls="true"
          input-size="small"
          @change="handleParamsChange"
        />
      </el-form-item>
    </el-form>

    <div class="param-tip">
      提示：Logo初始位置在左上角(20px, 20px)，可通过调整上边距、左边距来移动位置
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    logoMarginTop: number
    logoMarginLeft: number
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
  (e: 'change'): void
}>()

function handleParamsChange() {
  emit('change')
}
</script>

<style scoped>
.params-editor {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.param-tip {
  margin-top: 16px;
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

:deep(.el-slider__input) {
  width: 100px !important;
}

:deep(.el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-input__inner) {
  text-align: center;
}
</style> 