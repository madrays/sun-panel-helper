// =====================================================
// 【重要提示】
// 演示模式开关: 设为 true 时将显示默认账号密码
// 设为 false 时恢复正常模式，在下面找到 DEMO_MODE 修改
// =====================================================


<template>
  <div class="login-container">
    <el-card class="login-card">
      <!-- Demo模式提示 -->
      <el-alert
        v-if="DEMO_MODE"
        type="info"
        :closable="false"
        class="demo-alert"
      >
        <p>演示账号：helper</p>
        <p>演示密码：helper123</p>
      </el-alert>

      <div class="login-header">
        <img src="/logo.svg" alt="Logo" class="login-logo" />
        <h2>Sun Panel Helper</h2>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <el-button
            class="reset-button"
            @click="showResetInstructions"
          >
            忘记密码？重置默认账号
          </el-button>
        </div>
      </el-form>
    </el-card>

    <el-dialog
      v-model="showReset"
      title="重置说明"
      width="90%"
      class="reset-dialog"
      :close-on-click-modal="false"
      :show-close="true"
    >
      <div class="reset-content">
        <div class="grid-container">
          <div class="grid-item method-1">
            <div class="method-card">
              <h4>【方法一】通过图形界面重置（推荐）</h4>
              <div class="method-content">
                <p class="subtitle">支持的管理界面：Docker Desktop、群晖 Docker 套件、飞牛OS Docker、极空间 Docker、其他支持 Docker 的 NAS 系统</p>

                <p class="subtitle">操作步骤：</p>
                <ol>
                  <li>打开对应的 Docker 管理界面</li>
                  <li>找到 sun-panel-helper 容器</li>
                  <li>
                    进入容器终端
                    <div class="note">点击"终端"、"Console"或"Shell"，使用 <code>/bin/sh</code></div>
                  </li>
                  <li>
                    执行命令：
                    <div class="code-block">rm -f /app/backend/data/users.json</div>
                  </li>
                  <li>退出终端</li>
                  <li>重启容器完成重置</li>
                </ol>
              </div>
            </div>
          </div>

          <div class="grid-item method-2">
            <div class="method-card">
              <h4>【方法二】通过命令行重置</h4>
              <div class="method-content">
                <ol>
                  <li>使用终端连接到服务器</li>
                  <li>
                    选择以下任一方式连接容器：
                    <div class="code-block">【方式1】使用容器名称（推荐）：
docker exec -it sun-panel-helper /bin/sh</div>
                    <div class="code-block">【方式2】使用容器ID：
# 查找容器ID
docker ps | grep sun-panel-helper

# 连接容器
docker exec -it &lt;容器ID&gt; /bin/sh</div>
                  </li>
                  <li>
                    执行重置命令：
                    <div class="code-block">rm -f /app/backend/data/users.json
exit</div>
                  </li>
                  <li>
                    重启容器：
                    <div class="code-block">docker restart sun-panel-helper</div>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div class="grid-item info-section">
            <div class="info-card warning-section">
              <h4>【重要提示】</h4>
              <div class="warning-content">
                <div class="credentials">
                  <p>重置后的默认账号：用户名 <code>helper</code>&nbsp;&nbsp;密码 <code>helper123</code></p>
                </div>
                <ul>
                  <li>重置会清除所有用户数据</li>
                  <li>重置后请立即修改密码</li>
                  <li>请妥善保存新的密码</li>
                  <li>如重置后无法登录，请检查：<ol><li>容器是否已重启</li><li>输入的账号密码是否正确</li></ol></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showReset = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/user'

