<template>
  <div class="params-container">
    <div class="param-item">
      <div class="param-label">渐变色1</div>
      <input
        type="color"
        class="param-input color-input"
        v-model="localParams.color1"
        @input="handleChange"
      />
    </div>

    <div class="param-item">
      <div class="param-label">渐变色2</div>
      <input
        type="color"
        class="param-input color-input"
        v-model="localParams.color2"
        @input="handleChange"
      />
    </div>

    <div class="param-item">
      <div class="param-label">渐变色3</div>
      <input
        type="color"
        class="param-input color-input"
        v-model="localParams.color3"
        @input="handleChange"
      />
    </div>

    <div class="param-item">
      <div class="param-label">渐变色4</div>
      <input
        type="color"
        class="param-input color-input"
        v-model="localParams.color4"
        @input="handleChange"
      />
    </div>

    <div class="param-item">
      <div class="param-label">渐变角度</div>
      <div class="param-control">
        <input
          type="range"
          class="param-input range-input"
          min="0"
          max="360"
          step="1"
          v-model.number="localParams.angle"
          @input="handleChange"
        />
        <div class="param-value">{{ localParams.angle }}°</div>
      </div>
    </div>

    <div class="param-item">
      <div class="param-label">动画时长</div>
      <div class="param-control">
        <input
          type="range"
          class="param-input range-input"
          min="5"
          max="60"
          step="1"
          v-model.number="localParams.duration"
          @input="handleChange"
        />
        <div class="param-value">{{ localParams.duration }}秒</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface GradientBgParams {
  color1: string
  color2: string
  color3: string
  color4: string
  angle: number
  duration: number
}

const props = defineProps<{
  modelValue: GradientBgParams
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: GradientBgParams): void
}>()

const defaultParams: GradientBgParams = {
  color1: '#2C3E50',
  color2: '#2980B9',
  color3: '#8E44AD',
  color4: '#E74C3C',
  angle: 45,
  duration: 30
}

const localParams = ref<GradientBgParams>({ ...defaultParams })

onMounted(() => {
  localParams.value = { ...defaultParams, ...props.modelValue }
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    localParams.value = { ...newValue }
  }
}, { deep: true })

function handleChange() {
  emit('update:modelValue', { ...localParams.value })
}
</script>

<style scoped>
.params-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  flex: 1;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-label {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.param-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.param-value {
  font-size: 14px;
  color: #606266;
  min-width: 60px;
}

.param-input {
  width: 100%;
  border: none;
  outline: none;
  background: #f5f7fa;
  border-radius: 6px;
  transition: all 0.2s;
}

.color-input {
  height: 40px;
  padding: 4px;
  cursor: pointer;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.range-input {
  height: 6px;
  background: #e4e7ed;
  border-radius: 3px;
  cursor: pointer;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #409eff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
</style> 