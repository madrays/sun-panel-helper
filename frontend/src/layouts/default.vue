<template>
  <div class="app-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
        <div class="logo" @click="goToHome">
          <img src="/logo.svg" alt="Logo" class="logo-img" />
          <h1 class="logo-text" v-show="!isCollapse">Sun Panel Helper</h1>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          :collapse="isCollapse"
          :router="true"
        >
          <!-- 首页 -->
          <el-menu-item index="/dashboard">
            <el-icon><house /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <!-- 常规功能区 -->
          <el-menu-item index="/dashboard/css">
            <el-icon><magic-stick /></el-icon>
            <span>CSS 美化库</span>
          </el-menu-item>
          
          <el-menu-item index="/dashboard/js">
            <el-icon><monitor /></el-icon>
            <span>JS 功能库</span>
          </el-menu-item>
          
          <el-menu-item index="/dashboard/market">
            <el-icon><shop /></el-icon>
            <span>组件市场</span>
          </el-menu-item>

          <!-- 分割线 -->
          <div class="menu-divider">
            <span class="divider-text" v-show="!isCollapse">特殊组件</span>
          </div>
          
          <!-- 特殊组件区 -->
          <el-menu-item index="/dashboard/fixed">
            <el-icon><location /></el-icon>
            <span>固定组件</span>
          </el-menu-item>
          
          <el-menu-item index="/dashboard/free">
            <el-icon><magic-stick /></el-icon>
            <span>自由组件</span>
          </el-menu-item>

          <!-- 分割线 -->
          <div class="menu-divider">
            <span class="divider-text" v-show="!isCollapse">百宝箱</span>
          </div>
          
          <!-- 百宝箱区 -->
          <el-menu-item index="/dashboard/toolbox">
            <el-icon><Star /></el-icon>
            <span>百宝箱</span>
          </el-menu-item>

          <!-- 分割线 -->
          <div class="menu-divider">
            <span class="divider-text" v-show="!isCollapse">系统工具</span>
          </div>

          <!-- 系统工具区 -->
          <el-menu-item index="/dashboard/backup">
            <el-icon><CopyDocument /></el-icon>
            <span>备份恢复</span>
          </el-menu-item>

          <!-- 添加弹性空间 -->
          <div class="flex-spacer"></div>

          <!-- 支持作者区域添加特殊样式 -->
          <div class="support-divider">
            <div class="divider-line"></div>
            <span class="divider-text" v-show="!isCollapse">支持项目</span>
            <div class="divider-line"></div>
          </div>
          
          <el-menu-item index="/dashboard/thanks" class="thanks-item">
            <el-icon><Medal /></el-icon>
            <span>项目鸣谢</span>
          </el-menu-item>
          
          <el-menu-item index="/dashboard/support" class="support-item">
            <el-icon><Coffee /></el-icon>
            <span>支持作者</span>
          </el-menu-item>

          <!-- 添加版本信息组件 -->
          <VersionCheck :is-collapse="isCollapse" />
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="main-container">
        <el-header height="64px" class="header">
          <div class="header-left">
            <div class="collapse-btn" @click="toggleSidebar">
              <el-icon><fold /></el-icon>
            </div>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRoute.meta.parentTitle" :to="{ path: currentRoute.meta.parentPath }">{{ currentRoute.meta.parentTitle }}</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRoute.meta.title">{{ currentRoute.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <!-- 官方文档链接 - 移到用户头像左侧 -->
            <a href="https://helper.cocoyoo.cn" target="_blank" class="doc-link" title="官方文档">
              <div class="bg-pattern"></div>
              <div class="shine-line"></div>
              <div class="particles">
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
              </div>
              <div class="doc-icon-wrapper">
                <el-icon><document /></el-icon>
              </div>
              <span class="doc-text">官方文档</span>
            </a>
            
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="userInfo.avatar" />
                <span class="username">{{ userInfo.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="changePassword">
                    <el-icon><setting /></el-icon>
                    修改密码
                  </el-dropdown-item>
                  <el-dropdown-item command="logout">
                    <el-icon><circle-close /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="main">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  House,
  Fold,
  ArrowRight,
  MagicStick,
  Monitor,
  Shop,
  Location,
  Coffee,
  User,
  Key,
  Refresh,
  CopyDocument,
  Document,
  Medal,
  Star
} from '@element-plus/icons-vue'
import VersionCheck from '@/components/VersionCheck.vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const activeMenu = computed(() => {
  // 获取当前路由的父路径
  const parentPath = route.meta.parentPath as string
  
  // 如果是三级路由，返回父路径以保持二级菜单高亮
  if (parentPath) {
    return parentPath
  }
  
  // 否则返回当前路径
  return route.path
})
const currentRoute = computed(() => route)

// 获取用户信息
const userInfo = computed(() => {
  try {
    const storedInfo = localStorage.getItem('userInfo')
    if (!storedInfo) {
      router.push('/login')
      return { username: '', avatar: '' }
    }
    return JSON.parse(storedInfo)
  } catch (error) {
    console.error('Error parsing user info:', error)
    router.push('/login')
    return { username: '', avatar: '' }
  }
})

// 响应式处理
const handleResize = () => {
  isCollapse.value = window.innerWidth <= 768
}

onMounted(() => {
  handleResize() // 初始化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const goToHome = () => {
  router.push('/dashboard')
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'changePassword':
      router.push('/dashboard/profile/change-password')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.push('/login')
}
</script>

<style scoped lang="scss">
.app-container {
  width: 100%;
  min-height: 100vh;
}

.el-container {
  width: 100%;
  min-height: 100vh;
}

.sidebar {
  background: var(--bg-sidebar);
  backdrop-filter: blur(12px);
  height: 100vh;
  transition: var(--transition-bounce);
  overflow-x: hidden;
  border-right: none;
  box-shadow: var(--shadow);
  flex-shrink: 0;
  position: fixed;
  z-index: 1000;

  .logo {
    height: 64px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: var(--transition-bounce);
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-sidebar);

    &:hover {
      transform: translateX(4px);
    }

    .logo-img {
      width: 36px;
      height: 36px;
      transition: var(--transition-bounce);
    }

    .logo-text {
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      white-space: nowrap;
    }
  }
}

.el-menu-vertical {
  border-right: none;
  background: transparent;
  padding: 12px;
  height: calc(100% - 64px);  /* 减去logo高度 */
  display: flex;
  flex-direction: column;
}

.menu-divider {
  margin: 16px 12px;
  padding: 0 8px;
  
  .divider-text {
    color: var(--text-disabled);
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.main-container {
  margin-left: v-bind('isCollapse ? "64px" : "240px"');
  transition: margin-left var(--transition-bounce);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--bg-header);
  backdrop-filter: blur(12px);
  border-bottom: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 999;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .collapse-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius-base);
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition-bounce);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      
      &:hover {
        color: var(--primary-color);
        transform: rotate(180deg);
        border-color: var(--primary-light);
        box-shadow: var(--shadow);
      }

      .el-icon {
        margin: 0;
      }
    }

    .el-breadcrumb {
      white-space: nowrap;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .el-dropdown {
      outline: none !important;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: var(--border-radius-base);
      transition: var(--transition-bounce);
      background: white;
      border: 1px solid var(--border-color);
      outline: none !important;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow);
        border-color: var(--primary-light);
      }

      &:focus {
        outline: none !important;
        box-shadow: none !important;
      }

      .username {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-primary);
      }
    }
    
    /* 文档链接样式 */
    .doc-link {
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: 40px;
      border-radius: var(--border-radius-base);
      background: linear-gradient(145deg, #409eff, #1b56e0);
      background-size: 200% 200%;
      color: white;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(23, 92, 230, 0.25);
      margin-right: 20px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(5px);
      animation: float 3s ease-in-out infinite, 
                 pulse 2s infinite alternate, 
                 borderGlow 4s infinite alternate,
                 gradientShift 8s linear infinite;
      transform-style: preserve-3d;
      perspective: 500px;
      
      /* 发光边框 */
      &::before {
        content: "";
        position: absolute;
        inset: -1px;
        background: linear-gradient(90deg, #4dabff, #2160f0, #4dabff);
        border-radius: inherit;
        animation: rotateBorder 3s linear infinite, borderPulse 2s infinite alternate;
        z-index: -1;
        filter: blur(2px);
      }
      
      /* 扫光效果 */
      &::after {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
        opacity: 0;
        transform: scale(0.5);
        animation: scanLight 5s infinite;
        z-index: 1;
        transform-origin: center;
      }
      
      /* 内容背景图案 */
      .bg-pattern {
        position: absolute;
        inset: 0;
        background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='13' r='1.5'/%3E%3C/g%3E%3C/svg%3E");
        opacity: 0.5;
        z-index: 0;
        animation: patternMove 20s linear infinite;
      }
      
      /* 扫光线 */
      .shine-line {
        position: absolute;
        top: 0;
        left: -100%;
        width: 40%;
        height: 100%;
        background: linear-gradient(90deg, 
          rgba(255,255,255,0) 0%, 
          rgba(255,255,255,0.4) 50%, 
          rgba(255,255,255,0) 100%);
        transform: skewX(-20deg);
        animation: shineLine 5s infinite;
        z-index: 2;
      }
      
      /* 粒子效果 */
      .particles {
        position: absolute;
        inset: 0;
        z-index: 2;
        overflow: hidden;
        
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: white;
          border-radius: 50%;
          opacity: 0;
          
          &:nth-child(1) {
            top: 20%;
            left: 20%;
            animation: particleAnimation 3s ease-in-out infinite;
          }
          
          &:nth-child(2) {
            top: 70%;
            left: 40%;
            animation: particleAnimation 2.5s 0.3s ease-in-out infinite;
          }
          
          &:nth-child(3) {
            top: 30%;
            left: 60%;
            animation: particleAnimation 3.5s 0.7s ease-in-out infinite;
          }
          
          &:nth-child(4) {
            top: 60%;
            left: 80%;
            animation: particleAnimation 4s 1s ease-in-out infinite;
          }
        }
      }
      
      &:hover {
        transform: translateY(-3px) scale(1.05) rotateX(5deg);
        box-shadow: 0 10px 25px rgba(23, 92, 230, 0.6);
        background: linear-gradient(145deg, #4dabff, #2160f0);
        animation-play-state: paused;
        
        .doc-icon-wrapper {
          transform: rotateY(180deg);
          animation-play-state: paused;
        }
        
        .shine-line {
          animation-duration: 1.5s;
        }
        
        /* 霓虹脉冲效果 */
        &::after {
          animation: scanLight 2.5s infinite;
        }
      }
      
      .doc-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        position: relative;
        transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        transform-style: preserve-3d;
        z-index: 3;
        animation: iconPulse 1.5s infinite alternate, iconFloat 3s ease-in-out infinite;
        
        &:before {
          content: '';
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          animation: ripple 2s infinite ease-in-out;
        }

        &:after {
          content: '';
          position: absolute;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: ripple 2.5s 0.5s infinite ease-in-out;
        }
      }
      
      .el-icon {
        font-size: 20px;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        z-index: 3;
        animation: iconRotate 6s linear infinite;
      }
      
      .doc-text {
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.5px;
        position: relative;
        z-index: 3;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        animation: textGlow 2s ease-in-out infinite alternate, textFloat 2s ease-in-out infinite;
      }
    }
  }
}

