<template>
  <div class="params-editor">
    <el-form label-position="top">
      <div class="params-grid">
        <!-- 第一列：预览设置 -->
        <div class="params-column">
          <!-- 预览参数组 -->
          <div class="param-group">
            <div class="param-group-title">
              <el-icon><Monitor /></el-icon>
              预览设置
            </div>
            <div class="preview-note">
              <el-icon><InfoFilled /></el-icon>
              以下参数仅用于预览效果，不会影响最终生成的样式
            </div>
            <el-form-item label="卡片背景色">
              <el-color-picker 
                v-model="localParams.cardBackground"
                :show-alpha="true"
                @active-change="(color: string) => handleColorUpdate(color, 'cardBackground')"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 第二列：放大效果 -->
        <div class="params-column">
          <div class="param-group">
            <div class="param-group-title">
              <el-icon><ZoomIn /></el-icon>
              放大效果
            </div>
            <el-form-item label="启用放大">
              <el-switch
                v-model="localParams.enableScale"
                @change="updateParams"
              />
            </el-form-item>
            
            <template v-if="localParams.enableScale">
              <el-form-item label="放大倍数">
                <el-slider
                  v-model="localParams.scaleSize"
                  :min="1"
                  :max="1.2"
                  :step="0.01"
                  @change="updateParams"
                />
              </el-form-item>
              
              <el-form-item label="动画间隔">
                <el-slider
                  v-model="localParams.scaleDelay"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  @change="updateParams"
                />
              </el-form-item>
            </template>
          </div>
        </div>

        <!-- 第三列：晃动效果 -->
        <div class="params-column">
          <div class="param-group">
            <div class="param-group-title">
              <el-icon><DCaret /></el-icon>
              晃动效果
            </div>
            <el-form-item label="晃动幅度">
              <el-slider
                v-model="localParams.shakeDegree"
                :min="0"
                :max="15"
                :step="0.5"
                @change="updateParams"
              />
            </el-form-item>
            
            <el-form-item label="晃动速度">
              <el-slider
                v-model="localParams.shakeSpeed"
                :min="0.2"
                :max="1"
                :step="0.1"
                @change="updateParams"
              />
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Monitor, InfoFilled, ZoomIn, DCaret } from '@element-plus/icons-vue'

interface CardHoverParams {
  cardBackground: string
  enableScale: boolean
  scaleSize: number
  scaleDelay: number
  shakeDegree: number
  shakeSpeed: number
}

const props = defineProps<{
  params: CardHoverParams
}>()

const emit = defineEmits<{
  (e: 'update:params', params: CardHoverParams): void
  (e: 'deploy'): void
  (e: 'reset'): void
}>()

// 本地参数状态
const localParams = ref<CardHoverParams>({
  cardBackground: props.params.cardBackground,
  enableScale: props.params.enableScale,
  scaleSize: props.params.scaleSize,
  scaleDelay: props.params.scaleDelay,
  shakeDegree: props.params.shakeDegree,
  shakeSpeed: props.params.shakeSpeed
})

// 监听外部参数变化
watch(() => props.params, (newParams) => {
  Object.assign(localParams.value, newParams)
}, { deep: true, immediate: true })

// 更新参数
const updateParams = () => {
  emit('update:params', Object.assign({}, localParams.value))
}

// 处理颜色变化
const handleColorUpdate = (color: string | null, key: keyof Pick<CardHoverParams, 'cardBackground'>) => {
  if (color !== null) {
    localParams.value[key] = color
    updateParams()
  }
}
</script>

<style scoped>
.params-editor {
  flex: 1;
  padding: 16px;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
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

.preview-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #909399;
  margin-bottom: 16px;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-size: 0.9rem;
  color: #606266;
}

:deep(.el-slider) {
  margin-top: 8px;
}

:deep(.el-color-picker) {
  width: 100%;
  height: 32px;
}

:deep(.el-color-picker__trigger) {
  width: 100%;
  padding: 0 4px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

:deep(.el-color-picker__color) {
  border: none;
  border-radius: 2px;
}

:deep(.el-color-picker__color-inner) {
  border-radius: 2px;
}

@media (max-width: 1400px) {
  .params-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .params-grid {
    grid-template-columns: 1fr;
  }
}
</style> 