<template>
  <div class="params-editor">
    <!-- API前缀配置 -->
    <div class="api-config">
      <h3>API 配置</h3>
      <el-input 
        v-model="params.apiPrefix"
        placeholder="请输入可访问的地址，如: https://helper.example.com"
      >
        <template #prepend>API 前缀</template>
      </el-input>
      <div class="hint">
        提示：填写外部可访问的地址。如果使用反向代理，请填写反代后的完整地址（如：https://helper.example.com）
      </div>
    </div>

    <div class="user-list">
      <div class="list-header">
        <div class="header-cell">用户名</div>
        <div class="header-cell">密码</div>
        <div class="header-cell">备注</div>
        <div class="header-cell action">操作</div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="params.users.length === 0" class="empty-state">
        <el-empty description="暂无用户" />
      </div>
      
      <!-- 用户列表项 -->
      <div v-for="(user, index) in params.users" :key="index" class="list-item">
        <!-- 每个用户一个独立的表单 -->
        <form class="user-form" @submit.prevent>
          <div class="item-cell">
            <el-input 
              v-model="user.username" 
              placeholder="请输入用户名"
              autocomplete="username"
            />
          </div>
          <div class="item-cell">
            <el-input 
              v-model="user.password" 
              type="password" 
              placeholder="请输入密码" 
              show-password
              autocomplete="current-password"
            />
          </div>
          <div class="item-cell">
            <el-input v-model="user.note" placeholder="请输入备注" />
          </div>
          <div class="item-cell action">
            <el-button type="danger" @click="removeUser(index)">删除</el-button>
          </div>
        </form>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="addUser">添加用户</el-button>
      <el-button type="success" @click="saveConfig">保存配置</el-button>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      <el-alert
        :title="error"
        type="error"
        :closable="false"
        show-icon
      />
    </div>

    <!-- 配置说明 -->
    <div class="config-tips">
      <h4>配置说明</h4>
      <ul>
        <li>填写正确的 API 前缀</li>
        <li>添加用户后点击"保存"按钮</li>
        <li>点击"部署"使配置生效</li>
        <li>修改配置后需重新部署</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { MarkdownEditorParams } from '@/types/js/markdown-editor';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: MarkdownEditorParams
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: MarkdownEditorParams): void
}>();

const params = ref<MarkdownEditorParams>({
  users: [],
  apiPrefix: ''
});

// 错误信息
const error = ref('');

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  params.value = JSON.parse(JSON.stringify(newValue));
}, { deep: true, immediate: true });

// 添加用户
function addUser() {
  params.value.users.push({
    username: '',
    password: '',
    note: ''
  });
  emit('update:modelValue', params.value);
}

// 删除用户
function removeUser(index: number) {
  params.value.users.splice(index, 1);
  emit('update:modelValue', params.value);
}

// 保存配置
async function saveConfig() {
  try {
    error.value = '';
    
    // 验证用户数据
    const errors: string[] = [];
    params.value.users.forEach((user, index) => {
      if (!user.username) {
        errors.push(`第${index + 1}个用户的用户名不能为空`);
      }
      if (!user.password) {
        errors.push(`第${index + 1}个用户的密码不能为空`);
      }
    });

    if (errors.length > 0) {
      error.value = errors.join('\n');
      return;
    }

    // 保存配置
    const res = await fetch('/api/js/markdown-editor/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params.value)
    });

    if (!res.ok) {
      throw new Error('保存失败');
    }

    ElMessage.success('保存成功');
  } catch (err) {
    console.error('保存失败:', err);
    error.value = err instanceof Error ? err.message : '保存失败';
  }
}
</script>

<style scoped>
.params-editor {
  height: 100%;  /* 使用全部可用高度 */
  overflow-y: auto;  /* 添加垂直滚动条 */
  padding: 20px;
}

.user-list {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;  /* 改回 hidden */
}

.list-header {
  display: flex;
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color);
}

.header-cell {
  padding: 12px;
  font-weight: bold;
  flex: 1;
}

.list-item {
  display: flex;
  border-bottom: 1px solid var(--el-border-color);
}

.user-form {
  display: flex;
  width: 100%;
}

.item-cell {
  padding: 12px;
  flex: 1;
}

.action {
  width: 100px;
  flex: none;
}

.toolbar {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.error-message {
  margin-top: 20px;
}

:deep(.el-input__wrapper) {
  box-shadow: none !important;
  background: var(--el-fill-color-blank);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-border-color) !important;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) !important;
}

.api-config {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.hint {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.config-tips {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 20px;
}

.config-tips h4 {
  font-size: 0.95rem;
  color: #2c3e50;
  margin: 0 0 8px;
}

.config-tips ul {
  margin: 0;
  padding-left: 1.2rem;
}

.config-tips li {
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 4px;
}

.config-tips li:last-child {
  margin-bottom: 0;
}
</style> 