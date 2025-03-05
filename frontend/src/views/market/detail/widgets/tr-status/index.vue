<template>
  <div class="tr-status-detail">
    <div class="header-section">
      <div class="title-area">
        <h2>Transmission下载器状态</h2>
        <p class="description">实时监控Transmission下载器状态，支持多个下载器和自定义显示项</p>
      </div>
      <div class="actions">
        <el-button @click="showHelpDialog" type="info" icon="QuestionFilled">使用指南</el-button>
        <el-button @click="handleReset" type="danger">重置参数</el-button>
      </div>
    </div>
    
    <!-- 支持作者信息 -->
    <div class="support-author">
      <div class="support-text">
        <span>✨ TR组件开发不易，感谢各位大佬的支持和使用~ </span>
        <span class="highlight">喜欢的话，可以点击左下角「支持作者」按钮，给予一点点鼓励呀！💝</span>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧 - Transmission下载器列表 -->
      <el-card class="tr-list-section" shadow="hover">
        <template #header>
          <div class="section-title">
            <span>Transmission下载器列表</span>
            <el-button type="primary" size="small" @click="addNewTR">添加下载器</el-button>
          </div>
        </template>
        <div class="tr-list">
          <div 
            v-for="(tr, index) in trList" 
            :key="tr.id" 
            class="tr-item"
            :class="{ active: currentTRIndex === index }"
            @click="selectTR(index)"
          >
            <div class="tr-item-content">
              <div class="tr-item-name">{{ tr.name }}</div>
              <div class="tr-item-status" :class="{ valid: tr.isConfigValid }">
                {{ tr.isConfigValid ? '已验证' : '未验证' }}
              </div>
            </div>
            <div class="tr-item-actions">
              <el-button 
                type="danger" 
                size="small" 
                circle 
                @click.stop="removeTR(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div v-if="trList.length === 0" class="no-tr">
            <el-empty description="暂无下载器配置" />
          </div>
        </div>
      </el-card>

      <div class="right-section">
        <!-- 域名前缀设置 -->
        <el-card class="domain-prefix-section" shadow="hover">
          <template #header>
            <div class="section-title">
              <span>全局设置</span>
            </div>
          </template>
          <div class="domain-prefix-content">
            <el-form-item label="域名前缀 (全局设置)">
              <el-input 
                v-model="domainPrefix" 
                placeholder="例如: https://your-domain.com" 
              />
              <div class="form-tip">此为全局设置，所有组件共享同一域名前缀，仅需设置一次</div>
            </el-form-item>
          </div>
        </el-card>

        <!-- 中间 - 参数配置和预览 -->
        <el-tabs type="border-card" class="config-preview-tabs">
          <el-tab-pane label="参数配置">
            <div class="params-content">
              <Params 
                v-if="currentTR" 
                v-model="currentTR" 
                @test-connection="testConnection" 
                @save-config="saveConfig"
                @apply-to-fixed="applyToFixed"
                @apply-to-free="applyToFree"
              />
              <div v-else class="no-tr-selected">
                <el-empty description="请选择或添加一个Transmission下载器" />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="预览效果">
            <!-- 将整个预览区域包装在一个大框中 -->
            <div class="preview-container">
              <!-- 主题设置区域 -->
              <el-collapse>
                <el-collapse-item name="theme">
                  <template #title>
                    <span class="highlight-title">
                      <el-icon style="margin-right: 6px;"><Brush /></el-icon>
                      主题设置
                    </span>
                  </template>
                  <el-tabs type="card" style="margin-bottom: 10px;">
                    <el-tab-pane label="基础主题">
                      <div class="theme-grid">
                        <!-- 基础颜色设置 -->
                        <el-form-item label="背景颜色" class="mini-form-item">
                          <el-color-picker v-model="themeSettings.backgroundColor" size="small" show-alpha @change="handleThemeChange" />
                        </el-form-item>
                        <el-form-item label="背景透明度" class="mini-form-item">
                          <el-slider v-model="themeSettings.backgroundOpacity" :min="0" :max="1" :step="0.1" @change="handleThemeChange" />
                        </el-form-item>
                        <el-form-item label="边框圆角" class="mini-form-item">
                          <el-input v-model="themeSettings.borderRadius" size="small" @change="handleThemeChange" />
                        </el-form-item>
                        
                        <!-- 头部设置 -->
                        <el-form-item label="头部背景" class="mini-form-item">
                          <el-color-picker v-model="themeSettings.headerBackgroundColor" size="small" @change="handleThemeChange" />
                        </el-form-item>
                        <el-form-item label="头部文本色" class="mini-form-item">
                          <el-color-picker v-model="themeSettings.headerTextColor" size="small" @change="handleThemeChange" />
                        </el-form-item>
                        
                        <!-- 状态颜色 -->
                        <el-form-item label="在线状态色" class="mini-form-item">
                          <el-color-picker v-model="themeSettings.onlineStatusColor" size="small" show-alpha @change="handleThemeChange" />
                        </el-form-item>
                        <el-form-item label="离线状态色" class="mini-form-item">
                          <el-color-picker v-model="themeSettings.offlineStatusColor" size="small" show-alpha @change="handleThemeChange" />
                        </el-form-item>
                        

              </div>
                    </el-tab-pane>
                    
                    <el-tab-pane label="预设主题">
                      <div class="preset-themes">
                        <div class="preset-theme-grid">
                          <div class="preset-theme-card" @click="applyPresetTheme('dark')">
                            <div class="preset-theme-preview dark-theme"></div>
                            <div class="preset-theme-name">暗色主题</div>
            </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('light')">
                            <div class="preset-theme-preview light-theme"></div>
                            <div class="preset-theme-name">亮色主题</div>
                          </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('nord')">
                            <div class="preset-theme-preview nord-theme"></div>
                            <div class="preset-theme-name">北欧主题</div>
                          </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('elegant')">
                            <div class="preset-theme-preview elegant-theme"></div>
                            <div class="preset-theme-name">优雅主题</div>
                          </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('acrylic')">
                            <div class="preset-theme-preview acrylic-theme"></div>
                            <div class="preset-theme-name">亚克力主题</div>
                          </div>
                          <div class="preset-theme-card" @click="applyPresetTheme('colorful')">
                            <div class="preset-theme-preview colorful-theme"></div>
                            <div class="preset-theme-name">多彩主题</div>
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                    <el-tab-pane label="项目颜色">
                      <el-collapse accordion style="width: 100%;">
                        <el-collapse-item title="下载速度">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.downloadSpeedBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.downloadSpeedTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.downloadSpeedLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="上传速度">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.uploadSpeedBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.uploadSpeedTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.uploadSpeedLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="活跃下载">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.activeDownloadsBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.activeDownloadsTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.activeDownloadsLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="活跃任务">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.activeTorrentsBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.activeTorrentsTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.activeTorrentsLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="暂停任务">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.pausedTorrentsBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.pausedTorrentsTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.pausedTorrentsLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="完成任务">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.completedTorrentsBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.completedTorrentsTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.completedTorrentsLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="总任务数">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.totalTorrentsBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.totalTorrentsTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.totalTorrentsLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="全局已下载">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.globalDownloadedBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.globalDownloadedTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.globalDownloadedLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="全局已上传">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.globalUploadedBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.globalUploadedTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.globalUploadedLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="分享率">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.globalRatioBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.globalRatioTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.globalRatioLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="剩余空间">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.freeSpaceBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.freeSpaceTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.freeSpaceLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="做种数量">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.seedingTorrentsBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.seedingTorrentsTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.seedingTorrentsLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="错误任务">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.errorTorrentsBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.errorTorrentsTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.errorTorrentsLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                        <el-collapse-item title="总大小">
                          <div class="theme-grid">
                            <el-form-item label="背景颜色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.totalSizeBgColor" size="small" show-alpha @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="值文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.totalSizeTextColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                            <el-form-item label="标签文本色" class="mini-form-item">
                              <el-color-picker v-model="themeSettings.totalSizeLabelColor" size="small" @change="handleThemeChange" />
                            </el-form-item>
                          </div>
                        </el-collapse-item>
                      </el-collapse>
                    </el-tab-pane>
                  </el-tabs>
                  
                  <div class="action-buttons">
                    <el-button size="small" @click="resetTheme">重置</el-button>
                  </div>
                </el-collapse-item>
              </el-collapse>
              
              <!-- 有效配置时显示iframe预览 -->
              <div v-if="currentTR && currentTR.isConfigValid" class="iframe-preview">
                <div class="background-preview" :style="gradientBgStyle"></div>
                <iframe 
                  :src="widgetUrl" 
                  frameborder="0" 
                  :style="iframeStyle"
                  ref="previewIframe"
                  @load="handleIframeLoaded"
                ></iframe>
                <div class="size-display">
                  <span>{{ componentSize.width }} × {{ componentSize.height }}</span>
                </div>
                <div v-if="!iframeLoaded" class="iframe-loading">
                  <el-icon class="loading-icon"><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
              </div>
              <div v-else class="empty-preview">
                <el-empty description="请先配置并验证Transmission下载器" />
              </div>
              
              <!-- 壁纸背景和组件尺寸设置区域 -->
              <el-card v-if="currentTR && currentTR.isConfigValid" class="preview-settings-card">
                <template #header>
                  <div class="section-title">
                    <span>预览区域设置</span>
                  </div>
                </template>
                
                <el-tabs type="border-card">
                  <el-tab-pane label="壁纸背景设置">
                    <div class="theme-grid responsive-grid">
                      <el-form-item label="壁纸背景色" class="mini-form-item">
                        <el-color-picker v-model="wallpaperSettings.backgroundColor" size="small" show-alpha @change="handleWallpaperChange" />
                      </el-form-item>
                      <el-form-item label="壁纸样式" class="mini-form-item">
                        <el-select v-model="wallpaperSettings.style" size="small" @change="handleWallpaperChange">
                          <el-option label="渐变色" value="gradient" />
                          <el-option label="纯色" value="solid" />
                        </el-select>
                      </el-form-item>
                      <el-form-item v-if="wallpaperSettings.style === 'gradient'" label="渐变方向" class="mini-form-item">
                        <el-select v-model="wallpaperSettings.gradientDirection" size="small" @change="handleWallpaperChange">
                          <el-option label="左上到右下" value="135deg" />
                          <el-option label="左到右" value="90deg" />
                          <el-option label="上到下" value="180deg" />
                          <el-option label="右上到左下" value="225deg" />
                        </el-select>
                      </el-form-item>
                      <el-form-item v-if="wallpaperSettings.style === 'gradient'" label="第二背景色" class="mini-form-item">
                        <el-color-picker v-model="wallpaperSettings.backgroundColor2" size="small" show-alpha @change="handleWallpaperChange" />
                      </el-form-item>
                      <el-form-item v-if="wallpaperSettings.style === 'gradient'" label="动画效果" class="mini-form-item">
                        <el-switch v-model="wallpaperSettings.animation" @change="handleWallpaperChange" />
                      </el-form-item>
                    </div>
                    
                    <div class="preset-themes responsive-buttons">
                      <el-button type="primary" size="small" @click="applyWallpaperPreset('dark')">暗色壁纸</el-button>
                      <el-button type="success" size="small" @click="applyWallpaperPreset('light')">亮色壁纸</el-button>
                      <el-button type="info" size="small" @click="applyWallpaperPreset('nord')">北欧壁纸</el-button>
                      <el-button type="default" size="small" @click="applyWallpaperPreset('elegant')">优雅壁纸</el-button>
                      <el-button type="warning" size="small" @click="applyWallpaperPreset('acrylic')">亚克力壁纸</el-button>
                      <el-button type="danger" size="small" @click="applyWallpaperPreset('colorful')">多彩壁纸</el-button>
                    </div>
                  </el-tab-pane>
                  
                  <el-tab-pane label="组件尺寸设置">
                    <div class="theme-grid responsive-grid">
                      <el-form-item label="宽度" class="mini-form-item">
                        <el-slider v-model="componentSize.width" :min="200" :max="800" style="width: 100%" @change="handleSizeChange" />
                        <div class="slider-value">{{ componentSize.width }}px</div>
                      </el-form-item>
                      <el-form-item label="高度" class="mini-form-item">
                        <el-slider v-model="componentSize.height" :min="150" :max="600" style="width: 100%" @change="handleSizeChange" />
                        <div class="slider-value">{{ componentSize.height }}px</div>
                      </el-form-item>
                    </div>
                    
                    <div class="preset-themes responsive-buttons">
                      <el-button size="small" @click="applyComponentSize('small')">小尺寸</el-button>
                      <el-button size="small" @click="applyComponentSize('medium')">中尺寸</el-button>
                      <el-button size="small" @click="applyComponentSize('large')">大尺寸</el-button>
                      <el-button size="small" @click="applyComponentSize('mobile')">手机尺寸</el-button>
                      <el-button size="small" @click="applyComponentSize('reset')">重置尺寸</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
              </el-card>
            </div>
            <!-- 结束 preview-container -->
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 使用帮助对话框组件 -->
    <HelpDialog v-model:visible="helpDialogVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Loading, Brush } from '@element-plus/icons-vue'
