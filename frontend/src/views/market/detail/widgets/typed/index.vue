<template>
  <LayoutDetail
    title="打字机效果"
    description="支持自定义文本、字体、颜色等样式的打字机效果"
    :widget="widget"
    :is-applied-to-fixed="isAppliedToFixed"
    v-model:isAppliedToFree="isAppliedToFree"
    @reset="handleReset"
  >
    <template #params>
      <TypedParams v-model="widget" />
    </template>

    <template #preview>
      <TypedPreview :widget="widget" />
    </template>
  </LayoutDetail>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LayoutDetail from '../../layout.vue'
import TypedParams from './params.vue'
import TypedPreview from './preview.vue'
import type { Widget } from '@/types/market'

// 默认配置
const defaultWidget: Widget = {
  id: 'typed',
  name: '打字机效果',
  description: '支持自定义文本、字体、颜色等样式的打字机效果',
  type: 'link',
  url: 'https://www.widgets.link/#/typed?t=Hi，这里是Coco的导航页&bg=&tf=28&tt=ffffff&s=40&p=10&br=20&_b=true&pbg=FFFFFF00&bs=true&cf=16&cc=EEE8E8FF&c=随意享用吧~~',
  tags: ['文字', '动画', '特效']
}

const widget = ref<Widget>({ ...defaultWidget })
const isAppliedToFixed = ref(false)
const isAppliedToFree = ref(false)

// 重置参数
const handleReset = () => {
  widget.value = { ...defaultWidget }
}
</script> 