// =====================================================
// 【重要提示】
// 演示模式开关: 设为 true 时将显示默认账号密码
// 设为 false 时恢复正常模式，在下面找到 DEMO_MODE 修改
// =====================================================
const DEMO_MODE = false

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref()
const showReset = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    loading.value = true
    await loginFormRef.value.validate()
    
    // 调用登录 API
    const { token, userInfo } = await login(loginForm.value)
    
    // 存储 token 和用户信息
    localStorage.setItem('token', token)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Login error:', error)
    // 显示具体的错误信息
    ElMessage.error(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const showResetInstructions = () => {
  showReset.value = true
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-base) 0%, #DBEAFE 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  animation: pulse 8s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% { transform: translate(-25%, -25%) rotate(0deg); opacity: 0.5; }
  100% { transform: translate(-25%, -25%) rotate(360deg); opacity: 1; }
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  margin: 24px;
  position: relative;
  z-index: 1;
  
  .login-header {
    text-align: center;
    margin-bottom: 32px;
    
    .login-logo {
      width: 80px;
      height: 80px;
      margin-bottom: 16px;
      filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.2));
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    h2 {
      margin: 0;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
  }
  
  .login-button {
    width: 100%;
    padding: 12px;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    background: var(--gradient-primary);
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
  }

  .login-footer {
    margin-top: 16px;
    text-align: center;

    .reset-button {
      color: var(--primary-color);
      font-size: 0.875rem;
      padding: 8px 16px;
      border: 1px solid var(--primary-light);
      background: transparent;
      transition: all 0.3s ease;

      &:hover {
        color: white;
        background: var(--primary-color);
        border-color: var(--primary-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
      }
    }
  }
}

.reset-dialog {
  .el-dialog {
    --el-dialog-width: 720px;
    max-width: 95vw;
    margin: 15px auto;
  }

  .el-dialog__header {
    margin: 0;
    padding: 12px 16px;
    
    .el-dialog__title {
      font-size: 1.25rem;
    }
  }

  .el-dialog__body {
    padding: 0;
    max-height: 75vh;
    overflow-y: auto;
  }

  .reset-content {
    .grid-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      padding: 10px;
      background: var(--el-bg-color-page);
    }

    .grid-item {
      &.info-section {
        grid-column: 1 / -1;
        margin-top: -2px;  // 抵消间距，让警告区域更紧凑
      }
    }

    .method-card, .info-card {
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
      height: 100%;
      box-shadow: var(--el-box-shadow-light);
    }

    h4 {
      margin: 0;
      padding: 8px 12px;
      font-size: 1rem;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-bottom: 1px solid var(--el-border-color-light);
      border-radius: 6px 6px 0 0;
    }

    .method-content {
      padding: 10px;
    }

    .subtitle {
      font-weight: 600;
      margin: 6px 0 4px;
      color: var(--el-text-color-secondary);
    }

    ul {
      margin: 4px 0;
      padding-left: 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;

      li {
        margin: 0;
        color: var(--el-text-color-regular);
        flex: 0 0 auto;
      }
    }

    ol {
      margin: 4px 0;
      padding-left: 20px;

      li {
        margin-bottom: 6px;
        color: var(--el-text-color-regular);
        
        &:last-child {
          margin-bottom: 0;
        }

        ol {
          margin-top: 4px;
        }
      }
    }

    .note {
      margin: 4px 0;
      padding: 6px 10px;
      background: var(--el-color-info-light-9);
      border-radius: 4px;
      color: var(--el-text-color-secondary);
      border: 1px solid var(--el-border-color-lighter);
    }

    .code-block {
      margin: 4px 0;
      padding: 8px 10px;
      background: #2d2d2d;
      color: #e6e6e6;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
      line-height: 1.4;
      border: 1px solid #404040;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
      overflow-x: auto;
    }

    code {
      padding: 2px 4px;
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      border-radius: 3px;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
    }

    .warning-section {
      background: var(--el-color-danger-light-9);
      
      h4 {
        background: var(--el-color-danger-light-8);
        color: var(--el-color-danger);
      }

      .warning-content {
        padding: 10px;

        .credentials {
          margin-bottom: 8px;
          padding: 8px 12px;
          background: var(--el-color-danger-light-8);
          border-radius: 4px;
          text-align: center;
          
          p {
            margin: 0;
            color: var(--el-color-danger-dark-2);
            font-weight: 600;
          }

          code {
            font-size: 1rem;
            background: white;
            color: var(--el-color-danger);
            border: 1px solid var(--el-color-danger-light-5);
          }
        }

        ul {
          margin: 0;
          padding-left: 20px;
          display: block;
          
          li {
            margin-bottom: 4px;
            color: var(--el-color-danger-dark-2);

            &:last-child {
              margin-bottom: 0;
            }
          }

          ol {
            margin-top: 4px;
            
            li {
              color: var(--el-color-danger-dark-2);
            }
          }
        }
      }
    }
  }

  .el-dialog__footer {
    text-align: center;
    padding: 10px;
    border-top: 1px solid var(--el-border-color);
    background: var(--el-bg-color);

    .el-button {
      padding: 8px 24px;
      font-weight: 600;
      font-size: 1rem;
    }
  }
}

@media (max-width: 768px) {
  .reset-dialog {
    .el-dialog {
      --el-dialog-width: 100%;
      max-width: 100vw;
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      border-radius: 0;
    }

    .el-dialog__header {
      padding: 10px;
      
      .el-dialog__title {
        font-size: 1.1rem;
      }
    }

    .el-dialog__body {
      flex: 1;
      max-height: none;
      padding: 8px;
      background: var(--el-bg-color-page);
    }

    .reset-content {
      height: 100%;
      
      .grid-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0;
        height: 100%;
      }

      .grid-item {
        width: 100%;
      }
    }

    .method-card, .info-card {
      border-radius: 4px;
      margin: 0;
      
      h4 {
        padding: 8px 10px;
        font-size: 0.95rem;
        border-radius: 4px 4px 0 0;
      }
    }

    .method-content {
      padding: 8px 10px;
    }

    .subtitle {
      font-size: 0.9rem;
      margin: 4px 0;
    }

    ul {
      display: block;
      margin: 4px 0;
      padding-left: 16px;
      
      li {
        margin-bottom: 4px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    ol {
      margin: 4px 0;
      padding-left: 16px;
      
      li {
        margin-bottom: 4px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .code-block {
      font-size: 0.85rem;
      padding: 6px 8px;
      margin: 4px 0;
      border-radius: 3px;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
      max-width: 100%;
      box-sizing: border-box;
    }

    .note {
      font-size: 0.9rem;
      padding: 5px 8px;
      margin: 4px 0;
    }

    .warning-section {
      .warning-content {
        padding: 8px 10px;

        .credentials {
          padding: 6px 8px;
          margin-bottom: 6px;
          
          p {
            font-size: 0.9rem;
          }

          code {
            font-size: 0.9rem;
            padding: 2px 4px;
          }
        }

        ul {
          font-size: 0.9rem;
          
          li {
            margin-bottom: 4px;
            
            ol {
              margin-top: 4px;
            }
          }
        }
      }
    }

    .el-dialog__footer {
      padding: 8px;
      margin-top: auto;

      .el-button {
        padding: 6px 20px;
        font-size: 0.95rem;
      }
    }
  }
}

.demo-alert {
  margin-bottom: 16px;
}
.demo-alert :deep(p) {
  margin: 4px 0;
}
</style> 