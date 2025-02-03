import request from '@/utils/request'
import type { MarketResponse, WidgetConfig } from '@/types/market'

// 获取组件市场列表
export function getMarketWidgets() {
  return request<MarketResponse>({
    url: '/api/market/widgets',
    method: 'get'
  })
}

// 应用到固定组件
export function applyToFixed(widget: WidgetConfig) {
  return request({
    url: '/api/fixed/apply',
    method: 'post',
    data: widget
  })
}

// 应用到自由组件
export function applyToFree(widget: WidgetConfig) {
  return request({
    url: '/api/free/apply',
    method: 'post',
    data: widget
  })
}

// 取消应用(固定组件)
export function cancelFixed(widgetId: string) {
  return request({
    url: `/api/fixed/cancel/${widgetId}`,
    method: 'post'
  })
}

// 取消应用(自由组件)
export function cancelFree(widgetId: string) {
  return request({
    url: `/api/free/cancel/${widgetId}`,
    method: 'post'
  })
} 