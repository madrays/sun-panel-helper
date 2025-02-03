<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/default.vue'
import EmptyLayout from '@/layouts/empty.vue'

const route = useRoute()
const layout = computed(() => {
  return route.meta.layout === 'empty' ? EmptyLayout : DefaultLayout
})
</script>

<template>
  <router-view />
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}

#app {
  height: 100%;
  width: 100vw;
}

.app-container {
  min-height: 100vh;
  width: 100%;
}

.el-container {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

.el-aside {
  flex-shrink: 0;
  transition: width var(--transition-bounce);
}

.el-main {
  flex: 1;
  overflow-y: auto !important;
  padding: 24px !important;
}

/* 移除限制滚动的样式 */
.el-container,
.app-container {
  overflow: visible !important;
}

/* 移除 Element Plus 的默认样式限制 */
.el-container.is-vertical {
  height: auto !important;
}

:root {
  /* 主色调 - 清新蓝色系 */
  --primary-color: #3B82F6;
  --primary-light: #60A5FA;
  --primary-dark: #2563EB;
  
  /* 辅助色 - 明快的色彩 */
  --success-color: #10B981;
  --warning-color: #F59E0B;
  --error-color: #EF4444;
  
  /* 渐变色 */
  --gradient-primary: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
  --gradient-secondary: linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%);
  --gradient-success: linear-gradient(135deg, #34D399 0%, #10B981 100%);
  --gradient-warning: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
  
  /* 背景色 - 清新蓝色 */
  --bg-base: #EFF6FF;
  --bg-card: rgba(255, 255, 255, 0.9);
  --bg-sidebar: rgba(255, 255, 255, 0.95);
  --bg-header: rgba(255, 255, 255, 0.95);
  
  /* 中性色 */
  --gray-50: #F8FAFC;
  --gray-100: #F1F5F9;
  --gray-200: #E2E8F0;
  --gray-300: #CBD5E1;
  --gray-400: #94A3B8;
  --gray-500: #64748B;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1E293B;
  --gray-900: #0F172A;
  
  /* 文字颜色 */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-700);
  --text-disabled: var(--gray-500);
  
  /* 边框和阴影 */
  --border-color: var(--gray-200);
  --border-radius-lg: 20px;
  --border-radius-base: 16px;
  --border-radius-sm: 12px;
  
  --shadow-sm: 0 4px 12px -2px rgba(59, 130, 246, 0.1);
  --shadow: 0 8px 24px -4px rgba(59, 130, 246, 0.15);
  --shadow-md: 0 12px 32px -4px rgba(59, 130, 246, 0.2);
  --shadow-lg: 0 20px 48px -8px rgba(59, 130, 246, 0.25);
  
  /* 基础设置 */
  --font-size-base: 14px;
  --transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 全局背景渐变 */
body {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  margin: 0;
  padding: 0;
}

/* Element Plus 主题覆盖 */
.el-menu {
  --el-menu-bg-color: transparent !important;
  --el-menu-text-color: var(--text-secondary) !important;
  --el-menu-hover-bg-color: rgba(59, 130, 246, 0.08) !important;
  --el-menu-active-color: var(--primary-color) !important;
  border-right: none !important;
}

.el-menu-item {
  margin: 4px 8px !important;
  border-radius: var(--border-radius-base) !important;
  height: 48px !important;
  white-space: nowrap !important;
}

.el-menu-item.is-active {
  background: var(--gradient-primary) !important;
  color: white !important;
  font-weight: 600;
  margin: 4px 8px !important;
}

.el-menu--collapse {
  width: 64px !important;
}

.el-menu--collapse .el-menu-item {
  padding: 0 !important;
  justify-content: center !important;
}

.el-menu--collapse .el-menu-item .el-icon {
  margin: 0 !important;
}

.el-button {
  border-radius: var(--border-radius-base) !important;
  transition: var(--transition-bounce) !important;
}

.el-button--primary {
  background: var(--gradient-primary) !important;
  border: none !important;
  font-weight: 600 !important;
}

.el-card {
  border-radius: var(--border-radius-lg) !important;
  border: none !important;
  box-shadow: var(--shadow) !important;
  transition: var(--transition-bounce) !important;
  background: var(--bg-card) !important;
  backdrop-filter: blur(12px) !important;
}

.el-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg) !important;
}

/* 移除所有元素的默认轮廓 */
* {
  outline: none !important;
}

/* 移除下拉菜单的默认样式 */
.el-dropdown:focus,
.el-dropdown-menu__item:focus {
  outline: none !important;
}

.el-dropdown-menu {
  padding: 8px !important;
  border: none !important;
  border-radius: var(--border-radius-base) !important;
  box-shadow: var(--shadow) !important;
  background: var(--bg-card) !important;
  backdrop-filter: blur(12px) !important;
}

.el-dropdown-menu__item {
  border-radius: var(--border-radius-sm) !important;
  margin: 4px 0 !important;
  padding: 8px 16px !important;
  font-size: 0.9rem !important;
  transition: var(--transition-base) !important;
}

.el-dropdown-menu__item:not(.is-disabled):hover {
  background: var(--el-menu-hover-bg-color) !important;
  color: var(--primary-color) !important;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}
</style>