.main {
  flex: 1;
  padding: 24px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background: transparent;
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;

    .header-left {
      gap: 12px;

      .el-breadcrumb {
        display: none;
      }
    }

    .header-right {
      .user-info {
        padding: 4px 8px;

        .username {
          display: none;
        }
      }
    }
  }

  .doc-link {
    padding: 0;
    width: 40px;
    justify-content: center;
    
    .doc-text {
      display: none;
    }
    
    .doc-icon-wrapper {
      margin-right: 0;
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* 添加弹性空间样式 */
.flex-spacer {
  flex: 1;
  min-height: 20px;  /* 保证最小间距 */
}

/* 支持项目分割线样式 */
.support-divider {
  margin: 16px 12px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      var(--el-color-primary-light-7) 50%,
      transparent 100%
    );
  }
  
  .divider-text {
    color: var(--el-color-primary);
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    padding: 0 4px;
  }
}

/* 支持作者菜单项样式 */
.support-item, .thanks-item {
  position: relative;
  margin: 4px 6px;
  border-radius: 6px;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, 
      var(--el-color-primary-light-5),
      transparent 50%
    );
    mask: linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
  }

  &:hover::before {
    opacity: 1;
  }

  .el-icon {
    color: var(--el-color-primary);
  }
}

/* 鸣谢菜单项特殊样式 */
.thanks-item {
  .el-icon {
    color: #724bc0;
  }
  
  &::before {
    background: linear-gradient(135deg, 
      #a26bfa,
      transparent 50%
    );
  }
}

