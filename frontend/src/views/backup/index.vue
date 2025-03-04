<template>
  <div class="backup-page">
    <div class="page-header">
      <h2 class="title">备份恢复</h2>
      <p class="description">管理系统配置与部署文件的备份，防止配置文件错乱</p>
    </div>

    <!-- 配置文件备份卡片 -->
    <el-card class="backup-card">
      <template #header>
        <div class="card-header">
          <div>
            <h3>配置文件备份</h3>
            <p class="subtitle">备份路径：backend/data 目录下的所有配置文件</p>
          </div>
          <el-button type="primary" :loading="configBackupLoading" @click="createConfigBackup">
            <el-icon><Plus /></el-icon>创建新备份
          </el-button>
        </div>
      </template>

      <!-- 备份搜索和过滤 -->
      <div class="backup-filter">
        <el-input
          v-model="configSearchText"
          placeholder="搜索备份名称或备注"
          clearable
          prefix-icon="Search"
          style="width: 300px; margin-right: 16px;"
        />
        <el-select v-model="configBackupType" placeholder="备份类型" style="width: 150px;">
          <el-option label="全部备份" value="all" />
          <el-option label="手动备份" value="manual" />
          <el-option label="自动备份" value="auto" />
        </el-select>
      </div>

      <!-- 备份表格 -->
      <el-table 
        :data="filteredConfigBackups" 
        stripe 
        style="width: 100%" 
        v-loading="listLoading"
        :default-sort="{ prop: 'created', order: 'descending' }"
      >
        <el-table-column prop="name" label="备份名称" min-width="250">
          <template #default="scope">
            <div class="backup-name">
              <el-tooltip :content="scope.row.name" placement="top">
                <span>{{ formatBackupName(scope.row.name) }}</span>
              </el-tooltip>
              <el-tag size="small" :type="scope.row.isAuto ? 'info' : 'success'" class="backup-tag">
                {{ scope.row.isAuto ? '自动' : '手动' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created" label="创建时间" width="180" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.created) }}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120">
          <template #default="scope">
            {{ formatSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="200">
          <template #default="scope">
            <div class="backup-note">
              <span v-if="scope.row.note" class="note-content">{{ scope.row.note }}</span>
              <span v-else class="no-note">无备注</span>
              <el-tooltip content="编辑备注" placement="top">
                <el-button 
                  type="warning" 
                  size="small" 
                  circle
                  @click="openNoteDialog(scope.row)"
                  class="note-edit-btn"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" :loading="scope.row.restoring" @click="restoreBackup(scope.row)">
              恢复
            </el-button>
            <el-button type="danger" size="small" :loading="scope.row.deleting" @click="deleteBackup(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="configCurrentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="processBackups(configBackups, configSearchText, configBackupType).length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 部署文件备份卡片 -->
    <el-card class="backup-card">
      <template #header>
        <div class="card-header">
          <div>
            <h3>部署文件备份</h3>
            <p class="subtitle">备份路径：backend/custom/index.css 和 backend/custom/index.js</p>
          </div>
          <el-button type="primary" :loading="deployBackupLoading" @click="createDeploymentBackup">
            <el-icon><Plus /></el-icon>创建新备份
          </el-button>
        </div>
      </template>

      <!-- 备份搜索和过滤 -->
      <div class="backup-filter">
        <el-input
          v-model="deploySearchText"
          placeholder="搜索备份名称或备注"
          clearable
          prefix-icon="Search"
          style="width: 300px; margin-right: 16px;"
        />
        <el-select v-model="deployBackupType" placeholder="备份类型" style="width: 150px;">
          <el-option label="全部备份" value="all" />
          <el-option label="手动备份" value="manual" />
          <el-option label="自动备份" value="auto" />
        </el-select>
      </div>

      <!-- 备份表格 -->
      <el-table 
        :data="filteredDeploymentBackups" 
        stripe 
        style="width: 100%" 
        v-loading="listLoading"
        :default-sort="{ prop: 'created', order: 'descending' }"
      >
        <el-table-column prop="name" label="备份名称" min-width="250">
          <template #default="scope">
            <div class="backup-name">
              <el-tooltip :content="scope.row.name" placement="top">
                <span>{{ formatBackupName(scope.row.name) }}</span>
              </el-tooltip>
              <el-tag size="small" :type="scope.row.isAuto ? 'info' : 'success'" class="backup-tag">
                {{ scope.row.isAuto ? '自动' : '手动' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created" label="创建时间" width="180" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.created) }}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120">
          <template #default="scope">
            {{ formatSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="200">
          <template #default="scope">
            <div class="backup-note">
              <span v-if="scope.row.note" class="note-content">{{ scope.row.note }}</span>
              <span v-else class="no-note">无备注</span>
              <el-tooltip content="编辑备注" placement="top">
                <el-button 
                  type="warning" 
                  size="small" 
                  circle
                  @click="openNoteDialog(scope.row)"
                  class="note-edit-btn"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" :loading="scope.row.restoring" @click="restoreBackup(scope.row)">
              恢复
            </el-button>
            <el-button type="danger" size="small" :loading="scope.row.deleting" @click="deleteBackup(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="deployCurrentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="processBackups(deploymentBackups, deploySearchText, deployBackupType).length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 自动备份设置卡片 -->
    <el-card class="backup-card">
      <template #header>
        <div class="card-header">
          <div>
            <h3>自动备份设置</h3>
            <p class="subtitle">系统会自动每小时进行备份，最多保留100份最新备份</p>
          </div>
        </div>
      </template>

      <div class="auto-backup-info">
        <el-alert
          title="自动备份已启用"
          type="success"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>系统会每小时自动创建一次备份，并在数量超过100个时自动删除最旧的备份。</p>
            <p>自动备份的文件名格式为 "configs-auto-时间戳.zip" 和 "deployment-auto-时间戳.zip"。</p>
          </template>
        </el-alert>
      </div>
    </el-card>

    <!-- 备注对话框 -->
    <el-dialog
      v-model="noteDialogVisible"
      title="编辑备注"
      width="500px"
    >
      <el-form>
        <el-form-item label="备份名称">
          <div>{{ formatBackupName(currentBackup?.name || '') }}</div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="backupNote"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="noteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveBackupNote" :loading="saveNoteLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { format } from 'date-fns'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Search } from '@element-plus/icons-vue'
import axios from 'axios'

interface Backup {
  id: string
  name: string
  size: number
  created: string
  type: 'configs' | 'deployment'
  note?: string
  isAuto: boolean
  restoring?: boolean
  deleting?: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  backup?: Backup
}

// 备份列表
const backups = ref<Backup[]>([])

// 搜索和过滤
const configSearchText = ref('')
const deploySearchText = ref('')
const configBackupType = ref('all')
const deployBackupType = ref('all')

// 分页
const pageSize = ref(10)
const configCurrentPage = ref(1)
const deployCurrentPage = ref(1)

// 加载状态
const listLoading = ref(false)
const configBackupLoading = ref(false)
const deployBackupLoading = ref(false)

// 备注对话框
const noteDialogVisible = ref(false)
const currentBackup = ref<Backup | null>(null)
const backupNote = ref('')
const saveNoteLoading = ref(false)

// 格式化备份名称
const formatBackupName = (name: string) => {
  // 显示更易读的时间戳
  return name.replace(/(configs|deployment)-(?:auto-)?(.+?)\.zip/, (_, type, timestamp) => {
    const formattedType = type === 'configs' ? '配置文件' : '部署文件'
    
    // 处理自动备份和手动备份
    const isAuto = name.includes('-auto-')
    const typeWithMode = isAuto ? `${formattedType}(自动)` : formattedType
    
    // 更好地格式化时间戳
    let formattedTime = timestamp
    try {
      // 尝试解析日期格式，并使用更友好的格式显示
      formattedTime = timestamp
        .replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/, '$1-$2-$3 $4:$5:$6')
    } catch (error) {
      console.warn('日期格式化失败:', error)
    }
    
    return `${typeWithMode} - ${formattedTime}`
  })
}

// 处理搜索和筛选
const processBackups = (backups: Backup[], searchText: string, backupType: string) => {
  // 处理备份类型筛选
  let filtered = backups
  if (backupType === 'auto') {
    filtered = filtered.filter(b => b.isAuto)
  } else if (backupType === 'manual') {
    filtered = filtered.filter(b => !b.isAuto)
  }

  // 处理搜索文本
  if (searchText.trim()) {
    const searchLower = searchText.toLowerCase().trim()
    filtered = filtered.filter(b => 
      formatBackupName(b.name).toLowerCase().includes(searchLower) || 
      (b.note && b.note.toLowerCase().includes(searchLower))
    )
  }

  return filtered
}

// 筛选后的配置备份
const configBackups = computed(() => {
  return backups.value
    .filter(backup => backup.type === 'configs')
    .map(backup => ({
      ...backup,
      isAuto: backup.name.includes('-auto-')
    }))
})

// 筛选后的部署备份
const deploymentBackups = computed(() => {
  return backups.value
    .filter(backup => backup.type === 'deployment')
    .map(backup => ({
      ...backup,
      isAuto: backup.name.includes('-auto-')
    }))
})

// 搜索和分页过滤后的配置备份
const filteredConfigBackups = computed(() => {
  const filtered = processBackups(configBackups.value, configSearchText.value, configBackupType.value)
  const startIndex = (configCurrentPage.value - 1) * pageSize.value
  return filtered.slice(startIndex, startIndex + pageSize.value)
})

// 搜索和分页过滤后的部署备份
const filteredDeploymentBackups = computed(() => {
  const filtered = processBackups(deploymentBackups.value, deploySearchText.value, deployBackupType.value)
  const startIndex = (deployCurrentPage.value - 1) * pageSize.value
  return filtered.slice(startIndex, startIndex + pageSize.value)
})

// 获取所有备份
const loadBackups = async () => {
  listLoading.value = true
  try {
    const response = await axios.get<ApiResponse<Backup[]>>('/api/backup')
    if (response.data.success && response.data.data) {
      backups.value = response.data.data
    } else {
      ElMessage.error(response.data.message || '获取备份列表失败')
    }
  } catch (error) {
    console.error('加载备份失败:', error)
    ElMessage.error('获取备份列表失败')
  } finally {
    listLoading.value = false
  }
}

// 创建配置文件备份
const createConfigBackup = async () => {
  configBackupLoading.value = true
  try {
    const response = await axios.post<ApiResponse>('/api/backup/configs')
    if (response.data.success && response.data.backup) {
      ElMessage.success('配置文件备份创建成功')
      // 添加新备份到列表
      backups.value = [response.data.backup, ...backups.value]
    } else {
      ElMessage.error(response.data.message || '创建配置文件备份失败')
    }
  } catch (error) {
    console.error('创建配置文件备份失败:', error)
    ElMessage.error('创建配置文件备份失败')
  } finally {
    configBackupLoading.value = false
  }
}

// 创建部署文件备份
const createDeploymentBackup = async () => {
  deployBackupLoading.value = true
  try {
    const response = await axios.post<ApiResponse>('/api/backup/deployment')
    if (response.data.success && response.data.backup) {
      ElMessage.success('部署文件备份创建成功')
      // 添加新备份到列表
      backups.value = [response.data.backup, ...backups.value]
    } else {
      ElMessage.error(response.data.message || '创建部署文件备份失败')
    }
  } catch (error) {
    console.error('创建部署文件备份失败:', error)
    ElMessage.error('创建部署文件备份失败')
  } finally {
    deployBackupLoading.value = false
  }
}

// 恢复备份
const restoreBackup = async (backup: Backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复备份 "${formatBackupName(backup.name)}" 吗？这将覆盖当前的${backup.type === 'configs' ? '配置文件' : '部署文件'}。`,
      '恢复确认',
      {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 设置加载状态
    const index = backups.value.findIndex(b => b.id === backup.id)
    if (index !== -1) {
      backups.value[index].restoring = true
    }
    
    // 发送恢复请求
    const response = await axios.post<ApiResponse>(`/api/backup/restore/${backup.id}`)
    if (response.data.success) {
      ElMessage.success('备份恢复成功')
    } else {
      ElMessage.error(response.data.message || '恢复备份失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('恢复备份失败:', error)
      ElMessage.error('恢复备份失败')
    }
  } finally {
    // 取消加载状态
    const index = backups.value.findIndex(b => b.id === backup.id)
    if (index !== -1) {
      backups.value[index].restoring = false
    }
  }
}

// 删除备份
const deleteBackup = async (backup: Backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份 "${formatBackupName(backup.name)}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 设置加载状态
    const index = backups.value.findIndex(b => b.id === backup.id)
    if (index !== -1) {
      backups.value[index].deleting = true
    }
    
    // 发送删除请求
    const response = await axios.delete<ApiResponse>(`/api/backup/${backup.id}`)
    if (response.data.success) {
      ElMessage.success('备份删除成功')
      // 从列表中删除
      backups.value = backups.value.filter(b => b.id !== backup.id)
    } else {
      ElMessage.error(response.data.message || '删除备份失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除备份失败:', error)
      ElMessage.error('删除备份失败')
    }
  } finally {
    // 取消加载状态
    const index = backups.value.findIndex(b => b.id === backup.id)
    if (index !== -1) {
      backups.value[index].deleting = false
    }
  }
}

// 打开备注对话框
const openNoteDialog = (backup: Backup) => {
  currentBackup.value = backup
  backupNote.value = backup.note || ''
  noteDialogVisible.value = true
}

// 保存备份备注
const saveBackupNote = async () => {
  if (!currentBackup.value) return
  
  saveNoteLoading.value = true
  try {
    const response = await axios.post<ApiResponse>(`/api/backup/note/${currentBackup.value.id}`, {
      note: backupNote.value
    })
    
    if (response.data.success) {
      ElMessage.success('备注保存成功')
      
      // 更新本地备份数据
      const index = backups.value.findIndex(b => b.id === currentBackup.value?.id)
      if (index !== -1) {
        backups.value[index].note = backupNote.value
      }
      
      // 关闭对话框
      noteDialogVisible.value = false
    } else {
      ElMessage.error(response.data.message || '保存备注失败')
    }
  } catch (error) {
    console.error('保存备注失败:', error)
    ElMessage.error('保存备注失败')
  } finally {
    saveNoteLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}

// 格式化文件大小
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  configCurrentPage.value = 1
  deployCurrentPage.value = 1
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  // 当前页面变化的处理已经通过v-model绑定完成
}

// 初始化
onMounted(() => {
  loadBackups()
})
</script>

<style lang="scss" scoped>
.backup-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  .page-header {
    margin-bottom: 24px;
    
    .title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .description {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }

  .backup-card {
    margin-bottom: 24px;
    border-radius: 8px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      .subtitle {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: 13px;
      }
    }
  }

  .backup-filter {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
  }

  .backup-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .backup-tag {
    font-size: 11px;
  }

  .backup-note {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .note-content {
      flex: 1;
      word-break: break-all;
      padding-right: 8px;
    }
    
    .no-note {
      flex: 1;
      font-style: italic;
      color: var(--el-text-color-disabled);
    }
    
    .note-edit-btn {
      flex-shrink: 0;
      margin-left: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
      border: 2px solid var(--el-color-warning-dark);
      background-color: var(--el-color-warning) !important;
      color: white !important;
      
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background-color: var(--el-color-warning-dark) !important;
      }
    }
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .auto-backup-info {
    padding: 16px;
  }

  // 自定义按钮样式
  :deep(.el-button--primary) {
    &.is-circle {
      background: var(--el-color-primary-light-8);
      border-color: var(--el-color-primary-light-5);
      color: var(--el-color-primary);
      
      &:hover {
        background: var(--el-color-primary-light-7);
        border-color: var(--el-color-primary-light-3);
      }
    }
  }

  :deep(.el-pagination) {
    --el-pagination-bg-color: var(--el-fill-color-blank);
    --el-pagination-hover-color: var(--el-color-primary);
    --el-pagination-button-disabled-bg-color: var(--el-disabled-bg-color);
    
    .el-pagination__total,
    .el-pagination__sizes {
      margin-right: 16px;
    }
    
    .el-pagination__jump {
      margin-left: 16px;
    }
  }
}
</style> 