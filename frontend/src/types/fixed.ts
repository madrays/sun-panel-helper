export interface FixedWidget {
  id: number
  name: string
  url: string
  type: 'widget' | 'break'
  source: 'market' | 'custom'
  width: number
  height: number
  mobileShow: boolean
} 