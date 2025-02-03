// =====================================================
// 【重要提示】
// 演示模式开关: 设为 true 时将禁用密码修改功能
// 设为 false 时恢复正常模式
// 注意：此开关需要与登录页的开关保持一致！ 在下面找到 DEMO_MODE 修改
// =====================================================

<template>
  <div class="change-password-container">
    <!-- Demo模式提示 -->
    <el-alert
      v-if="DEMO_MODE"
      type="warning"
      :closable="false"
      class="demo-alert"
      show-icon
    >
      演示模式下禁用修改密码功能
    </el-alert>

    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <h3>修改密码</h3>
          <p class="subtitle">修改密码后需要重新登录</p>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="password-form"
        :disabled="DEMO_MODE"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
          >
            <template #append>
              <el-tooltip
                content="用户名可以保持不变"
                placement="top"
              >
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="form.currentPassword"
            type="password"
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            保存修改
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { changePassword } from '@/api/user'

// =====================================================
// 【重要提示】
// 演示模式开关: 设为 true 时将禁用密码修改功能
// 设为 false 时恢复正常模式
// 注意：此开关需要与登录页的开关保持一致！
// =====================================================
const DEMO_MODE = false

const router = useRouter()
const loading = ref(false)
const formRef = ref()

const form = ref({
  username: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 获取当前用户信息
const userInfo = computed(() => {
  const info = localStorage.getItem('userInfo')
  return info ? JSON.parse(info) : { username: '' }
})

onMounted(() => {
  form.value.username = userInfo.value.username
})

const validatePass = (_: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6位'))
  } else {
    callback()
  }
}

const validateConfirmPass = (_: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.value.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateUsername = (_: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入用户名'))
  } else if (value.length < 3) {
    callback(new Error('用户名长度不能小于3位'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { validator: validateUsername, trigger: 'blur' }
  ],
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPass, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    loading.value = true
    await formRef.value.validate()
    
    await changePassword({
      username: form.value.username,
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    })
    
    ElMessage.success('信息修改成功，请重新登录')
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  } catch (error: any) {
    console.error('Change password error:', error)
    ElMessage.error(error.response?.data?.message || '修改失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.change-password-container {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.password-card {
  .card-header {
    h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-primary);
    }
    
    .subtitle {
      margin: 8px 0 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  }
}

.password-form {
  margin-top: 24px;
  
  :deep(.el-form-item__content) {
    max-width: 360px;
  }
}

.demo-alert {
  margin-bottom: 16px;
}
</style> 