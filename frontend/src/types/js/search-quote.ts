/**
 * @file 搜索框随机一言类型定义
 * @description 为搜索框添加随机一言占位符
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