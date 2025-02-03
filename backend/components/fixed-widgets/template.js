// ====================== 初始化控制 开始 ======================
// 创建一个全局初始化状态对象
window.initStatus = {
    footerReady: false
};

// 初始化检查函数
function checkInit() {
    if (window.initStatus.footerReady) {
        // 组件准备好后，执行组件移动
        const itemCardBox = document.getElementById("item-card-box");
        const weatherComponent1 = document.querySelector('.row');
        
        if (itemCardBox && weatherComponent1) {
            itemCardBox.insertAdjacentElement('beforebegin', weatherComponent1);
        }
    }
}
// ====================== 初始化控制 结束 ======================

// ====================== Widget配置说明 开始 ======================
/**
 * Widget 配置指南:
 * 
 * 1. 基础配置:
 *    {
 *        type: 'weather',           // 组件类型（用于标识）
 *        url: '/widget/url.html',   // 组件URL
 *        height: '200',             // 组件高度
 *        mobileShow: true,         // 是否在移动端显示
 *        width: '500px'            // 可选，指定组件宽度
 *    }
 * 
 * 2. 响应式行为:
 *    - PC端: 弹性布局，每个组件宽度自适应
 *    - 移动端: 只显示标记为 mobileShow: true 的组件
 * 
 * 3. 移动端显示控制:
 *    - mobileShow: true  -> 在移动端显示此组件
 *    - mobileShow: false -> 在移动端隐藏此组件（默认）
 * 
 * 4. 布局控制:
 *    - 使用 {type: 'break'} 强制换行
 *    - 可以通过设置 width 控制组件宽度
 */

// Widget配置数组
const WIDGETS = []

// Widget 生成函数
function generateWidgets(widgets) {
    return widgets.map(widget => {
        // 处理换行组件
        if (widget.type === 'break') {
            return '<div class="widget-break"></div>';
        }
        
        // 处理普通组件
        return `
            <iframe 
                src="${widget.url}" 
                class="widget${widget.mobileShow ? ' show-on-mobile' : ''}" 
                style="width: ${widget.width}; ${widget.style || ''}"
                height="${widget.height}" 
                loading="lazy"
                title="${widget.type}"
                scrolling="no"
                frameborder="0"
            ></iframe>
        `;
    }).join('');
}
// ====================== Widget配置说明 结束 ======================

// ====================== 页脚处理系统 开始 ======================
const footerObserver = new MutationObserver((mutations) => {
    mutations.forEach(() => {
        const footerElements = document.querySelectorAll('.custom-footer');
        footerElements.forEach(footer => {
            if (footer && !footer.hasChildNodes()) {
                footer.innerHTML = `
                    <!-- Widget组件 -->
                    <div class="row">
                        ${generateWidgets(WIDGETS)}
                    </div>

                    <!-- 页脚 -->
// ======================用户自定义页脚代码放在这下面======================

                `;
                
                window.initStatus.footerReady = true;
                checkInit();
            }
        });
    });
});

footerObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
});
// ====================== 页脚处理系统 结束 ====================== 