import axios from 'axios'
import request from '@/utils/request'
import Params from './params.vue'
import Preview from './preview.vue'
import HelpDialog from './help-dialog.vue'
import { TRConfig, TRStatusData, TRService } from './tr-service'

// 定义接口类型
interface PoolResponse {
  code: number
  message: string
  data: {
    widgets: any[]
  }
}

interface FreeResponse {
  code: number
  message: string
  data?: any
}

// 定义接口
interface SaveConfigResponse {
  success: boolean
  id?: string
  error?: string
}

interface ComponentPoolItem {
  type: string
  title: string
  name: string
  url?: string
  config: any
  source?: string
  [key: string]: any
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface PoolData {
  widgets: ComponentPoolItem[]
  [key: string]: any
}

// 添加主题设置相关数据结构
interface WallpaperSettings {
  backgroundColor: string
  backgroundColor2: string
  style: 'gradient' | 'solid'
  gradientDirection: string
  animation: boolean
}

interface ComponentSize {
  width: number
  height: number
}

// 主题设置类型
interface ThemeSettings {
  backgroundColor: string
  backgroundOpacity: number
  headerBackgroundColor: string
  headerTextColor: string
  onlineStatusColor: string
  offlineStatusColor: string
  
  // 下载速度
  downloadSpeedBgColor: string
  downloadSpeedTextColor: string
  downloadSpeedLabelColor: string
  
  // 上传速度
  uploadSpeedBgColor: string  
  uploadSpeedTextColor: string
  uploadSpeedLabelColor: string
  
  // 活跃下载
  activeDownloadsBgColor: string
  activeDownloadsTextColor: string
  activeDownloadsLabelColor: string
  
  // 活跃任务
  activeTorrentsBgColor: string
  activeTorrentsTextColor: string
  activeTorrentsLabelColor: string
  
  // 暂停任务
  pausedTorrentsBgColor: string
  pausedTorrentsTextColor: string
  pausedTorrentsLabelColor: string
  
  // 完成任务
  completedTorrentsBgColor: string
  completedTorrentsTextColor: string
  completedTorrentsLabelColor: string
  
  // 总任务数
  totalTorrentsBgColor: string
  totalTorrentsTextColor: string
  totalTorrentsLabelColor: string
  
  // 错误任务
  errorTorrentsBgColor: string
  errorTorrentsTextColor: string
  errorTorrentsLabelColor: string
  
  // 做种数
  seedingTorrentsBgColor: string
  seedingTorrentsTextColor: string
  seedingTorrentsLabelColor: string
  
  // 分享率
  globalRatioBgColor: string
  globalRatioTextColor: string
  globalRatioLabelColor: string
  
  // 平均分享率
  averageRatioBgColor: string
  averageRatioTextColor: string
  averageRatioLabelColor: string
  
  // 已下载
  globalDownloadedBgColor: string
  globalDownloadedTextColor: string
  globalDownloadedLabelColor: string
  
  // 已上传
  globalUploadedBgColor: string
  globalUploadedTextColor: string
  globalUploadedLabelColor: string
  
  // 上传限制
  uploadLimitBgColor: string
  uploadLimitTextColor: string
  uploadLimitLabelColor: string
  
  // 下载限制
  downloadLimitBgColor: string
  downloadLimitTextColor: string
  downloadLimitLabelColor: string
  
  // 可用空间
  freeSpaceBgColor: string
  freeSpaceTextColor: string
  freeSpaceLabelColor: string
  
  // 总体积
  totalSizeBgColor: string
  totalSizeTextColor: string
  totalSizeLabelColor: string
  
  // 标签和值通用设置
  labelTextColor: string
  valueTextColor: string
  
