import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'css',
    name: 'CSS',
    component: () => import('../../views/css/index.vue'),
    meta: {
      title: 'CSS 美化库',
      icon: 'magic-stick'
    }
  },
  {
    path: 'css/xiantiao',
    name: 'CSSXiantiao',
    component: () => import('../../views/css/detail/xiantiao/index.vue'),
    meta: {
      title: '装饰线条',
      hideInMenu: true,
      parentTitle: 'CSS 美化库',
      parentPath: '/dashboard/css'
    }
  },
  {
    path: 'css/card-hover',
    name: 'CSSCardHover',
    component: () => import('../../views/css/detail/card-hover/index.vue'),
    meta: {
      title: '卡片悬停动画',
      hideInMenu: true,
      parentTitle: 'CSS 美化库',
      parentPath: '/dashboard/css'
    }
  },
  {
    path: 'css/gradient-bg',
    name: 'CSSGradientBg',
    component: () => import('../../views/css/detail/gradient-bg/index.vue'),
    meta: {
      title: '渐变背景',
      hideInMenu: true,
      parentTitle: 'CSS 美化库',
      parentPath: '/dashboard/css'
    }
  },
  {
    path: 'css/mouse-cursor',
    name: 'CSSMouseCursor',
    component: () => import('../../views/css/detail/mouse-cursor/index.vue'),
    meta: {
      title: '自定义鼠标指针',
      hideInMenu: true,
      parentTitle: 'CSS 美化库',
      parentPath: '/dashboard/css'
    }
  },
  {
    path: 'css/global-font',
    name: 'CSSGlobalFont',
    component: () => import('../../views/css/detail/global-font/index.vue'),
    meta: {
      title: '全局字体',
      hideInMenu: true,
      parentTitle: 'CSS 美化库',
      parentPath: '/dashboard/css'
    }
  },
  {
    path: 'css/custom-logo',
    name: 'CSSCustomLogo',
    component: () => import('../../views/css/detail/custom-logo/index.vue'),
    meta: {
      title: '自定义Logo',
      hideInMenu: true,
      parentTitle: 'CSS 美化库',
      parentPath: '/dashboard/css'
    }
  },
  {
    path: 'css/layout-adjust',
    name: 'CSSLayoutAdjust',
    component: () => import('../../views/css/detail/layout-adjust/index.vue'),
    meta: {
      title: '布局调整',
      hideInMenu: true,
      parentTitle: 'CSS 美化库',
      parentPath: '/dashboard/css'
    }
  },
  {
    path: 'css/clock-style',
    name: 'CSSClockStyle',
    component: () => import('@/views/css/detail/clock-style/index.vue'),
    meta: {
      title: '时钟样式',
      hideInMenu: true,
      parentTitle: 'CSS 美化库',
      parentPath: '/dashboard/css'
    }
  }
]

export default routes