// 目录导航组件
(function() {
  // 创建命名空间
  const SunPanelTOC = {
    // =========== Config Start ===========
    // ------------------------------------
    // 配置项
    config: {
      scrollOffset: 80,
      displayStyle: 'auto',
      mobileWidth: 800,
      domId: 'sun-panel-toc-dom',
      svgTocMobileBtn: '<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"><path fill="currentColor" d="M17.5 4.5c-1.95 0-4.05.4-5.5 1.5c-1.45-1.1-3.55-1.5-5.5-1.5c-1.45 0-2.99.22-4.28.79C1.49 5.62 1 6.33 1 7.14v11.28c0 1.3 1.22 2.26 2.48 1.94c.98-.25 2.02-.36 3.02-.36c1.56 0 3.22.26 4.56.92c.6.3 1.28.3 1.87 0c1.34-.67 3-.92 4.56-.92c1 0 2.04.11 3.02.36c1.26.33 2.48-.63 2.48-1.94V7.14c0-.81-.49-1.52-1.22-1.85c-1.28-.57-2.82-.79-4.27-.79M21 17.23c0 .63-.58 1.09-1.2.98c-.75-.14-1.53-.2-2.3-.2c-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5c.92 0 1.83.09 2.7.28c.46.1.8.51.8.98z"/><path fill="currentColor" d="M13.98 11.01c-.32 0-.61-.2-.71-.52c-.13-.39.09-.82.48-.94c1.54-.5 3.53-.66 5.36-.45c.41.05.71.42.66.83s-.42.71-.83.66c-1.62-.19-3.39-.04-4.73.39c-.08.01-.16.03-.23.03m0 2.66c-.32 0-.61-.2-.71-.52c-.13-.39.09-.82.48-.94c1.53-.5 3.53-.66 5.36-.45c.41.05.71.42.66.83s-.42.71-.83.66c-1.62-.19-3.39-.04-4.73.39a1 1 0 0 1-.23.03m0 2.66c-.32 0-.61-.2-.71-.52c-.13-.39.09-.82.48-.94c1.53-.5 3.53-.66 5.36-.45c.41.05.71.42.66.83s-.42.7-.83.66c-1.62-.19-3.39-.04-4.73.39a1 1 0 0 1-.23.03"/></svg>'
    },

    // 主题配置
    theme: {
      background: {THEME_BACKGROUND},
      text: {THEME_TEXT},
      hover: {THEME_HOVER},
      active: {THEME_ACTIVE}
    },

    // 滚动容器的类名
    scrollContainerElementClassName: '.scroll-container',

    // 工具函数
    utils: {
      isMobile() {
        if (SunPanelTOC.config.displayStyle === 'mobile') return true
        if (SunPanelTOC.config.displayStyle === 'pc') return false
        return window.innerWidth < SunPanelTOC.config.mobileWidth
      },

      debounce(func, wait) {
        let timeout
        return function (...args) {
          clearTimeout(timeout)
          timeout = setTimeout(() => func.apply(this, args), wait)
        }
      }
    },

    // DOM 操作相关
    dom: {
      createDom() {
        // 检测是否已经存在TOC DOM，存在则删除
        const element = document.getElementById(SunPanelTOC.config.domId)
        if (element) element.remove()

        const tocDom = document.createElement('div')
        tocDom.id = SunPanelTOC.config.domId
        document.body.appendChild(tocDom)

        // ========= Add style start =========
        const style = document.createElement('style')
        const tocDomStyleId = `#${SunPanelTOC.config.domId}`
        style.textContent = `
        ${tocDomStyleId} #toc-mobile-btn {
            top: 20px !important;
            left: 20px !important;
            position: fixed;
            width: 46px;
            height: 46px;
            background-color: ${SunPanelTOC.theme.background};
            color: ${SunPanelTOC.theme.text};
            border-radius: 0.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        }

        ${tocDomStyleId} .hidden {
            display: none !important;
        }

        ${tocDomStyleId} #toc-sidebar {
            width: 40px;
            padding: 10px;
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            transition: width 0.3s ease, background-color 0.3s ease;
            border-top-right-radius: 20px;
            border-bottom-right-radius: 20px;
            background-color: none;
        }

        ${tocDomStyleId} .toc-mobile-btn-svg-container{
          width:21px;
          height:21px;
        }

        ${tocDomStyleId} .toc-sidebar-expansion {
            width: 200px !important;
            display: flex;
            background-color: ${SunPanelTOC.theme.background};
            box-shadow: 1px 0 5px ${SunPanelTOC.theme.hover};
        }

        ${tocDomStyleId} #toc-sidebar .toc-sidebar-box {
            width: 500px;
        }

        ${tocDomStyleId} .title-bar-box {
            display: flex;
            align-items: center;
            position: relative;
            cursor: pointer;
        }

        ${tocDomStyleId} .title-bar-slip {
            width: 20px;
            height: 6px;
            background-color: ${SunPanelTOC.theme.text};
            border-radius: 5px;
            margin: 15px 0;
            transition: height 0.3s ease, width 0.3s ease;
            box-shadow: 1px 0 5px ${SunPanelTOC.theme.hover};
        }

        ${tocDomStyleId} .title-bar-title {
            opacity: 0;
            white-space: nowrap;
            transition: opacity 0.3s ease, transform 0.3s ease, margin-left 0.3s ease;
            font-size: 15px;
            color: ${SunPanelTOC.theme.text};
        }

        ${tocDomStyleId} .toc-sidebar-expansion .title-bar-title {
            opacity: 1;
            margin-left: 10px;
        }

        ${tocDomStyleId} .toc-sidebar-expansion .title-bar-slip {
            box-shadow: none;
        }

        ${tocDomStyleId} .toc-sidebar-expansion .title-bar-box:hover .title-bar-slip {
            width: 40px;
        }

        ${tocDomStyleId} .toc-sidebar-expansion .title-bar-box:hover .title-bar-title {
            font-size: 20px;
        }

          `
        // 添加样式到文档头部
        tocDom.appendChild(style)

        // ========= Add style end =========

        // 添加移动端菜单按钮
        const tocMobileBtn = document.createElement('div')
        tocMobileBtn.id = 'toc-mobile-btn'
        tocMobileBtn.classList.add('backdrop-blur-[2px]')
        tocDom.appendChild(tocMobileBtn)

        const tocMobileBtnSvgcContainer = document.createElement('div')
        tocMobileBtnSvgcContainer.innerHTML = SunPanelTOC.config.svgTocMobileBtn
        tocMobileBtnSvgcContainer.classList.add('toc-mobile-btn-svg-container')
        tocMobileBtn.appendChild(tocMobileBtnSvgcContainer)

        // 创建侧边栏容器
        const sidebar = document.createElement('div')
        sidebar.id = 'toc-sidebar'

        const sidebarBox = document.createElement('div')
        sidebarBox.className = 'toc-sidebar-box'

        // 查询出所有类名包含 item-group-index- 的元素
        const items = document.querySelectorAll('[class*="item-group-index-"]')

        // 遍历并打印每个元素的完整类名
        items.forEach((item) => {
          item.classList.forEach((className) => {
            if (className.startsWith('item-group-index-')) {
              const titleBarBox = document.createElement('div')
              titleBarBox.className = 'title-bar-box'
              // titleBarBox.href = `#${item.id}`
              titleBarBox.dataset.groupClassName = className

              // 目录条
              const titleBarSlip = document.createElement('div')
              titleBarSlip.className = 'title-bar-slip'

              // 创建一个链接
              const titleBarTitle = document.createElement('div')
              titleBarTitle.className = 'title-bar-title'

              // 获取子元素中 class="group-title" 的内容
              const titleElement = item.querySelector('.group-title')
              const titleText = titleElement ? titleElement.textContent : item.id
              titleBarTitle.textContent = titleText

              titleBarBox.appendChild(titleBarSlip)
              titleBarBox.appendChild(titleBarTitle)

              sidebarBox.appendChild(titleBarBox)
            }
          })
        })

        sidebar.appendChild(sidebarBox)

        // 将侧边栏添加到页面中
        tocDom.appendChild(sidebar)

        function mobileHideSidebar() {
          sidebar.classList.remove('toc-sidebar-expansion')
          sidebar.classList.add('hidden')
        }

        function hideSidebar() {
          sidebar.classList.remove('toc-sidebar-expansion')
        }

        function showSidebar() {
          sidebar.classList.add('toc-sidebar-expansion')
          sidebar.classList.remove('hidden')
        }

        // ----------------
        // 监听宽度变化开始
        // ----------------
        function handleResize() {
          if (SunPanelTOC.utils.isMobile()) {
            tocMobileBtn.classList.remove('hidden')
            sidebar.classList.add('hidden')
          }
          else {
            tocMobileBtn.classList.add('hidden')
            sidebar.classList.remove('hidden')
          }
        }

        // 使用防抖函数包装你的处理函数
        const debouncedHandleResize = SunPanelTOC.utils.debounce(handleResize, 200)

        // 添加事件监听器
        window.addEventListener('resize', debouncedHandleResize)

        // 首次触发
        handleResize()

        // ----------------
        // 监听宽度变化结束
        // ----------------

        // 监听移动端按钮点击
        tocMobileBtn.addEventListener('click', () => {
          if (sidebar.classList.contains('toc-sidebar-expansion')) {
            // 隐藏
            mobileHideSidebar()
          }
          else {
            // 显示
            showSidebar()
          }
        })

        // 监听TOC栏失去hover
        sidebar.addEventListener('mouseleave', () => {
          if (SunPanelTOC.utils.isMobile()) {
            // 隐藏
            mobileHideSidebar()
          }
          else {
            hideSidebar()
          }
        })

        // 监听TOC栏获得hover
        sidebar.addEventListener('mouseenter', () => {
          showSidebar()
        })

        // 监听TOC点击事件
        document.querySelectorAll('.title-bar-box').forEach((box) => {
          box.addEventListener('click', function (event) {
          // 检查触发事件的元素是否有 'data-groupClassName' 属性
            if (this.dataset.groupClassName) {
            // 获取 'data-groupClass' 属性的值
              const groupClassName = this.dataset.groupClassName
              // 使用属性值作为选择器查询对应的元素
              const targetElement = document.querySelector(`.${groupClassName}`)
              if (targetElement) {
              // 获取目标元素的 'top' 坐标
                const targetTop = targetElement.offsetTop
                const scrollContainerElement = document.querySelector(SunPanelTOC.scrollContainerElementClassName)
                if (scrollContainerElement) {
                  scrollContainerElement.scrollTo({
                    top: targetTop - SunPanelTOC.config.scrollOffset,
                    behavior: 'smooth', // 平滑滚动
                  })
                }
              }
            }
          })
        })
      },

      handleResize() {
        if (SunPanelTOC.utils.isMobile()) {
          // ... 移动端处理
        } else {
          // ... PC端处理
        }
      }
    },

    // 初始化
    init() {
      const items = document.querySelectorAll('[class*="item-group-index-"]')
      if (items.length > 0) {
        SunPanelTOC.dom.createDom()
        return
      }

      const interval = setInterval(() => {
        const items = document.querySelectorAll('[class*="item-group-index-"]')
        if (items.length > 0) {
          SunPanelTOC.dom.createDom()
          clearInterval(interval)
        }
      }, 1000)
    }
  }

  // 启动
  SunPanelTOC.init()
})()
