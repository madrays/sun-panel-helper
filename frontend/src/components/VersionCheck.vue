<template>
  <!-- 侧边栏版本信息 -->
  <div class="version-info" @click="checkVersion">
    <el-icon><Setting /></el-icon>
    <span v-if="!isCollapse">v{{ currentVersion }}</span>
    <div v-if="hasNewVersion" class="update-badge">更新</div>
  </div>

  <!-- 版本检查弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="`Sun Panel Helper ${currentVersion}`"
    width="520px"
    :append-to-body="true"
    :destroy-on-close="true"
    class="version-dialog"
  >
    <div class="dialog-content">
      <!-- 版本状态卡片 -->
      <div class="version-status" :class="{ 'has-update': hasNewVersion }">
        <div class="status-icon">
          <el-icon><component :is="hasNewVersion ? 'Upload' : 'CircleCheckFilled'" /></el-icon>
        </div>
        <div class="status-info">
          <div class="status-title">
            {{ hasNewVersion ? '发现新版本' : '当前已是最新版本' }}
          </div>
          <div class="version-compare">
            <span class="current">当前版本: v{{ currentVersion }}</span>
            <template v-if="hasNewVersion">
              <el-icon><ArrowRight /></el-icon>
              <span class="latest">最新版本: v{{ latestVersion }}</span>
            </template>
          </div>
          <div v-if="hasNewVersion" class="update-desc">
            {{ updateDesc }}
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="section-divider">
        <span class="divider-text">快速导航</span>
      </div>

      <!-- 快速链接 -->
      <div class="quick-links">
        <div class="link-item github" @click="openLink('github')">
          <svg class="icon" viewBox="0 0 1024 1024">
            <path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"/>
          </svg>
          <span>GitHub</span>
        </div>
        <div class="link-item gitee" @click="openLink('gitee')">
          <svg class="icon" viewBox="0 0 1024 1024">
            <path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z"/>
          </svg>
          <span>Gitee</span>
        </div>
        <div class="link-item bilibili" @click="openLink('bilibili')">
          <svg class="icon" viewBox="0 0 1024 1024">
            <path d="M777.514667 131.669333a53.333333 53.333333 0 0 1 0 75.434667L728.746667 255.829333h49.92A160 160 0 0 1 938.666667 415.872v320a160 160 0 0 1-160 160H245.333333A160 160 0 0 1 85.333333 735.872v-320a160 160 0 0 1 160-160h49.749334L246.4 207.146667a53.333333 53.333333 0 1 1 75.392-75.434667l113.152 113.152c3.370667 3.370667 6.186667 7.04 8.448 10.965333h137.088c2.261333-3.925333 5.12-7.594667 8.490667-10.965333l113.109333-113.152a53.333333 53.333333 0 0 1 75.434667 0z m1.152 231.253334H245.333333a53.333333 53.333333 0 0 0-53.205333 49.365333l-0.128 4.010667v320c0 28.117333 21.76 51.157333 49.365333 53.162666l3.968 0.170667h533.333334a53.333333 53.333333 0 0 0 53.205333-49.365333l0.128-3.968v-320c0-29.44-23.893333-53.333333-53.333333-53.333334z m-426.666667 106.666666c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z m320 0c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z"/>
          </svg>
          <span>B站主页</span>
        </div>
        <div class="link-item video" @click="openLink('tutorial')">
          <svg class="icon" viewBox="0 0 1024 1024">
            <path d="M512 0C229.376 0 0 229.376 0 512s229.376 512 512 512 512-229.376 512-512S794.624 0 512 0zm215.04 551.936L365.056 721.92c-7.168 3.584-15.872-.512-15.872-8.704V310.272c0-8.192 8.704-12.288 15.872-8.704l361.984 169.984c7.68 3.584 7.68 14.336 0 17.92z"/>
          </svg>
          <span>使用教程</span>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="section-divider">
        <span class="divider-text">更新教程</span>
      </div>

      <!-- 更新教程 -->
      <el-collapse class="update-guide">
        <el-collapse-item>
          <template #title>
            <div class="guide-header">
              <el-icon><Document /></el-icon>
              <span>点击查看更新教程</span>
            </div>
          </template>
          
          <!-- 更新提示说明 -->
          <div class="guide-tips">
            <div class="tip-item">
              <div class="tip-title">
                <el-icon><Warning /></el-icon>
                <span>更新前请注意</span>
              </div>
              <ul>
                <li>请确保已备份重要数据</li>
                <li>更新过程中服务会短暂中断</li>
                <li>如遇问题可查看使用教程或加群咨询</li>
              </ul>
            </div>
            <div class="tip-item">
              <div class="tip-title">
                <el-icon><Edit /></el-icon>
                <span>配置说明</span>
              </div>
              <ul>
                <li>
                  <code>33002:80</code> - 前端访问端口
                  <div class="port-tips">
                    <span class="required">注意: 容器内端口80不可修改</span>
                    <span class="desc">只能修改映射端口33002为其他值</span>
                  </div>
                </li>
                <li>
                  <code>BACKEND_PORT=3001</code> - 后端端口，可自定义修改
                </li>
                <li>
                  <code>/path/to/sunpanel/conf/custom</code> - Sun-Panel的custom目录
                  <div class="path-tips">请替换为你的实际Sun-Panel配置目录路径</div>
                </li>
              </ul>
            </div>
          </div>

          <!-- 更新命令 -->
          <div class="guide-steps">
            <div class="step">
              <div class="step-title">
                <el-icon><ArrowRight /></el-icon>
                <span>Docker命令更新</span>
              </div>
              <div class="step-content">
                <pre class="code-block">docker pull madrays/sun-panel-helper:latest
