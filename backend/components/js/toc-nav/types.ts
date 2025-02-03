/**
 * @file 目录导航组件类型定义
 * @description 页面目录导航功能的类型定义
 * @author madrays
 * @update 2024-01-30
 */

/** 显示风格类型 */
export type DisplayStyle = 'auto' | 'mobile' | 'sidebar';

/** 主题配置接口 */
export interface ThemeConfig {
  /** 背景颜色 */
  background: string;
  /** 文字颜色 */
  text: string;
  /** 悬停颜色 */
  hover: string;
  /** 激活颜色 */
  active: string;
}

/** 组件参数接口 */
export interface TocNavParams {
  /** 滚动偏移量(px) */
  scrollOffset: number;
  /** 显示风格 */
  displayStyle: DisplayStyle;
  /** 移动端宽度(px) */
  mobileWidth: number;
  /** 主题配置 */
  theme: ThemeConfig;
}

/** 默认参数 */
export const defaultParams: TocNavParams = {
  scrollOffset: 80,
  displayStyle: 'auto',
  mobileWidth: 800,
  theme: {
    background: 'rgba(42, 42, 42, 0.42)',
    text: '#ffffff',
    hover: 'rgba(255, 255, 255, 0.2)',
    active: 'rgba(255, 255, 255, 0.3)'
  }
}; 