  borderRadius: string
}

// 域名前缀
const domainPrefix = ref('')

// 壁纸设置
const wallpaperSettings = ref<WallpaperSettings>({
  backgroundColor: 'rgba(22, 24, 29, 1)',
  backgroundColor2: 'rgba(46, 52, 64, 1)',
  style: 'gradient',
  gradientDirection: '135deg',
  animation: false
})

// 主题设置
const themeSettings = ref<ThemeSettings>({
  backgroundColor: '#2d3436',
  backgroundOpacity: 1,
  headerBackgroundColor: '#2d3436',
  headerTextColor: '#ffffff',
  onlineStatusColor: 'rgba(46, 204, 113, 0.8)',
  offlineStatusColor: 'rgba(231, 76, 60, 0.8)',
  
  // 下载速度
  downloadSpeedBgColor: 'rgba(33, 150, 243, 0.15)',
  downloadSpeedTextColor: '#3498db',
  downloadSpeedLabelColor: '#7f8c8d',
  
  // 上传速度
  uploadSpeedBgColor: 'rgba(76, 175, 80, 0.15)',
  uploadSpeedTextColor: '#27ae60',
  uploadSpeedLabelColor: '#7f8c8d',
  
  // 活跃下载
  activeDownloadsBgColor: 'rgba(33, 150, 243, 0.1)',
  activeDownloadsTextColor: '#4fc3f7',
  activeDownloadsLabelColor: '#7f8c8d',
  
  // 活跃任务
  activeTorrentsBgColor: 'rgba(156, 39, 176, 0.1)',
  activeTorrentsTextColor: '#9c27b0',
  activeTorrentsLabelColor: '#7f8c8d',
  
  // 暂停任务
  pausedTorrentsBgColor: 'rgba(255, 152, 0, 0.1)',
  pausedTorrentsTextColor: '#ff9800',
  pausedTorrentsLabelColor: '#7f8c8d',
  
  // 完成任务
  completedTorrentsBgColor: 'rgba(76, 175, 80, 0.1)',
  completedTorrentsTextColor: '#4caf50',
  completedTorrentsLabelColor: '#7f8c8d',
  
  // 总任务数
  totalTorrentsBgColor: 'rgba(158, 158, 158, 0.1)',
  totalTorrentsTextColor: '#9e9e9e',
  totalTorrentsLabelColor: '#7f8c8d',
  
  // 错误任务
  errorTorrentsBgColor: 'rgba(244, 67, 54, 0.1)',
  errorTorrentsTextColor: '#f44336',
  errorTorrentsLabelColor: '#7f8c8d',
  
  // 做种数
  seedingTorrentsBgColor: 'rgba(0, 188, 212, 0.1)',
  seedingTorrentsTextColor: '#00bcd4',
  seedingTorrentsLabelColor: '#7f8c8d',
  
  // 分享率
  globalRatioBgColor: 'rgba(3, 169, 244, 0.1)',
  globalRatioTextColor: '#03a9f4',
  globalRatioLabelColor: '#7f8c8d',
  
  // 平均分享率
  averageRatioBgColor: 'rgba(63, 81, 181, 0.1)',
  averageRatioTextColor: '#3f51b5',
  averageRatioLabelColor: '#7f8c8d',
  
  // 已下载
  globalDownloadedBgColor: 'rgba(0, 188, 212, 0.1)',
  globalDownloadedTextColor: '#00bcd4',
  globalDownloadedLabelColor: '#7f8c8d',
  
  // 已上传
  globalUploadedBgColor: 'rgba(233, 30, 99, 0.1)',
  globalUploadedTextColor: '#e91e63',
  globalUploadedLabelColor: '#7f8c8d',
  
  // 上传限制
  uploadLimitBgColor: 'rgba(255, 87, 34, 0.1)',
  uploadLimitTextColor: '#ff5722',
  uploadLimitLabelColor: '#7f8c8d',
  
  // 下载限制
  downloadLimitBgColor: 'rgba(121, 85, 72, 0.1)',
  downloadLimitTextColor: '#795548',
  downloadLimitLabelColor: '#7f8c8d',
  
  // 可用空间
  freeSpaceBgColor: 'rgba(96, 125, 139, 0.1)',
  freeSpaceTextColor: '#607d8b',
  freeSpaceLabelColor: '#7f8c8d',
  
  // 总体积
  totalSizeBgColor: 'rgba(97, 97, 97, 0.1)',
  totalSizeTextColor: '#616161',
  totalSizeLabelColor: '#7f8c8d',
  
  // 标签和值通用设置
  labelTextColor: 'rgba(255, 255, 255, 0.7)',
  valueTextColor: '#ffffff',
  
  borderRadius: '8px'
})

// 组件尺寸
const componentSize = ref<ComponentSize>({
  width: 400,
  height: 300
})

// 计算iframe样式
const iframeStyle = computed(() => {
  return {
    width: `${componentSize.value.width}px`,
    height: `${componentSize.value.height}px`,
    maxWidth: '100%',
    margin: '0 auto',
    display: 'block'
  }
})

// 计算渐变背景样式
const gradientBgStyle = computed(() => {
  if (wallpaperSettings.value.style === 'gradient') {
    const direction = wallpaperSettings.value.gradientDirection || '135deg';
    const color1 = wallpaperSettings.value.backgroundColor || '#1a1a2e';
    const color2 = wallpaperSettings.value.backgroundColor2 || '#0f3460';
    
    if (wallpaperSettings.value.animation) {
      return {
        background: `linear-gradient(${direction}, ${color1}, ${color2}, ${color1})`,
        backgroundSize: '400% 400%',
        animation: 'gradient-animation 15s ease infinite'
      };
    } else {
      return {
        background: `linear-gradient(${direction}, ${color1}, ${color2})`
      };
    }
  } else {
    // 纯色背景
    return {
      backgroundColor: wallpaperSettings.value.backgroundColor || '#1a1a2e'
    };
  }
});

// TR下载器列表
const trList = ref<TRConfig[]>([])
// 当前选中的TR下载器索引
const currentTRIndex = ref(-1)
// 预览数据
const previewData = ref<TRStatusData>({
  name: '',
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
})

// 帮助对话框可见性
const helpDialogVisible = ref(false)
// iframe加载状态
const iframeLoaded = ref(false)
// 初始加载标记
const isInitialLoad = ref(true)

// 当前选中的TR下载器
const currentTR = computed(() => {
  if (currentTRIndex.value >= 0 && currentTRIndex.value < trList.value.length) {
    return trList.value[currentTRIndex.value]
  }
  return null
})

// 预览URL
const widgetUrl = computed(() => {
  if (!currentTR.value) return ''
  return TRService.generateWidgetUrl(currentTR.value)
})

// 显示帮助对话框
const showHelpDialog = () => {
  helpDialogVisible.value = true
}

// 添加新的TR下载器
const addNewTR = () => {
  const newTR = TRService.createDefaultConfig()
  // 设置域名前缀
  newTR.domainPrefix = domainPrefix.value
  trList.value.push(newTR)
  currentTRIndex.value = trList.value.length - 1
  saveTRList()
}

// 选择TR下载器
const selectTR = (index: number) => {
  currentTRIndex.value = index
}

// 移除TR下载器
const removeTR = (index: number) => {
  ElMessageBox.confirm(
    '确定要删除这个Transmission下载器吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    trList.value.splice(index, 1)
    if (currentTRIndex.value === index) {
      currentTRIndex.value = trList.value.length > 0 ? 0 : -1
    } else if (currentTRIndex.value > index) {
      currentTRIndex.value--
    }
    saveTRList()
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 重置参数
const handleReset = () => {
  ElMessageBox.confirm(
    '确定要重置所有参数吗？这将删除所有已配置的下载器。',
    '重置确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    trList.value = []
    currentTRIndex.value = -1
    saveTRList()
    ElMessage.success('参数已重置')
  }).catch(() => {
    // 取消重置
  })
}

// 测试连接
const testConnection = async () => {
  if (!currentTR.value) return
  
  try {
    ElMessage.info('正在测试连接...')
    
    const isConnected = await TRService.testConnection(
      currentTR.value.url,
      currentTR.value.username,
      currentTR.value.password
    )
    
    if (isConnected.success) {
      currentTR.value.isConfigValid = true
      currentTR.value.lastTested = Date.now()
      saveTRList()
      
      // 获取状态数据用于预览
      if (currentTR.value.id) {
        const statusData = await TRService.getStatus(currentTR.value.id)
        if (statusData) {
          previewData.value = statusData
        }
      }
      
      ElMessage.success('连接测试成功')
    } else {
      currentTR.value.isConfigValid = false
      saveTRList()
      ElMessage.error(`连接测试失败: ${isConnected.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('测试连接错误:', error)
    currentTR.value.isConfigValid = false
    saveTRList()
    ElMessage.error('连接测试失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 保存配置
const saveConfig = async () => {
  if (!currentTR.value) {
    ElMessage.warning('请先选择或添加一个Transmission下载器')
    return
  }
  
  if (!currentTR.value.isConfigValid) {
    ElMessage.warning('请先测试连接，确保配置有效')
    return
  }
  
  try {

    
    // 确保displayItems包含所有必要的字段
    const allItems = [
      'downloadSpeed', 'uploadSpeed', 'activeDownloads', 'activeTorrents',
      'pausedTorrents', 'completedTorrents', 'totalTorrents', 'errorTorrents',
      'seedingTorrents', 'globalRatio', 'averageRatio',
      'globalDownloaded', 'globalUploaded', 'uploadLimit', 'downloadLimit',
      'freeSpace', 'totalSize'
    ];
    
    // 此时我们已经确认currentTR.value不为null
    const config = currentTR.value;
    
    if (!config.displayItems) {
      config.displayItems = {
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
      };
    } else {
      // 确保所有字段都存在，但不改变现有值
      allItems.forEach(item => {
        if (config.displayItems[item] === undefined) {
          console.log(`配置中缺少${item}项，设置为默认值false`);
          config.displayItems[item] = false;
        }
      });
    }
    
    // 确保displayOrder字段存在且只包含用户选择的项目
    if (!config.displayOrder || !Array.isArray(config.displayOrder)) {

      // 只包含已勾选的项目
      config.displayOrder = Object.keys(config.displayItems)
        .filter(key => config.displayItems[key] === true);
    } else {
      // 只保留用户选择的显示项
      config.displayOrder = config.displayOrder.filter(item => 
        config.displayItems[item] === true
      );
    }
    

    
    // 使用TRService保存配置
    const saveResult = await TRService.saveConfig(config)
    
    if (!saveResult) {
      throw new Error('保存配置到服务器失败')
    }
    
    // 更新当前配置
    if (saveResult.id) {
      config.id = saveResult.id
    }
    
    // 保存到本地列表
    saveTRList()
    
    // 获取状态数据用于预览
    if (config.id) {
      const statusData = await TRService.getStatus(config.id)
      
      // 更新预览数据
      if (statusData) {
        previewData.value = statusData
      }
    }
    
    ElMessage.success('配置已保存')
  } catch (error) {
    console.error('保存配置出错:', error)
    ElMessage.error('保存配置出错: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 应用到固定组件
const applyToFixed = async () => {
  if (!currentTR.value || !currentTR.value.isConfigValid) {
    ElMessage.warning('请先测试连接，确保配置有效')
    return
  }
  
  try {
    // 使用TRService保存配置
    await TRService.getStatus(currentTR.value.id) // 这会验证配置是否有效
    
    // 生成组件URL
    const widgetUrl = TRService.generateWidgetUrl(currentTR.value)
    
    // 获取当前固定组件池
    try {
      const response = await axios.get('/api/fixed/pool')
      

      
      const poolData = (response.data as PoolResponse).data || { widgets: [] }
      const poolWidgets = poolData.widgets || []
      
      // 检查是否已存在相同URL的TR下载器组件（通过URL中的ID判断）
      const existingWidget = poolWidgets.find((w: any) => 
        w.url && w.url.includes(`id=${currentTR.value?.id}`)
      )
      
      // 检查是否存在同名但不同ID的组件
      const sameNameWidget = poolWidgets.find((w: any) => 
        w.name === currentTR.value?.name && 
        (!w.url || !w.url.includes(`id=${currentTR.value?.id}`))
      )
      
      try {
        // 如果存在同名但不同ID的组件，先删除它
        if (sameNameWidget) {
          console.log('删除同名组件:', sameNameWidget)
          await axios.post('/api/fixed/pool', {
            action: 'remove',
            name: sameNameWidget.name
          })
        }
        
        if (existingWidget) {

          
          // 如果存在，则更新该组件的配置
          const updateResponse = await axios.post('/api/fixed/pool', {
            action: 'update',
            name: existingWidget.name,
            widget: {
              id: existingWidget.id,
              name: currentTR.value.name,
              url: widgetUrl,
              type: 'widget',
              source: 'market',
              width: 500,
              height: 300,
              mobileShow: true
            }
          })
          

          ElMessage.success('已更新固定组件')
        } else {
          // 如果不存在，则添加新组件
          const newWidget = {
            id: Date.now().toString(),
            name: currentTR.value.name,
            url: widgetUrl,
            type: 'widget',
            source: 'market',
            width: 500,
            height: 300,
            mobileShow: true
          }
          

          
          const addResponse = await axios.post('/api/fixed/pool', {
            action: 'add',
            widget: newWidget
          })
          

          ElMessage.success('已添加到固定组件')
        }
        
        // 标记为已应用
        currentTR.value.isAppliedToFixed = true
        saveTRList()
      } catch (apiError: any) {
        console.error('API请求错误:', apiError)
        
        // 尝试获取详细错误信息
        let errorMessage = '未知错误'
        if (apiError.response && apiError.response.data) {
          errorMessage = apiError.response.data.message || apiError.response.data.error || '未知错误'
        } else if (apiError.message) {
          errorMessage = apiError.message
        }
        
        ElMessage.error(`应用到固定组件失败: ${errorMessage}`)
      }
    } catch (poolError: any) {
      console.error('获取组件池失败:', poolError)
      ElMessage.error('获取组件池失败: ' + (poolError.message || '未知错误'))
    }
  } catch (error) {
    console.error('应用到固定组件出错:', error)
    ElMessage.error('应用到固定组件出错: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 应用到自由组件
const applyToFree = async () => {
  if (!currentTR.value || !currentTR.value.isConfigValid) {
    ElMessage.warning('请先测试连接，确保配置有效')
    return
  }
  
  try {
    // 使用TRService保存配置
    await TRService.getStatus(currentTR.value.id) // 这会验证配置是否有效
    
    // 生成组件URL
    const widgetUrl = TRService.generateWidgetUrl(currentTR.value)
    
    try {
      // 获取当前自由组件池
      const response = await axios.get('/api/free/pool')
      
      
      const poolData = (response.data as PoolResponse).data || { widgets: [] }
      const poolWidgets = poolData.widgets || []
      
      // 检查是否已存在相同URL的TR下载器组件（通过URL中的ID判断）
      const existingWidget = poolWidgets.find((w: any) => 
        w.url && w.url.includes(`id=${currentTR.value?.id}`)
      )
      
      // 检查是否存在同名但不同ID的组件
      const sameNameWidget = poolWidgets.find((w: any) => 
        w.name === currentTR.value?.name && 
        (!w.url || !w.url.includes(`id=${currentTR.value?.id}`))
      )
      
      try {
        // 如果存在同名但不同ID的组件，先删除它
        if (sameNameWidget) {
          console.log('删除同名组件:', sameNameWidget)
          await axios.post('/api/free/pool', {
            action: 'remove',
            name: sameNameWidget.name
          })
        }
        
        if (existingWidget) {

          
          // 如果存在，则更新该组件的配置
          const updateResponse = await axios.post('/api/free/pool', {
            action: 'update',
            name: existingWidget.name,
            widget: {
              id: existingWidget.id,
              name: currentTR.value.name,
              url: widgetUrl,
              source: 'market'
            }
          })
          

          ElMessage.success('已更新自由组件')
        } else {
          // 如果不存在，则添加新组件
          const newWidget = {
            id: Date.now().toString(),
            name: currentTR.value.name,
            url: widgetUrl,
            source: 'market'
          }
          

          
          const addResponse = await axios.post('/api/free/pool', {
            action: 'add',
            widget: newWidget
          })
          
          ElMessage.success('已添加到自由组件')
        }
        
        // 标记为已应用
        currentTR.value.isAppliedToFree = true
        saveTRList()
      } catch (apiError: any) {
        console.error('API请求错误:', apiError)
        
        // 尝试获取详细错误信息
        let errorMessage = '未知错误'
        if (apiError.response && apiError.response.data) {
          errorMessage = apiError.response.data.message || apiError.response.data.error || '未知错误'
        } else if (apiError.message) {
          errorMessage = apiError.message
        }
        
        ElMessage.error(`应用到自由组件失败: ${errorMessage}`)
      }
    } catch (error) {
      console.error('获取自由组件池失败:', error)
      ElMessage.error('获取自由组件池失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  } catch (error) {
    console.error('应用到自由组件出错:', error)
    ElMessage.error('应用到自由组件出错: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 刷新预览
const refreshPreview = () => {
  if (!currentTR.value || !currentTR.value.isConfigValid) return
  
  iframeLoaded.value = false
  
  // 使用setTimeout确保iframe重新加载
  setTimeout(() => {
    const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement
    if (iframe) {
      // 添加时间戳参数，确保刷新
      iframe.src = widgetUrl.value + (widgetUrl.value.includes('?') ? '&' : '?') + 't=' + Date.now()
    }
  }, 100)
}

// 保存TR下载器列表到本地存储和后端
const saveTRList = async () => {
  // 保存到本地存储作为备份
  localStorage.setItem('tr-status-list', JSON.stringify(trList.value))
  
  // 将数组转换为对象，以便与后端API格式匹配
  const configsObject: Record<string, any> = {}
  trList.value.forEach(config => {
    if (config.id) {
      configsObject[config.id] = config
    }
  })
  
  try {
    // 保存到后端
    await axios.post('/api/widgets/tr-status/configs', configsObject)
  } catch (error) {
    console.error('保存TR配置列表到后端失败:', error)
    ElMessage.error('保存配置到服务器失败，但已保存到本地')
  }
}

// 从本地存储加载TR下载器列表
const loadTRList = async () => {
  try {
    // 首先尝试从后端API获取配置列表
    const response = await axios.get('/api/widgets/tr-status/configs')
    
    if (response.data) {
      // 将对象转换为数组
      const configsArray = Object.values(response.data)
      
      // 迁移旧配置
      trList.value = configsArray.map((item: any) => {
        // 确保displayItems字段符合当前的接口定义
        if (item.displayItems) {
          // 保留当前接口中定义的字段
          item.displayItems = {
            downloadSpeed: item.displayItems.downloadSpeed ?? true,
            uploadSpeed: item.displayItems.uploadSpeed ?? true,
            activeDownloads: item.displayItems.activeDownloads ?? false,
            activeTorrents: item.displayItems.activeTorrents ?? false,
            pausedTorrents: item.displayItems.pausedTorrents ?? false,
            completedTorrents: item.displayItems.completedTorrents ?? false,
            totalTorrents: item.displayItems.totalTorrents ?? false,
            globalRatio: item.displayItems.globalRatio ?? false,
            globalDownloaded: item.displayItems.globalDownloaded ?? false,
            globalUploaded: item.displayItems.globalUploaded ?? false,
            freeSpace: item.displayItems.freeSpace ?? false,
            seedingTorrents: item.displayItems.seedingTorrents ?? false,
            totalSize: item.displayItems.totalSize ?? false,
            averageRatio: item.displayItems.averageRatio ?? false,
            errorTorrents: item.displayItems.errorTorrents ?? false,
            uploadLimit: item.displayItems.uploadLimit ?? false,
            downloadLimit: item.displayItems.downloadLimit ?? false
          }
        }
        
        // 确保应用状态字段存在
        item.isAppliedToFixed = item.isAppliedToFixed ?? false
        item.isAppliedToFree = item.isAppliedToFree ?? false
        
        return item
      })
      
      if (trList.value.length > 0) {
        currentTRIndex.value = 0
        // 设置域名前缀
        if (currentTR.value && currentTR.value.domainPrefix) {
          domainPrefix.value = currentTR.value.domainPrefix
        }
      } else {
        // 如果没有配置，创建一个默认的
        addNewTR()
      }
      
      return
    }
  } catch (error) {
    console.error('从后端API加载TR配置列表失败，尝试从本地存储加载:', error)
  }
  
  // 如果从API加载失败，尝试从本地存储加载
  const savedList = localStorage.getItem('tr-status-list')
  if (savedList) {
    try {
      // 解析保存的列表
      const parsedList = JSON.parse(savedList)
      
      // 迁移旧配置
      trList.value = parsedList.map((item: any) => {
        // 确保displayItems字段符合当前的接口定义
        if (item.displayItems) {
          // 保留当前接口中定义的字段
          item.displayItems = {
            downloadSpeed: item.displayItems.downloadSpeed ?? true,
            uploadSpeed: item.displayItems.uploadSpeed ?? true,
            activeDownloads: item.displayItems.activeDownloads ?? false,
            activeTorrents: item.displayItems.activeTorrents ?? false,
            pausedTorrents: item.displayItems.pausedTorrents ?? false,
            completedTorrents: item.displayItems.completedTorrents ?? false,
            totalTorrents: item.displayItems.totalTorrents ?? false,
            globalRatio: item.displayItems.globalRatio ?? false,
            globalDownloaded: item.displayItems.globalDownloaded ?? false,
            globalUploaded: item.displayItems.globalUploaded ?? false,
            freeSpace: item.displayItems.freeSpace ?? false,
            seedingTorrents: item.displayItems.seedingTorrents ?? false,
            totalSize: item.displayItems.totalSize ?? false,
            averageRatio: item.displayItems.averageRatio ?? false,
            errorTorrents: item.displayItems.errorTorrents ?? false,
            uploadLimit: item.displayItems.uploadLimit ?? false,
            downloadLimit: item.displayItems.downloadLimit ?? false
          }
        }
        
        // 确保应用状态字段存在
        item.isAppliedToFixed = item.isAppliedToFixed ?? false
        item.isAppliedToFree = item.isAppliedToFree ?? false
        
        return item
      })
      
      if (trList.value.length > 0) {
        currentTRIndex.value = 0
        // 设置域名前缀
        if (currentTR.value && currentTR.value.domainPrefix) {
          domainPrefix.value = currentTR.value.domainPrefix
        }
      } else {
        // 如果没有配置，创建一个默认的
        addNewTR()
      }
      
    } catch (error) {
      console.error('解析本地存储的TR配置列表失败:', error)
      // 创建一个默认配置
      addNewTR()
    }
  } else {
    // 如果没有保存的列表，创建一个默认配置
    addNewTR()
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadTRList()
  
  // 加载主题设置
  try {
    // 尝试从本地存储中解析保存的壁纸设置
    const savedWallpaper = localStorage.getItem('tr-wallpaper-settings')
    if (savedWallpaper) {
      try {
        const parsedWallpaper = JSON.parse(savedWallpaper)
        wallpaperSettings.value = {
          ...wallpaperSettings.value,
          ...parsedWallpaper
        }
      } catch (error) {
        console.error('解析保存的壁纸设置失败:', error)
      }
    }
    
    // 尝试从本地存储中解析保存的主题设置
    const savedTheme = localStorage.getItem('tr-theme-settings')
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme)
        themeSettings.value = {
          ...themeSettings.value,
          ...parsedTheme
        }
      } catch (error) {
        console.error('解析保存的主题设置失败:', error)
      }
    }
    
    // 应用默认预设主题(如果没有设置过)
    if (!savedTheme && !savedWallpaper) {
      applyPresetTheme('colorful')
    }
    
    // 尝试从本地存储中解析保存的组件尺寸
    const savedSize = localStorage.getItem('tr-component-size')
    if (savedSize) {
      try {
        const parsedSize = JSON.parse(savedSize)
        componentSize.value = {
          ...componentSize.value,
          ...parsedSize
        }
      } catch (error) {
        console.error('解析保存的组件尺寸失败:', error)
      }
    }
  } catch (error) {
    console.error('加载主题设置失败:', error)
  }
})

// 获取显示项目对应的显示名称
const getDisplayItemLabel = (item: string): string => {
  const displayItemLabels: Record<string, string> = {
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
    errorTorrents: '错误种子',
    uploadLimit: '上传限速',
    downloadLimit: '下载限速'
  }
  
  return displayItemLabels[item] || item
}

// 处理iframe加载事件
const handleIframeLoaded = () => {

  iframeLoaded.value = true
  
  // 强制应用尺寸设置
  forceApplySize()
  
  // 额外逻辑：应用尺寸后短暂延迟再次应用，以确保响应式生效
  if (isInitialLoad.value) {
    isInitialLoad.value = false
    setTimeout(() => {
      forceApplySize()
      // 发送强制布局更新的消息
      const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement | null
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({
            type: 'forceLayout',
            data: {}
          }, '*')
        } catch (e) {
          console.error('无法发送消息到iframe', e)
        }
      }
    }, 300)
  }
}

// 处理尺寸变化
const handleSizeChange = () => {
  // 延迟执行以避免频繁刷新
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    refreshIframePreview()
  }, 300) as unknown as number
}

// 防抖定时器
let debounceTimer: number | null = null

// 刷新iframe预览
const refreshIframePreview = () => {
  const currentWidth = componentSize.value.width
  const currentHeight = componentSize.value.height
  
  // 重新加载iframe
  const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement | null
  if (iframe && iframe.contentWindow) {
    try {
      // 先直接设置尺寸
      iframe.style.width = `${currentWidth}px`
      iframe.style.height = `${currentHeight}px`

      // 获取当前src
      const currentSrc = iframe.src
      // 添加尺寸参数和时间戳强制刷新
      let newSrc = currentSrc
      newSrc = newSrc.replace(/[?&]w=\d+/g, '').replace(/[?&]h=\d+/g, '')
      newSrc = newSrc.includes('?') 
        ? newSrc.replace(/(\?|&)t=\d+/, '') + `&t=${Date.now()}&w=${currentWidth}&h=${currentHeight}` 
        : newSrc + `?t=${Date.now()}&w=${currentWidth}&h=${currentHeight}`
      iframe.src = newSrc
      
      // 在iframe重新加载后再次强制应用尺寸
      iframe.onload = () => {
        setTimeout(() => {
          forceApplySize()
        }, 100)
      }
    } catch (e) {
      console.error('无法刷新iframe', e)
    }
  }
}

// 强制应用尺寸
const forceApplySize = () => {
  const iframe = document.querySelector('.iframe-preview iframe') as HTMLIFrameElement | null
  if (iframe) {
    iframe.style.width = `${componentSize.value.width}px`
    iframe.style.height = `${componentSize.value.height}px`
  }
}

// 添加监听器确保组件尺寸变化时更新预览
watch([() => componentSize.value.width, () => componentSize.value.height], () => {
  // 延迟执行以避免频繁刷新
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    refreshIframePreview()
  }, 300) as unknown as number
}, { immediate: false })

// 展示项目标签映射
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
  errorTorrents: '错误种子',
  uploadLimit: '上传限速',
  downloadLimit: '下载限速'
}

// 主题更改处理
const handleThemeChange = () => {
  if (currentTR.value && currentTR.value.isConfigValid) {
    // 确保主题对象存在
    if (!currentTR.value.themeSettings) {
      currentTR.value.themeSettings = {
        theme: { ...themeSettings.value },
        wallpaper: { ...wallpaperSettings.value }
      }
    } else {
      // 保存主题设置
      currentTR.value.themeSettings.wallpaper = { ...wallpaperSettings.value }
      
      // 确保theme对象存在并初始化
      if (!currentTR.value.themeSettings.theme) {
        currentTR.value.themeSettings.theme = { ...themeSettings.value }
      } else {
        // 复制所有主题设置到theme对象
        Object.keys(themeSettings.value).forEach(key => {
          // 跳过wallpaper，因为它已经单独处理了
          if (key !== 'wallpaper') {
            // 使用类型断言确保TypeScript不会报错
            if (currentTR.value && currentTR.value.themeSettings && currentTR.value.themeSettings.theme) {
              (currentTR.value.themeSettings.theme as any)[key] = themeSettings.value[key]
            }
          }
        })
      }
    }
    
    
    saveTRList()
    
    // 如果iframe已加载且当前配置有效，则刷新iframe
    if (iframeLoaded.value && currentTR.value.isConfigValid) {
      setTimeout(() => {
        refreshPreview()
      }, 200)
    }
  }
}

// 处理壁纸变化
const handleWallpaperChange = () => {
  // 更新背景样式
  // 这里不需要特别的处理，因为computed会自动更新
}

// 应用壁纸预设
const applyWallpaperPreset = (preset: string) => {
  switch(preset) {
    case 'dark':
      wallpaperSettings.value = {
        backgroundColor: '#1a1a2e',
        backgroundColor2: '#0f3460',
        style: 'gradient',
        gradientDirection: '135deg',
        animation: true
      }
      break;
    case 'light':
      wallpaperSettings.value = {
        backgroundColor: '#f5f5f5',
        backgroundColor2: '#e0e0e0',
        style: 'gradient',
        gradientDirection: '135deg',
        animation: true
      }
      break;
    case 'nord':
      wallpaperSettings.value = {
        backgroundColor: '#2e3440',
        backgroundColor2: '#3b4252',
        style: 'gradient',
        gradientDirection: '135deg',
        animation: true
      }
      break;
    case 'elegant':
      wallpaperSettings.value = {
        backgroundColor: '#353535',
        backgroundColor2: '#1e1e1e',
        style: 'gradient',
        gradientDirection: '135deg',
        animation: true
      }
      break;
    case 'acrylic':
      wallpaperSettings.value = {
        backgroundColor: 'rgba(28, 28, 30, 0.7)',
        backgroundColor2: 'rgba(40, 40, 45, 0.5)',
        style: 'gradient',
        gradientDirection: '135deg',
        animation: true
      }
      break;
    case 'colorful':
      wallpaperSettings.value = {
        backgroundColor: '#0f172a',
        backgroundColor2: '#1e293b',
        style: 'gradient',
        gradientDirection: '135deg',
        animation: true
      }
      break;
  }
  
  handleWallpaperChange()
}

// 应用组件尺寸预设
const applyComponentSize = (preset: string) => {
  switch(preset) {
    case 'small':
      setComponentSize(300, 220)
      break
    case 'medium':
      setComponentSize(400, 300)
      break
    case 'large':
      setComponentSize(500, 400)
      break
    case 'mobile':
      setComponentSize(320, 580)
      break
    case 'reset':
      setComponentSize(400, 300) // 默认尺寸
      break
  }
}

// 设置组件尺寸
const setComponentSize = (width: number, height: number) => {
  componentSize.value.width = width
  componentSize.value.height = height
  handleSizeChange()
}

// 重置主题设置
const resetTheme = () => {
  themeSettings.value = {
    backgroundColor: '#2d3436',
    backgroundOpacity: 1,
    headerBackgroundColor: '#2d3436',
    headerTextColor: '#ffffff',
    onlineStatusColor: 'rgba(46, 204, 113, 0.8)',
    offlineStatusColor: 'rgba(231, 76, 60, 0.8)',
    
    // 下载速度
    downloadSpeedBgColor: 'rgba(33, 150, 243, 0.15)',
    downloadSpeedTextColor: '#3498db',
    downloadSpeedLabelColor: '#7f8c8d',
    
    // 上传速度
    uploadSpeedBgColor: 'rgba(76, 175, 80, 0.15)',
    uploadSpeedTextColor: '#27ae60',
    uploadSpeedLabelColor: '#7f8c8d',
    
    // 活跃下载
    activeDownloadsBgColor: 'rgba(33, 150, 243, 0.1)',
    activeDownloadsTextColor: '#4fc3f7',
    activeDownloadsLabelColor: '#7f8c8d',
    
    // 活跃任务
    activeTorrentsBgColor: 'rgba(156, 39, 176, 0.1)',
    activeTorrentsTextColor: '#9c27b0',
    activeTorrentsLabelColor: '#7f8c8d',
    
    // 暂停任务
    pausedTorrentsBgColor: 'rgba(255, 152, 0, 0.1)',
    pausedTorrentsTextColor: '#ff9800',
    pausedTorrentsLabelColor: '#7f8c8d',
    
    // 完成任务
    completedTorrentsBgColor: 'rgba(76, 175, 80, 0.1)',
    completedTorrentsTextColor: '#4caf50',
    completedTorrentsLabelColor: '#7f8c8d',
    
    // 总任务数
    totalTorrentsBgColor: 'rgba(158, 158, 158, 0.1)',
    totalTorrentsTextColor: '#9e9e9e',
    totalTorrentsLabelColor: '#7f8c8d',
    
    // 错误任务
    errorTorrentsBgColor: 'rgba(244, 67, 54, 0.1)',
    errorTorrentsTextColor: '#f44336',
    errorTorrentsLabelColor: '#7f8c8d',
    
    // 做种数
    seedingTorrentsBgColor: 'rgba(0, 188, 212, 0.1)',
    seedingTorrentsTextColor: '#00bcd4',
    seedingTorrentsLabelColor: '#7f8c8d',
    
    // 分享率
    globalRatioBgColor: 'rgba(3, 169, 244, 0.1)',
    globalRatioTextColor: '#03a9f4',
    globalRatioLabelColor: '#7f8c8d',
    
    // 平均分享率
    averageRatioBgColor: 'rgba(63, 81, 181, 0.1)',
    averageRatioTextColor: '#3f51b5',
    averageRatioLabelColor: '#7f8c8d',
    
    // 已下载
    globalDownloadedBgColor: 'rgba(0, 188, 212, 0.1)',
    globalDownloadedTextColor: '#00bcd4',
    globalDownloadedLabelColor: '#7f8c8d',
    
    // 已上传
    globalUploadedBgColor: 'rgba(233, 30, 99, 0.1)',
    globalUploadedTextColor: '#e91e63',
    globalUploadedLabelColor: '#7f8c8d',
    
    // 上传限制
    uploadLimitBgColor: 'rgba(255, 87, 34, 0.1)',
    uploadLimitTextColor: '#ff5722',
    uploadLimitLabelColor: '#7f8c8d',
    
    // 下载限制
    downloadLimitBgColor: 'rgba(121, 85, 72, 0.1)',
    downloadLimitTextColor: '#795548',
    downloadLimitLabelColor: '#7f8c8d',
    
    // 可用空间
    freeSpaceBgColor: 'rgba(96, 125, 139, 0.1)',
    freeSpaceTextColor: '#607d8b',
    freeSpaceLabelColor: '#7f8c8d',
    
    // 总体积
    totalSizeBgColor: 'rgba(97, 97, 97, 0.1)',
    totalSizeTextColor: '#616161',
    totalSizeLabelColor: '#7f8c8d',
    
    // 保留字段但不在UI中显示
    labelTextColor: 'rgba(255, 255, 255, 0.7)',
    valueTextColor: '#ffffff',
    
    borderRadius: '8px'
  }
  
  // 修复重置按钮，调用handleThemeChange应用设置
  handleThemeChange();
  
  ElMessage.info('主题设置已重置为默认值')
}

// 处理主题更新
const handleThemeUpdate = (theme: ThemeSettings) => {
  if (!currentTR.value) return
  
  // 确保themeSettings对象存在
  if (!currentTR.value.themeSettings) {
    currentTR.value.themeSettings = { 
      theme: { 
        backgroundColor: '#1a1a2e',
        backgroundOpacity: 1,
        headerBackgroundColor: '#1a1a2e',
        headerTextColor: '#ffffff',
        onlineStatusColor: 'rgba(46, 204, 113, 0.8)',
        offlineStatusColor: 'rgba(231, 76, 60, 0.8)',
        downloadSpeedBgColor: 'rgba(33, 150, 243, 0.15)',
        downloadSpeedTextColor: '#3498db',
        downloadSpeedLabelColor: 'rgba(255, 255, 255, 0.7)',
        labelTextColor: 'rgba(255, 255, 255, 0.7)',
        valueTextColor: '#ffffff',
        borderRadius: '8px'
      },
      wallpaper: {
        type: 'none',
        url: '',
        blur: 0,
        opacity: 1,
        backgroundColor: '#1a1a2e',
        style: 'solid',
        gradientDirection: 'to right',
        animation: false
      }
    }
  }
  
  // 保存新的主题设置 (复制所有属性)
  if (currentTR.value.themeSettings && currentTR.value.themeSettings.theme) {
    currentTR.value.themeSettings.theme = {...theme}
    

    
    saveTRList()
    
    ElMessage.success('主题设置已更新')
    setTimeout(() => {
      refreshPreview()
    }, 200)
  }
}

// 应用预设主题
const applyPresetTheme = (theme: string) => {
  if (!currentTR.value) return;

  // 设置基础主题
  themeSettings.value = {
    ...themeSettings.value,
    backgroundColor: theme === 'dark' ? '#1a1a2e' : 
                    theme === 'light' ? '#f5f5f5' : 
                    theme === 'nord' ? '#2e3440' :
                    theme === 'elegant' ? '#353535' :
                    theme === 'acrylic' ? 'rgba(28, 28, 30, 0.7)' :
                    theme === 'colorful' ? '#0f172a' :
                    '#2d3436',
    headerBackgroundColor: theme === 'dark' ? '#1a1a2e' : 
                    theme === 'light' ? '#f5f5f5' : 
                    theme === 'nord' ? '#2e3440' :
                    theme === 'elegant' ? '#353535' :
                    theme === 'acrylic' ? 'rgba(28, 28, 30, 0.7)' :
                    theme === 'colorful' ? '#0f172a' :
                    '#2d3436',
    headerTextColor: theme === 'dark' ? '#ffffff' : 
                     theme === 'light' ? '#000000' : 
                     theme === 'nord' ? '#eceff4' :
                     theme === 'elegant' ? '#ffffff' :
                     theme === 'acrylic' ? '#ffffff' : 
                     theme === 'colorful' ? '#ffffff' :
                     '#ffffff',
    onlineStatusColor: theme === 'dark' ? 'rgba(46, 204, 113, 0.8)' : 
                        theme === 'light' ? 'rgba(39, 174, 96, 0.8)' : 
                        theme === 'nord' ? 'rgba(163, 190, 140, 0.8)' :
                        theme === 'elegant' ? 'rgba(46, 204, 113, 0.8)' :
                        theme === 'acrylic' ? 'rgba(46, 204, 113, 0.8)' :
                        theme === 'colorful' ? 'rgba(46, 204, 113, 0.8)' :
                        'rgba(46, 204, 113, 0.8)',
    offlineStatusColor: theme === 'dark' ? 'rgba(231, 76, 60, 0.8)' : 
                       theme === 'light' ? 'rgba(192, 57, 43, 0.8)' : 
                       theme === 'nord' ? 'rgba(191, 97, 106, 0.8)' :
                       theme === 'elegant' ? 'rgba(231, 76, 60, 0.8)' :
                       theme === 'acrylic' ? 'rgba(231, 76, 60, 0.8)' :
                       theme === 'colorful' ? 'rgba(231, 76, 60, 0.8)' :
                       'rgba(231, 76, 60, 0.8)',
    backgroundOpacity: theme === 'acrylic' ? 0.7 : 1,
    labelTextColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 
                   theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 
                   theme === 'nord' ? 'rgba(236, 239, 244, 0.7)' :
                   theme === 'elegant' ? 'rgba(255, 255, 255, 0.7)' :
                   theme === 'acrylic' ? 'rgba(255, 255, 255, 0.7)' :
                   theme === 'colorful' ? 'rgba(255, 255, 255, 0.7)' :
                   'rgba(255, 255, 255, 0.7)',
    valueTextColor: theme === 'dark' ? '#ffffff' : 
                   theme === 'light' ? '#000000' : 
                   theme === 'nord' ? '#eceff4' :
                   theme === 'elegant' ? '#ffffff' :
                   theme === 'acrylic' ? '#ffffff' :
                   theme === 'colorful' ? '#ffffff' :
                   '#ffffff'
  };

  // 设置默认文本颜色
  const defaultLabelColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 
                          theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 
                          theme === 'nord' ? 'rgba(236, 239, 244, 0.7)' :
                          theme === 'elegant' ? 'rgba(255, 255, 255, 0.7)' :
                          theme === 'acrylic' ? 'rgba(255, 255, 255, 0.7)' :
                          theme === 'colorful' ? 'rgba(255, 255, 255, 0.7)' :
                          'rgba(255, 255, 255, 0.7)';

  // 为所有项目设置默认颜色
  const items = [
    'downloadSpeed', 'uploadSpeed', 'totalDownloaded', 'totalUploaded', 
    'activeDownloads', 'activeTorrents', 'pausedTorrents', 'totalTorrents', 
    'seedingTorrents', 'downloadingTorrents', 'errorTorrents', 'checkingTorrents', 
    'ratio', 'freeSpace'
  ];

  items.forEach(item => {
    // 设置背景颜色
    themeSettings.value[`${item}BgColor`] = theme === 'dark' ? 'rgba(33, 150, 243, 0.15)' : 
                                              theme === 'light' ? 'rgba(33, 150, 243, 0.1)' : 
                                              theme === 'nord' ? 'rgba(136, 192, 208, 0.15)' :
                                              theme === 'elegant' ? 'rgba(33, 150, 243, 0.2)' :
                                              theme === 'acrylic' ? 'rgba(10, 132, 255, 0.25)' :
                                              theme === 'colorful' ? 'rgba(6, 182, 212, 0.2)' :
                                              'rgba(33, 150, 243, 0.15)';
    
    // 设置标签文本颜色
    themeSettings.value[`${item}LabelColor`] = defaultLabelColor;
    
    // 设置值文本颜色
    themeSettings.value[`${item}TextColor`] = theme === 'dark' ? '#3498db' : 
                                               theme === 'light' ? '#2980b9' : 
                                               theme === 'nord' ? '#88c0d0' :
                                               theme === 'elegant' ? '#3498db' :
                                               theme === 'acrylic' ? '#0a84ff' :
                                               theme === 'colorful' ? '#06b6d4' :
                                               '#3498db';
  });

  // 特殊项目样式设置
  // 下载速度
  themeSettings.value.downloadSpeedBgColor = theme === 'dark' ? 'rgba(33, 150, 243, 0.15)' : 
                                            theme === 'light' ? 'rgba(33, 150, 243, 0.1)' : 
                                            theme === 'nord' ? 'rgba(136, 192, 208, 0.15)' :
                                            theme === 'elegant' ? 'rgba(33, 150, 243, 0.2)' :
                                            theme === 'acrylic' ? 'rgba(10, 132, 255, 0.25)' :
                                            theme === 'colorful' ? 'rgba(6, 182, 212, 0.2)' :
                                            'rgba(33, 150, 243, 0.15)';
  
  themeSettings.value.downloadSpeedTextColor = theme === 'dark' ? '#3498db' : 
                                              theme === 'light' ? '#2980b9' : 
                                              theme === 'nord' ? '#88c0d0' :
                                              theme === 'elegant' ? '#3498db' :
                                              theme === 'acrylic' ? '#0a84ff' :
                                              theme === 'colorful' ? '#06b6d4' :
                                              '#3498db';
  
  // 上传速度
  themeSettings.value.uploadSpeedBgColor = theme === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 
                                          theme === 'light' ? 'rgba(76, 175, 80, 0.1)' : 
                                          theme === 'nord' ? 'rgba(163, 190, 140, 0.15)' :
                                          theme === 'elegant' ? 'rgba(76, 175, 80, 0.2)' :
                                          theme === 'acrylic' ? 'rgba(48, 209, 88, 0.25)' :
                                          theme === 'colorful' ? 'rgba(5, 150, 105, 0.2)' :
                                          'rgba(76, 175, 80, 0.15)';
  
  themeSettings.value.uploadSpeedTextColor = theme === 'dark' ? '#27ae60' : 
                                            theme === 'light' ? '#27ae60' : 
                                            theme === 'nord' ? '#a3be8c' :
                                            theme === 'elegant' ? '#27ae60' :
                                            theme === 'acrylic' ? '#30d158' :
                                            theme === 'colorful' ? '#059669' :
                                            '#27ae60';
  
  // 做种数量
  themeSettings.value.seedingTorrentsBgColor = theme === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 
                                              theme === 'light' ? 'rgba(76, 175, 80, 0.1)' : 
                                              theme === 'nord' ? 'rgba(163, 190, 140, 0.15)' :
                                              theme === 'elegant' ? 'rgba(76, 175, 80, 0.2)' :
                                              theme === 'acrylic' ? 'rgba(48, 209, 88, 0.25)' :
                                              theme === 'colorful' ? 'rgba(5, 150, 105, 0.2)' :
                                              'rgba(76, 175, 80, 0.15)';
  
  themeSettings.value.seedingTorrentsTextColor = theme === 'dark' ? '#27ae60' : 
                                                theme === 'light' ? '#27ae60' : 
                                                theme === 'nord' ? '#a3be8c' :
                                                theme === 'elegant' ? '#27ae60' :
                                                theme === 'acrylic' ? '#30d158' :
                                                theme === 'colorful' ? '#059669' :
                                                '#27ae60';
  
  // 错误种子
  themeSettings.value.errorTorrentsBgColor = theme === 'dark' ? 'rgba(231, 76, 60, 0.15)' : 
                                            theme === 'light' ? 'rgba(231, 76, 60, 0.1)' : 
                                            theme === 'nord' ? 'rgba(191, 97, 106, 0.15)' :
                                            theme === 'elegant' ? 'rgba(231, 76, 60, 0.2)' :
                                            theme === 'acrylic' ? 'rgba(255, 69, 58, 0.25)' :
                                            theme === 'colorful' ? 'rgba(220, 38, 38, 0.2)' :
                                            'rgba(231, 76, 60, 0.15)';
  
  themeSettings.value.errorTorrentsTextColor = theme === 'dark' ? '#e74c3c' : 
                                              theme === 'light' ? '#c0392b' : 
                                              theme === 'nord' ? '#bf616a' :
                                              theme === 'elegant' ? '#e74c3c' :
                                              theme === 'acrylic' ? '#ff453a' :
                                              theme === 'colorful' ? '#dc2626' :
                                              '#e74c3c';
  
  // 直接应用主题，无需点击"应用主题"按钮
  handleThemeUpdate(themeSettings.value);
  
  // 同时应用壁纸预设
  applyWallpaperPreset(theme);
}

// 监听域名前缀变化，更新当前TR配置
watch(domainPrefix, (newPrefix) => {
  if (currentTR.value) {
    currentTR.value.domainPrefix = newPrefix
    saveTRList()
  }
})
</script>

<style scoped lang="scss">
.tr-status-detail {
  padding: 24px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    
    .title-area {
      h2 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-color-primary);
      }
      
      .description {
        color: var(--el-text-color-secondary);
        margin: 0;
      }
    }
    
    .actions {
      display: flex;
      gap: 12px;
  }
}

/* 支持作者样式 */
.support-author {
  margin: 0 0 20px;
  text-align: center;
  font-size: 14px;
  background: linear-gradient(to right, rgba(230, 162, 60, 0.05), rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.05));
  padding: 10px 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .support-text {
    color: #606266;
    
    .highlight {
      color: #E6A23C;
      font-weight: 500;
      margin-left: 4px;
    }
  }
}

.main-content {
  display: grid;
  grid-template-columns: minmax(250px, 280px) 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  font-weight: 600;
  font-size: 16px;
}

.tr-list-section {
  border-radius: 8px;
  overflow: hidden;
  
  :deep(.el-card__header) {
    padding: 12px 16px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  :deep(.el-card__body) {
    padding: 0;
    max-height: 500px;
    overflow-y: auto;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  
  .tr-list {
    .tr-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      cursor: pointer;
      transition: all 0.2s;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
      
      &.active {
        background-color: var(--el-color-primary-light-8);
        border-left: 3px solid var(--el-color-primary);
      }
      
      .tr-item-content {
        display: flex;
        align-items: center;
        flex: 1;
      }
      
      .tr-item-name {
        font-weight: 500;
        flex: 1;
        margin-right: 8px;
        word-break: break-word;
      }
      
      .tr-item-status {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 10px;
        background-color: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
        
        &.valid {
          background-color: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }
      }
    }
    
    .no-tr {
      padding: 40px 0;
    }
  }
}

.domain-prefix-section {
  border-radius: 8px;
  overflow: hidden;
  
  .domain-prefix-content {
    padding: 16px;
    
    .form-tip {
          font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
    }
  }
}

.config-preview-tabs {
  :deep(.el-tabs__content) {
    overflow: visible;
  }
}

.params-content {
  padding: 16px 0;
}

/* 预览相关样式 */
.preview-container {
  margin: 0 0 24px;
  overflow: hidden;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  
  .iframe-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: linear-gradient(135deg, rgba(128, 128, 128, 0.05), rgba(128, 128, 128, 0.1));
    
    .iframe-wrapper {
      position: relative;
      width: 100%;
      max-width: 600px;
      height: 360px;
      margin: 0 auto;
      
      .iframe-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: rgba(26, 26, 46, 0.8);
        color: white;
        z-index: 10;
  border-radius: 8px;
        
        .loading-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
      }
    }
  }
}

.iframe-preview {
  position: relative;
  width: 100%;
  min-height: 350px;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, rgba(128, 128, 128, 0.1), rgba(128, 128, 128, 0.05));
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    background-color: transparent !important;
    z-index: 2;
    position: relative;
  }
  
  .background-preview {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    pointer-events: none;
  }
  
  .size-display {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 10;
    pointer-events: none;
  }
  
  .iframe-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(26, 26, 46, 0.8);
    color: white;
    z-index: 10;
    
    .loading-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
  }
}

.empty-preview {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.preview-settings-card {
  margin-top: 24px;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  
  :deep(.el-card__header) {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-light);
  }
  
  :deep(.el-tabs--border-card) {
    box-shadow: none;
    border: none;
  }
  
  :deep(.el-tabs__content) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    :deep(.el-tabs__content) {
      padding: 10px;
    }
  }
}

.responsive-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.responsive-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.slider-value {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: right;
  margin-top: 4px;
}

/* 主题设置相关样式 */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.mini-form-item {
  margin-bottom: 10px;
  
  :deep(.el-form-item__label) {
    font-size: 13px;
  }
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

@keyframes gradient-animation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 预设主题卡片样式 */
.preset-themes {
  padding: 16px 0;
}

.preset-theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.preset-theme-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #eee;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.preset-theme-preview {
  height: 80px;
  
  &.dark-theme {
    background-color: #1e1e2e;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #1e1e2e;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(137, 180, 250, 0.15);
      border-radius: 4px;
    }
  }
  
  &.light-theme {
    background-color: #f9fafb;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #f9fafb;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(59, 130, 246, 0.1);
      border-radius: 4px;
    }
  }
  
  &.nord-theme {
    background-color: #2e3440;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #2e3440;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(129, 161, 193, 0.15);
      border-radius: 4px;
    }
  }
  
  &.elegant-theme {
    background-color: #353535;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #353535;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(66, 165, 245, 0.15);
      border-radius: 4px;
    }
  }
  
  &.acrylic-theme {
    background-color: rgba(28, 28, 30, 0.7);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: rgba(28, 28, 30, 0.7);
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(10, 132, 255, 0.25);
      border-radius: 6px;
    }
  }
  
  &.colorful-theme {
    background-color: #0f172a;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 24px;
      background-color: #0f172a;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      height: 20px;
      background-color: rgba(6, 182, 212, 0.2);
      border-radius: 4px;
    }
  }
}

.preset-theme-name {
  padding: 8px;
  text-align: center;
  font-size: 14px;
  background-color: #f5f5f5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tr-status-detail {
    padding: 16px;
  }
  
  .header-section {
    flex-direction: column;
    
    .actions {
      margin-top: 16px;
      align-self: flex-end;
    }
  }
  
  .iframe-preview {
    iframe {
      transform: scale(0.9);
      height: auto;
    }
  }
  
  .preview-settings-card {
    :deep(.el-tabs__item) {
      font-size: 12px;
      padding: 0 10px;
    }
    
    :deep(.el-tabs__content) {
      padding: 10px 0;
    }
  }
}

.highlight-title {
  color: #E6A23C;
  font-weight: 600;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  padding: 3px 6px;
  border-radius: 4px;
  background-color: rgba(230, 162, 60, 0.1);
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.2);
}

/* 修改折叠面板样式，使主题设置更突出 */
.preview-container {
  .el-collapse {
    border: 2px solid rgba(230, 162, 60, 0.2);
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(230, 162, 60, 0.15);
    
    :deep(.el-collapse-item__header) {
      background-color: rgba(230, 162, 60, 0.05);
      padding: 8px 12px;
      height: auto;
      line-height: 1.5;
    }
    
    :deep(.el-collapse-item__content) {
      padding: 16px;
    }
  }
}
</style> 