docker stop sun-panel-helper
docker rm sun-panel-helper
docker run -d \
  --name sun-panel-helper \
  -p 33002:80 \
  -e BACKEND_PORT=3001 \
  -v /path/to/sunpanel/conf/custom:/app/backend/custom \
  madrays/sun-panel-helper:latest</pre>
              </div>
            </div>
            <div class="step">
              <div class="step-title">
                <el-icon><ArrowRight /></el-icon>
                <span>Docker Compose更新</span>
              </div>
              <div class="step-content">
                <pre class="code-block"># 进入docker-compose.yml所在目录
docker-compose pull
docker-compose up -d</pre>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Setting,  // 改用设置图标
  Upload,
  CircleCheckFilled,
  ArrowRight,
  Document,
  Warning,
  Edit
} from '@element-plus/icons-vue'

const props = defineProps({
  isCollapse: Boolean
})

const currentVersion = '2.0.2'
const latestVersion = ref('')
const hasNewVersion = ref(false)
const updateDesc = ref('')
const dialogVisible = ref(false)

// 比较版本号
const compareVersions = (v1: string, v2: string) => {
  const v1Parts = v1.split('.').map(Number)
  const v2Parts = v2.split('.').map(Number)
  
  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] > v2Parts[i]) return 1
    if (v1Parts[i] < v2Parts[i]) return -1
  }
  return 0
}

// 检查版本
const checkVersion = async () => {
  dialogVisible.value = true
  await checkLatestVersion()
}

// 检查最新版本
const checkLatestVersion = async () => {
  try {
    // 优先使用Gitee API
    const res = await fetch('https://gitee.com/api/v5/repos/madrays/sun-panel-helper/tags')
    const data = await res.json()
    if (data && data.length > 0) {
      // 找出最大版本号
      const versions = data.map(tag => tag.name.replace('v', ''))
      const maxVersion = versions.reduce((max, ver) => 
        compareVersions(ver, max) > 0 ? ver : max
      , '0.0.0')
      
      latestVersion.value = maxVersion
      hasNewVersion.value = compareVersions(maxVersion, currentVersion) > 0
      
      // 获取对应tag的完整更新说明
      if (hasNewVersion.value) {
        const tag = data.find(t => t.name.replace('v', '') === maxVersion)
        if (tag) {
          try {
            // 获取commit详情来获取完整message
            const commitRes = await fetch(`https://gitee.com/api/v5/repos/madrays/sun-panel-helper/commits/${tag.commit.sha}`)
            const commitData = await commitRes.json()
            updateDesc.value = commitData.commit.message
          } catch {
            updateDesc.value = `feat: v${maxVersion}版本更新`
          }
        }
      }
      return
    }
  } catch {
    // Gitee失败后尝试GitHub
    try {
      const res = await fetch('https://api.github.com/repos/madrays/sun-panel-helper/tags')
      const data = await res.json()
      if (data && data.length > 0) {
        const versions = data.map(tag => tag.name.replace('v', ''))
        const maxVersion = versions.reduce((max, ver) => 
          compareVersions(ver, max) > 0 ? ver : max
        , '0.0.0')
        
        latestVersion.value = maxVersion
        hasNewVersion.value = compareVersions(maxVersion, currentVersion) > 0
        
        // 获取对应tag的完整更新说明
        if (hasNewVersion.value) {
          const tag = data.find(t => t.name.replace('v', '') === maxVersion)
          if (tag) {
            try {
              const commitRes = await fetch(tag.commit.url)
              const commitData = await commitRes.json()
              updateDesc.value = commitData.commit.message
            } catch {
              updateDesc.value = `feat: v${maxVersion}版本更新`
            }
          }
        }
      }
    } catch (err) {
      console.error('版本检查失败:', err)
    }
  }
}

