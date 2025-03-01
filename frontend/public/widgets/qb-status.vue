<template>
  <div class="qb-widget-container">
    <div class="qb-widget-wrapper">
      <div class="qb-widget" :class="{ 'offline': !data.isOnline }">
        <!-- 头部区域 -->
        <div class="qb-header">
          <img src="/qb.png" alt="QB" class="qb-logo">
          <span class="qb-title">{{ data.name }}</span>
          <span class="qb-badge" :class="{ 'online': data.isOnline, 'offline': !data.isOnline }">
            {{ data.isOnline ? '在线' : '离线' }}
          </span>
        </div>
        
        <!-- 主体内容区域 -->
        <div class="qb-content">
          <!-- 状态信息 -->
          <div v-if="data.isOnline" class="qb-status-section">
            <!-- 速度显示区域 - 单独一行 -->
            <div v-if="hasSpeedItems" class="qb-speed-row">
              <div v-if="config.displayItems.downloadSpeed" class="qb-item download">
                <div class="qb-label">下载速度</div>
                <div class="qb-value">{{ formatSpeed(data.downloadSpeed) }}</div>
              </div>
              
              <div v-if="config.displayItems.uploadSpeed" class="qb-item upload">
                <div class="qb-label">上传速度</div>
                <div class="qb-value">{{ formatSpeed(data.uploadSpeed) }}</div>
              </div>
            </div>
            
            <!-- 其他状态信息项目 -->
            <div class="qb-stats-grid">
              <!-- 使用排序后的显示项来控制顺序 -->
              <template v-for="item in sortedDisplayItems" :key="item.key">
                <!-- 跳过速度项，因为它们已经在上面的速度行中显示 -->
                <template v-if="item.key !== 'downloadSpeed' && item.key !== 'uploadSpeed'">
                  <!-- 活跃下载 -->
                  <div v-if="item.key === 'activeDownloads'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">下载中</div>
                    <div class="qb-value">{{ data.activeDownloads }}</div>
                  </div>
                  
                  <!-- 活跃任务 -->
                  <div v-else-if="item.key === 'activeTorrents'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">活跃</div>
                    <div class="qb-value">{{ data.activeTorrents }}</div>
                  </div>
                  
                  <!-- 暂停任务 -->
                  <div v-else-if="item.key === 'pausedTorrents'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">暂停</div>
                    <div class="qb-value">{{ data.pausedTorrents }}</div>
                  </div>
                  
                  <!-- 完成任务 -->
                  <div v-else-if="item.key === 'completedTorrents'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">完成</div>
                    <div class="qb-value">{{ data.completedTorrents }}</div>
                  </div>
                  
                  <!-- 总任务数 -->
                  <div v-else-if="item.key === 'totalTorrents'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">总数</div>
                    <div class="qb-value">{{ data.totalTorrents }}</div>
                  </div>
                  
                  <!-- 错误任务 -->
                  <div v-else-if="item.key === 'errorTorrents'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">错误任务</div>
                    <div class="qb-value">{{ data.errorTorrents }}</div>
                  </div>
                  
                  <!-- 做种数 -->
                  <div v-else-if="item.key === 'seedingTorrents'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">做种数</div>
                    <div class="qb-value">{{ data.seedingTorrents }}</div>
                  </div>
                  
                  <!-- I/O任务 -->
                  <div v-else-if="item.key === 'ioTasks'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">I/O任务</div>
                    <div class="qb-value">{{ data.ioTasks }}</div>
                  </div>
                  
                  <!-- 分享率 -->
                  <div v-else-if="item.key === 'globalRatio'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">分享率</div>
                    <div class="qb-value">{{ formatRatio(data.globalRatio) }}</div>
                  </div>
                  
                  <!-- 平均分享率 -->
                  <div v-else-if="item.key === 'averageRatio'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">平均分享率</div>
                    <div class="qb-value">{{ formatRatio(data.averageRatio) }}</div>
                  </div>
                  
                  <!-- 已下载 -->
                  <div v-else-if="item.key === 'globalDownloaded'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">已下载</div>
                    <div class="qb-value">{{ formatSize(data.globalDownloaded) }}</div>
                  </div>
                  
                  <!-- 已上传 -->
                  <div v-else-if="item.key === 'globalUploaded'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">已上传</div>
                    <div class="qb-value">{{ formatSize(data.globalUploaded) }}</div>
                  </div>
                  
                  <!-- 上传限制 -->
                  <div v-else-if="item.key === 'uploadLimit'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">上传限制</div>
                    <div class="qb-value">{{ data.uploadLimit === 0 ? '无限制' : formatSpeed(data.uploadLimit) }}</div>
                  </div>
                  
                  <!-- 下载限制 -->
                  <div v-else-if="item.key === 'downloadLimit'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">下载限制</div>
                    <div class="qb-value">{{ data.downloadLimit === 0 ? '无限制' : formatSpeed(data.downloadLimit) }}</div>
                  </div>
                  
                  <!-- 可用空间 -->
                  <div v-else-if="item.key === 'freeSpace'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">可用空间</div>
                    <div class="qb-value">{{ formatSize(data.freeSpace) }}</div>
                  </div>
                  
                  <!-- 总体积 -->
                  <div v-else-if="item.key === 'totalSize'" class="qb-item" :style="getItemStyle()">
                    <div class="qb-label">总体积</div>
                    <div class="qb-value">{{ formatSize(data.totalSize) }}</div>
                  </div>
                </template>
              </template>
            </div>
          </div>
          
          <!-- 离线状态显示 -->
          <div v-else class="qb-error">
            <span>QB下载器离线</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QBStatus',
  props: {
    configId: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      data: {
        name: '加载中...',
        isOnline: false,
        downloadSpeed: 0,
        uploadSpeed: 0,
        activeTorrents: 0,
        pausedTorrents: 0,
        completedTorrents: 0,
        totalTorrents: 0,
        activeDownloads: 0,
        globalRatio: 0,
        globalDownloaded: 0,
        globalUploaded: 0,
        freeSpace: 0,
        seedingTorrents: 0,
        totalSize: 0,
        averageRatio: 0,
        sessionDownloaded: 0,
        sessionUploaded: 0
      },
      config: {
        updateInterval: 30,
        displayItems: {
          downloadSpeed: true,
          uploadSpeed: true,
          activeDownloads: true,
          activeTorrents: true,
          pausedTorrents: true,
          completedTorrents: true,
          totalTorrents: true,
          globalRatio: true,
          globalDownloaded: true,
          globalUploaded: true,
          freeSpace: true,
          seedingTorrents: true,
          totalSize: true,
          averageRatio: true,
          sessionDownloaded: false,
          sessionUploaded: false
        }
      },
      timer: null,
      containerHeight: 0,
      containerWidth: 0
    };
  },
  computed: {
    // 根据配置的显示顺序排序显示项
    sortedDisplayItems() {
      // 创建一个映射，用于快速查找项目标签
      const labelMap = {
        downloadSpeed: '下载速度',
        uploadSpeed: '上传速度',
        activeDownloads: '下载中',
        activeTorrents: '活跃',
        pausedTorrents: '暂停',
        completedTorrents: '完成',
        totalTorrents: '总数',
        errorTorrents: '错误任务',
        seedingTorrents: '做种数',
        ioTasks: 'I/O任务',
        globalRatio: '分享率',
        averageRatio: '平均分享率',
        globalDownloaded: '已下载',
        globalUploaded: '已上传',
        uploadLimit: '上传限制',
        downloadLimit: '下载限制',
        freeSpace: '可用空间',
        totalSize: '总体积'
      };
      
      // 如果没有配置显示顺序，或者显示顺序为空，使用默认顺序
      let displayOrder = [];
      if (!this.config || !this.config.displayOrder || this.config.displayOrder.length === 0) {
        // 默认显示顺序
        displayOrder = [
          'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
          'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
          'seedingTorrents', 'ioTasks', 'globalRatio', 'averageRatio',
          'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
          'freeSpace', 'totalSize'
        ];
      } else {
        // 使用配置的显示顺序
        displayOrder = [...this.config.displayOrder];
      }
      
      // 过滤掉未启用的显示项
      if (this.config && this.config.displayItems) {
        displayOrder = displayOrder.filter(key => {
          const isEnabled = this.config.displayItems[key] === true;
          return isEnabled;
        });
      }
      
      // 根据过滤后的顺序创建显示项列表
      return displayOrder.map(key => ({
        key,
        label: labelMap[key] || key
      }));
    },
    
    // 计算统计项目数量
    statsItemCount() {
      const items = this.config.displayItems;
      let count = 0;
      
      if (items.activeDownloads) count++;
      if (items.activeTorrents) count++;
      if (items.pausedTorrents) count++;
      if (items.completedTorrents) count++;
      if (items.totalTorrents) count++;
      if (items.globalRatio) count++;
      if (items.globalDownloaded) count++;
      if (items.globalUploaded) count++;
      if (items.freeSpace) count++;
      if (items.seedingTorrents) count++;
      if (items.totalSize) count++;
      if (items.averageRatio) count++;
      if (items.ioTasks) count++;
      if (items.errorTorrents) count++;
      if (items.uploadLimit) count++;
      if (items.downloadLimit) count++;
      
      return count;
    },
    
    // 是否有速度项
    hasSpeedItems() {
      return this.config.displayItems.downloadSpeed || this.config.displayItems.uploadSpeed;
    },
    
    // 计算每行显示的项目数
    itemsPerRow() {
      const width = this.containerWidth || window.innerWidth;
      
      if (width < 250) return 1;
      if (width < 350) return 2;
      if (width < 500) return 3;
      return 4;
    },
    
    // 计算需要的行数
    rowsNeeded() {
      return Math.ceil(this.statsItemCount / this.itemsPerRow);
    }
  },
  mounted: function() {
    this.fetchData();
    this.timer = setInterval(this.fetchData, this.config.updateInterval * 1000);
    
    // 监听容器大小变化
    this.updateContainerSize();
    window.addEventListener('resize', this.updateContainerSize);
  },
  beforeDestroy: function() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    window.removeEventListener('resize', this.updateContainerSize);
  },
  methods: {
    fetchData: function() {
      fetch(`/api/widgets/qb-status?id=${this.configId}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          if (data.success) {
            // 确保配置中包含所有必要的字段
            if (!data.config) {
              return;
            }
            
            if (!data.config.displayItems) {
              data.config.displayItems = {};
            }
            
            // 确保新增的显示项存在
            const allItems = [
              'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
              'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
              'seedingTorrents', 'ioTasks', 'globalRatio', 'averageRatio',
              'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
              'freeSpace', 'totalSize'
            ];
            
            // 记录原始配置中的displayItems状态
            
            // 确保所有显示项都存在，但不要覆盖现有值
            allItems.forEach(item => {
              if (data.config.displayItems[item] === undefined) {
                data.config.displayItems[item] = false;
              }
            });
            
            // 确保显示顺序字段存在
            if (!data.config.displayOrder || !Array.isArray(data.config.displayOrder) || data.config.displayOrder.length === 0) {
              // 创建默认显示顺序，只包含已启用的项目
              data.config.displayOrder = Object.keys(data.config.displayItems)
                .filter(key => data.config.displayItems[key] === true);
            } else {
              // 只保留用户选择的显示项
              data.config.displayOrder = data.config.displayOrder.filter(item => 
                data.config.displayItems[item] === true
              );
            }
            
            // 确保数据对象中包含所有必要的字段
            if (!data.data) {
              return;
            }
            
            allItems.forEach(item => {
              if (data.data[item] === undefined) {
                // 为缺失的数据字段设置默认值，不显示警告
                if (['globalRatio', 'averageRatio'].includes(item)) {
                  data.data[item] = 0;
                } else if (['globalDownloaded', 'globalUploaded', 'freeSpace', 'totalSize', 'uploadLimit', 'downloadLimit'].includes(item)) {
                  data.data[item] = 0;
                } else {
                  data.data[item] = 0;
                }
              }
            });
            
            // 更新数据和配置
            this.data = data.data;
            this.config = data.config;
          } else {
            this.data.isOnline = false;
            this.data.name = data.name || '未知';
          }
        })
        .catch(error => {
          this.data.isOnline = false;
        });
    },
    formatSize: function(bytes) {
      // 确保bytes是数字类型
      bytes = Number(bytes);
      
      // 检查是否为有效数字
      if (isNaN(bytes) || bytes === undefined) {
        return '0 B';
      }
      
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    },
    formatSpeed: function(bytes) {
      return this.formatSize(bytes) + '/s';
    },
    formatRatio: function(ratio) {
      if (typeof ratio === 'number') {
        return ratio.toFixed(2);
      } else {
        return '0.00';
      }
    },
    updateContainerSize: function() {
      if (this.$el) {
        const container = this.$el.querySelector('.qb-widget-container');
        if (container) {
          this.containerHeight = container.clientHeight;
          this.containerWidth = container.clientWidth;
        }
      }
    },
    // 获取项目样式
    getItemStyle: function() {
      const width = this.containerWidth || window.innerWidth;
      
      // 根据屏幕宽度调整每行项目数
      let itemsPerRow = this.itemsPerRow;
      let flexBasis;
      
      if (width < 250) {
        flexBasis = 'calc(100% - 4px)';
      } else if (width < 350) {
        flexBasis = 'calc(50% - 4px)';
      } else if (width < 500) {
        flexBasis = 'calc(33.33% - 4px)';
      } else {
        flexBasis = 'calc(25% - 4px)';
      }
      
      return {
        flex: `1 0 ${flexBasis}`
      };
    }
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.qb-widget-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  min-width: 200px;
  height: 100%;
  background: transparent;
  display: flex;
  align-items: stretch;
  padding: 6px;
  margin: 0 auto;
  overflow: hidden;
}

.qb-widget-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.04),
              0 0 15px rgba(0, 0, 0, 0.03),
              0 0 10px rgba(0, 0, 0, 0.02);
  border-radius: 16px;
  overflow: hidden;
  margin: 0;
}

.qb-widget {
  position: relative;
  width: 100%;
  height: 100%;
  background: transparent;
  color: white;
  border-radius: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 2px;
}

.qb-widget.offline {
  background: rgba(0, 0, 0, 0.05);
}

/* 头部区域 */
.qb-header {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: transparent;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  height: 24px;
}

.qb-logo {
  width: 12px;
  height: 12px;
  margin-right: 6px;
  flex-shrink: 0;
}

.qb-title {
  flex: 1;
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qb-badge {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 8px;
  margin-left: 6px;
  flex-shrink: 0;
  font-weight: normal;
}

.qb-badge.online {
  background-color: rgba(46, 204, 113, 0.8);
}

.qb-badge.offline {
  background-color: rgba(231, 76, 60, 0.8);
}

/* 内容区域 */
.qb-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  height: calc(100% - 24px);
}

/* 状态区域 */
.qb-status-section {
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: transparent;
  height: 100%;
  overflow: hidden;
  gap: 6px;
}

/* 速度显示行 */
.qb-speed-row {
  display: flex;
  gap: 6px;
  width: 100%;
  margin-bottom: 4px;
}

.qb-speed-row .qb-item {
  flex: 1;
}

/* 状态网格 */
.qb-stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  overflow: hidden;
}

/* 项目样式 */
.qb-item {
  min-width: 0;
  text-align: center;
  padding: 4px 2px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-height: 36px;
}

.qb-item.download {
  background: rgba(33, 150, 243, 0.15);
}

.qb-item.upload {
  background: rgba(244, 67, 54, 0.15);
}

.qb-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  margin-bottom: 2px;
  font-weight: normal;
  line-height: 1.2;
}

.qb-value {
  font-weight: 600;
  font-size: 13px;
  line-height: 1.2;
}

/* 错误状态 */
.qb-error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  padding: 10px;
}

/* 响应式布局 - 特殊处理 */
@media (height: 200px) {
  .qb-widget-container {
    height: 200px;
  }
  
  .qb-header {
    height: 24px;
  }
  
  .qb-content {
    height: 176px; /* 200px - 24px */
  }
  
  .qb-status-section {
    padding: 3px 5px;
    gap: 5px;
  }
  
  .qb-speed-row {
    gap: 5px;
    margin-bottom: 3px;
  }
  
  .qb-stats-grid {
    gap: 5px;
  }
  
  .qb-item {
    min-height: 32px;
  }
}

/* 小屏幕适配 */
@media (max-width: 320px) {
  .qb-status-section {
    padding: 3px 4px;
  }
}

@media (max-width: 250px) {
  .qb-status-section {
    padding: 2px 3px;
  }
  
  .qb-speed-row {
    gap: 4px;
  }
  
  .qb-stats-grid {
    gap: 4px;
  }
}
</style> 