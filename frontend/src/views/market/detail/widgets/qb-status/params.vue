<template>
  <div class="qb-params">
    <el-form label-position="top">
      <el-form-item label="名称" prop="name">
        <el-input 
          v-model="qbConfig.name" 
          placeholder="给这个QB下载器起个名字"
          :status="nameStatus"
        />
        <div class="form-item-tip">
          <el-alert
            :type="nameAlertType"
            :closable="false"
            show-icon
            size="small"
          >
            {{ nameAlertMessage }}
          </el-alert>
        </div>
      </el-form-item>
      
      <el-form-item label="QB访问地址">
        <el-input 
          v-model="qbConfig.url" 
          placeholder="例如: http://192.168.1.100:8080" 
        />
        <div class="form-tip">请输入完整URL，包含http/https和端口</div>
        
        <el-alert
          type="info"
          :closable="false"
          show-icon
          size="small"
          style="margin-top: 10px;"
        >
          <template #title>
            <span style="font-weight: 500;">IPv6兼容性提示</span>
          </template>
          <div class="ipv6-tip">
            由于容器环境普遍不支持IPv6，如需管理纯IPv6域名的下载器，建议：
            <ul style="margin: 5px 0 0 0; padding-left: 18px;">
              <li>若与Helper在同一局域网，请使用局域网IPv4地址+端口</li>
              <li>或使用frp、ngrok等内网穿透工具转发至IPv4地址</li>
            </ul>
          </div>
        </el-alert>
      </el-form-item>
      
      <el-form-item label="用户名">
        <el-input v-model="qbConfig.username" placeholder="请输入用户名" />
      </el-form-item>
      
      <el-form-item label="密码">
        <el-input 
          v-model="qbConfig.password" 
          type="password" 
          placeholder="请输入密码" 
          show-password
        />
      </el-form-item>
      
      <el-form-item label="更新频率">
        <el-slider 
          v-model="qbConfig.updateInterval" 
          :min="3" 
          :max="300" 
          :step="1"
          :format-tooltip="formatSeconds"
        />
        <div class="slider-value">{{ formatSeconds(qbConfig.updateInterval) }}</div>
      </el-form-item>
      
      <el-divider content-position="center">显示项配置</el-divider>
      
      <div class="display-items-section">
        <div class="display-items-header">
          <div class="required-items">
            <span class="section-label">必选项：</span>
            <el-checkbox v-model="qbConfig.displayItems.downloadSpeed" disabled checked>下载速度</el-checkbox>
            <el-checkbox v-model="qbConfig.displayItems.uploadSpeed" disabled checked>上传速度</el-checkbox>
          </div>
        </div>
        
        <el-tag type="warning" class="tip-tag" effect="dark">
          <el-icon><Warning /></el-icon>
          <span>增加或删除显示项目后，务必调整下方显示顺序！</span>
        </el-tag>
        
        <div class="display-items">
          <el-checkbox v-model="qbConfig.displayItems.activeDownloads">活跃下载</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.activeTorrents">活跃种子</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.pausedTorrents">暂停种子</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.completedTorrents">完成种子</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.totalTorrents">总种子数</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.errorTorrents">错误种子</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.seedingTorrents">做种数量</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.ioTasks">I/O任务</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.globalRatio">全局分享率</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.averageRatio">平均分享率</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.globalDownloaded">总下载量</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.globalUploaded">总上传量</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.uploadLimit">上传限速</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.downloadLimit">下载限速</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.freeSpace">剩余空间</el-checkbox>
          <el-checkbox v-model="qbConfig.displayItems.totalSize">总大小</el-checkbox>
        </div>
        
        <el-divider content-position="center">显示顺序调整</el-divider>
        
        <div class="display-order-section">
          <p class="order-tip">拖拽调整显示项顺序（仅对已选中的项目生效）：</p>
          <el-alert
            type="info"
            :closable="false"
            show-icon
            size="small"
            style="margin-bottom: 16px;"
          >
            下载速度和上传速度始终显示在最前面，其他项目按照下面的顺序显示
          </el-alert>
          
          <div class="sortable-list">
            <draggable 
              v-model="displayOrder" 
              item-key="key"
              handle=".drag-handle"
              ghost-class="ghost"
              chosen-class="chosen"
            >
              <template #item="{ element }">
                <div class="sortable-item" :class="{ 'disabled': !isItemSelected(element.key) }">
                  <el-icon class="drag-handle" v-if="isItemSelected(element.key)"><Rank /></el-icon>
                  <el-icon v-else><Lock /></el-icon>
                  <span>{{ element.label }}</span>
                  <el-tag size="small" :type="isItemSelected(element.key) ? 'success' : 'info'">
                    {{ isItemSelected(element.key) ? '已选' : '未选' }}
                  </el-tag>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <el-button @click="testConnection" :disabled="isNameDuplicated || !qbConfig.name">测试连接</el-button>
        <el-button type="primary" @click="saveConfig" :disabled="isNameDuplicated || !qbConfig.name">保存配置</el-button>
      </div>
      
      <el-divider content-position="center">应用到组件池</el-divider>
      
      <div class="apply-buttons">
        <el-button 
          :type="qbConfig.isAppliedToFixed ? 'info' : 'success'" 
          @click="applyToFixed"
          :disabled="!qbConfig.isConfigValid || qbConfig.isAppliedToFixed || isNameDuplicated"
          :title="qbConfig.isAppliedToFixed ? '请从固定组件池中删除此组件后再添加' : ''"
        >
          {{ qbConfig.isAppliedToFixed ? '已添加到固定组件池' : '添加到固定组件池' }}
        </el-button>
        <el-button 
          :type="qbConfig.isAppliedToFree ? 'info' : 'warning'" 
          @click="applyToFree"
          :disabled="!qbConfig.isConfigValid || qbConfig.isAppliedToFree || isNameDuplicated"
          :title="qbConfig.isAppliedToFree ? '请从自由组件池中删除此组件后再添加' : ''"
        >
          {{ qbConfig.isAppliedToFree ? '已添加到自由组件池' : '添加到自由组件池' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { Rank, Lock, Warning } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 定义接口
interface QBConfig {
  id: string
  name: string
  url: string
  username: string
  password: string
  domainPrefix?: string
  updateInterval: number
  displayItems: {
    downloadSpeed: boolean
    uploadSpeed: boolean
    activeTorrents: boolean
    pausedTorrents: boolean
    completedTorrents: boolean
    totalTorrents: boolean
    activeDownloads: boolean
    globalRatio: boolean
    globalDownloaded: boolean
    globalUploaded: boolean
    freeSpace: boolean
    seedingTorrents: boolean
    totalSize: boolean
    averageRatio: boolean
    ioTasks: boolean
    errorTorrents: boolean
    uploadLimit: boolean
    downloadLimit: boolean
  }
  isConfigValid: boolean
  lastTested: number
  isAppliedToFixed?: boolean
  isAppliedToFree?: boolean
  displayOrder?: string[]
}

const props = defineProps<{
  modelValue: QBConfig
  fixedPoolWidgets?: any[]
  freePoolWidgets?: any[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: QBConfig): void
  (e: 'test-connection'): void
  (e: 'save-config'): void
  (e: 'apply-to-fixed'): void
  (e: 'apply-to-free'): void
}>()

// 计算属性，用于双向绑定
const qbConfig = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 格式化秒数为可读时间
const formatSeconds = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 
      ? `${minutes}分${remainingSeconds}秒` 
      : `${minutes}分钟`
  }
}

