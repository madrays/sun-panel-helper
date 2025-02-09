<template>
  <div class="params-container">
    <div class="param-content">
      <!-- 基础设置区域 -->
      <div class="param-header">
        <div class="param-title">
          基础设置
          <el-tooltip content="查看使用指南" placement="top">
            <el-button type="info" text @click="showGuide = true">
              <el-icon><Warning /></el-icon>
              使用指南
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 添加默认播放器说明 -->
      <div class="default-player-info">
        <el-alert
          type="success"
          :closable="false"
          show-icon
        >
          <template #title>
            默认播放器说明
          </template>
          <div class="provider-info">
            <p class="thanks">特别鸣谢：
              <a href="https://blog.ymz.icu/" target="_blank" class="provider">与末</a> 
              友情提供默认播放器
            </p>
            <p>默认播放器内容为网易云音乐热门榜单。</p>
            <p>如需自定义播放列表，请前往 <a href="https://myhkw.cn/" target="_blank">明月浩空网</a> 创建播放器。</p>
          </div>
        </el-alert>
      </div>

      <el-form :model="params" label-width="100px" class="basic-form">
        <el-form-item label="播放器ID" required>
          <el-input 
            v-model="params.playerId" 
            placeholder="请输入MYHK播放器ID"
          />
          <div class="form-tip">
            格式如：16698096362
          </div>
        </el-form-item>

        <el-form-item label="显示位置">
          <el-radio-group v-model="params.position">
            <el-radio-button value="left">左侧</el-radio-button>
            <el-radio-button value="right">右侧</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="移动端加载">
          <el-switch v-model="params.mobileLoad" />
          <div class="form-tip">
            开启后将在移动端显示播放器
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 使用指南对话框 -->
    <el-dialog
      v-model="showGuide"
      title="音乐播放器设置指南"
      width="500px"
      destroy-on-close
    >
      <div class="guide-content">
        <div class="guide-section">
          <h4>重要提示</h4>
          <ul class="guide-list">
            <li>播放器ID：在MYHK音乐创建播放器后获取</li>
            <li>显示位置：可选择左侧或右侧显示</li>
            <li>移动端：可选择是否在移动端加载</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4>操作步骤</h4>
          <ol class="guide-list">
            <li>访问 MYHK音乐 创建播放器</li>
            <li>获取播放器ID</li>
            <li>填写播放器ID</li>
            <li>选择显示位置和移动端设置</li>
            <li>点击部署按钮完成设置</li>
          </ol>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Warning } from '@element-plus/icons-vue';
import type { MusicPlayerConfig } from '@/types/js/music-player';

const props = defineProps<{
  modelValue: MusicPlayerConfig
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: MusicPlayerConfig): void
}>();

// 使用深拷贝确保参数结构完整
const params = ref<MusicPlayerConfig>(JSON.parse(JSON.stringify(props.modelValue)));

// 监听参数变化
watch(
  params,
  (newVal) => {
    emit('update:modelValue', { ...newVal });
  },
  { deep: true }
);

// 使用指南状态
const showGuide = ref(false);
</script>

<style scoped>
.params-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.param-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.param-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  margin: 0 -20px 20px;
}

.param-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.guide-content {
  padding: 16px;
}

.guide-section {
  margin-bottom: 20px;
}

.guide-section h4 {
  margin: 0 0 12px;
  color: #2c3e50;
  font-size: 16px;
}

.guide-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.guide-list li {
  margin-bottom: 8px;
}

.default-player-info {
  margin: 0 -20px 20px;
  padding: 0 20px;
}

.default-player-info :deep(.el-alert__title) {
  font-size: 14px;
  font-weight: bold;
}

.default-player-info p {
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.5;
}

.default-player-info a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.default-player-info a:hover {
  text-decoration: underline;
}

.provider-info {
  padding: 4px 0;
}

.provider-info .thanks {
  font-weight: 500;
  color: #67c23a;
  margin-bottom: 8px;
}

.provider-info .provider {
  font-size: 15px;
  color: #f56c6c;
  font-weight: bold;
  margin: 0 2px;
  text-decoration: none;
  transition: all 0.3s;
}

.provider-info .provider:hover {
  color: #ff7875;
  text-decoration: underline;
}
</style> 