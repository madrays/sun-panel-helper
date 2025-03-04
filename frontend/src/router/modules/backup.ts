import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'backup',
    name: 'Backup',
    component: () => import('@/views/backup/index.vue'),
    meta: {
      title: '备份恢复',
      icon: 'DataBackup', // 需要在icons中引入
      requiresAuth: true
    }
  }
]

export default routes 