// 名称验证相关
const isNameDuplicated = ref(false)
const qbConfigs = ref<Record<string, any>>({})

// 名称验证状态和消息
const nameStatus = computed(() => {
  if (!qbConfig.value.name) return '';
  return isNameDuplicated.value ? 'error' : '';
})

const nameAlertType = computed(() => {
  if (!qbConfig.value.name) return 'warning';
  if (qbConfig.value.isAppliedToFixed || qbConfig.value.isAppliedToFree) {
    return 'info';
  }
  return isNameDuplicated.value ? 'error' : 'warning';
})

const nameAlertMessage = computed(() => {
  if (!qbConfig.value.name) return '名称不能为空';
  if (qbConfig.value.isAppliedToFixed || qbConfig.value.isAppliedToFree) {
    return '组件已添加到组件池，无法修改名称';
  }
  if (isNameDuplicated.value) {
    return `名称 "${qbConfig.value.name}" 已存在，请使用其他名称`;
  }
  return '名称具有唯一性，是系统识别组件的关键标识，请勿随意更改';
})

// 获取所有QB配置
const fetchQBConfigs = async () => {
  try {
    const response = await axios.get('/api/widgets/qb-status/configs')
    qbConfigs.value = response.data || {}
    console.log('获取到QB配置列表:', Object.keys(qbConfigs.value).length, '个配置')
    checkNameDuplicate()
  } catch (error) {
    console.error('获取QB配置列表失败:', error)
    qbConfigs.value = {}
  }
}

