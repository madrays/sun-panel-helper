export const DEFAULT_USER = {
  username: 'helper',
  password: 'helper123',
  avatar: '/logo.svg'
}

// 用于本地存储的 key
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo'
}

// 简单的 token 生成函数
export const generateToken = (username: string): string => {
  return `${username}_${Date.now()}_${Math.random().toString(36).substr(2)}`
} 