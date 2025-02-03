<template>
  <LayoutDetail
    title="热门资讯"
    description="实时展示热门新闻资讯，支持多种数据源和自定义样式"
    :widget="widget"
    :is-applied-to-fixed="isAppliedToFixed"
    v-model:isAppliedToFree="isAppliedToFree"
    @reset="handleReset"
  >
    <template #params>
      <HotNewsParams v-model="widget" />
    </template>

    <template #preview>
      <HotNewsPreview :widget="widget" />
    </template>
  </LayoutDetail>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LayoutDetail from '../../layout.vue'
import HotNewsParams from './params.vue'
import HotNewsPreview from './preview.vue'
import type { Widget } from '@/types/market'

// 默认配置
const defaultWidget: Widget = {
  id: 'hot-news',
  name: '热门资讯',
  description: '实时展示热门新闻资讯，支持多种数据源和自定义样式',
  type: 'link',
  url: 'https://www.widgets.link/#/tools-hot-news?contentBoxShadowColor=FFFFFF0D&ac=F0B17F00&tc=19A7CE8C&ttc=ffffff&tic=ffffff&thc=ffffff&cc=FBE8D900&bg=&_b=true',
  tags: ['资讯', '热门', '动态']
}

const widget = ref<Widget>({ ...defaultWidget })
const isAppliedToFixed = ref(false)
const isAppliedToFree = ref(false)

// 重置参数
const handleReset = () => {
  widget.value = { ...defaultWidget }
}
</script> 