<template>
  <div class="params-editor">
    <el-form label-position="top">
      <div class="param-group">
        <div class="param-group-title">
          <el-icon><Setting /></el-icon>
          <span>布局设置</span>
        </div>
        <el-form-item label="时钟显示">
          <el-switch
            v-model="localParams.showClock"
            @change="handleClockChange"
          />
        </el-form-item>
        <div class="param-row">
          <el-form-item label="搜索栏上边距">
            <div class="param-control">
              <el-slider
                v-model="localParams.searchMarginTop"
                :min="-100"
                :max="100"
                :step="1"
                :show-input="true"
                :show-input-controls="false"
                class="margin-slider"
              />
            </div>
          </el-form-item>
        </div>
        <div class="param-row">
          <el-form-item label="系统信息上边距">
            <div class="param-control">
              <el-slider
                v-model="localParams.systemMarginTop"
                :min="-100"
                :max="100"
                :step="1"
                :show-input="true"
                :show-input-controls="false"
                class="margin-slider"
              />
            </div>
          </el-form-item>
        </div>
      </div>

      <div class="preview-note">
        <el-icon><InfoFilled /></el-icon>
        <span>提示：负值向上移动，正值向下移动，数值越大移动距离越远</span>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Setting, InfoFilled } from '@element-plus/icons-vue'

interface LayoutAdjustParams {
  showClock: boolean
  searchMarginTop: number
  systemMarginTop: number
}

const props = defineProps<{
  modelValue: LayoutAdjustParams
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: LayoutAdjustParams): void
}>()

const localParams = ref<LayoutAdjustParams>({
  showClock: props.modelValue.showClock,
  searchMarginTop: props.modelValue.searchMarginTop || 0,
  systemMarginTop: props.modelValue.systemMarginTop || 0
})

function handleClockChange(value: boolean) {
  localParams.value.showClock = value;
  emit('update:modelValue', { ...localParams.value });
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (JSON.stringify(localParams.value) !== JSON.stringify(newValue)) {
      localParams.value = { ...newValue }
    }
  },
  { deep: true }
)

watch(
  localParams,
  (newValue) => {
    if (JSON.stringify(props.modelValue) !== JSON.stringify(newValue)) {
      emit('update:modelValue', { ...newValue })
    }
  },
  { deep: true }
)
</script>

<style scoped>
.params-editor {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.param-group {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.param-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.param-row {
  margin-bottom: 16px;
}

.param-control {
  display: flex;
  align-items: center;
  gap: 16px;
}

.margin-slider {
  width: 100%;
  min-width: 300px;
}

.preview-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #606266;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
  line-height: 1.4;
  font-size: 13px;
}

:deep(.el-slider__input) {
  width: 70px;
  margin-left: 12px;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  display: none;
}
</style> 