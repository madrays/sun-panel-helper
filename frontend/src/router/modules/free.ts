import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'free',
    name: 'Free',
    component: () => import('../../views/free/index.vue'),
    meta: {
      title: '自由组件',
      icon: 'magic-stick'
    }
  }
]

export default routes 