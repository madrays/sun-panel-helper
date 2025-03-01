<template>
  <el-dialog
    v-model="dialogVisible"
    title="QB下载器组件使用指南"
    width="60%"
    class="help-dialog"
  >
    <div class="help-content">
      <h3>基本使用流程</h3>
      <ol>
        <li><strong>添加下载器：</strong> 点击"添加下载器"按钮创建一个新的QB下载器配置。</li>
        <li><strong>配置参数：</strong> 填写QB下载器的地址、端口、用户名和密码等信息。</li>
        <li><strong>测试连接：</strong> 点击"测试连接"按钮验证配置是否有效。</li>
        <li><strong>自定义显示项：</strong> 选择需要在组件中显示的数据项。</li>
        <li><strong>预览效果：</strong> 配置验证成功后，可以在预览区查看实际效果。</li>
        <li><strong>应用到面板：</strong> 选择"应用到固定组件"或"应用到自由组件"将其添加到SunPanel面板。</li>
      </ol>

      <h3>常见问题</h3>
      <ul>
        <li><strong>组件名称冲突：</strong> 系统会自动处理同名组件，确保每个配置都能正确应用。</li>
        <li><strong>连接失败：</strong> 请检查QB下载器地址、端口是否正确，以及用户名密码是否有效。</li>
        <li><strong>预览不显示：</strong> 点击"刷新预览"按钮更新数据，或检查网络连接是否正常。</li>
        <li><strong>多个下载器管理：</strong> 可以添加多个QB下载器配置，通过左侧列表切换管理。</li>
      </ul>

      <h3>组件特殊性</h3>
      <ul>
        <li><strong>名称唯一性：</strong> 组件名称具有唯一性，是系统识别组件的关键标识，请勿随意更改名称。</li>
        <li><strong>实时参数更新：</strong> 修改参数后只需点击"保存配置"即可，无需重新添加或重新部署组件。</li>
        <li><strong>自动同步：</strong> 系统会自动将最新配置同步到已部署的组件，确保显示效果一致。</li>
        <li><strong>配置持久化：</strong> 所有配置会保存到服务器和本地存储，确保数据不会丢失。</li>
      </ul>

      <h3>高级提示</h3>
      <ul>
        <li>域名前缀是全局设置，所有组件共享同一域名前缀，仅需设置一次。</li>
        <li>应用到面板后，可以在SunPanel的布局编辑器中调整组件的大小和位置。</li>
        <li>定期刷新预览可以查看最新的下载状态数据。</li>
        <li>组件布局为响应式设计，会根据最终部署环境自动调整大小和布局。</li>
        <li>更新频率最小可设置为3秒，默认为10秒，建议根据实际需求调整。</li>
      </ul>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, watch } from 'vue'

const emit = defineEmits(['update:visible'])

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const dialogVisible = ref(props.visible)

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

// 监听对话框状态变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.help-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
    
    .el-dialog__header {
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }
    
    .el-dialog__body {
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }
  }
  
  .help-content {
    max-height: 60vh;
    overflow-y: auto;
    padding: 0 16px;
    
    h3 {
      margin-top: 20px;
      margin-bottom: 12px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
    
    ol, ul {
      padding-left: 20px;
      margin-bottom: 16px;
      
      li {
        margin-bottom: 8px;
        line-height: 1.6;
      }
    }
    
    strong {
      font-weight: 600;
    }
  }
}

@media (max-width: 768px) {
  .help-dialog {
    :deep(.el-dialog) {
      width: 90% !important;
      margin: 0 auto;
    }
  }
}
</style> 