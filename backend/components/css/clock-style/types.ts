import { z } from 'zod'

export interface ClockStyleParams {
  // 位置调整
  logoMarginTop: number
  logoMarginLeft: number
  
  // 字体设置
  fontFamily: string  // 与global-font共用字体目录
}

// Zod验证schema
export const clockStyleSchema = z.object({
  logoMarginTop: z.number().min(-100).max(100),
  logoMarginLeft: z.number().min(-100).max(100),
  fontFamily: z.string().min(1)
})

export const defaultParams: ClockStyleParams = {
  logoMarginTop: 20,
  logoMarginLeft: 20,
  fontFamily: 'Zen Dots'  // 默认使用原CSS中的字体
} 