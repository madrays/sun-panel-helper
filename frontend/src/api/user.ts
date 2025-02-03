import request from '@/utils/request'

export interface LoginData {
  username: string
  password: string
}

export interface UserInfo {
  username: string
  avatar: string
}

export interface ChangePasswordData {
  username?: string
  currentPassword: string
  newPassword: string
}

export interface LoginResponse {
  token: string
  userInfo: UserInfo
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

export const login = (data: LoginData): Promise<LoginResponse> => {
  return request<LoginResponse, LoginData>({
    url: '/api/login',
    method: 'post',
    data
  })
}

export const getUserInfo = (): Promise<UserInfo> => {
  return request<UserInfo>({
    url: '/api/user/info',
    method: 'get'
  })
}

export const changePassword = (data: ChangePasswordData): Promise<null> => {
  return request<null, ChangePasswordData>({
    url: '/api/user/change-password',
    method: 'post',
    data
  })
} 