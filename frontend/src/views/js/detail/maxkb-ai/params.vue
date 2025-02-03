<template>
  <div class="params-container">
    <!-- 标签页导航 -->
    <el-tabs v-model="activeTab" class="param-tabs">
      <el-tab-pane name="pc">
        <template #label>
          <div class="tab-label">
            <el-icon><Monitor /></el-icon>
            <span>电脑端</span>
          </div>
        </template>
      </el-tab-pane>
      <el-tab-pane name="mobile">
        <template #label>
          <div class="tab-label">
            <el-icon><Iphone /></el-icon>
            <span>手机端</span>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>

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

      <el-form :model="params" label-width="100px" class="basic-form">
        <el-form-item label="MaxKB链接" required>
          <el-input 
            v-model="params.chatUrl" 
            placeholder="请输入MaxKB应用链接"
          />
          <div class="form-tip">
            格式如：https://chat.xxx.com/ui/chat/xxx
          </div>
        </el-form-item>

        <el-form-item label="助手图标">
          <div class="upload-section">
            <el-upload
              class="upload-button"
              :action="`/api/js/maxkb-ai/upload`"
              :show-file-list="false"
              :on-success="handleLogoSuccess"
              :before-upload="beforeLogoUpload"
            >
              <el-button type="primary" size="small">
                <el-icon><Plus /></el-icon>
                上传图标
              </el-button>
            </el-upload>
          </div>
          
          <!-- 图标列表 -->
          <div class="logo-list">
            <div 
              v-for="logo in logoHistory" 
              :key="logo.path"
              class="logo-item"
              :class="{ active: params.logoPath === logo.path }"
            >
              <img 
                :src="logo.path" 
                :alt="logo.name"
                @click="selectLogo(logo.path)"
              >
              <div class="logo-actions">
                <el-button 
                  v-if="logo.name !== 'logo.gif'"
                  type="danger" 
                  circle
                  size="small"
                  @click.stop="deleteLogo(logo)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <!-- 设备相关设置 -->
      <div class="param-header">
        <div class="param-title">
          {{ activeTab === 'pc' ? '电脑端设置' : '手机端设置' }}
        </div>
      </div>

      <div class="device-params">
        <el-form 
          :model="activeTab === 'pc' ? params.pc : params.mobile" 
          label-width="100px"
        >
          <el-form-item label="位置">
            <el-radio-group 
              v-model="(activeTab === 'pc' ? params.pc : params.mobile).position"
            >
              <el-radio-button value="top-left">左上</el-radio-button>
              <el-radio-button value="top-right">右上</el-radio-button>
              <el-radio-button value="bottom-left">左下</el-radio-button>
              <el-radio-button value="bottom-right">右下</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <div class="size-settings">
            <div class="param-group">
              <div class="param-row">
                <div class="param-label">水平偏移</div>
                <el-input-number
                  v-model="(activeTab === 'pc' ? params.pc : params.mobile).offset.x"
                  :min="0"
                  :max="100"
                  :step="5"
                  size="small"
                  controls-position="right"
                />
                <span class="unit">px</span>
              </div>
              <div class="param-row">
                <div class="param-label">垂直偏移</div>
                <el-input-number
                  v-model="(activeTab === 'pc' ? params.pc : params.mobile).offset.y"
                  :min="0"
                  :max="100"
                  :step="5"
                  size="small"
                  controls-position="right"
                />
                <span class="unit">px</span>
              </div>
            </div>

            <div class="param-group">
              <div class="param-row">
                <div class="param-label">图标宽度</div>
                <el-input-number
                  v-model="(activeTab === 'pc' ? params.pc : params.mobile).size.width"
                  :min="activeTab === 'pc' ? 40 : 30"
                  :max="activeTab === 'pc' ? 200 : 120"
                  :step="10"
                  size="small"
                  controls-position="right"
                />
                <span class="unit">px</span>
              </div>
              <div class="param-row">
                <div class="param-label">图标高度</div>
                <el-input-number
                  v-model="(activeTab === 'pc' ? params.pc : params.mobile).size.height"
                  :min="activeTab === 'pc' ? 40 : 30"
                  :max="activeTab === 'pc' ? 200 : 120"
                  :step="10"
                  size="small"
                  controls-position="right"
                />
                <span class="unit">px</span>
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 使用指南对话框 -->
    <el-dialog
      v-model="showGuide"
      title="AI助手设置指南"
      width="500px"
      destroy-on-close
    >
      <div class="guide-content">
        <div class="guide-section">
          <h4>重要提示</h4>
          <ul class="guide-list">
            <li>图片格式：支持 JPG、PNG、GIF 等常见图片格式</li>
            <li>文件大小：单个文件不超过 5MB</li>
            <li>建议尺寸：根据设备类型选择合适的尺寸</li>
            <li>透明背景：建议使用透明背景的图片以获得最佳效果</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4>操作步骤</h4>
          <ol class="guide-list">
            <li>填写 MaxKB 链接</li>
            <li>上传或选择助手图标</li>
            <li>选择设备类型（电脑端/手机端）</li>
            <li>设置图标位置和大小</li>
            <li>点击部署按钮完成设置</li>
          </ol>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Plus, Monitor, Iphone, Warning, Delete } from '@element-plus/icons-vue';
