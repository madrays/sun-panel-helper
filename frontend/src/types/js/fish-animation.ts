/**
 * @file 鱼群动画类型定义
 * @description 为面板添加底部鱼群动画效果
 * @author madrays
 * @update 2024-01-28
 */

/**
 * API响应接口
 * @interface ApiResponse
 */
export interface ApiResponse {
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 响应数据 */
  data?: any;
} 