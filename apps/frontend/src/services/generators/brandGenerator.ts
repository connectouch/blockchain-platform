/**
 * Brand Logo Generator - Professional Connectouch platform branding
 * Creates scalable brand assets with consistent visual identity
 */

import { BrandSystem } from '../brandSystem';
import { AssetCache, generateCacheKey } from '../assetCache';

// ===== TYPE DEFINITIONS =====

export type BrandVariant = 'full' | 'icon' | 'wordmark' | 'symbol';
export type BrandContext = 'favicon' | 'app' | 'social' | 'header' | 'footer' | 'print';

export interface BrandConfig {
  variant: BrandVariant;
  context: BrandContext;
  size: number;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background?: string;
  };
  typography: {
    fontFamily: string;
    fontWeight: number;
    letterSpacing: string;
  };
}

// ===== BRAND CONFIGURATIONS =====

const BRAND_CONFIGS: Record<BrandContext, Partial<BrandConfig>> = {
  favicon: {
    colors: {
      primary: BrandSystem.colors.primary[500],
      secondary: BrandSystem.colors.secondary[500],
      text: '#ffffff'
    }
  },
  app: {
    colors: {
      primary: BrandSystem.colors.primary[500],
      secondary: BrandSystem.colors.secondary[500],
      text: '#ffffff'
    }
  },
  social: {
    colors: {
      primary: BrandSystem.colors.primary[500],
      secondary: BrandSystem.colors.secondary[500],
      text: '#ffffff',
      background: BrandSystem.colors.gray[900]
    }
  },
  header: {
    colors: {
      primary: BrandSystem.colors.primary[500],
      secondary: BrandSystem.colors.secondary[500],
      text: BrandSystem.colors.gray[900]
    }
  },
  footer: {
    colors: {
      primary: BrandSystem.colors.primary[400],
      secondary: BrandSystem.colors.secondary[400],
      text: BrandSystem.colors.gray[300]
    }
  },
  print: {
    colors: {
      primary: BrandSystem.colors.gray[900],
      secondary: BrandSystem.colors.gray[700],
      text: BrandSystem.colors.gray[900]
    }
  }
};

// ===== MAIN GENERATOR FUNCTION =====

/**
 * Generate professional brand logo with multiple variants
 */
export function generateBrandLogo(
  variant: BrandVariant = 'full',
  size: number = 64,
  context: BrandContext = 'app'
): string {
  // Check cache first
  const cacheKey = generateCacheKey('brand', variant, size, context);
  const cached = AssetCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const config = getBrandConfig(variant, context, size);
  const svg = createBrandSVG(config);
  
  // Cache the result
  AssetCache.set(cacheKey, svg);
  
  return svg;
}

/**
 * Get brand configuration for specific variant and context
 */
function getBrandConfig(variant: BrandVariant, context: BrandContext, size: number): BrandConfig {
  const baseConfig = BRAND_CONFIGS[context] || BRAND_CONFIGS.app;
  
  return {
    variant,
    context,
    size,
    colors: {
      primary: BrandSystem.colors.primary[500],
      secondary: BrandSystem.colors.secondary[500],
      text: '#ffffff',
      ...baseConfig.colors
    },
    typography: {
      fontFamily: BrandSystem.typography.primary,
      fontWeight: BrandSystem.typography.weights.bold,
      letterSpacing: '-0.02em',
      ...baseConfig.typography
    }
  };
}

/**
 * Create SVG markup for brand logo
 */
function createBrandSVG(config: BrandConfig): string {
  const { variant, size } = config;
  
  switch (variant) {
    case 'full':
      return createFullLogo(config);
    case 'icon':
      return createIconLogo(config);
    case 'wordmark':
      return createWordmarkLogo(config);
    case 'symbol':
      return createSymbolLogo(config);
    default:
      return createFullLogo(config);
  }
}

/**
 * Create full logo with icon and text
 */
function createFullLogo(config: BrandConfig): string {
  const { size, colors } = config;
  const iconSize = size * 0.4;
  const textSize = size * 0.25;
  const spacing = size * 0.1;
  
  const gradientId = `brand-gradient-${Date.now()}`;
  const shadowId = `brand-shadow-${Date.now()}`;
  
  const totalWidth = iconSize + spacing + (textSize * 4.5); // Approximate text width
  const startX = (size - totalWidth) / 2;
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
        <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>
        </filter>
      </defs>
      
      <!-- Icon -->
      <g transform="translate(${startX}, ${(size - iconSize) / 2})">
        ${createChainIcon(iconSize, gradientId, shadowId)}
      </g>
      
      <!-- Text -->
      <text
        x="${startX + iconSize + spacing}"
        y="${size / 2 + textSize * 0.35}"
        fill="${colors.text}"
        font-family="${config.typography.fontFamily}"
        font-size="${textSize}"
        font-weight="${config.typography.fontWeight}"
        letter-spacing="${config.typography.letterSpacing}"
        filter="url(#${shadowId})"
      >
        Connectouch
      </text>
    </svg>
  `)}`;
}

