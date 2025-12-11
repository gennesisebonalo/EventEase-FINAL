import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12 Pro)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Responsive scaling functions
export const scaleWidth = (size) => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

export const scaleHeight = (size) => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

export const scaleFont = (size) => {
  const newSize = scaleWidth(size);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

// Device type detection
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  }
  
  return (adjustedWidth >= 1920 && adjustedHeight >= 1080);
};

export const isSmallDevice = () => {
  return SCREEN_WIDTH < 375;
};

export const isLargeDevice = () => {
  return SCREEN_WIDTH > 414;
};

// Responsive breakpoints
export const BREAKPOINTS = {
  small: 375,
  medium: 414,
  large: 768,
  xlarge: 1024,
};

// Get current breakpoint
export const getCurrentBreakpoint = () => {
  if (SCREEN_WIDTH < BREAKPOINTS.small) return 'small';
  if (SCREEN_WIDTH < BREAKPOINTS.medium) return 'medium';
  if (SCREEN_WIDTH < BREAKPOINTS.large) return 'large';
  return 'xlarge';
};

// Responsive styles helper
export const createResponsiveStyle = (styles) => {
  const breakpoint = getCurrentBreakpoint();
  
  return {
    ...styles.base,
    ...(styles[breakpoint] || {}),
  };
};

// Chart dimensions based on screen size
export const getChartDimensions = () => {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'small':
      return {
        width: SCREEN_WIDTH - 32,
        height: 180,
      };
    case 'medium':
      return {
        width: SCREEN_WIDTH - 32,
        height: 200,
      };
    case 'large':
      return {
        width: SCREEN_WIDTH - 32,
        height: 220,
      };
    case 'xlarge':
      return {
        width: SCREEN_WIDTH - 32,
        height: 240,
      };
    default:
      return {
        width: SCREEN_WIDTH - 32,
        height: 220,
      };
  }
};

// Grid columns based on screen size
export const getGridColumns = () => {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'small':
      return 1;
    case 'medium':
      return 2;
    case 'large':
      return 2;
    case 'xlarge':
      return 3;
    default:
      return 2;
  }
};

// Font sizes based on screen size
export const getFontSize = (baseSize) => {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'small':
      return baseSize * 0.9;
    case 'medium':
      return baseSize;
    case 'large':
      return baseSize * 1.1;
    case 'xlarge':
      return baseSize * 1.2;
    default:
      return baseSize;
  }
};

// Padding based on screen size
export const getPadding = (basePadding) => {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'small':
      return basePadding * 0.8;
    case 'medium':
      return basePadding;
    case 'large':
      return basePadding * 1.2;
    case 'xlarge':
      return basePadding * 1.4;
    default:
      return basePadding;
  }
};

// Safe area handling
export const getSafeAreaInsets = () => {
  // This would typically use react-native-safe-area-context
  // For now, return default values
  return {
    top: 44, // Status bar height
    bottom: 34, // Home indicator height
    left: 0,
    right: 0,
  };
};

// Orientation detection
export const isLandscape = () => {
  return SCREEN_WIDTH > SCREEN_HEIGHT;
};

// Responsive image dimensions
export const getImageDimensions = (aspectRatio = 16/9) => {
  const maxWidth = SCREEN_WIDTH - 32; // Account for padding
  const width = maxWidth;
  const height = width / aspectRatio;
  
  return { width, height };
};

// Responsive modal dimensions
export const getModalDimensions = () => {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'small':
      return {
        width: SCREEN_WIDTH - 20,
        maxHeight: SCREEN_HEIGHT * 0.8,
      };
    case 'medium':
      return {
        width: SCREEN_WIDTH - 40,
        maxHeight: SCREEN_HEIGHT * 0.8,
      };
    case 'large':
      return {
        width: Math.min(SCREEN_WIDTH - 60, 500),
        maxHeight: SCREEN_HEIGHT * 0.8,
      };
    case 'xlarge':
      return {
        width: Math.min(SCREEN_WIDTH - 80, 600),
        maxHeight: SCREEN_HEIGHT * 0.8,
      };
    default:
      return {
        width: SCREEN_WIDTH - 40,
        maxHeight: SCREEN_HEIGHT * 0.8,
      };
  }
};

export default {
  scaleWidth,
  scaleHeight,
  scaleFont,
  isTablet,
  isSmallDevice,
  isLargeDevice,
  getCurrentBreakpoint,
  createResponsiveStyle,
  getChartDimensions,
  getGridColumns,
  getFontSize,
  getPadding,
  getSafeAreaInsets,
  isLandscape,
  getImageDimensions,
  getModalDimensions,
  BREAKPOINTS,
};
