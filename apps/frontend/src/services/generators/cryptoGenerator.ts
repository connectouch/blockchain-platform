/**
 * Professional Cryptocurrency Logo Generator
 * Creates high-quality SVG logos with gradients, symbols, and brand-specific styling
 */

import { BrandSystem, getCryptoColor } from '../brandSystem';
import { AssetCache, generateCacheKey } from '../assetCache';

// ===== TYPE DEFINITIONS =====

export type CryptoStyle = 'circle' | 'square' | 'hex' | 'shield';

export interface CryptoConfig {
  symbol: string;
  name: string;
  colors: string[];
  gradient: boolean;
  customSymbol?: string;
  borderColor?: string;
  textColor?: string;
}

// ===== PREDEFINED CRYPTOCURRENCY CONFIGURATIONS =====

const CRYPTO_CONFIGS: Record<string, CryptoConfig> = {
  'BTC': {
    symbol: 'BTC',
    name: 'Bitcoin',
    colors: ['#f7931a', '#ff9500'],
    gradient: true,
    customSymbol: '₿',
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'ETH': {
    symbol: 'ETH',
    name: 'Ethereum',
    colors: ['#627eea', '#8a92b2'],
    gradient: true,
    customSymbol: 'Ξ',
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'BNB': {
    symbol: 'BNB',
    name: 'Binance Coin',
    colors: ['#f0b90b', '#f8d12f'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'ADA': {
    symbol: 'ADA',
    name: 'Cardano',
    colors: ['#0052ff', '#1e3a8a'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'SOL': {
    symbol: 'SOL',
    name: 'Solana',
    colors: ['#9945ff', '#14f195'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'MATIC': {
    symbol: 'MATIC',
    name: 'Polygon',
    colors: ['#8247e5', '#6f42c1'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'AVAX': {
    symbol: 'AVAX',
    name: 'Avalanche',
    colors: ['#e84142', '#ff6b6b'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'LINK': {
    symbol: 'LINK',
    name: 'Chainlink',
    colors: ['#375bd2', '#2563eb'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'UNI': {
    symbol: 'UNI',
    name: 'Uniswap',
    colors: ['#ff007a', '#ff6ec7'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'AAVE': {
    symbol: 'AAVE',
    name: 'Aave',
    colors: ['#b6509e', '#d946ef'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'DOT': {
    symbol: 'DOT',
    name: 'Polkadot',
    colors: ['#e6007a', '#ff1493'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'ATOM': {
    symbol: 'ATOM',
    name: 'Cosmos',
    colors: ['#2e3148', '#6f7390'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'NEAR': {
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    colors: ['#00c08b', '#10b981'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'FTM': {
    symbol: 'FTM',
    name: 'Fantom',
    colors: ['#1969ff', '#3b82f6'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  },
  'ALGO': {
    symbol: 'ALGO',
    name: 'Algorand',
    colors: ['#000000', '#374151'],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  }
};

// ===== MAIN GENERATOR FUNCTION =====

/**
 * Generate advanced cryptocurrency logo with professional styling
 */
export function generateAdvancedCryptoLogo(
  symbol: string,
  style: CryptoStyle = 'circle',
  size: number = 64
): string {
  // Check cache first
  const cacheKey = generateCacheKey('crypto', symbol, style, size);
  const cached = AssetCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const config = getCryptoConfig(symbol);
  const svg = createCryptoSVG(config, style, size);
  
  // Cache the result
  AssetCache.set(cacheKey, svg);
  
  return svg;
}

/**
 * Get cryptocurrency configuration (predefined or fallback)
 */
function getCryptoConfig(symbol: string): CryptoConfig {
  const upperSymbol = symbol.toUpperCase();
  
  if (CRYPTO_CONFIGS[upperSymbol]) {
    return CRYPTO_CONFIGS[upperSymbol];
  }
  
  // Generate fallback configuration
  return generateFallbackConfig(upperSymbol);
}

/**
 * Generate fallback configuration for unknown cryptocurrencies
 */
function generateFallbackConfig(symbol: string): CryptoConfig {
  const colors = BrandSystem.colors.primary;
  const colorIndex = symbol.length % 5;
  
  const colorMap = [
    [colors[500], colors[600]],
    [BrandSystem.colors.secondary[500], BrandSystem.colors.secondary[600]],
    [BrandSystem.colors.accent[500], BrandSystem.colors.accent[600]],
    [BrandSystem.colors.success[500], BrandSystem.colors.success[600]],
    [BrandSystem.colors.warning[500], BrandSystem.colors.warning[600]]
  ];
  
  return {
    symbol,
    name: symbol,
    colors: colorMap[colorIndex],
    gradient: true,
    borderColor: '#ffffff',
    textColor: '#ffffff'
  };
}

/**
 * Create SVG markup for cryptocurrency logo
 */
function createCryptoSVG(config: CryptoConfig, style: CryptoStyle, size: number): string {
  const gradientId = `grad-${config.symbol}-${Date.now()}`;
  const shadowId = `shadow-${config.symbol}-${Date.now()}`;
  
  // Calculate responsive dimensions
  const center = size / 2;
  const radius = (size / 2) - 2;
  const fontSize = Math.max(12, size * 0.3);
  const symbolFontSize = Math.max(14, size * 0.35);
  
  // Create gradient definition
  const gradient = config.gradient ? `
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${config.colors[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${config.colors[1] || config.colors[0]};stop-opacity:1" />
      </linearGradient>
      <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
    </defs>
  ` : '';
  
  // Create shape based on style
  const shape = createShape(style, center, radius, gradientId, config);
  
  // Create text content
  const displayText = config.customSymbol || config.symbol;
  const textSize = config.customSymbol ? symbolFontSize : fontSize;
  
  const text = `
    <text 
      x="${center}" 
      y="${center + (textSize * 0.35)}" 
      text-anchor="middle" 
      fill="${config.textColor}" 
      font-family="${BrandSystem.typography.primary}" 
      font-size="${textSize}" 
      font-weight="700"
      filter="url(#${shadowId})"
    >
      ${displayText}
    </text>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      ${gradient}
      ${shape}
      ${text}
    </svg>
  `)}`;
}

/**
 * Create shape element based on style
 */
function createShape(
  style: CryptoStyle,
  center: number,
  radius: number,
  gradientId: string,
  config: CryptoConfig
): string {
  const fill = config.gradient ? `url(#${gradientId})` : config.colors[0];
  const stroke = config.borderColor ? `stroke="${config.borderColor}" stroke-width="2"` : '';
  
  switch (style) {
    case 'circle':
      return `<circle cx="${center}" cy="${center}" r="${radius}" fill="${fill}" ${stroke}/>`;
    
    case 'square':
      const squareSize = radius * 1.6;
      const squareOffset = center - (squareSize / 2);
      return `<rect x="${squareOffset}" y="${squareOffset}" width="${squareSize}" height="${squareSize}" rx="8" fill="${fill}" ${stroke}/>`;
    
    case 'hex':
      const hexPoints = generateHexagonPoints(center, radius);
      return `<polygon points="${hexPoints}" fill="${fill}" ${stroke}/>`;
    
    case 'shield':
      const shieldPath = generateShieldPath(center, radius);
      return `<path d="${shieldPath}" fill="${fill}" ${stroke}/>`;
    
    default:
      return `<circle cx="${center}" cy="${center}" r="${radius}" fill="${fill}" ${stroke}/>`;
  }
}

/**
 * Generate hexagon points for polygon
 */
function generateHexagonPoints(center: number, radius: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
}

/**
 * Generate shield path for SVG
 */
function generateShieldPath(center: number, radius: number): string {
  const top = center - radius;
  const bottom = center + radius;
  const left = center - radius * 0.8;
  const right = center + radius * 0.8;
  
  return `M ${center} ${top} 
          L ${right} ${center - radius * 0.3} 
          L ${right} ${center + radius * 0.3} 
          Q ${right} ${bottom} ${center} ${bottom} 
          Q ${left} ${bottom} ${left} ${center + radius * 0.3} 
          L ${left} ${center - radius * 0.3} 
          Z`;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get list of supported cryptocurrencies
 */
export function getSupportedCryptos(): string[] {
  return Object.keys(CRYPTO_CONFIGS);
}

/**
 * Check if cryptocurrency has predefined configuration
 */
export function hasPredefinedConfig(symbol: string): boolean {
  return CRYPTO_CONFIGS.hasOwnProperty(symbol.toUpperCase());
}

/**
 * Get cryptocurrency configuration details
 */
export function getCryptoDetails(symbol: string): CryptoConfig | null {
  const upperSymbol = symbol.toUpperCase();
  return CRYPTO_CONFIGS[upperSymbol] || null;
}

export default generateAdvancedCryptoLogo;
