import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import App from '../App.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/widgets',
    name: 'Widgets',
    component: App
  }
]

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL || '/',
  routes
})