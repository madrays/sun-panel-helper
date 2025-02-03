export interface CustomLogoParams {
  pcLogo: string;
  pcWidth: number;
  pcHeight: number;
  pcMarginTop: number;
  mobileLogo: string;
  mobileWidth: number;
  mobileHeight: number;
  mobileMarginTop: number;
  tabletLogo: string;
  tabletWidth: number;
  tabletHeight: number;
  tabletMarginTop: number;
}

export const defaultParams: CustomLogoParams = {
  pcLogo: '',
  pcWidth: 250,
  pcHeight: 250,
  pcMarginTop: -70,
  mobileLogo: '',
  mobileWidth: 200,
  mobileHeight: 150,
  mobileMarginTop: -30,
  tabletLogo: '',
  tabletWidth: 200,
  tabletHeight: 200,
  tabletMarginTop: -50
} 