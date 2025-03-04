<template>
  <div class="market-page">
    <!-- 头部区域 -->
    <div class="page-header">
      <div class="title-section">
        <h2>组件市场</h2>
        <p class="description">精选组件，一键应用到固定组件或自由组件</p>
      </div>
    </div>

    <!-- 组件列表 -->
    <div class="widgets-grid">

      <!-- 热门资讯组件 -->
      <HotNewsCard
        :is-applied-to-fixed="isAppliedToFixed('hot-news')"
        :is-applied-to-free="isAppliedToFree('hot-news')"
        @click="() => handleWidgetClick('hot-news')"
      />

      <!-- 打字机组件 -->
      <TypedCard
        :is-applied-to-fixed="isAppliedToFixed('typed')"
        :is-applied-to-free="isAppliedToFree('typed')"
        @click="() => handleWidgetClick('typed')"
      />

      <!-- 天气预报组件 -->
      <WeatherCard
        :is-applied-to-fixed="isAppliedToFixed('weather')"
        :is-applied-to-free="isAppliedToFree('weather')"
        @click="() => handleWidgetClick('weather')"
      />

      <!-- QB下载器状态组件 -->
      <QBStatusCard
        :is-applied-to-fixed="isAppliedToFixed('qb-status')"
        :is-applied-to-free="isAppliedToFree('qb-status')"
        @click="() => handleWidgetClick('qb-status')"
      />

      <!-- TR下载器状态组件 -->
      <TRStatusCard
        :is-applied-to-fixed="isAppliedToFixed('tr-status')"
        :is-applied-to-free="isAppliedToFree('tr-status')"
        @click="() => handleWidgetClick('tr-status')"
      />

      <!-- 轻轻小组件 -->
      <WidgetsLinkCard
        :is-applied-to-fixed="isAppliedToFixed('widgets-link')"
        :is-applied-to-free="isAppliedToFree('widgets-link')"
        @click="() => handleWidgetClick('widgets-link')"
      />

      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import HotNewsCard from './preview/widgets/HotNewsCard.vue'
import TypedCard from './preview/widgets/TypedCard.vue'
import WeatherCard from './preview/widgets/WeatherCard.vue'
import QBStatusCard from './preview/widgets/QBStatusCard.vue'
import TRStatusCard from './preview/widgets/TRStatusCard.vue'
import WidgetsLinkCard from './preview/widgets/WidgetsLinkCard.vue'

const router = useRouter()
const route = useRoute()

// 使用正确的类型
const fixedWidgets = ref<string[]>([])
const freeWidgets = ref<string[]>([])

// 加载固定组件状态
const loadFixedWidgets = async () => {
  try {
    const res = await request({
      url: '/api/fixed/pool',
      method: 'GET'
    })
    
    const widgets = res.widgets || []
    
    fixedWidgets.value = widgets.map((w: { name: string }) => w.name)
  } catch (error) {
  }
}

// 加载自由组件状态
const loadFreeWidgets = async () => {
  try {
    const res = await request({
      url: '/api/free/pool',
      method: 'GET'
    })
    
    const widgets = res.widgets || []
    
    freeWidgets.value = widgets.map((w: { name: string }) => w.name)
  } catch (error) {
  }
}

// 检查组件是否已应用到固定组件
const isAppliedToFixed = (widgetId: string): boolean => {
  // QB下载器状态组件和TR下载器状态组件特殊处理，不进行检测
  if (widgetId === 'qb-status' || widgetId === 'tr-status') {
    return false
  }
  
  const widgetNames: Record<string, string> = {
    'widgets-link': '轻轻小组件',
    'hot-news': '热门资讯',
    'typed': '打字机效果',
    'weather': '天气预报',
    'qb-status': 'QB下载器状态',
    'tr-status': 'Transmission下载器状态'
  }
  const isApplied = fixedWidgets.value.includes(widgetNames[widgetId])
  return isApplied
}

// 检查组件是否已应用到自由组件
const isAppliedToFree = (widgetId: string): boolean => {
  // QB下载器状态组件和TR下载器状态组件特殊处理，不进行检测
  if (widgetId === 'qb-status' || widgetId === 'tr-status') {
    return false
  }
  
  const widgetNames: Record<string, string> = {
    'widgets-link': '轻轻小组件',
    'hot-news': '热门资讯',
    'typed': '打字机效果',
    'weather': '天气预报',
    'qb-status': 'QB下载器状态',
    'tr-status': 'Transmission下载器状态'
  }
  const isApplied = freeWidgets.value.includes(widgetNames[widgetId])
  return isApplied
}

// 点击组件卡片
const handleWidgetClick = (widgetId: string) => {
  router.push(`/dashboard/market/${widgetId}`)
}

// 组件加载时获取状态
onMounted(() => {
  loadFixedWidgets()
  loadFreeWidgets()
})

// 监听路由变化时重新加载
watch(route, () => {
  loadFixedWidgets()
  loadFreeWidgets()
})
</script>

<style lang="scss" scoped>
.market-page {
  padding: 24px;
  min-height: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.title-section {
  margin-bottom: 16px;

  h2 {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }
}

.description {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 12px 0;
}

@media (max-width: 768px) {
  .market-page {
    padding: 16px;
  }

  .widgets-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

:deep(h2) {
  font-weight: 600 !important;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--el-text-color-primary);
}
</style> 