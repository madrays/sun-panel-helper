<script setup lang="ts">
import { onMounted } from 'vue'

// 添加FontAwesome CDN链接
onMounted(() => {
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    document.head.appendChild(link)
  }
})
</script>

<template>
  <div class="footer-preview custom-footer">
    <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" class="icp-link">京ICP备xxxxxx号</a>
    <span class="separator">|</span>
    <a href="http://www.beian.gov.cn" target="_blank" rel="noopener noreferrer" class="gongan-link">
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" 
           style="vertical-align:-2px;margin-right:4px;">
        <path d="M512 62.08A449.92 449.92 0 1 0 961.92 512 449.92 449.92 0 0 0 512 62.08z m0 821.76A371.84 371.84 0 1 1 883.84 512 371.84 371.84 0 0 1 512 883.84z" fill="#5181F8"></path>
        <path d="M551.52 806.72a346.88 346.88 0 0 1-346.88-346.88h74.24a273.28 273.28 0 0 0 273.28 273.28z" fill="#5181F8"></path>
        <path d="M468.8 216a346.24 346.24 0 0 1 346.24 346.24h-74.24A272.64 272.64 0 0 0 468.16 289.28z" fill="#5181F8"></path>
        <path d="M600 680.32l45.76-45.76-126.4-126.72 53.76-66.24a82.56 82.56 0 1 0-128-104.96 82.56 82.56 0 0 0 104.96 128l-60.8 74.56-237.76 44.8 20.8 54.4 214.4-40.32L600 680.32z" fill="#5181F8"></path>
      </svg>
      京公网安备 11010xxxxxxxxx号
    </a>
  </div>
</template>

<style scoped>
.footer-preview {
  color: #909399;
  padding: 15px 0;
  text-align: center;
  font-size: 13px;
  line-height: 1.4;
  width: 100%;
  font-family: 'Noto Sans SC', 'Microsoft YaHei', 'Segoe UI', sans-serif !important;
}

.footer-preview a {
  color: #909399;
  text-decoration: none;
  transition: color 0.3s ease;
  margin: 0 5px;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.footer-preview a:hover {
  color: #409EFF;
}

.footer-preview .separator {
  margin: 0 8px;
  color: #DCDFE6;
  opacity: 0.8;
}
</style> 