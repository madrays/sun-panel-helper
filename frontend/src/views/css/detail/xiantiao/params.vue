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
              以下参数仅用于预览效果,不会影响最终生成的样式
            </div>
            <el-form-item label="卡片背景色">
              <el-color-picker 
                v-model="localParams.cardBackground"
                :show-alpha="true"
                @active-change="(color: string) => handleColorUpdate(color, 'cardBackground')"
              />
            </el-form-item>
            
            <el-form-item label="卡片透明度">
              <el-slider
                v-model="localParams.cardOpacity"
                :min="0"
                :max="1"
                :step="0.1"
                @change="updateParams"
              />
            </el-form-item>
          </div>

          <!-- 磨砂玻璃效果设置 -->
          <div class="param-group">
            <div class="param-group-title">
              <el-icon><Crop /></el-icon>
              磨砂玻璃效果
            </div>
            <el-form-item label="模糊强度">
              <el-slider
                v-model="localParams.blurAmount"
                :min="0"
                :max="20"
                :step="1"
                @change="updateParams"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 第二列：前置圆形装饰 -->
        <div class="params-column">
          <!-- 前置圆形装饰设置 -->
          <div class="param-group">
            <div class="param-group-title">
              <el-icon><Sunny /></el-icon>
              前置圆形装饰
            </div>
            <el-form-item label="前置圆形颜色">
              <el-color-picker 
                v-model="localParams.beforeCircleColor"
                :show-alpha="true"
                @active-change="(color: string) => handleColorUpdate(color, 'beforeCircleColor')"
              />
            </el-form-item>
            
            <el-form-item label="前置圆形阴影颜色">
              <el-color-picker 
                v-model="localParams.beforeCircleShadowColor"
                :show-alpha="true"
                @active-change="(color: string) => handleColorUpdate(color, 'beforeCircleShadowColor')"
              />
            </el-form-item>
            
            <el-form-item label="前置圆形大小">
              <el-slider
                v-model="localParams.beforeCircleSize"
                :min="50"
                :max="150"
                :step="1"
                @change="updateParams"
              />
            </el-form-item>
          </div>

          <!-- 前置圆形位置设置 -->
          <div class="param-group">
            <div class="param-group-title">
              <el-icon><Location /></el-icon>
              前置圆形位置
            </div>
            <el-form-item label="上下位置">
              <el-slider
                v-model="localParams.beforeCircleTop"
                :min="-100"
                :max="0"
                :step="1"
                @change="updateParams"
              />
            </el-form-item>
            
            <el-form-item label="左右位置">
              <el-slider
                v-model="localParams.beforeCircleRight"
                :min="-100"
                :max="0"
                :step="1"
                @change="updateParams"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 第三列：后置圆形边框 -->
        <div class="params-column">
          <!-- 后置圆形边框设置 -->
          <div class="param-group">
            <div class="param-group-title">
              <el-icon><CirclePlus /></el-icon>
              后置圆形边框
            </div>
            <el-form-item label="圆形边框颜色">
              <el-color-picker 
                v-model="localParams.afterCircleColor"
                :show-alpha="true"
                @active-change="(color: string) => handleColorUpdate(color, 'afterCircleColor')"
              />
            </el-form-item>
            
            <el-form-item label="圆形大小">
              <el-slider
                v-model="localParams.afterCircleSize"
                :min="20"
                :max="80"
                :step="1"
                @change="updateParams"
              />
            </el-form-item>
            
            <el-form-item label="上下位置">
              <el-slider
                v-model="localParams.afterCircleTop"
                :min="-50"
                :max="0"
                :step="1"
                @change="updateParams"
              />
            </el-form-item>
            
            <el-form-item label="左右位置">
              <el-slider
                v-model="localParams.afterCircleRight"
                :min="0"
                :max="100"
                :step="1"
                @change="updateParams"
              />
            </el-form-item>
            
            <el-form-item label="边框宽度">
              <el-slider
                v-model="localParams.afterCircleBorderWidth"
                :min="1"
                :max="10"
                :step="1"
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
import { Monitor, InfoFilled, Sunny, CirclePlus, Crop, Location } from '@element-plus/icons-vue'

interface XiantiaoParams {
  cardBackground: string
  cardOpacity: number
  beforeCircleColor: string
  beforeCircleShadowColor: string
  beforeCircleSize: number
  beforeCircleTop: number
  beforeCircleRight: number
  afterCircleColor: string
  afterCircleSize: number
  afterCircleTop: number
  afterCircleRight: number
  afterCircleBorderWidth: number
  blurAmount: number
}

const props = defineProps<{
  params: XiantiaoParams
}>()

const emit = defineEmits<{
  (e: 'update:params', params: XiantiaoParams): void
  (e: 'deploy'): void
  (e: 'reset'): void
}>()

// 本地参数状态
const localParams = ref<XiantiaoParams>({
  cardBackground: props.params.cardBackground,
  cardOpacity: props.params.cardOpacity,
  beforeCircleColor: props.params.beforeCircleColor,
  beforeCircleShadowColor: props.params.beforeCircleShadowColor,
  beforeCircleSize: props.params.beforeCircleSize,
  beforeCircleTop: props.params.beforeCircleTop,
  beforeCircleRight: props.params.beforeCircleRight,
  afterCircleColor: props.params.afterCircleColor,
  afterCircleSize: props.params.afterCircleSize,
  afterCircleTop: props.params.afterCircleTop,
  afterCircleRight: props.params.afterCircleRight,
  afterCircleBorderWidth: props.params.afterCircleBorderWidth,
  blurAmount: props.params.blurAmount
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
const handleColorUpdate = (color: string | null, key: keyof Pick<XiantiaoParams, 'cardBackground' | 'beforeCircleColor' | 'beforeCircleShadowColor' | 'afterCircleColor'>) => {
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
  margin: 0;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  height: 100%;
  overflow: hidden;
  margin: 0;
}

:deep(.el-form) {
  height: 100%;
  margin: 0;
  padding: 0;
}

.params-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
  margin: 0;
}

.param-group {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 0;
}

.param-group-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.param-group-title .el-icon {
  font-size: 16px;
}

.preview-note {
  font-size: 12px;
  color: #909399;
  margin: 4px 0 12px;
  padding: 8px 12px;
  background: #ecf5ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview-note .el-icon {
  color: #409eff;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
  line-height: 1.4;
  font-size: 13px;
}

:deep(.el-slider) {
  margin-top: 8px;
}

:deep(.el-color-picker) {
  width: 100%;
}

:deep(.el-color-picker__trigger) {
  width: 100%;
  height: 32px;
}

@media (max-width: 1200px) {
  .params-grid {
    grid-template-columns: 1fr;
    height: auto;
    overflow: visible;
    gap: 16px;
  }
  
  .params-column {
    height: auto;
    overflow: visible;
    gap: 16px;
  }
  
  .params-editor {
    height: auto;
    overflow: visible;
  }
}
</style>

