export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface PositionConfig {
  position: Position;
  offset: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface MaxkbAiParams {
  chatUrl: string;
  logoPath: string;
  pc: PositionConfig;
  mobile: PositionConfig;
}

export const defaultParams: MaxkbAiParams = {
  chatUrl: '',
  logoPath: '/custom/helper/maxkb/logo.gif',
  pc: {
    position: 'bottom-right',
    offset: {
      x: 20,
      y: 20
    },
    size: {
      width: 80,
      height: 80
    }
  },
  mobile: {
    position: 'bottom-right',
    offset: {
      x: 15,
      y: 90
    },
    size: {
      width: 60,
      height: 60
    }
  }
}; 