import type { MaxkbAiParams } from '@/types/js/maxkb-ai';
import { DEFAULT_LOGO_PATH } from '@/constants/js/maxkb-ai';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: MaxkbAiParams
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: MaxkbAiParams): void,
  (e: 'device-change', device: 'pc' | 'mobile'): void
}>();

// 使用深拷贝确保参数结构完整
const params = ref<MaxkbAiParams>(JSON.parse(JSON.stringify(props.modelValue)));

// 监听参数变化
watch(
  params,
  (newVal) => {
    emit('update:modelValue', { ...newVal });
  },
  { deep: true }
);

// Logo上传相关方法
const handleLogoSuccess = async (res: any) => {
  params.value.logoPath = res.url;
  // 上传成功后立即刷新图标列表
  await loadLogoHistory();
};

const beforeLogoUpload = (file: File) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isValidType) {
    ElMessage.error('只支持JPG、PNG、GIF格式的图片!');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!');
    return false;
  }
  return true;
};

interface LogoInfo {
  name: string;
  path: string;
  uploadTime: string;
}

const logoHistory = ref<LogoInfo[]>([]);

// 加载历史图标
const loadLogoHistory = async () => {
  try {
    const res = await fetch('/api/js/maxkb-ai/logos');
    const data = await res.json();
    if (data.logos) {
      const hasDefaultLogo = data.logos.some(logo => logo.name === 'logo.gif');
      if (!hasDefaultLogo) {
        data.logos.unshift({
          name: 'logo.gif',
          path: DEFAULT_LOGO_PATH,
          uploadTime: new Date().toISOString()
        });
      }
      logoHistory.value = data.logos;
    }
  } catch (error) {
    console.error('加载历史图标失败:', error);
  }
};

// 选择图标
const selectLogo = (path: string) => {
  params.value.logoPath = path;
};

// 删除图标
const deleteLogo = async (logo: LogoInfo) => {
  try {
    const res = await fetch(`/api/js/maxkb-ai/logos/${encodeURIComponent(logo.name)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      ElMessage.success('删除成功');
      await loadLogoHistory();
      if (params.value.logoPath === logo.path) {
        params.value.logoPath = DEFAULT_LOGO_PATH;
      }
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    console.error('删除图标失败:', error);
    ElMessage.error('删除失败');
  }
};

// 当前激活的标签页
const activeTab = ref('pc');

// 监听标签页切换
watch(activeTab, (newVal) => {
  if (newVal === 'pc' || newVal === 'mobile') {
    emit('device-change', newVal);
  }
});

// 使用指南状态
const showGuide = ref(false);

onMounted(() => {
  loadLogoHistory();
});
</script>

<style scoped>
.params-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.param-tabs {
  flex-shrink: 0;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
}

:deep(.el-tabs__nav-wrap) {
  display: flex;
  justify-content: center;
}

:deep(.el-tabs__nav) {
  border: none;
  background: #fff;
  border-radius: 8px;
  padding: 4px;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  width: 360px;
}

:deep(.el-tabs__item) {
  flex: 1;
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  padding: 0;
  transition: all 0.3s;
  border-radius: 6px;
  margin: 0 2px;
  text-align: center;
}

:deep(.el-tabs__item.is-active) {
  font-weight: 500;
  background: var(--el-color-primary);
  color: white;
}

:deep(.el-tabs__item:hover) {
  color: var(--el-color-primary);
}

:deep(.el-tabs__item.is-active:hover) {
  color: white;
}

:deep(.el-tabs__active-bar) {
  display: none;
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

.upload-section {
  margin-bottom: 16px;
}

.logo-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.logo-item {
  aspect-ratio: 1;
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.logo-item:hover {
  border-color: var(--el-color-primary);
}

.logo-item.active {
  border-color: var(--el-color-primary);
}

.logo-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.logo-item:hover .logo-actions {
  opacity: 1;
}

.size-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px;
}

.param-group {
  display: flex;
  gap: 16px;
}

.param-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.param-label {
  width: 70px;
  color: #606266;
  font-size: 14px;
}

.unit {
  color: #909399;
  font-size: 14px;
}

:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-input-number.el-input-number--small) {
  width: 100px;
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

.tab-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  padding: 0 8px;
}

.tab-label .el-icon {
  font-size: 16px;
  margin-right: 2px;
}
</style> 