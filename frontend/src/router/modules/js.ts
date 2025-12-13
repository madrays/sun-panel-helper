import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'js',
    name: 'JS',
    component: () => import('../../views/js/index.vue'),
    meta: {
      title: 'JS 功能库',
      icon: 'code'
    }
  },
  {
    path: 'js/maxkb-ai',
    name: 'JSMaxkbAi',
    component: () => import('../../views/js/detail/maxkb-ai/index.vue'),
    meta: {
      title: 'MaxKB AI助手',
      hideInMenu: true,
      parentTitle: 'JS 功能库',
      parentPath: '/dashboard/js'
    }
  },
  {
    path: 'js/search-quote',
    name: 'JSSearchQuote',
    component: () => import('../../views/js/detail/search-quote/index.vue'),
    meta: {
      title: '搜索框随机一言',
      hideInMenu: true,
      parentTitle: 'JS 功能库',
      parentPath: '/dashboard/js'
    }
  },
  {
    path: 'js/fish-animation',
    name: 'JSFishAnimation',
    component: () => import('../../views/js/detail/fish-animation/index.vue'),
    meta: {
      title: '鱼群动画',
      hideInMenu: true,
      parentTitle: 'JS 功能库',
      parentPath: '/dashboard/js'
    }
  },
  {
    path: 'js/markdown-editor',
    name: 'JSMarkdownEditor',
    component: () => import('../../views/js/detail/markdown-editor/index.vue'),
    meta: {
      title: 'Markdown编辑器',
      hideInMenu: true,
      parentTitle: 'JS 功能库',
      parentPath: '/dashboard/js'
    }
  },
  {
    path: 'js/toc-nav',
    name: 'JSTocNav',
    component: () => import('../../views/js/detail/toc-nav/index.vue'),
    meta: {
      title: '目录导航',
      hideInMenu: true,
      parentTitle: 'JS 功能库',
      parentPath: '/dashboard/js'
    }
  },
  {
    path: 'js/music-player',
    name: 'JSMusicPlayer',
    component: () => import('../../views/js/detail/music-player/index.vue'),
    meta: {
      title: '音乐播放器',
      hideInMenu: true,
      parentTitle: 'JS 功能库',
      parentPath: '/dashboard/js'
    }
  },
  {
    path: 'js/hide-login',
    name: 'JSHideLogin',
    component: () => import('../../views/js/detail/hide-login/index.vue'),
    meta: {
      title: '隐藏登录按钮',
      hideInMenu: true,
      parentTitle: 'JS 功能库',
      parentPath: '/dashboard/js'
    }
  },
  {
    path: 'js/weather',
    name: 'JSWeather',
    component: () => import('../../views/js/detail/weather/index.vue'),
    meta: {
      title: '智能天气助手',
      hideInMenu: true,
      parentTitle: 'JS 功能库',
      parentPath: '/dashboard/js'
    }
  }
]

export default routes 