// 定时检查更新
onMounted(() => {
  checkLatestVersion()
  // 每小时检查一次更新
  setInterval(checkLatestVersion, 3600000)
})

// 打开链接
const openLink = (type: string) => {
  const links = {
    github: 'https://github.com/madrays/sun-panel-helper',
    gitee: 'https://gitee.com/madrays/sun-panel-helper',
    bilibili: 'https://space.bilibili.com/1966866878',
    tutorial: 'https://www.bilibili.com/video/BV124PkeFEwM'
  }
  window.open(links[type], '_blank')
}
</script>

<style scoped lang="scss">
.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin: 4px 6px;
  cursor: pointer;
  border-radius: 6px;
  color: var(--el-text-color-secondary);
  transition: all 0.2s;
  position: relative;
  font-size: 13px;

  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .update-badge {
    position: absolute;
    right: 6px;
    top: 6px;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--el-color-danger);
    color: white;
    font-size: 12px;
    transform: scale(0.9);
  }
}

.version-dialog {
  :deep(.el-dialog__header) {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .dialog-content {
    padding: 24px;

    .version-status {
      display: flex;
      gap: 20px;
      padding: 24px;
      background: #f0f9eb;
      border-radius: 8px;
      margin-bottom: 30px;
      transition: all 0.3s;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

      &.has-update {
        background: #ecf5ff;
      }

      .status-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #67c23a;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          font-size: 24px;
        }
      }

      &.has-update .status-icon {
        background: var(--el-color-primary);
        animation: pulse 2s infinite;
      }

      .status-info {
        flex: 1;

        .status-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #2c3e50;
        }

        .version-compare {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--el-text-color-regular);

          .el-icon {
            color: var(--el-color-primary);
          }

          .latest {
            color: var(--el-color-primary-dark-2);
            font-weight: 500;
          }
        }

        .update-desc {
          margin-top: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.6;
          color: var(--el-text-color-regular);
          white-space: pre-line;
        }
      }
    }

    .section-divider {
      display: flex;
      align-items: center;
      margin: 30px 0 20px;
      color: #909399;
      font-size: 14px;
      font-weight: 500;

      &::before,
      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--el-border-color-light);
      }

      .divider-text {
        padding: 0 12px;
      }
    }

    .quick-links {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 24px;

      .link-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        color: white;

        .icon {
          width: 28px;
          height: 28px;
          fill: currentColor;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
          transition: transform 0.2s;
        }

        &:hover .icon {
          transform: scale(1.1);
        }

        span {
          font-size: 14px;
          font-weight: 500;
        }

        &.github {
          background: linear-gradient(135deg, #2b3137 0%, #24292e 100%);
        }

        &.gitee {
          background: linear-gradient(135deg, #d81f06 0%, #c71d23 100%);
        }

        &.bilibili {
          background: linear-gradient(135deg, #00a1d6 0%, #008ac5 100%);
        }

        &.video {
          background: linear-gradient(135deg, #606266 0%, #505155 100%);
        }
      }
    }

    .guide-tips {
      margin-bottom: 20px;
      
      .tip-item {
        background: #f4f4f5;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .tip-title {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          font-weight: 500;
          color: #2c3e50;

          .el-icon {
            font-size: 16px;
            color: var(--el-color-primary);
          }
        }

        ul {
          margin: 0;
          padding-left: 20px;
          
          li {
            color: var(--el-text-color-regular);
            margin-bottom: 8px;
            font-size: 13px;
            line-height: 1.6;

            &:last-child {
              margin-bottom: 0;
            }

            code {
              background: #ebeef5;
              padding: 2px 6px;
              border-radius: 4px;
              color: #476582;
              font-family: monospace;
            }

            .port-tips {
              margin-top: 4px;
              margin-left: 4px;
              font-size: 12px;
              
              .required {
                color: var(--el-color-danger);
                font-weight: 500;
              }
              
              .desc {
                color: var(--el-text-color-secondary);
                margin-left: 8px;
              }
            }

            .path-tips {
              margin-top: 4px;
              margin-left: 4px;
              font-size: 12px;
              color: var(--el-color-warning-dark-2);
            }
          }
        }
      }
    }

    .guide-steps {
      .step {
        margin-bottom: 16px;

        .step-title {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          color: #2c3e50;
          font-weight: 500;

          .el-icon {
            color: var(--el-color-primary);
          }
        }

        .code-block {
          background: #282c34;
          border-radius: 6px;
          padding: 16px;
          margin: 0;
          font-family: monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #abb2bf;
          white-space: pre-wrap;
        }
      }
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style> 