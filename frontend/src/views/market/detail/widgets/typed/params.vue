<template>
  <div class="params-form">
    <el-form label-position="top">
      <el-form-item label="标题">
        <el-input v-model="title" @input="updateUrl" />
      </el-form-item>

      <el-form-item label="标题字体大小">
        <el-input-number 
          v-model="titleSize" 
          :min="12" 
          :max="48" 
          @change="updateUrl"
          :controls="true"
        />
      </el-form-item>

      <el-form-item label="标题颜色">
        <el-color-picker 
          v-model="titleColor" 
          format="hex"
          :predefine="[]"
          class="color-picker-long"
          @change="updateUrl"
        />
      </el-form-item>

      <el-form-item label="正文内容">
        <el-input v-model="content" @input="updateUrl" />
      </el-form-item>

      <el-form-item label="正文字体大小">
        <el-input-number 
          v-model="contentSize" 
          :min="12" 
          :max="48" 
          @change="updateUrl"
          :controls="true"
        />
      </el-form-item>

      <el-form-item label="正文颜色">
        <el-color-picker 
          v-model="contentColor" 
          format="hex"
          :predefine="[]"
          class="color-picker-long"
          @change="updateUrl"
        />
      </el-form-item>

      <el-form-item label="打字速度">
        <el-input-number 
          v-model="speed" 
          :min="10" 
          :max="200" 
          :step="10" 
          @change="updateUrl"
          :controls="true"
        />
      </el-form-item>

      <el-form-item label="标题与正文间距">
        <el-input-number 
          v-model="spacing" 
          :min="0" 
          :max="50" 
          @change="updateUrl"
          :controls="true"
        />
      </el-form-item>

      <el-form-item label="圆角弧度">
        <el-input-number 
          v-model="borderRadius" 
          :min="0" 
          :max="50" 
          @change="updateUrl"
          :controls="true"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WidgetConfig } from '@/types/market'

const props = defineProps<{
  modelValue: WidgetConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: WidgetConfig): void
}>()

// 转换颜色值为hex格式
const toHex = (color: string) => {
  if (!color) return ''
  if (color.startsWith('rgba')) {
    const matches = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/)
    if (matches) {
      const [_, r, g, b] = matches
      return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('')
    }
  }
  return color
}

// 解析当前URL中的参数
const parseCurrentUrl = () => {
  const url = new URL(props.modelValue.url)
  return {
    title: url.searchParams.get('t') || 'Hi，这里是Coco的导航页',
    titleSize: parseInt(url.searchParams.get('tf') || '28'),
    titleColor: '#' + (url.searchParams.get('tt') || 'ffffff'),
    content: url.searchParams.get('c') || '随意享用吧~~',
    contentSize: parseInt(url.searchParams.get('cf') || '16'),
    contentColor: '#' + (url.searchParams.get('cc') || 'EEE8E8FF'),
    speed: parseInt(url.searchParams.get('s') || '40'),
    spacing: parseInt(url.searchParams.get('p') || '10'),
    borderRadius: parseInt(url.searchParams.get('br') || '20')
  }
}

const { title: initTitle, titleSize: initTitleSize, titleColor: initTitleColor,
        content: initContent, contentSize: initContentSize, contentColor: initContentColor,
        speed: initSpeed, spacing: initSpacing, borderRadius: initRadius } = parseCurrentUrl()

const title = ref(initTitle)
const titleSize = ref(initTitleSize)
const titleColor = ref(initTitleColor)
const content = ref(initContent)
const contentSize = ref(initContentSize)
const contentColor = ref(initContentColor)
const speed = ref(initSpeed)
const spacing = ref(initSpacing)
const borderRadius = ref(initRadius)

const updateUrl = () => {
  const baseUrl = 'https://www.widgets.link/#/typed'
  const params = new URLSearchParams()
  
  // 按照固定顺序设置参数
  params.set('t', title.value)
  params.set('bg', '')
  params.set('tf', titleSize.value.toString())
  params.set('tt', toHex(titleColor.value).replace('#', ''))
  params.set('s', speed.value.toString())
  params.set('p', spacing.value.toString())
  params.set('br', borderRadius.value.toString())
  params.set('_b', 'true')
  params.set('pbg', 'FFFFFF00')
  params.set('bs', 'true')
  params.set('cf', contentSize.value.toString())
  params.set('cc', toHex(contentColor.value).replace('#', ''))
  params.set('c', content.value)

  emit('update:modelValue', {
    ...props.modelValue,
    url: `${baseUrl}?${params.toString()}`
  })
}
</script>

<style scoped>
.params-form {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  padding-bottom: 8px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.color-picker-long) {
  width: 100%;
  height: 40px;
}

:deep(.color-picker-long .el-color-picker__trigger) {
  width: 100%;
  height: 100%;
  padding: 4px;
}

:deep(.color-picker-long .el-color-picker__color) {
  border-radius: 4px;
}
</style> 