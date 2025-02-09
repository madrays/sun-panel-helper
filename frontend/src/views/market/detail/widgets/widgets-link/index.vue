<template>
  <div class="widgets-link-page">
    <!-- 头部区域 -->
    <div class="header">
      <div class="logo-wrap">
        <img src="https://www.widgets.link/favicon.svg" alt="Logo" class="logo">
        <div class="logo-glow"></div>
      </div>
      <h2 class="title">轻轻小组件</h2>
      <p class="subtitle">第三方组件库集成</p>
    </div>

    <div class="content">
      <!-- 简介 -->
      <div class="intro">
        <p class="desc">轻轻小组件提供了丰富的组件库，您可以在其官网选择组件并调整参数，然后将链接复制到本项目固定/自由组件的自定义组件使用。</p>
        <el-button type="primary" size="large" class="main-btn" @click="openWidgetsLink">
          <el-icon><Link /></el-icon>
          打开轻轻小组件官网
        </el-button>
      </div>
      
      <!-- 使用步骤 -->
      <div class="steps">
        <div class="step">
          <div class="step-icon">
            <el-icon><Search /></el-icon>
          </div>
          <div class="step-content">
            <h3>1. 选择组件</h3>
            <p>浏览并选择喜欢的组件</p>
          </div>
        </div>
        <div class="step">
          <div class="step-icon">
            <el-icon><Setting /></el-icon>
          </div>
          <div class="step-content">
            <h3>2. 调整参数</h3>
            <p>自定义样式和功能参数</p>
          </div>
        </div>
        <div class="step">
          <div class="step-icon">
            <el-icon><Share /></el-icon>
          </div>
          <div class="step-content">
            <h3>3. 获取链接</h3>
            <p>点击分享按钮复制链接</p>
          </div>
        </div>
        <div class="step">
          <div class="step-icon">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="step-content">
            <h3>4. 添加使用</h3>
            <p>粘贴到自定义组件中</p>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="tips">
        <div class="tip-item">
          <el-icon><InfoFilled /></el-icon>
          <span>组件链接包含了您的所有自定义设置</span>
        </div>
        <div class="tip-item">
          <el-icon><Warning /></el-icon>
          <span>建议选择合适尺寸的组件以获得最佳展示效果</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Link, Search, Setting, Share, Plus, InfoFilled, Warning } from '@element-plus/icons-vue'

const openWidgetsLink = () => {
  window.open('https://www.widgets.link', '_blank')
}
</script>

<style scoped lang="scss">
.widgets-link-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px;
}

.header {
  text-align: center;
  margin-bottom: 48px;

  .logo-wrap {
    position: relative;
    width: 96px;
    height: 96px;
    margin: 0 auto 20px;

    .logo {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 1;
    }

    .logo-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      background: #6366f1;
      filter: blur(20px);
      opacity: 0.15;
      border-radius: 50%;
    }
  }

  .title {
    font-size: 32px;
    font-weight: 600;
    margin: 0 0 8px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .subtitle {
    font-size: 16px;
    color: #64748b;
    margin: 0;
  }
}

.intro {
  text-align: center;
  margin-bottom: 48px;

  .desc {
    font-size: 16px;
    line-height: 1.6;
    color: #475569;
    margin-bottom: 24px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .main-btn {
    padding: 12px 24px;
    font-size: 16px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
    }
  }
}

.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 48px;

  .step {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s;
    border: 1px solid #e2e8f0;

    &:hover {
      transform: translateY(-2px);
      border-color: #6366f1;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
    }

    .step-icon {
      width: 48px;
      height: 48px;
      background: #eff6ff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: #6366f1;
      font-size: 24px;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px;
      color: #1e293b;
    }

    p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
  }
}

.tips {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;

  .tip-item {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #475569;
    font-size: 14px;
    
    &:not(:last-child) {
      margin-bottom: 16px;
    }

    .el-icon {
      font-size: 18px;
      flex-shrink: 0;
      color: #6366f1;
    }
  }
}

@media (max-width: 768px) {
  .steps {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .steps {
    grid-template-columns: 1fr;
  }
}
</style> 