export interface MusicPlayerConfig {
  playerId: string;
  mobileLoad: boolean;
  position: 'left' | 'right';
}

export const defaultParams: MusicPlayerConfig = {
  playerId: '16698096362',
  mobileLoad: true,
  position: 'right'
}; 