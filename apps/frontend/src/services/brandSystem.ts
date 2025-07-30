/**
 * Brand Identity System - Comprehensive design tokens and visual identity
 * Provides consistent branding across the entire ChainAgent platform
 */

// ===== TYPE DEFINITIONS =====

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface CategoryColors {
  primary: string[];
  secondary: string[];
  accent: string[];
}

export interface CryptoColors {
  bitcoin: string;
  ethereum: string;
  binance: string;
  cardano: string;
  solana: string;
  polygon: string;
  avalanche: string;
  chainlink: string;
  uniswap: string;
  aave: string;
}

export interface Typography {
  primary: string;
  secondary: string;
  mono: string;
  weights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export interface BorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  full: string;
}

export interface BrandSystemType {
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    accent: ColorPalette;
    gray: ColorPalette;
    success: ColorPalette;
    warning: ColorPalette;
    error: ColorPalette;
    crypto: CryptoColors;
    categories: {
      defi: CategoryColors;
      gamefi: CategoryColors;
      nft: CategoryColors;
      dao: CategoryColors;
      bridge: CategoryColors;
    };
  };
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    crypto: string;
    defi: string;
    gamefi: string;
    nft: string;
  };
}

// ===== BRAND SYSTEM IMPLEMENTATION =====

export const BrandSystem: BrandSystemType = {
  colors: {
    // Primary brand colors (Indigo)
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1', // Main brand color
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b'
    },

    // Secondary brand colors (Purple)
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#8b5cf6', // Secondary brand color
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065'
    },

    // Accent colors (Cyan)
    accent: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4', // Accent color
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344'
    },

    // Gray scale
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    },

    // Success colors (Green)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22'
    },

    // Warning colors (Amber)
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },

    // Error colors (Red)
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },

    // Cryptocurrency specific colors
    crypto: {
      bitcoin: '#f7931a',
      ethereum: '#627eea',
      binance: '#f0b90b',
      cardano: '#0052ff',
      solana: '#9945ff',
      polygon: '#8247e5',
      avalanche: '#e84142',
      chainlink: '#375bd2',
      uniswap: '#ff007a',
      aave: '#b6509e'
    },

    // Category-specific color schemes
    categories: {
      defi: {
        primary: ['#6366f1', '#8b5cf6'],
        secondary: ['#4f46e5', '#7c3aed'],
        accent: ['#06b6d4', '#0891b2']
      },
      gamefi: {
        primary: ['#8b5cf6', '#06b6d4'],
        secondary: ['#7c3aed', '#0891b2'],
        accent: ['#10b981', '#059669']
      },
      nft: {
        primary: ['#ec4899', '#8b5cf6'],
        secondary: ['#db2777', '#7c3aed'],
        accent: ['#f59e0b', '#d97706']
      },
      dao: {
        primary: ['#10b981', '#059669'],
        secondary: ['#047857', '#065f46'],
        accent: ['#6366f1', '#4f46e5']
      },
      bridge: {
        primary: ['#06b6d4', '#0891b2'],
        secondary: ['#0e7490', '#155e75'],
        accent: ['#8b5cf6', '#7c3aed']
      }
    }
  },

  typography: {
    primary: 'Inter, system-ui, -apple-system, sans-serif',
    secondary: 'Poppins, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, Monaco, monospace',
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'  // 36px
    }
  },

  spacing: {
    xs: 4,   // 4px
    sm: 8,   // 8px
    md: 16,  // 16px
    lg: 24,  // 24px
    xl: 32,  // 32px
    '2xl': 48, // 48px
    '3xl': 64, // 64px
    '4xl': 96  // 96px
  },

  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: '50%'
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },

  gradients: {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    crypto: 'linear-gradient(135deg, #f7931a 0%, #627eea 100%)',
    defi: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
    gamefi: 'linear-gradient(135deg, #8b5cf6 0%, #10b981 100%)',
    nft: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)'
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get color by category and intensity
 */
export function getCategoryColor(category: keyof typeof BrandSystem.colors.categories, intensity: 'primary' | 'secondary' | 'accent' = 'primary', index: number = 0): string {
  const categoryColors = BrandSystem.colors.categories[category];
  return categoryColors[intensity][index] || categoryColors[intensity][0];
}

/**
 * Get crypto-specific color
 */
export function getCryptoColor(crypto: keyof typeof BrandSystem.colors.crypto): string {
  return BrandSystem.colors.crypto[crypto] || BrandSystem.colors.primary[500];
}

/**
 * Get gradient by type
 */
export function getGradient(type: keyof typeof BrandSystem.gradients): string {
  return BrandSystem.gradients[type];
}

/**
 * Get responsive spacing
 */
export function getSpacing(size: keyof typeof BrandSystem.spacing): number {
  return BrandSystem.spacing[size];
}

/**
 * Get typography configuration
 */
export function getTypography(property: keyof typeof BrandSystem.typography): any {
  return BrandSystem.typography[property];
}

export default BrandSystem;
