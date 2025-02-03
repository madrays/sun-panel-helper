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

          <!-- 添加弹性空间 -->
          <div class="flex-spacer"></div>

          <!-- 支持作者区域添加特殊样式 -->
          <div class="support-divider">
            <div class="divider-line"></div>
            <span class="divider-text" v-show="!isCollapse">支持项目</span>
            <div class="divider-line"></div>
          </div>
          
          <el-menu-item index="/dashboard/support" class="support-item">
            <el-icon><Coffee /></el-icon>
            <span>支持作者</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="main-container">
        <el-header height="64px" class="header">
          <div class="header-left">
            <div class="collapse-btn" @click="toggleSidebar">
              <el-icon><Fold /></el-icon>
            </div>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRoute.meta.parentTitle" :to="{ path: currentRoute.meta.parentPath }">{{ currentRoute.meta.parentTitle }}</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRoute.meta.title">{{ currentRoute.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="userInfo.avatar" />
                <span class="username">{{ userInfo.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="changePassword">
                    <el-icon><Setting /></el-icon>
                    修改密码
                  </el-dropdown-item>
                  <el-dropdown-item command="logout">
                    <el-icon><CircleClose /></el-icon>
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
  MagicStick,
  Monitor,
  Location,
  Shop,
  Fold,
  House,
  Setting,
  CircleClose,
  Coffee
} from '@element-plus/icons-vue'

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
.support-item {
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

/* 折叠状态下的样式调整 */
.el-menu--collapse {
  .support-divider {
    .divider-line {
      display: none;
    }
  }
  
  .support-item {
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
</style> 