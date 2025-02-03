export interface LayoutAdjustParams {
  showClock: boolean;
  searchMarginTop: number;
  systemMarginTop: number;
}

export const defaultParams: LayoutAdjustParams = {
  showClock: false,
  searchMarginTop: -20,
  systemMarginTop: -60
}; 