<template>
  <div class="tr-widget-container">
    <div class="tr-widget-wrapper">
      <div class="tr-widget" :class="{ 'offline': !data.isOnline }" :style="{
        backgroundColor: currentTheme.backgroundColor || '#2d3436',
        opacity: currentTheme.backgroundOpacity || 1,
        borderRadius: currentTheme.borderRadius || '16px'
      }">
        <!-- 头部区域 -->
        <div class="tr-header" :style="{
          backgroundColor: currentTheme.headerBackgroundColor || '#2d3436'
        }">
          <img src="/tr.png" alt="TR" class="tr-logo">
          <span class="tr-title" :style="{
            color: currentTheme.headerTextColor || '#ffffff'
          }">{{ data.name }}</span>
          <span class="tr-badge" :class="{ 'online': data.isOnline, 'offline': !data.isOnline }" :style="data.isOnline ? 
            { backgroundColor: currentTheme.onlineStatusColor || 'rgba(46, 204, 113, 0.8)' } : 
            { backgroundColor: currentTheme.offlineStatusColor || 'rgba(231, 76, 60, 0.8)' }">
            {{ data.isOnline ? '在线' : '离线' }}
          </span>
        </div>
        
        <!-- 主体内容区域 -->
        <div class="tr-content">
          <!-- 状态信息 -->
          <div v-if="data.isOnline" class="tr-status-section">
            <!-- 速度显示区域 - 单独一行 -->
            <div v-if="hasSpeedItems" class="tr-speed-row">
              <div v-if="shouldDisplay('downloadSpeed')" class="tr-item download" :style="{
                backgroundColor: currentTheme.downloadSpeedBgColor || 'rgba(33, 150, 243, 0.15)'
              }">
                <div class="tr-label" :style="{
                  color: currentTheme.downloadSpeedLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                }">下载速度</div>
                <div class="tr-value" :style="{
                  color: currentTheme.downloadSpeedTextColor || '#3498db'
                }">{{ formatSpeed(data.downloadSpeed) }}</div>
              </div>
              
              <div v-if="shouldDisplay('uploadSpeed')" class="tr-item upload" :style="{
                backgroundColor: currentTheme.uploadSpeedBgColor || 'rgba(76, 175, 80, 0.15)'
              }">
                <div class="tr-label" :style="{
                  color: currentTheme.uploadSpeedLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                }">上传速度</div>
                <div class="tr-value" :style="{
                  color: currentTheme.uploadSpeedTextColor || '#27ae60'
                }">{{ formatSpeed(data.uploadSpeed) }}</div>
              </div>
            </div>
            
            <!-- 其他状态信息项目 -->
            <div class="tr-stats-grid">
              <!-- 使用排序后的显示项来控制顺序 -->
              <template v-for="item in sortedDisplayItems" :key="item.key">
                <!-- 跳过速度项，因为它们已经在上面的速度行中显示 -->
                <template v-if="item.key !== 'downloadSpeed' && item.key !== 'uploadSpeed'">
                  <!-- 活跃下载 -->
                  <div v-if="item.key === 'activeDownloads'" class="tr-item" :style="{
                    backgroundColor: currentTheme.activeDownloadsBgColor || 'rgba(33, 150, 243, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.activeDownloadsLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">活跃下载</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.activeDownloadsTextColor || '#4fc3f7'
                    }">{{ data.activeDownloads }}</div>
                  </div>
                  
                  <!-- 活跃种子 -->
                  <div v-else-if="item.key === 'activeTorrents'" class="tr-item" :style="{
                    backgroundColor: currentTheme.activeTorrentsBgColor || 'rgba(156, 39, 176, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.activeTorrentsLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">活跃任务</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.activeTorrentsTextColor || '#9c27b0'
                    }">{{ data.activeTorrents }}</div>
                  </div>
                  
                  <!-- 暂停种子 -->
                  <div v-else-if="item.key === 'pausedTorrents'" class="tr-item" :style="{
                    backgroundColor: currentTheme.pausedTorrentsBgColor || 'rgba(255, 152, 0, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.pausedTorrentsLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">暂停任务</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.pausedTorrentsTextColor || '#ff9800'
                    }">{{ data.pausedTorrents }}</div>
                  </div>
                  
                  <!-- 完成种子 -->
                  <div v-else-if="item.key === 'completedTorrents'" class="tr-item" :style="{
                    backgroundColor: currentTheme.completedTorrentsBgColor || 'rgba(76, 175, 80, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.completedTorrentsLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">完成任务</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.completedTorrentsTextColor || '#4caf50'
                    }">{{ data.completedTorrents }}</div>
                  </div>
                  
                  <!-- 总种子数 -->
                  <div v-else-if="item.key === 'totalTorrents'" class="tr-item" :style="{
                    backgroundColor: currentTheme.totalTorrentsBgColor || 'rgba(158, 158, 158, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.totalTorrentsLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">总任务数</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.totalTorrentsTextColor || '#9e9e9e'
                    }">{{ data.totalTorrents }}</div>
                  </div>
                  
                  <!-- 错误种子 -->
                  <div v-else-if="item.key === 'errorTorrents'" class="tr-item" :style="{
                    backgroundColor: currentTheme.errorTorrentsBgColor || 'rgba(244, 67, 54, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.errorTorrentsLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">错误任务</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.errorTorrentsTextColor || '#f44336'
                    }">{{ data.errorTorrents }}</div>
                  </div>
                  
                  <!-- 做种数量 -->
                  <div v-else-if="item.key === 'seedingTorrents'" class="tr-item" :style="{
                    backgroundColor: currentTheme.seedingTorrentsBgColor || 'rgba(0, 188, 212, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.seedingTorrentsLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">做种数量</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.seedingTorrentsTextColor || '#00bcd4'
                    }">{{ data.seedingTorrents }}</div>
                  </div>
                  
                  <!-- 全局分享率 -->
                  <div v-else-if="item.key === 'globalRatio'" class="tr-item" :style="{
                    backgroundColor: currentTheme.globalRatioBgColor || 'rgba(3, 169, 244, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.globalRatioLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">分享率</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.globalRatioTextColor || '#03a9f4'
                    }">{{ formatRatio(data.globalRatio) }}</div>
                  </div>
                  
                  <!-- 平均分享率 -->
                  <div v-else-if="item.key === 'averageRatio'" class="tr-item" :style="{
                    backgroundColor: currentTheme.averageRatioBgColor || 'rgba(63, 81, 181, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.averageRatioLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">平均分享率</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.averageRatioTextColor || '#3f51b5'
                    }">{{ formatRatio(data.averageRatio) }}</div>
                  </div>
                  
                  <!-- 总下载量 -->
                  <div v-else-if="item.key === 'globalDownloaded'" class="tr-item" :style="{
                    backgroundColor: currentTheme.globalDownloadedBgColor || 'rgba(0, 188, 212, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.globalDownloadedLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">总下载</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.globalDownloadedTextColor || '#00bcd4'
                    }">{{ formatSize(data.globalDownloaded) }}</div>
                  </div>
                  
                  <!-- 总上传量 -->
                  <div v-else-if="item.key === 'globalUploaded'" class="tr-item" :style="{
                    backgroundColor: currentTheme.globalUploadedBgColor || 'rgba(233, 30, 99, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.globalUploadedLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">总上传</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.globalUploadedTextColor || '#e91e63'
                    }">{{ formatSize(data.globalUploaded) }}</div>
                  </div>
                  
                  <!-- 上传限速 -->
                  <div v-else-if="item.key === 'uploadLimit'" class="tr-item" :style="{
                    backgroundColor: currentTheme.uploadLimitBgColor || 'rgba(255, 87, 34, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.uploadLimitLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">上传限速</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.uploadLimitTextColor || '#ff5722'
                    }">{{ data.uploadLimit === 0 ? '无限制' : formatSpeed(data.uploadLimit) }}</div>
                  </div>
                  
                  <!-- 下载限速 -->
                  <div v-else-if="item.key === 'downloadLimit'" class="tr-item" :style="{
                    backgroundColor: currentTheme.downloadLimitBgColor || 'rgba(121, 85, 72, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.downloadLimitLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">下载限速</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.downloadLimitTextColor || '#795548'
                    }">{{ data.downloadLimit === 0 ? '无限制' : formatSpeed(data.downloadLimit) }}</div>
                  </div>
                  
                  <!-- 剩余空间 -->
                  <div v-else-if="item.key === 'freeSpace'" class="tr-item" :style="{
                    backgroundColor: currentTheme.freeSpaceBgColor || 'rgba(96, 125, 139, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.freeSpaceLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">剩余空间</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.freeSpaceTextColor || '#607d8b'
                    }">{{ formatSize(data.freeSpace) }}</div>
                  </div>
                  
                  <!-- 总大小 -->
                  <div v-else-if="item.key === 'totalSize'" class="tr-item" :style="{
                    backgroundColor: currentTheme.totalSizeBgColor || 'rgba(97, 97, 97, 0.1)',
                    ...getItemStyle()
                  }">
                    <div class="tr-label" :style="{
                      color: currentTheme.totalSizeLabelColor || currentTheme.labelTextColor || 'rgba(255, 255, 255, 0.7)'
                    }">总大小</div>
                    <div class="tr-value" :style="{
                      color: currentTheme.totalSizeTextColor || '#616161'
                    }">{{ formatSize(data.totalSize) }}</div>
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
      currentTheme: {
          backgroundColor: '#2d3436',
          backgroundOpacity: 1,
        borderRadius: '16px',
          headerBackgroundColor: '#2d3436',
          headerTextColor: '#ffffff',
          onlineStatusColor: 'rgba(46, 204, 113, 0.8)',
          offlineStatusColor: 'rgba(231, 76, 60, 0.8)',
        labelTextColor: 'rgba(255, 255, 255, 0.8)',
        valueTextColor: '#ffffff',
          
          // 下载速度
          downloadSpeedBgColor: 'rgba(33, 150, 243, 0.15)',
          downloadSpeedTextColor: '#3498db',
        downloadSpeedLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 上传速度
          uploadSpeedBgColor: 'rgba(76, 175, 80, 0.15)',
          uploadSpeedTextColor: '#27ae60',
        uploadSpeedLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 活跃下载
          activeDownloadsBgColor: 'rgba(33, 150, 243, 0.1)',
          activeDownloadsTextColor: '#4fc3f7',
        activeDownloadsLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 活跃任务
          activeTorrentsBgColor: 'rgba(156, 39, 176, 0.1)',
          activeTorrentsTextColor: '#9c27b0',
        activeTorrentsLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 暂停任务
          pausedTorrentsBgColor: 'rgba(255, 152, 0, 0.1)',
          pausedTorrentsTextColor: '#ff9800',
        pausedTorrentsLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 完成任务
          completedTorrentsBgColor: 'rgba(76, 175, 80, 0.1)',
          completedTorrentsTextColor: '#4caf50',
        completedTorrentsLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 总任务数
          totalTorrentsBgColor: 'rgba(158, 158, 158, 0.1)',
          totalTorrentsTextColor: '#9e9e9e',
        totalTorrentsLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 错误任务
          errorTorrentsBgColor: 'rgba(244, 67, 54, 0.1)',
          errorTorrentsTextColor: '#f44336',
        errorTorrentsLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 做种数
          seedingTorrentsBgColor: 'rgba(0, 188, 212, 0.1)',
          seedingTorrentsTextColor: '#00bcd4',
        seedingTorrentsLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 分享率
          globalRatioBgColor: 'rgba(3, 169, 244, 0.1)',
          globalRatioTextColor: '#03a9f4',
        globalRatioLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 平均分享率
          averageRatioBgColor: 'rgba(63, 81, 181, 0.1)',
          averageRatioTextColor: '#3f51b5',
        averageRatioLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 已下载
          globalDownloadedBgColor: 'rgba(0, 188, 212, 0.1)',
          globalDownloadedTextColor: '#00bcd4',
        globalDownloadedLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 已上传
          globalUploadedBgColor: 'rgba(233, 30, 99, 0.1)',
          globalUploadedTextColor: '#e91e63',
        globalUploadedLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 上传限制
          uploadLimitBgColor: 'rgba(255, 87, 34, 0.1)',
          uploadLimitTextColor: '#ff5722',
        uploadLimitLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 下载限制
          downloadLimitBgColor: 'rgba(121, 85, 72, 0.1)',
          downloadLimitTextColor: '#795548',
        downloadLimitLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 可用空间
          freeSpaceBgColor: 'rgba(96, 125, 139, 0.1)',
          freeSpaceTextColor: '#607d8b',
        freeSpaceLabelColor: 'rgba(255, 255, 255, 0.8)',
          
          // 总体积
          totalSizeBgColor: 'rgba(97, 97, 97, 0.1)',
          totalSizeTextColor: '#616161',
        totalSizeLabelColor: 'rgba(255, 255, 255, 0.8)'
      }
    };
  },
  computed: {
    // 根据配置的显示顺序排序显示项
    sortedDisplayItems() {
      // 创建一个映射，用于快速查找项目标签
      const displayItemLabels = {
        downloadSpeed: '下载速度',
        uploadSpeed: '上传速度',
        activeDownloads: '活跃下载',
        activeTorrents: '活跃任务',
        pausedTorrents: '暂停任务',
        completedTorrents: '完成任务',
        totalTorrents: '总任务数',
        globalRatio: '分享率',
        globalDownloaded: '总下载',
        globalUploaded: '总上传',
        freeSpace: '剩余空间',
        seedingTorrents: '做种数量',
        totalSize: '总大小',
        averageRatio: '平均分享率',
        errorTorrents: '错误任务',
        uploadLimit: '上传限速',
        downloadLimit: '下载限速'
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
          label: displayItemLabels[key] || key
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
    
    // 从配置中提取并设置主题
    processThemeSettings() {
      // 处理主题设置
      if (this.config && this.config.themeSettings) {
        const themeSettings = this.config.themeSettings;
        
        // 处理主题设置 - 兼容两种可能的结构
        // 1. 如果存在theme对象，使用它
        if (themeSettings.theme) {
          this.applyThemeObject(themeSettings.theme);
        } 
        // 2. 如果没有theme对象，但直接在themeSettings中有颜色属性，则直接使用themeSettings
        else if (
          themeSettings.backgroundColor || 
          themeSettings.headerBackgroundColor || 
          themeSettings.headerTextColor
        ) {
          this.applyThemeObject(themeSettings);
        }
      }
      
      // 打印最终的主题设置，用于调试

    },
    
    // 添加新方法，用于应用主题对象
    applyThemeObject(theme) {
      // 复制所有主题设置
      Object.keys(theme).forEach(key => {
        // 跳过wallpaper对象，因为它已经在上面处理过了
        if (key === 'wallpaper') return;
        
        if (key in this.currentTheme) {
          this.currentTheme[key] = theme[key];
        }
      });
      
      // 特殊处理某些项目的颜色设置 - 如果没有特定的颜色设置，则使用全局默认值
      const items = [
        'downloadSpeed', 'uploadSpeed', 'totalDownloaded', 'totalUploaded', 
        'activeDownloads', 'activeTorrents', 'pausedTorrents', 'totalTorrents', 
        'seedingTorrents', 'downloadingTorrents', 'errorTorrents', 'checkingTorrents', 
        'ratio', 'freeSpace'
      ];
      
      items.forEach(item => {
        // 检查是否存在项目特定的背景颜色
        const bgColorKey = `${item}BgColor`;
        if (theme[bgColorKey] && this.currentTheme[bgColorKey] !== undefined) {
          this.currentTheme[bgColorKey] = theme[bgColorKey];
        }
        
        // 检查是否存在项目特定的文本颜色
        const textColorKey = `${item}TextColor`;
        if (theme[textColorKey] && this.currentTheme[textColorKey] !== undefined) {
          this.currentTheme[textColorKey] = theme[textColorKey];
        } else if (this.currentTheme[textColorKey] !== undefined && theme.valueTextColor) {
          // 如果未指定特定项目的文本颜色，则使用全局值文本颜色
          this.currentTheme[textColorKey] = theme.valueTextColor;
        }
        
        // 检查是否存在项目特定的标签颜色
        const labelColorKey = `${item}LabelColor`;
        if (theme[labelColorKey] && this.currentTheme[labelColorKey] !== undefined) {
          this.currentTheme[labelColorKey] = theme[labelColorKey];
        } else if (this.currentTheme[labelColorKey] !== undefined && theme.labelTextColor) {
          // 如果未指定特定项目的标签颜色，则使用全局标签文本颜色
          this.currentTheme[labelColorKey] = theme.labelTextColor;
        }
      });
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
            
            // 处理主题设置
            this.processThemeSettings();
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