/**
 * Create icon-only logo
 */
function createIconLogo(config: BrandConfig): string {
  const { size, colors } = config;
  const gradientId = `icon-gradient-${Date.now()}`;
  const shadowId = `icon-shadow-${Date.now()}`;
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
        <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      ${createChainIcon(size, gradientId, shadowId)}
    </svg>
  `)}`;
}

/**
 * Create wordmark-only logo
 */
function createWordmarkLogo(config: BrandConfig): string {
  const { size, colors } = config;
  const fontSize = size * 0.3;
  const shadowId = `wordmark-shadow-${Date.now()}`;
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size * 2}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size * 2} ${size}">
      <defs>
        <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>
        </filter>
      </defs>
      
      <text
        x="${size}"
        y="${size / 2 + fontSize * 0.35}"
        text-anchor="middle"
        fill="${colors.text}"
        font-family="${config.typography.fontFamily}"
        font-size="${fontSize}"
        font-weight="${config.typography.fontWeight}"
        letter-spacing="${config.typography.letterSpacing}"
        filter="url(#${shadowId})"
      >
        Connectouch
      </text>
    </svg>
  `)}`;
}

/**
 * Create symbol-only logo (simplified icon)
 */
function createSymbolLogo(config: BrandConfig): string {
  const { size, colors } = config;
  const gradientId = `symbol-gradient-${Date.now()}`;
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      ${createSimpleChainSymbol(size, gradientId)}
    </svg>
  `)}`;
}

/**
 * Create chain icon with blockchain-inspired design
 */
function createChainIcon(size: number, gradientId: string, shadowId: string): string {
  const center = size / 2;
  const linkSize = size * 0.15;
  const strokeWidth = size * 0.04;
  
  return `
    <g filter="url(#${shadowId})">
      <!-- Chain links forming a circular pattern -->
      <circle 
        cx="${center}" 
        cy="${center - linkSize}" 
        r="${linkSize}" 
        fill="none" 
        stroke="url(#${gradientId})" 
        stroke-width="${strokeWidth}"
      />
      <circle 
        cx="${center + linkSize * 0.8}" 
        cy="${center + linkSize * 0.5}" 
        r="${linkSize}" 
        fill="none" 
        stroke="url(#${gradientId})" 
        stroke-width="${strokeWidth}"
      />
      <circle 
        cx="${center - linkSize * 0.8}" 
        cy="${center + linkSize * 0.5}" 
        r="${linkSize}" 
        fill="none" 
        stroke="url(#${gradientId})" 
        stroke-width="${strokeWidth}"
      />
      
      <!-- Central connecting element -->
      <circle 
        cx="${center}" 
        cy="${center}" 
        r="${linkSize * 0.4}" 
        fill="url(#${gradientId})"
      />
    </g>
  `;
}

/**
 * Create simple chain symbol for minimal contexts
 */
function createSimpleChainSymbol(size: number, gradientId: string): string {
  const center = size / 2;
  const radius = size * 0.35;
  
  return `
    <circle 
      cx="${center}" 
      cy="${center}" 
      r="${radius}" 
      fill="url(#${gradientId})"
    />
    <text 
      x="${center}" 
      y="${center + size * 0.1}" 
      text-anchor="middle" 
      fill="white" 
      font-family="Arial, sans-serif" 
      font-size="${size * 0.4}" 
      font-weight="bold"
    >
      C
    </text>
  `;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get supported brand variants
 */
export function getSupportedVariants(): BrandVariant[] {
  return ['full', 'icon', 'wordmark', 'symbol'];
}

/**
 * Get supported brand contexts
 */
export function getSupportedContexts(): BrandContext[] {
  return ['favicon', 'app', 'social', 'header', 'footer', 'print'];
}

/**
 * Generate favicon-specific logo
 */
export function generateFavicon(size: number = 32): string {
  return generateBrandLogo('icon', size, 'favicon');
}

/**
 * Generate app icon
 */
export function generateAppIcon(size: number = 512): string {
  return generateBrandLogo('icon', size, 'app');
}

/**
 * Generate social media logo
 */
export function generateSocialLogo(size: number = 400): string {
  return generateBrandLogo('full', size, 'social');
}

export default generateBrandLogo;
