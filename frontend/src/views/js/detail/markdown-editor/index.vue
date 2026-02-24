<template>
  <div class="css-detail">
    <!-- 头部区域 -->
    <div class="detail-header">
      <div class="title-section">
        <h2>Markdown编辑器</h2>
        <p class="description">支持多用户的Markdown笔记编辑器,可在线编辑和预览</p>
      </div>
      <div class="action-buttons">
        <el-button 
          :type="isDeployed ? 'success' : 'primary'"
          @click="handleDeploy"
          :loading="deploying"
        >
          {{ isDeployed ? '重新部署' : '部署' }}
        </el-button>
        <el-button 
          type="danger" 
          @click="handleUndeploy"
          :loading="undeploying"
          v-if="isDeployed"
        >
          取消部署
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="detail-content">
      <!-- 参数调整区域 -->
      <div class="params-section">
        <h3>参数设置</h3>
        <params v-model="params" />
      </div>

      <!-- 预览区域 -->
      <div class="preview-section">
        <h3>使用说明</h3>
        <div class="docs-content">
          <h4>基本功能</h4>
          <ul>
            <li>支持多用户笔记管理</li>
            <li>支持 Markdown 实时预览</li>
            <li>支持代码高亮和一键复制</li>
            <li>支持本地/服务器双存储模式</li>
          </ul>

          <h4>快速开始</h4>
          <ul>
            <li>点击右下角笔记图标打开编辑器</li>
            <li>点击"新建"创建笔记</li>
            <li>使用工具栏快速插入 Markdown 语法</li>
            <li>自动保存，无需手动操作</li>
          </ul>

          <h4>存储说明</h4>
          <ul>
            <li>API 可用时自动使用服务器存储</li>
            <li>API 异常时自动切换本地存储</li>
            <li>支持 .md 文件导入导出</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { MarkdownEditorParams } from '@/types/js/markdown-editor';
import Params from './params.vue';

const isDeployed = ref(false);
const deploying = ref(false);
const undeploying = ref(false);

const params = ref<MarkdownEditorParams>({
  users: [],
  apiPrefix: ''
});

// 检查部署状态和读取配置
onMounted(async () => {
  try {
    // 检查部署状态
    const deployedRes = await fetch('/api/js/markdown-editor/deployed');
    if (!deployedRes.ok) throw new Error('检查部署状态失败');
    const { deployed } = await deployedRes.json();
    isDeployed.value = deployed;

    // 读取配置
    const configRes = await fetch('/api/js/markdown-editor/config');
    if (!configRes.ok) throw new Error('读取配置失败');
    const config = await configRes.json();
    params.value = config;
  } catch (error) {
    console.error('初始化失败:', error);
  }
});

// 部署
async function handleDeploy() {
  try {
    deploying.value = true;

    // 过滤空用户（用户名或密码为空的）
    const validUsers = params.value.users.filter(u => u.username && u.password);

    // 构建部署参数
    const deployParams = {
      ...params.value,
      users: validUsers
    };

    // 先保存配置
    const saveRes = await fetch('/api/js/markdown-editor/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deployParams)
    });

    if (!saveRes.ok) {
      throw new Error('保存配置失败');
    }

    // 然后部署
    const deployRes = await fetch('/api/js/markdown-editor/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deployParams)
    });

    const data = await deployRes.json();
    if (!deployRes.ok) {
      if (data.errors) {
        ElMessage.error(data.errors.join('\n'));
      } else {
        ElMessage.error(data.error || '部署失败');
      }
      return;
    }

    isDeployed.value = true;
    ElMessage.success(`部署成功（已过滤 ${params.value.users.length - validUsers.length} 个空用户）`);
  } catch (error) {
    console.error('部署失败:', error);
    ElMessage.error('部署失败');
  } finally {
    deploying.value = false;
  }
}

// 取消部署
async function handleUndeploy() {
  try {
    undeploying.value = true;
    const res = await fetch('/api/js/markdown-editor/undeploy', {
      method: 'POST'
    });
    
    if (!res.ok) throw new Error('取消部署失败');
    
    isDeployed.value = false;
    ElMessage.success('取消部署成功');
  } catch (error) {
    ElMessage.error('取消部署失败');
  } finally {
    undeploying.value = false;
  }
}

// 重置参数
function handleReset() {
  params.value = {
    users: [],
    apiPrefix: ''
  };
  ElMessage.success('参数已重置');
}
</script>

<style scoped>
.css-detail {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
  max-height: 800px;
  background: var(--bg-base);
}

.detail-header {
  margin-bottom: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex-shrink: 0;
}

.detail-header .title-section {
  flex: 1;
  min-width: 300px;
}

.detail-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 8px;
}

.description {
  color: #606266;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.detail-content {
  display: grid;
  grid-template-columns: minmax(600px, 2fr) minmax(300px, 1fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin-bottom: 0;
}

.preview-section,
.params-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0;
}

.preview-section h3,
.params-section h3 {
  margin: 0;
  padding: 12px 16px;
  font-size: 1rem;
  color: #2c3e50;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.docs-content {
  padding: 16px;
  overflow-y: auto;
}

.docs-content h4 {
  font-size: 1rem;
  color: #2c3e50;
  margin: 1rem 0 0.5rem;
}

.docs-content h4:first-child {
  margin-top: 0;
}

.docs-content ul {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.docs-content li {
  margin-bottom: 0.5rem;
  color: #606266;
  line-height: 1.5;
}

.params-section {
  height: 100%;
  overflow: hidden;
  margin: 0;
}

@media (max-width: 1200px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .preview-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .css-detail {
    padding: 16px;
    height: auto;
  }
  
  .detail-header {
    flex-direction: column;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 