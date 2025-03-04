import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import cssRoutes from './modules/css'
import jsRoutes from './modules/js'
import marketRoutes from './modules/market'
import fixedRoutes from './modules/fixed'
import freeRoutes from './modules/free'
import profileRoutes from './modules/profile'
import backupRoutes from './modules/backup'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: {
      layout: 'empty'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../layouts/default.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/home/index.vue'),
        meta: {
          title: '首页',
          icon: 'home'
        }
      },
      ...cssRoutes,
      ...jsRoutes,
      ...marketRoutes,
      ...fixedRoutes,
      ...freeRoutes,
      ...profileRoutes,
      ...backupRoutes,
      {
        path: '/dashboard/support',
        component: () => import('@/views/support/index.vue'),
        meta: {
          title: '支持作者',
          requiresAuth: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router