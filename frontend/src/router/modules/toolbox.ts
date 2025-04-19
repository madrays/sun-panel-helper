import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'toolbox',
    name: 'Toolbox',
    component: () => import('../../views/toolbox/index.vue'),
    meta: {
      title: '百宝箱',
      icon: 'magic-wand'
    }
  },
  // 页脚组件
  {
    path: 'toolbox/footer',
    name: 'ToolboxFooter',
    component: () => import('../../views/toolbox/category/footer/index.vue'),
    meta: {
      title: '自定义页脚',
      hideInMenu: true,
      parentTitle: '百宝箱',
      parentPath: '/dashboard/toolbox'
    }
  },
  // 详情页 - 生命线页脚
  {
    path: 'toolbox/footer/lifeline-footer',
    name: 'ToolboxLifelineFooter',
    component: () => import('../../views/toolbox/detail/footer/lifeline-footer/index.vue'),
    meta: {
      title: '生命线页脚',
      hideInMenu: true,
      parentTitle: '自定义页脚',
      parentPath: '/dashboard/toolbox/footer'
    }
  },
  // 详情页 - 备案信息页脚
  {
    path: 'toolbox/footer/icp-footer',
    name: 'ToolboxIcpFooter',
    component: () => import('../../views/toolbox/detail/footer/icp-footer/index.vue'),
    meta: {
      title: '备案信息页脚',
      hideInMenu: true,
      parentTitle: '自定义页脚',
      parentPath: '/dashboard/toolbox/footer'
    }
  },
  // 点击特效
  {
    path: 'toolbox/click-effect',
    name: 'ToolboxClickEffect',
    component: () => import('../../views/toolbox/category/click-effect/index.vue'),
    meta: {
      title: '点击特效',
      hideInMenu: true,
      parentTitle: '百宝箱',
      parentPath: '/dashboard/toolbox'
    }
  },
  // 详情页 - 社会主义核心价值观点击特效
  {
    path: 'toolbox/detail/click-effect/socialist-values',
    name: 'ToolboxSocialistValuesClickEffect',
    component: () => import('../../views/toolbox/detail/click-effect/socialist-values/index.vue'),
    meta: {
      title: '社会主义核心价值观点击特效',
      hideInMenu: true,
      parentTitle: '点击特效',
      parentPath: '/dashboard/toolbox/click-effect'
    }
  },
  // 背景特效
  {
    path: 'toolbox/background-effect',
    name: 'ToolboxBackgroundEffect',
    component: () => import('../../views/toolbox/category/background-effect/index.vue'),
    meta: {
      title: '背景特效',
      hideInMenu: true,
      parentTitle: '百宝箱',
      parentPath: '/dashboard/toolbox'
    }
  },
  // 详情页 - 星空背景特效
  {
    path: 'toolbox/detail/background-effect/star-background',
    name: 'ToolboxStarBackground',
    component: () => import('../../views/toolbox/detail/background-effect/star-background/index.vue'),
    meta: {
      title: '星空背景特效',
      hideInMenu: true,
      parentTitle: '背景特效',
      parentPath: '/dashboard/toolbox/background-effect'
    }
  }
]

export default routes 