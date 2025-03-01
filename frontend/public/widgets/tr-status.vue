<template>
  <div class="tr-widget-container">
    <div class="tr-widget-wrapper">
      <div class="tr-widget" :class="{ 'offline': !data.isOnline }">
        <!-- 头部区域 -->
        <div class="tr-header">
          <img src="/tr.png" alt="TR" class="tr-logo">
          <span class="tr-title">{{ data.name }}</span>
          <span class="tr-badge" :class="{ 'online': data.isOnline, 'offline': !data.isOnline }">
            {{ data.isOnline ? '在线' : '离线' }}
          </span>
        </div>
        
        <!-- 主体内容区域 -->
        <div class="tr-content">
          <!-- 状态信息 -->
          <div v-if="data.isOnline" class="tr-status-section">
            <!-- 速度显示区域 - 单独一行 -->
            <div v-if="hasSpeedItems" class="tr-speed-row">
              <div v-if="shouldDisplay('downloadSpeed')" class="tr-item download">
                <div class="tr-label">下载速度</div>
                <div class="tr-value">{{ formatSpeed(data.downloadSpeed) }}</div>
              </div>
              
              <div v-if="shouldDisplay('uploadSpeed')" class="tr-item upload">
                <div class="tr-label">上传速度</div>
                <div class="tr-value">{{ formatSpeed(data.uploadSpeed) }}</div>
              </div>
            </div>
            
            <!-- 其他状态信息项目 -->
            <div class="tr-stats-grid">
              <!-- 使用排序后的显示项来控制顺序 -->
              <template v-for="item in sortedDisplayItems" :key="item.key">
                <!-- 跳过速度项，因为它们已经在上面的速度行中显示 -->
                <template v-if="item.key !== 'downloadSpeed' && item.key !== 'uploadSpeed'">
                  <!-- 活跃下载 -->
                  <div v-if="item.key === 'activeDownloads'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">下载中</div>
                    <div class="tr-value">{{ data.activeDownloads }}</div>
                  </div>
                  
                  <!-- 活跃任务 -->
                  <div v-else-if="item.key === 'activeTorrents'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">活跃</div>
                    <div class="tr-value">{{ data.activeTorrents }}</div>
                  </div>
                  
                  <!-- 暂停任务 -->
                  <div v-else-if="item.key === 'pausedTorrents'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">暂停</div>
                    <div class="tr-value">{{ data.pausedTorrents }}</div>
                  </div>
                  
                  <!-- 完成任务 -->
                  <div v-else-if="item.key === 'completedTorrents'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">完成</div>
                    <div class="tr-value">{{ data.completedTorrents }}</div>
                  </div>
                  
                  <!-- 总任务数 -->
                  <div v-else-if="item.key === 'totalTorrents'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">总数</div>
                    <div class="tr-value">{{ data.totalTorrents }}</div>
                  </div>
                  
                  <!-- 错误任务 -->
                  <div v-else-if="item.key === 'errorTorrents'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">错误任务</div>
                    <div class="tr-value">{{ data.errorTorrents }}</div>
                  </div>
                  
                  <!-- 做种数 -->
                  <div v-else-if="item.key === 'seedingTorrents'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">做种数</div>
                    <div class="tr-value">{{ data.seedingTorrents }}</div>
                  </div>
                  
                  <!-- 分享率 -->
                  <div v-else-if="item.key === 'globalRatio'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">分享率</div>
                    <div class="tr-value">{{ formatRatio(data.globalRatio) }}</div>
                  </div>
                  
                  <!-- 平均分享率 -->
                  <div v-else-if="item.key === 'averageRatio'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">平均分享率</div>
                    <div class="tr-value">{{ formatRatio(data.averageRatio) }}</div>
                  </div>
                  
                  <!-- 已下载 -->
                  <div v-else-if="item.key === 'globalDownloaded'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">已下载</div>
                    <div class="tr-value">{{ formatSize(data.globalDownloaded) }}</div>
                  </div>
                  
                  <!-- 已上传 -->
                  <div v-else-if="item.key === 'globalUploaded'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">已上传</div>
                    <div class="tr-value">{{ formatSize(data.globalUploaded) }}</div>
                  </div>
                  
                  <!-- 上传限制 -->
                  <div v-else-if="item.key === 'uploadLimit'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">上传限制</div>
                    <div class="tr-value">{{ data.uploadLimit === 0 ? '无限制' : formatSpeed(data.uploadLimit) }}</div>
                  </div>
                  
                  <!-- 下载限制 -->
                  <div v-else-if="item.key === 'downloadLimit'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">下载限制</div>
                    <div class="tr-value">{{ data.downloadLimit === 0 ? '无限制' : formatSpeed(data.downloadLimit) }}</div>
                  </div>
                  
                  <!-- 可用空间 -->
                  <div v-else-if="item.key === 'freeSpace'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">可用空间</div>
                    <div class="tr-value">{{ formatSize(data.freeSpace) }}</div>
                  </div>
                  
                  <!-- 总体积 -->
                  <div v-else-if="item.key === 'totalSize'" class="tr-item" :style="getItemStyle()">
                    <div class="tr-label">总体积</div>
                    <div class="tr-value">{{ formatSize(data.totalSize) }}</div>
                  </div>
                </template>
              </template>
            </div>
          </div>
          
          <!-- 离线状态显示 -->
          <div v-else class="tr-error">
            <span>Transmission下载器离线</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TRStatus',
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
        errorTorrents: 0,
        uploadLimit: 0,
        downloadLimit: 0
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
          errorTorrents: true,
          uploadLimit: true,
          downloadLimit: true
        },
        displayOrder: [
          'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
          'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
          'seedingTorrents', 'globalRatio', 'averageRatio',
          'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
          'freeSpace', 'totalSize'
        ]
      },
      timer: null,
      containerHeight: 0,
      containerWidth: 0,
      sessionId: '', // 存储Transmission会话ID
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
          'seedingTorrents', 'globalRatio', 'averageRatio',
          'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
          'freeSpace', 'totalSize'
        ];
      } else {
        // 使用配置的显示顺序
        displayOrder = [...this.config.displayOrder];
      }
      
      // 过滤掉未启用的显示项 (与QB组件保持一致)
      if (this.config && this.config.displayItems) {
        displayOrder = displayOrder.filter(key => {
          const isEnabled = this.config.displayItems[key] === true;
          return isEnabled;
        });
      }
      
      // 将显示顺序转换为对象数组，包含键和标签
      const result = displayOrder.map(key => {
        return {
          key: key,
          label: labelMap[key] || key
        };
      });
      
      return result;
    },
    
    // 检查是否有速度项目需要显示
    hasSpeedItems() {
      return this.shouldDisplay('downloadSpeed') || this.shouldDisplay('uploadSpeed');
    }
  },
  methods: {
    // 检查是否应该显示特定项
    shouldDisplay(key) {
      // 如果没有配置，默认显示所有项
      if (!this.config || !this.config.displayItems) {
        return true;
      }
      
      // 按照配置决定是否显示
      const shouldShow = this.config.displayItems[key] === true;
      return shouldShow;
    },
    
    // 格式化字节大小
    formatSize(bytes) {
      if (bytes === undefined || bytes === null || isNaN(bytes) || bytes < 0) {
        return '0 B';
      }
      
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let i = 0;
      while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
      }
      
      return bytes.toFixed(2) + ' ' + units[i];
    },
    
    // 格式化速度
    formatSpeed(bytesPerSecond) {
      return this.formatSize(bytesPerSecond) + '/s';
    },
    
    // 格式化比率
    formatRatio(ratio) {
      if (ratio === undefined || ratio === null || isNaN(ratio)) {
        return '0.00';
      }
      return ratio.toFixed(2);
    },
    
    // 更新容器尺寸
    updateContainerSize() {
      const container = this.$el.querySelector('.tr-widget-container');
      if (container) {
        this.containerWidth = container.offsetWidth;
        this.containerHeight = container.offsetHeight;
      }
    },
    
    // 获取项目样式
    getItemStyle() {
      const width = this.containerWidth || window.innerWidth;
      
      // 根据屏幕宽度调整每行项目数
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
    },
    
    // 获取Transmission状态
    fetchData() {
      // 使用与QB组件相同的API路径格式，使用相对路径
      const apiUrl = `/api/widgets/tr-status?id=${this.configId}`;
      
      // 发起请求
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            console.error('获取TR状态失败:', response.status, response.statusText);
            throw new Error(`获取TR状态失败: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(result => {
          if (result.success === false) {
            console.error('获取TR状态失败:', result.error);
            throw new Error(result.error || '获取TR状态失败');
          }
          
          // 保存原始结果，用于调试
          const originalResult = JSON.parse(JSON.stringify(result));
          
          // 检查结果中是否包含data和config
          if (result.data && result.config) {
            // 获取配置数据
            const config = result.config;
            
            // 确保displayItems存在
            if (!config.displayItems) {
              config.displayItems = {};
            }
            
            // 确保所有可能的显示项都存在
            const allItems = [
              'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
              'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
              'seedingTorrents', 'globalRatio', 'averageRatio',
              'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
              'freeSpace', 'totalSize', 'ioTasks'
            ];
            
            // 确保所有显示项都存在，但不要覆盖现有值
            allItems.forEach(item => {
              if (config.displayItems[item] === undefined) {
                config.displayItems[item] = false;
              }
            });
            
            // 确保显示顺序字段存在
            if (!config.displayOrder || !Array.isArray(config.displayOrder) || config.displayOrder.length === 0) {
              // 创建默认显示顺序，只包含已启用的项目
              config.displayOrder = Object.keys(config.displayItems)
                .filter(key => config.displayItems[key] === true);
            } else {
              // 只保留用户选择的显示项
              config.displayOrder = config.displayOrder.filter(item => 
                config.displayItems[item] === true
              );
            }
            
            // 更新数据和配置
            this.data = result.data;
            this.config = config;
          } else {
            console.error('API返回的数据格式不正确:', originalResult);
            this.data.isOnline = false;
          }
        })
        .catch(error => {
          console.error('获取TR状态出错:', error);
          // 设置离线状态
          this.data.isOnline = false;
        });
    }
  },
  mounted() {
    // 初始获取数据
    this.fetchData();
    
    // 设置定时器，定期更新数据
    this.timer = setInterval(() => {
      this.fetchData();
    }, (this.config.updateInterval || 30) * 1000);
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.updateContainerSize);
    
    // 初始化容器尺寸
    this.$nextTick(() => {
      this.updateContainerSize();
    });
  },
  beforeDestroy() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    // 移除事件监听
    window.removeEventListener('resize', this.updateContainerSize);
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

.tr-widget-container {
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

.tr-widget-wrapper {
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

.tr-widget {
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

.tr-widget.offline {
  background: rgba(0, 0, 0, 0.05);
}

/* 头部区域 */
.tr-header {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: transparent;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  height: 24px;
}

.tr-logo {
  width: 12px;
  height: 12px;
  margin-right: 6px;
  flex-shrink: 0;
}

.tr-title {
  flex: 1;
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tr-badge {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 8px;
  margin-left: 6px;
  flex-shrink: 0;
  font-weight: normal;
}

.tr-badge.online {
  background-color: rgba(46, 204, 113, 0.8);
}

.tr-badge.offline {
  background-color: rgba(231, 76, 60, 0.8);
}

/* 内容区域 */
.tr-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  height: calc(100% - 24px);
}

/* 状态区域 */
.tr-status-section {
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
.tr-speed-row {
  display: flex;
  gap: 6px;
  width: 100%;
  margin-bottom: 4px;
}

.tr-speed-row .tr-item {
  flex: 1;
}

/* 状态网格 */
.tr-stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  overflow: hidden;
}

/* 项目样式 */
.tr-item {
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

.tr-item.download {
  background: rgba(33, 150, 243, 0.15);
}

.tr-item.upload {
  background: rgba(244, 67, 54, 0.15);
}

.tr-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  margin-bottom: 2px;
  font-weight: normal;
  line-height: 1.2;
}

.tr-value {
  font-weight: 600;
  font-size: 13px;
  line-height: 1.2;
}

/* 错误状态 */
.tr-error {
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
  .tr-widget-container {
    height: 200px;
  }
  
  .tr-header {
    height: 24px;
  }
  
  .tr-content {
    height: 176px; /* 200px - 24px */
  }
  
  .tr-status-section {
    padding: 3px 5px;
    gap: 5px;
  }
  
  .tr-speed-row {
    gap: 5px;
    margin-bottom: 3px;
  }
  
  .tr-stats-grid {
    gap: 5px;
  }
  
  .tr-item {
    min-height: 32px;
  }
}

/* 小屏幕适配 */
@media (max-width: 320px) {
  .tr-status-section {
    padding: 3px 4px;
  }
}

@media (max-width: 250px) {
  .tr-status-section {
    padding: 2px 3px;
  }
  
  .tr-speed-row {
    gap: 4px;
  }
  
  .tr-stats-grid {
    gap: 4px;
  }
}
</style> 
