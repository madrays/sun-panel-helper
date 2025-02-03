import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import type { ApiResponse } from '@/api/user'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // 生产环境用 /api
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    console.log('Response:', response.config.url, response.data)
    const res = response.data as ApiResponse<any>
    
    if (res.code !== 0) {
      ElMessage.warning(res.message || '请求失败')
      
      // token 失效
      if (res.code === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res.data
  },
  (error) => {
    console.error('Response Error:', error.response?.data || error.message)
    ElMessage.warning(error.message || '请求失败')
    return Promise.reject(error)
  }
)

// 重新定义 request 函数的类型
const request = <T = any, D = any>(config: {
  url: string
  method: string
  data?: D
}) => {
  return service(config) as Promise<T>
}

export default request 