// 检查组件名称是否重复 - 检查QB配置列表
const checkNameDuplicate = () => {
  if (!qbConfig.value.name) {
    isNameDuplicated.value = false
    return
  }
  
  try {
    console.log('开始检查名称重复，当前名称:', qbConfig.value.name)
    console.log('QB配置数量:', Object.keys(qbConfigs.value).length)
    
    // 检查名称是否在其他配置中重复
    const isDuplicate = Object.values(qbConfigs.value).some((config: any) => {
      const isSameName = config.name === qbConfig.value.name
      const isDifferentId = config.id !== qbConfig.value.id
      const duplicate = isSameName && isDifferentId
      
      if (duplicate) {
        console.log('发现重名配置:', config.name, '(ID:', config.id, ')')
      }
      
      return duplicate
    })
    
    isNameDuplicated.value = isDuplicate
    console.log('名称重复检查结果:', isNameDuplicated.value ? '重复' : '不重复')
    
    if (isNameDuplicated.value) {
      ElMessage.warning(`名称 "${qbConfig.value.name}" 已存在，请使用其他名称`)
    }
  } catch (error) {
    console.error('检查名称重复出错:', error)
    // 防止错误影响用户体验
    isNameDuplicated.value = false
  }
}

// 监听名称变化
watch(() => qbConfig.value.name, (newName) => {
  console.log('名称变化:', newName)
  if (newName) {
    checkNameDuplicate()
  } else {
    isNameDuplicated.value = false
  }
})

// 测试连接
const testConnection = () => {
  emit('test-connection')
}

// 保存配置
const saveConfig = () => {
  emit('save-config')
}

// 应用到固定组件
const applyToFixed = () => {
  if (isNameDuplicated.value) {
    ElMessage.error('组件名称重复，请修改后再添加')
    return
  }
  emit('apply-to-fixed')
}

// 应用到自由组件
const applyToFree = () => {
  if (isNameDuplicated.value) {
    ElMessage.error('组件名称重复，请修改后再添加')
    return
  }
  emit('apply-to-free')
}

// 显示项顺序
interface DisplayItem {
  key: string
  label: string
}

// 初始化显示顺序
const displayOrder = ref<DisplayItem[]>([
  { key: 'activeDownloads', label: '活跃下载' },
  { key: 'activeTorrents', label: '活跃种子' },
  { key: 'pausedTorrents', label: '暂停种子' },
  { key: 'completedTorrents', label: '完成种子' },
  { key: 'totalTorrents', label: '总种子数' },
  { key: 'errorTorrents', label: '错误种子' },
  { key: 'seedingTorrents', label: '做种数量' },
  { key: 'ioTasks', label: 'I/O任务' },
  { key: 'globalRatio', label: '全局分享率' },
  { key: 'averageRatio', label: '平均分享率' },
  { key: 'globalDownloaded', label: '总下载量' },
  { key: 'globalUploaded', label: '总上传量' },
  { key: 'uploadLimit', label: '上传限速' },
  { key: 'downloadLimit', label: '下载限速' },
  { key: 'freeSpace', label: '剩余空间' },
  { key: 'totalSize', label: '总大小' }
])

