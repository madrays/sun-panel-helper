import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'fixed',
    name: 'Fixed',
    component: () => import('@/views/fixed/index.vue'),
    meta: {
      title: '固定组件',
      icon: 'Grid'
    }
  }
]

export default routes 