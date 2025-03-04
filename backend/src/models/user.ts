import bcrypt from 'bcryptjs'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export interface User {
  username: string
  password: string
  avatar: string
}

class UserModel {
  private users: User[]
  private readonly filePath: string

  constructor() {
    this.filePath = process.env.NODE_ENV === 'production'
      ? '/app/backend/data/users.json'  // 生产环境固定路径
      : join(__dirname, '../../data/users.json')  // 开发环境相对路径
    
    this.users = this.loadUsers()
    
    // 确保默认用户存在
    this.ensureDefaultUser()
  }

  private loadUsers(): User[] {
    try {
      const data = readFileSync(this.filePath, 'utf8')
      const users = JSON.parse(data)
      return users.length > 0 ? [users[users.length - 1]] : []
    } catch (error) {
      console.error('Error loading users:', error)
      return []
    }
  }

  private saveUsers(): void {
    try {
      // 始终只保存一个用户
      writeFileSync(this.filePath, JSON.stringify([this.users[0]], null, 2))
    } catch (error) {
      console.error('Error saving users:', error)
    }
  }

  private ensureDefaultUser(): void {
    if (this.users.length === 0) {
      const password = process.env.DEFAULT_USER_PASSWORD || 'helper123'
      this.createUser({
        username: 'helper',
        password,
        avatar: '/logo.svg'
      })
    }
  }

  public findByUsername(username: string): User | undefined {
    const user = this.users.find(user => user.username === username)
    return user
  }

  public async validatePassword(user: User, password: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, user.password)
      return isValid
    } catch (error) {
      console.error('Password validation error:', error)
      return false
    }
  }

  public async createUser(userData: { username: string; password: string; avatar: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const newUser: User = {
      username: userData.username,
      password: hashedPassword,
      avatar: userData.avatar
    }
    
    // 替换现有用户
    this.users = [newUser]
    this.saveUsers()
    return newUser
  }

  public async changePassword(username: string, newPassword: string, newUsername?: string): Promise<boolean> {
    if (this.users.length === 0) return false
    
    const user = this.users[0]
    // 更新用户名和密码
    if (newUsername) {
      user.username = newUsername
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    this.saveUsers()
    return true
  }

  public getUserInfo(username: string): Omit<User, 'password'> | null {
    const user = this.users[0]
    if (!user) return null

    const { password, ...userInfo } = user
    return userInfo
  }
}

export default new UserModel() 