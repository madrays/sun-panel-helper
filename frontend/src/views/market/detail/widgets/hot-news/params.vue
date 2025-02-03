<template>
  <div class="params-form">
    <el-form label-position="top">
      <el-form-item label="卡片颜色">
        <el-color-picker 
          v-model="cardColor" 
          show-alpha 
          format="hex"
          :predefine="[]"
          class="color-picker-long"
          @change="updateUrl"
        />
      </el-form-item>

      <el-form-item label="分类高亮颜色">
        <el-color-picker 
          v-model="tagBgColor" 
          show-alpha 
          format="hex"
          :predefine="[]"
          class="color-picker-long"
          @change="updateUrl"
        />
      </el-form-item>

      <el-form-item label="分类文字颜色">
        <el-color-picker 
          v-model="tagTextColor" 
          format="hex"
          :predefine="[]"
          class="color-picker-long"
          @change="updateUrl"
        />
      </el-form-item>

      <el-form-item label="新闻标题文字颜色">
        <el-color-picker 
          v-model="titleColor" 
          format="hex"
          :predefine="[]"
          class="color-picker-long"
          @change="updateUrl"
        />
      </el-form-item>

      <el-form-item label="新闻标题悬浮颜色">
        <el-color-picker 
          v-model="titleHoverColor" 
          format="hex"
          :predefine="[]"
          class="color-picker-long"
          @change="updateUrl"
        />
      </el-form-item>

      <el-form-item label="新闻面板颜色">
        <el-color-picker 
          v-model="contentBgColor" 
          show-alpha 
          format="hex"
          :predefine="[]"
          class="color-picker-long"
          @change="updateUrl"
        />
      </el-form-item>

      <el-form-item label="新闻面板阴影颜色">
        <el-color-picker 
          v-model="shadowColor" 
          show-alpha 
          format="hex"
          :predefine="[]"
          class="color-picker-long"
          @change="updateUrl"
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

// 转换颜色值为8位hex格式（包含透明度）
const toHex8 = (color: string) => {
  if (!color) return ''
  if (color.startsWith('rgba')) {
    const matches = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
    if (matches) {
      const [_, r, g, b, a] = matches
      const alpha = Math.round(parseFloat(a) * 255).toString(16).padStart(2, '0')
      return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('') + alpha
    }
  }
  return color
}

// 解析当前URL中的参数
const parseCurrentUrl = () => {
  const url = new URL(props.modelValue.url)
  return {
    cardColor: '#' + (url.searchParams.get('ac') || 'F0B17F00'),
    tagBgColor: '#' + (url.searchParams.get('tc') || '19A7CE8C'),
    tagTextColor: '#' + (url.searchParams.get('ttc') || 'ffffff'),
    titleColor: '#' + (url.searchParams.get('tic') || 'ffffff'),
    titleHoverColor: '#' + (url.searchParams.get('thc') || 'ffffff'),
    contentBgColor: '#' + (url.searchParams.get('cc') || 'FBE8D900'),
    shadowColor: '#' + (url.searchParams.get('contentBoxShadowColor') || 'FFFFFF0D')
  }
}

const { cardColor: initCard, tagBgColor: initTagBg, tagTextColor: initTagText, 
        titleColor: initTitle, titleHoverColor: initHover, 
        contentBgColor: initContent, shadowColor: initShadow } = parseCurrentUrl()

const cardColor = ref(initCard)
const tagBgColor = ref(initTagBg)
const tagTextColor = ref(initTagText)
const titleColor = ref(initTitle)
const titleHoverColor = ref(initHover)
const contentBgColor = ref(initContent)
const shadowColor = ref(initShadow)

const updateUrl = () => {
  const baseUrl = 'https://www.widgets.link/#/tools-hot-news'
  const params = new URLSearchParams()
  
  // 按照固定顺序设置参数
  params.set('contentBoxShadowColor', toHex8(shadowColor.value).replace('#', ''))
  params.set('ac', toHex8(cardColor.value).replace('#', ''))
  params.set('tc', toHex8(tagBgColor.value).replace('#', ''))
  params.set('ttc', toHex8(tagTextColor.value).replace('#', ''))
  params.set('tic', toHex8(titleColor.value).replace('#', ''))
  params.set('thc', toHex8(titleHoverColor.value).replace('#', ''))
  params.set('cc', toHex8(contentBgColor.value).replace('#', ''))
  params.set('bg', '')
  params.set('_b', 'true')

  const newUrl = `${baseUrl}?${params.toString()}`

  emit('update:modelValue', {
    ...props.modelValue,
    url: newUrl
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