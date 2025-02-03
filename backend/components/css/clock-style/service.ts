import { access } from 'fs/promises'
import { join } from 'path'
import { ClockStyleParams, clockStyleSchema } from './types'
import { readFileSync } from 'fs'

/**
 * 验证参数
 */
export function validateParams(params: ClockStyleParams): string[] {
  const errors: string[] = []
  
  if (typeof params.logoMarginTop !== 'number') {
    errors.push('Logo上边距必须是数字')
  }
  
  if (typeof params.logoMarginLeft !== 'number') {
    errors.push('Logo左边距必须是数字')
  }
  
  if (params.logoMarginTop < 0 || params.logoMarginTop > 1200) {
    errors.push('Logo上边距必须在0-1200之间')
  }
  
  if (params.logoMarginLeft < 0 || params.logoMarginLeft > 2000) {
    errors.push('Logo左边距必须在0-2000之间')
  }
  
  return errors
}

/**
 * 生成CSS内容
 */
export function generateCSS(params: ClockStyleParams): string {
  const { logoMarginTop, logoMarginLeft, fontFamily } = params
  
  return `
/* 引入默认字体 */
@import url('https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap');

/* 标题位置调整 */
.absolute .logo { 
  position: absolute;
  top: ${logoMarginTop}px;
  left: ${logoMarginLeft}px;
  padding-left: 35px;
}

.absolute .logo .md\\:text-6xl {
  font-size: 1.75rem;
}

/* 删除竖线 */
.text-base {
  display: none;
}

/* 时钟样式 */
.clock {
  position: relative;
  top: -50px;
  --yell: #F5CE5A;
}

.clock.w-full {
  width: fit-content;
}

.clock .md\\:block {
  display: inline;
}

/* 时钟字体设置 */
.clock span.clock-time {
  font-size: 55px;
  font-family: "${fontFamily}", "Zen Dots", sans-serif;
  font-weight: 400;
  font-style: normal;
}

/* 日期和星期样式 */
span.clock-date, span.clock-week {
  position: absolute;
  font-size: 23px;
  font-weight: 900;
  inset: -45px auto auto -30px;
}

/* 装饰边框 */
.clock:before {
  content: "";
  position: absolute;
  width: 50px;
  border-left: 5px solid var(--yell);
  border-bottom: 5px solid var(--yell);
  inset: 0 auto -20px -20px;
  border-radius: 0 28px;
}

.clock:after {
  content: "";
  position: absolute;
  width: 50px;
  border-right: 5px solid var(--yell);
  border-top: 5px solid var(--yell);
  inset: -25px -20px 10px auto;
  border-radius: 0 28px;
}

span.clock-week {
  font-weight: 700;
  inset: auto -30px -30px auto;
  font-size: 19px;
}

.sun-panel-logo {
  margin-top: ${logoMarginTop}px !important;
  margin-left: ${logoMarginLeft}px !important;
}
`.trim()
} 