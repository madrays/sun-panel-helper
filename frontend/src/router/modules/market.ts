import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'market',
    name: 'Market',
    component: () => import('../../views/market/index.vue'),
    meta: {
      title: '组件市场',
      icon: 'shop'
    }
  },
  {
    path: 'market/hot-news',
    name: 'MarketHotNews',
    component: () => import('../../views/market/detail/widgets/hot-news/index.vue'),
    meta: {
      title: '热门资讯',
      hideInMenu: true,
      parentTitle: '组件市场',
      parentPath: '/dashboard/market'
    }
  },
  {
    path: 'market/typed',
    name: 'MarketTyped',
    component: () => import('../../views/market/detail/widgets/typed/index.vue'),
    meta: {
      title: '打字机效果',
      hideInMenu: true,
      parentTitle: '组件市场',
      parentPath: '/dashboard/market'
    }
  },
  {
    path: 'market/weather',
    name: 'MarketWeather',
    component: () => import('../../views/market/detail/widgets/weather/index.vue'),
    meta: {
      title: '天气预报',
      hideInMenu: true,
      parentTitle: '组件市场',
      parentPath: '/dashboard/market'
    }
  },
  {
    path: 'market/qb-status',
    name: 'MarketQBStatus',
    component: () => import('../../views/market/detail/widgets/qb-status/index.vue'),
    meta: {
      title: 'QB下载器状态',
      hideInMenu: true,
      parentTitle: '组件市场',
      parentPath: '/dashboard/market'
    }
  },
  {
    path: 'market/tr-status',
    name: 'MarketTRStatus',
    component: () => import('../../views/market/detail/widgets/tr-status/index.vue'),
    meta: {
      title: 'Transmission下载器状态',
      hideInMenu: true,
      parentTitle: '组件市场',
      parentPath: '/dashboard/market'
    }
  },
  {
    path: 'market/widgets-link',
    name: 'MarketWidgetsLink',
    component: () => import('../../views/market/detail/widgets/widgets-link/index.vue'),
    meta: {
      title: '轻轻小组件',
      hideInMenu: true,
      parentTitle: '组件市场',
      parentPath: '/dashboard/market'
    }
  }
]

export default routes 