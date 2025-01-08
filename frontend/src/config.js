// 智能判断 API 地址
function getApiBaseUrl() {
    const host = window.location.hostname;
    const port = window.location.port;

    // 如果是通过域名访问
    if (port === '') {
        // 使用相同域名，让反向代理处理
        return `/api`;
    }
    
    // 如果是直接 IP 访问
    return `http://${host}:5000`;
}

export const API_BASE_URL = getApiBaseUrl();