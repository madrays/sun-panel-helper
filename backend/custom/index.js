/* Sun-Panel-Helper JS */
/* 此文件由系统自动管理，请勿手动修改 */
/* 警告：手动修改可能导致功能冲突或程序异常 */
/* 上次更新：2025/3/1 16:11:28 */

/* Sun-Panel-Helper JS Start: search-quote */
// 定义一个函数，用于获取随机句子并更新占位符
function updatePlaceholder() {
    // 定义接口列表
    const apiUrls = [
        'https://v1.hitokoto.cn/',
        'https://yyapi.xpdbk.com/api/ian',
        'https://api.nxvav.cn/api/yiyan'
    ];

    // 定义一个函数来尝试获取句子
    const fetchRandomSentence = (index) => {
        if (index >= apiUrls.length) {
            console.error('所有接口均获取句子失败');
            return;
        }

        fetch(apiUrls[index])
            .then(response => response.json())
            .then(data => {
                const sentence = data.hitokoto || data.content || data.data;
                if (sentence) {
                    const inputElements = document.querySelectorAll('input[placeholder="请输入搜索内容"]');
                    if (inputElements.length > 0) {
                        inputElements.forEach(input => {
                            input.placeholder = sentence;
                        });
                    }
                } else {
                    fetchRandomSentence(index + 1);
                }
            })
            .catch(error => {
                console.error('获取句子时出错:', error);
                fetchRandomSentence(index + 1);
            });
    };

    // 开始尝试获取句子
    fetchRandomSentence(0);
}

// 页面加载时自动调用替换函数
window.onload = updatePlaceholder;
/* Sun-Panel-Helper JS End: search-quote */
