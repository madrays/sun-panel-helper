export interface CardHoverParams {
  cardBackground: string
  shakeDegree: number
  shakeSpeed: number
  enableScale: boolean
  scaleSize: number
  scaleDelay: number
}

export const defaultParams: CardHoverParams = {
  cardBackground: '#ffffff',
  shakeDegree: 15,
  shakeSpeed: 0.5,
  enableScale: true,
  scaleSize: 1.1,
  scaleDelay: 0.3
}