// 检查项目是否被选中
const isItemSelected = (key: string) => {
  return qbConfig.value.displayItems[key as keyof typeof qbConfig.value.displayItems]
}

// 监听顺序变化，更新配置
watch(displayOrder, (newOrder) => {
  // 将顺序保存到配置中，但只保存用户选中的项目
  const selectedItems = newOrder
    .filter(item => qbConfig.value.displayItems[item.key] === true)
    .map(item => item.key);
  
  qbConfig.value.displayOrder = selectedItems;
  console.log('显示顺序已更新:', qbConfig.value.displayOrder);
}, { deep: true })

// 监听配置中displayItems的变化
watch(() => qbConfig.value.displayItems, (newDisplayItems) => {
  console.log('显示项配置已更新:', newDisplayItems);
  
  // 当显示项状态变化时，更新排序列表中的项目状态
  displayOrder.value.forEach(item => {
    const isEnabled = newDisplayItems[item.key] === true;
    console.log(`项目 ${item.key} 状态更新为: ${isEnabled ? '启用' : '禁用'}`);
  });
}, { deep: true })

// 初始化时从配置加载显示顺序
onMounted(() => {
  console.log('初始化显示顺序，当前配置:', JSON.stringify(qbConfig.value));
  
  // 获取QB配置列表并检查名称重复
  fetchQBConfigs()
  
  // 确保所有显示项都存在
  const allItems = [
    'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
    'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
    'seedingTorrents', 'ioTasks', 'globalRatio', 'averageRatio',
    'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
    'freeSpace', 'totalSize'
  ];
  
  if (!qbConfig.value.displayItems) {
    // 创建一个包含所有必要字段的displayItems对象
    qbConfig.value.displayItems = {
      downloadSpeed: true,
      uploadSpeed: true,
      activeDownloads: false,
      activeTorrents: false,
      pausedTorrents: false,
      completedTorrents: false,
      totalTorrents: false,
      globalRatio: false,
      globalDownloaded: false,
      globalUploaded: false,
      freeSpace: false,
      seedingTorrents: false,
      totalSize: false,
      averageRatio: false,
      ioTasks: false,
      errorTorrents: false,
      uploadLimit: false,
      downloadLimit: false
    };
  } else {
    // 确保所有字段都存在，但不改变现有值
    allItems.forEach(item => {
      if (qbConfig.value.displayItems[item] === undefined) {
        console.log(`配置中缺少${item}项，设置为默认值false`);
        qbConfig.value.displayItems[item] = false;
      }
    });
  }
  
  // 初始化显示顺序列表，始终包含所有项目
  const orderMap = new Map<string, DisplayItem>();
  
  // 创建所有项目的映射
  allItems.forEach(key => {
    const label = getItemLabel(key);
    orderMap.set(key, { key, label });
  });
  
  // 如果配置中已有显示顺序，则使用配置中的顺序
  if (qbConfig.value.displayOrder && qbConfig.value.displayOrder.length > 0) {
    console.log('使用配置中的显示顺序:', qbConfig.value.displayOrder);
    
    // 根据配置中的顺序重新排列
    const newOrder: DisplayItem[] = [];
    
    // 首先添加配置中指定的项目
    qbConfig.value.displayOrder.forEach(key => {
      const item = orderMap.get(key);
      if (item) {
        newOrder.push(item);
        orderMap.delete(key);
      }
    });
    
    // 然后添加剩余的项目
    orderMap.forEach(item => {
      newOrder.push(item);
    });
    
    // 更新显示顺序
    displayOrder.value = newOrder;
  } else {
    console.log('配置中没有显示顺序，使用默认顺序');
    
    // 使用默认顺序
    displayOrder.value = allItems.map(key => {
      const label = getItemLabel(key);
      return { key, label };
    });
    
    // 确保配置中有displayOrder字段，只包含已选中的项目
    qbConfig.value.displayOrder = qbConfig.value.displayItems ? 
      Object.keys(qbConfig.value.displayItems).filter(key => qbConfig.value.displayItems[key] === true) : 
      ['downloadSpeed', 'uploadSpeed'];
  }
  
  console.log('初始化后的显示顺序:', displayOrder.value.map(item => item.key));
})

