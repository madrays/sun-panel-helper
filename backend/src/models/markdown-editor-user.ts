import bcrypt from 'bcryptjs'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export interface MarkdownEditorUser {
  username: string
  password: string  // bcrypt 加密后的密码
  note: string
  createdAt: string
}

class MarkdownEditorUserModel {
  private users: Map<string, MarkdownEditorUser>
  private readonly filePath: string

  constructor() {
    this.filePath = process.env.NODE_ENV === 'production'
      ? '/app/backend/data/markdown-editor-users.json'  // 生产环境固定路径
      : join(__dirname, '../../data/markdown-editor-users.json')  // 开发环境相对路径

    this.users = this.loadUsers()

    // 确保数据目录存在
    const dataDir = process.env.NODE_ENV === 'production'
      ? '/app/backend/data'
      : join(__dirname, '../../data')

    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }
  }

  private loadUsers(): Map<string, MarkdownEditorUser> {
    try {
      if (!existsSync(this.filePath)) {
        return new Map()
      }
      const data = readFileSync(this.filePath, 'utf8')
      const users: MarkdownEditorUser[] = JSON.parse(data)
      const userMap = new Map<string, MarkdownEditorUser>()
      users.forEach(user => userMap.set(user.username, user))
      return userMap
    } catch (error) {
      console.error('Error loading markdown-editor users:', error)
      return new Map()
    }
  }

  private saveUsers(): void {
    try {
      const users = Array.from(this.users.values())
      writeFileSync(this.filePath, JSON.stringify(users, null, 2), 'utf8')
    } catch (error) {
      console.error('Error saving markdown-editor users:', error)
    }
  }

  /**
   * 根据用户名查找用户
   */
  public findByUsername(username: string): MarkdownEditorUser | undefined {
    return this.users.get(username)
  }

  /**
   * 获取所有用户（不含密码）
   */
  public getAllUsers(): Omit<MarkdownEditorUser, 'password'>[] {
    return Array.from(this.users.values()).map(({ password, ...user }) => user)
  }

  /**
   * 获取所有用户名列表
   */
  public getAllUsernames(): string[] {
    return Array.from(this.users.keys())
  }

  /**
   * 验证密码
   */
  public async validatePassword(user: MarkdownEditorUser, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password)
    } catch (error) {
      console.error('Password validation error:', error)
      return false
    }
  }

  /**
   * 添加用户
   */
  public async addUser(username: string, password: string, note: string = ''): Promise<{ success: boolean; error?: string }> {
    try {
      // 检查用户名是否已存在
      if (this.users.has(username)) {
        return { success: false, error: '用户名已存在' }
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser: MarkdownEditorUser = {
        username,
        password: hashedPassword,
        note,
        createdAt: new Date().toISOString()
      }

      this.users.set(username, newUser)
      this.saveUsers()

      return { success: true }
    } catch (error) {
      console.error('Error adding user:', error)
      return { success: false, error: '添加用户失败' }
    }
  }

  /**
   * 更新用户
   */
  public async updateUser(username: string, updates: { password?: string; note?: string }): Promise<{ success: boolean; error?: string }> {
    try {
      const user = this.users.get(username)
      if (!user) {
        return { success: false, error: '用户不存在' }
      }

      if (updates.password) {
        user.password = await bcrypt.hash(updates.password, 10)
      }

      if (updates.note !== undefined) {
        user.note = updates.note
      }

      this.users.set(username, user)
      this.saveUsers()

      return { success: true }
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error: '更新用户失败' }
    }
  }

  /**
   * 删除用户
   */
  public removeUser(username: string): { success: boolean; error?: string } {
    if (!this.users.has(username)) {
      return { success: false, error: '用户不存在' }
    }

    this.users.delete(username)
    this.saveUsers()

    return { success: true }
  }

  /**
   * 批量设置用户列表（用于从配置导入）
   */
  public async setUsers(users: { username: string; password: string; note: string }[]): Promise<{ success: boolean; error?: string }> {
    try {
      const userMap = new Map<string, MarkdownEditorUser>()

      for (const userData of users) {
        const existingUser = this.users.get(userData.username)
        const hashedPassword = existingUser
          ? (userData.password ? await bcrypt.hash(userData.password, 10) : existingUser.password)
          : await bcrypt.hash(userData.password, 10)

        userMap.set(userData.username, {
          username: userData.username,
          password: hashedPassword,
          note: userData.note || '',
          createdAt: existingUser?.createdAt || new Date().toISOString()
        })
      }

      this.users = userMap
      this.saveUsers()

      return { success: true }
    } catch (error) {
      console.error('Error setting users:', error)
      return { success: false, error: '设置用户失败' }
    }
  }
}

export default new MarkdownEditorUserModel()
