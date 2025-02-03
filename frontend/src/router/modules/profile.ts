import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'profile',
    name: 'Profile',
    redirect: 'profile/change-password',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: () => import('@/views/profile/change-password.vue'),
        meta: {
          title: '修改密码',
          requiresAuth: true
        }
      }
    ]
  }
]

export default routes 