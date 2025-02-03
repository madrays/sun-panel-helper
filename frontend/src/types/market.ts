/**
 * 组件市场类型定义
 */

// 组件位置配置
export interface Position {
  top: number;
  left: number;
  width: string;
  height: string;
  isScrollMode: boolean;
  isPinned: boolean;
}

// 组件基础配置
export interface Widget {
  id: string;           // 改为只使用 string 类型
  name: string;         // 组件名称
  description: string;  // 组件描述
  type: 'html' | 'link';// 组件类型
  url: string;         // 组件URL或HTML内容
  width?: number;
  height?: number;
  mobileShow?: boolean;
  tags: string[];     // 组件标签
  preview?: string;    // 预览图片
  position?: Position;
}

// 固定组件配置文件
export interface FixedWidgetsConfig {
  widgets: WidgetConfig[];
}

// 自由组件配置文件
export interface FreeWidgetsConfig {
  widgets: WidgetConfig[];
}

// 组件市场响应
export interface MarketResponse {
  success: boolean;
  error?: string;
  data?: {
    widgets: Widget[];
  };
}

// 应用状态
export interface ApplyStatus {
  fixed: boolean;  // 是否应用到固定组件
  free: boolean;   // 是否应用到自由组件
}

export type WidgetConfig = Widget; 