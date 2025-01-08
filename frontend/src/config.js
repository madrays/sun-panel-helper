// 智能判断 API 地址
function getApiBaseUrl() {
    // 如果是通过域名访问
    if (window.location.port === '') {
        return '';  // 使用相对路径
    }
    
    // 如果是直接 IP 访问
    return '';  // 也使用相对路径，让 nginx 处理代理
}

export const API_BASE_URL = getApiBaseUrl();