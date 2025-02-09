<template>
  <div class="widget-detail">
    <LayoutDetail
      title="天气预报"
      description="实时展示当前天气状况，支持和风天气API，可配置位置坐标"
      :widget="widget"
      :is-applied-to-fixed="isAppliedToFixed"
      v-model:isAppliedToFree="isAppliedToFree"
      @reset="handleReset"
    >
      <template #params-title>
        <div class="params-title">
          <span>参数配置</span>
          <el-button type="info" @click="showGuide">使用说明</el-button>
        </div>
      </template>

      <template #params>
        <WeatherParams 
          v-model="config" 
          :widget="widget"
          @guide="showGuide"
          @update:url="updateUrl"
        />
      </template>

      <template #preview>
        <WeatherPreview :widget="widget" :config="config" />
      </template>
    </LayoutDetail>

    <!-- 使用说明弹窗 -->
    <el-dialog
      title="天气组件使用说明"
      v-model="dialogVisible"
      width="500px"
    >
      <el-alert
        title="使用说明"
        type="info"
        :closable="false"
        class="mb-4"
      >
        <p>1. 需要先申请和风天气API密钥（可以申请两个作为备用）</p>
        <p>2. 位置坐标格式为: 经度,纬度（如：116.41,39.92 代表北京）</p>
        <p>3. 支持实时天气、24小时预报和7天预报</p>
        <p>4. 已部署的组件会实时更新配置，无需重新部署</p>
      </el-alert>
      
      <el-alert
        title="获取API密钥"
        type="success"
        :closable="false"
        class="mb-4"
      >
        <p>1. 访问 <el-link href="https://dev.qweather.com" target="_blank">和风天气开发平台</el-link></p>
        <p>2. 注册账号并实名认证</p>
        <p>3. 创建应用，选择免费版本即可</p>
        <p>4. 获取API密钥（建议申请两个作为备用）</p>
      </el-alert>
      
      <el-alert
        title="获取位置坐标"
        type="warning"
        :closable="false"
      >
        <p>1. 访问 <el-link href="https://lbs.amap.com/tools/picker" target="_blank">高德地图坐标拾取器</el-link></p>
        <p>2. 搜索或点选目标位置</p>
        <p>3. 复制经纬度坐标（注意格式：经度,纬度）</p>
      </el-alert>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">我知道了</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LayoutDetail from '../../layout.vue'
import WeatherParams from './params.vue'
import WeatherPreview from './preview.vue'
import type { Widget } from '@/types/market'

// 默认配置
const defaultWidget: Widget = {
  id: 'weather',
  name: '天气预报',
  description: '实时展示当前天气状况，支持自定义城市和样式',
  type: 'html',
  url: '/custom/helper/weather-widget/weather-widget.html',
  tags: ['天气', '实时', '动态']
}

// 参数配置
const config = ref({
  keys: ['', ''],
  location: '116.41,39.92'
})

const widget = ref<Widget>({ ...defaultWidget })
const isAppliedToFixed = ref(false)
const isAppliedToFree = ref(false)

// 重置参数
const handleReset = () => {
  widget.value = { ...defaultWidget }
  config.value = {
    keys: ['', ''],
    location: '116.41,39.92'
  }
}

// 弹窗控制
const dialogVisible = ref(false)
const showGuide = () => {
  dialogVisible.value = true
}

const updateUrl = (newUrl: string) => {
  widget.value.url = newUrl
}
</script>

<style scoped>
.params-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 50px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.params-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

:deep(.el-alert__title) {
  font-size: 16px;
  font-weight: bold;
}

:deep(.el-alert__content) {
  padding: 8px 0;
}

:deep(.el-link) {
  font-weight: bold;
}

.dialog-footer {
  text-align: center;
  width: 100%;
  display: block;
}
</style> 