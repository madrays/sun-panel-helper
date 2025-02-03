<template>
  <div class="preview-container">
    <div class="preview-header">
      <h3>布局预览</h3>
      <p>调整参数可实时预览效果</p>
      <div class="deploy-tip">
        <el-icon><Warning /></el-icon>
        请部署后在面板查看实际效果
      </div>
    </div>
    <div class="preview-content">
      <div class="layout-preview">
        <!-- 第一行：LOGO + 分隔符 + 时钟 -->
        <div class="layout-row first-row" :class="{ 'clock-hidden': !params.showClock }">
          <div class="layout-item logo">LOGO</div>
          <template v-if="params.showClock">
            <div class="layout-item divider">|</div>
            <div class="layout-item clock">
              <el-icon><Clock /></el-icon>
              12:00
            </div>
          </template>
        </div>

        <!-- 第二行：搜索框 -->
        <div class="layout-row search-row" :style="{ transform: `translateY(${params.searchMarginTop}px)` }">
          <div class="layout-item search">
            <el-icon><Search /></el-icon>
            搜索
          </div>
        </div>

        <!-- 第三行：系统信息 -->
        <div class="layout-row system-row" :style="{ transform: `translateY(${params.systemMarginTop}px)` }">
          <div class="layout-item system">
            <el-icon><Monitor /></el-icon>
            系统信息
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock, Search, Monitor, Warning } from '@element-plus/icons-vue'

defineProps<{
  params: {
    showClock: boolean
    searchMarginTop: number
    systemMarginTop: number
  }
}>()
</script>

<style scoped>
.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #ebeef5;
}

.preview-header h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #2c3e50;
}

.preview-header p {
  margin: 0 0 16px;
  color: #606266;
  font-size: 14px;
}

.deploy-tip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 4px;
  color: var(--el-color-warning);
  font-size: 13px;
}

.preview-content {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layout-preview {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.layout-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: transform 0.3s ease;
}

.layout-row + .layout-row {
  margin-top: 60px;
}

.first-row {
  margin-bottom: 60px;
}

.layout-row.search-row,
.layout-row.system-row {
  position: relative;
  will-change: transform;
}

.layout-row.clock-hidden .layout-item.logo {
  margin: 0 auto;
}

.layout-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.layout-item.logo {
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  color: #67c23a;
  font-weight: 600;
}

.layout-item.divider {
  padding: 0;
  color: #dcdfe6;
  font-size: 16px;
}

.layout-item.clock {
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  color: #67c23a;
  width: 80px;
  justify-content: center;
}

.layout-item.search {
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  color: #409eff;
  width: 200px;
  justify-content: center;
}

.layout-item.system {
  background: #fdf6ec;
  border: 1px solid #faecd8;
  color: #e6a23c;
  width: 200px;
  justify-content: center;
}

.el-icon {
  font-size: 16px;
}
</style> 