/* 折叠状态下的样式调整 */
.el-menu--collapse {
  .support-divider {
    .divider-line {
      display: none;
    }
  }
  
  .support-item, .thanks-item {
    width: 40px;
    margin: 4px auto;
  }
}

/* 添加一些微妙的动画效果 */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.support-item {
  .el-icon {
    transition: transform 0.3s ease;
  }
  
  &:hover .el-icon {
    transform: scale(1.2);
  }
}

/* 侧边栏折叠按钮 */
.collapse-btn {
  font-size: 20px;
  margin-right: 15px;
  cursor: pointer;
  color: var(--el-color-info);
  transition: all 0.3s;
}

.collapse-btn:hover {
  color: var(--el-color-primary);
  transform: scale(1.1);
}

/* 动画定义 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes textFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(5deg); }
}

@keyframes pulse {
  0% { box-shadow: 0 4px 15px rgba(23, 92, 230, 0.25); }
  100% { box-shadow: 0 8px 25px rgba(23, 92, 230, 0.6); }
}

@keyframes shineLine {
  0% { left: -100%; }
  20%, 100% { left: 100%; }
}

@keyframes scanLight {
  0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 0.5; transform: scale(1) rotate(180deg); }
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.6; }
  100% { transform: scale(0.8); opacity: 1; }
}

@keyframes patternMove {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

@keyframes iconPulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.15); }
}

@keyframes iconRotate {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

@keyframes textGlow {
  0% { text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); }
  100% { text-shadow: 0 1px 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(23, 92, 230, 0.3); }
}

@keyframes borderGlow {
  0%, 100% { border-color: rgba(255, 255, 255, 0.3); }
  50% { border-color: rgba(255, 255, 255, 0.8); }
}

@keyframes borderPulse {
  0% { opacity: 0.4; }
  100% { opacity: 0.8; }
}

@keyframes rotateBorder {
  0% { background-position: 0% 0%; }
  100% { background-position: 400% 0%; }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes particleAnimation {
  0% { 
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  50% { 
    opacity: 0.8;
    transform: translateY(-10px) scale(1.2);
  }
  100% { 
    opacity: 0;
    transform: translateY(-20px) scale(0);
  }
}
</style> 