// 获取项目标签
function getItemLabel(key: string): string {
  const labelMap: Record<string, string> = {
    downloadSpeed: '下载速度',
    uploadSpeed: '上传速度',
    activeDownloads: '活跃下载',
    activeTorrents: '活跃种子',
    pausedTorrents: '暂停种子',
    completedTorrents: '完成种子',
    totalTorrents: '总种子数',
    errorTorrents: '错误种子',
    seedingTorrents: '做种数量',
    ioTasks: 'I/O任务',
    globalRatio: '全局分享率',
    averageRatio: '平均分享率',
    globalDownloaded: '总下载量',
    globalUploaded: '总上传量',
    uploadLimit: '上传限速',
    downloadLimit: '下载限速',
    freeSpace: '剩余空间',
    totalSize: '总大小'
  };
  
  return labelMap[key] || key;
}
</script>

<style lang="scss" scoped>
.qb-params {
  padding: 16px;
  
  .el-form {
    max-width: 100%;
  }
  
  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }
  
  .form-item-tip {
    margin-top: 4px;
    font-size: 12px;
    
    :deep(.el-alert) {
      padding: 6px 8px;
    }
  }
  
  .ipv6-tip {
    font-size: 12px;
    line-height: 1.5;
    
    ul {
      margin-top: 4px;
      
      li {
        margin-bottom: 3px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
  
  .slider-value {
    text-align: center;
    margin-top: 8px;
    color: var(--el-color-primary);
    font-weight: 500;
  }
  
  .display-items-section {
    margin-bottom: 24px;
  }
  
  .display-items-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .section-label {
    font-weight: 600;
    color: var(--el-color-primary);
  }
  
  .display-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
    
    .el-checkbox {
      margin-right: 0;
      border-radius: 4px;
      padding: 6px 8px;
      transition: all 0.2s;
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
    }
  }
  
  .action-buttons, .apply-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
    
    .el-button {
      min-width: 120px;
      border-radius: 6px;
    }
  }
  
  .apply-buttons {
    margin-top: 16px;
  }
  
  :deep(.el-input),
  :deep(.el-select) {
    border-radius: 6px;
    
    .el-input__wrapper {
      border-radius: 6px;
    }
  }
  
  :deep(.el-slider) {
    .el-slider__runway {
      border-radius: 4px;
    }
    
    .el-slider__button {
      border-radius: 50%;
    }
  }
  
  :deep(.el-divider) {
    margin: 24px 0;
    
    .el-divider__text {
      background-color: #fff;
      padding: 0 16px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }
}

@media (max-width: 768px) {
  .qb-params {
    .display-items {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    
    .action-buttons, .apply-buttons {
      flex-direction: column;
      
      .el-button {
        width: 100%;
      }
    }
  }
}

.display-order-section {
  margin-top: 16px;
  
  .order-tip {
    font-size: 14px;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
  }
  
  .sortable-list {
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    overflow: hidden;
    
    .sortable-item {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      background-color: #fff;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
      }
      
      &.disabled {
        opacity: 0.6;
        background-color: var(--el-fill-color-light);
      }
      
      .el-icon {
        margin-right: 12px;
        font-size: 16px;
        color: var(--el-color-primary);
        
        &.drag-handle {
          cursor: move;
        }
      }
      
      span {
        flex: 1;
      }
      
      .el-tag {
        margin-left: 8px;
      }
    }
  }
}

.tip-tag {
    width: 100%;
    margin: 10px 0 15px;
    padding: 8px 10px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    
    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }

  .ghost {
    opacity: 0.5;
    background: var(--el-color-primary-light-9) !important;
  }

  .chosen {
    background: var(--el-color-primary-light-8);
  }
</style> 