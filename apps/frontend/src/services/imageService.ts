/**
 * Enhanced Image Service - Comprehensive visual asset system
 * Provides professional SVG generation for all platform visual needs
 * Zero external dependencies, instant loading, consistent branding
 */

// Import advanced generators
import { generateAdvancedCryptoLogo } from './generators/cryptoGenerator';
import { generateBrandLogo } from './generators/brandGenerator';

// Type definitions for enhanced functionality
export type LogoStyle = 'circle' | 'square' | 'hex';
export type BrandVariant = 'full' | 'icon' | 'wordmark';
export type PlatformIconType = 'favicon' | 'app' | 'social';
export type ProtocolCategory = 'dex' | 'lending' | 'yield' | 'bridge' | 'dao';
export type ChainStyle = 'hex' | 'circle' | 'shield';
export type BackgroundType = 'gradient' | 'pattern' | 'mesh';

export class ImageService {
  // ===== BRAND & PLATFORM ASSETS =====

  /**
   * Get platform brand logo with multiple variants
   */
  static getBrandLogo(variant: BrandVariant = 'full', size: number = 64): string {
    // Use advanced brand generator with fallback to basic generator
    try {
      return generateBrandLogo(variant, size);
    } catch {
      return this.generateBrandLogo(variant, size);
    }
  }

  /**
   * Get platform icons for different contexts
   */
  static getPlatformIcon(type: PlatformIconType = 'app'): string {
    // Use advanced brand generator for platform icons
    try {
      const contextMap: Record<PlatformIconType, any> = {
        'favicon': 'favicon',
        'app': 'app',
        'social': 'social'
      };
      return generateBrandLogo('icon', 64, contextMap[type] || 'app');
    } catch {
      return this.generatePlatformIcon(type);
    }
  }

  // ===== CRYPTOCURRENCY & TOKEN ASSETS =====

  /**
   * Get cryptocurrency logo with enhanced styling
   */
  static getCryptoLogo(symbol: string, style: LogoStyle = 'circle'): string {
    // Use advanced crypto generator with fallback to basic generator
    try {
      return generateAdvancedCryptoLogo(symbol, style as any);
    } catch {
      return this.generateCryptoLogo(symbol, style);
    }
  }

  /**
   * Get token logo by contract address and symbol
   */
  static getTokenLogo(address: string, symbol: string): string {
    return this.generateTokenLogo(address, symbol);
  }

  // ===== DEFI & PROTOCOL ASSETS =====

  /**
   * Get DeFi protocol logo with category-specific styling
   */
  static getProtocolLogo(protocol: string, category: ProtocolCategory = 'dex'): string {
    return this.generateProtocolLogo(protocol, category);
  }

  /**
   * Get DeFi icon for interface elements
   */
  static getDeFiIcon(type: string): string {
    return this.generateDeFiIcon(type);
  }

  // ===== NFT & COLLECTION ASSETS =====

  /**
   * Get NFT image with enhanced metadata display
   */
  static getNFTImage(contractAddress: string, tokenId: string, size: number = 300): string {
    return this.generateNFTImage(contractAddress, tokenId, size);
  }

  /**
   * Get NFT collection logo
   */
  static getCollectionLogo(name: string): string {
    return this.generateCollectionLogo(name);
  }

  // ===== BLOCKCHAIN & NETWORK ASSETS =====

  /**
   * Get blockchain network logo with multiple styles
   */
  static getChainLogo(chain: string, style: ChainStyle = 'hex'): string {
    return this.generateChainLogo(chain, style);
  }

  /**
   * Get network icon for interface elements
   */
  static getNetworkIcon(network: string): string {
    return this.generateNetworkIcon(network);
  }

  // ===== UI & INTERFACE ASSETS =====

  /**
   * Get UI icon for interface elements
   */
  static getUIIcon(iconName: string, size: number = 24): string {
    return this.generateUIIcon(iconName, size);
  }

  /**
   * Get background patterns and gradients
   */
  static getBackground(type: BackgroundType = 'gradient'): string {
    return this.generateBackground(type);
  }

  /**
   * Get avatar for user profiles
   */
  static getAvatar(seed: string): string {
    return this.generateAvatar(seed);
  }

  // ===== LEGACY COMPATIBILITY =====

  /**
   * @deprecated Use getGameFiLogo instead
   */
  static getGameFiLogo(gameName: string): string {
    return this.generateGameLogo(gameName);
  }

  /**
   * Generate Web3 tool logos
   */
  static generateToolLogo(toolName: string): string {
    const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];
    const color = colors[toolName.length % colors.length];
    const letter = toolName.charAt(0).toUpperCase();

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="8" fill="${color}"/>
        <rect x="12" y="12" width="40" height="40" rx="4" fill="none" stroke="white" stroke-width="2"/>
        <text x="32" y="42" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${letter}</text>
      </svg>
    `)}`;

    return svg;
  }

  /**
   * Generate enhanced cryptocurrency logo with style support
   */
  private static generateCryptoLogo(symbol: string, style: LogoStyle = 'circle'): string {
    const colors = [
      '#f7931a', '#627eea', '#f0b90b', '#0052ff', '#9945ff',
      '#e6007a', '#375bd2', '#ff6b6b', '#4ecdc4', '#45b7d1'
    ];
    const color = colors[symbol.length % colors.length];
    const letter = symbol.charAt(0).toUpperCase();

    let shape = '';
    switch (style) {
      case 'circle':
        shape = `<circle cx="32" cy="32" r="30" fill="${color}"/>`;
        break;
      case 'square':
        shape = `<rect x="2" y="2" width="60" height="60" rx="8" fill="${color}"/>`;
        break;
      case 'hex':
        shape = `<polygon points="32,4 54,16 54,48 32,60 10,48 10,16" fill="${color}"/>`;
        break;
    }

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        ${shape}
        <text x="32" y="42" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${letter}</text>
      </svg>
    `)}`;

    return svg;
  }

  /**
   * Generate a simple SVG logo for DeFi protocols
   */
  private static generateProtocolLogo(protocolName: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    const color = colors[protocolName.length % colors.length];
    const letter = protocolName.charAt(0).toUpperCase();

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="12" fill="${color}"/>
        <text x="32" y="42" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${letter}</text>
      </svg>
    `)}`;

    return svg;
  }

  /**
   * Generate a simple SVG logo for GameFi projects
   */
  private static generateGameLogo(gameName: string): string {
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const color = colors[gameName.length % colors.length];
    const letter = gameName.charAt(0).toUpperCase();

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" fill="${color}"/>
        <circle cx="32" cy="32" r="20" fill="none" stroke="white" stroke-width="2"/>
        <text x="32" y="42" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">${letter}</text>
      </svg>
    `)}`;

    return svg;
  }

  /**
   * Generate enhanced blockchain network logo with style support
   */
  private static generateChainLogo(chainName: string, style: ChainStyle = 'hex'): string {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
    const color = colors[chainName.length % colors.length];
    const letter = chainName.charAt(0).toUpperCase();

    let shape = '';
    switch (style) {
      case 'hex':
        shape = `<polygon points="32,8 56,24 56,40 32,56 8,40 8,24" fill="${color}"/>`;
        break;
      case 'circle':
        shape = `<circle cx="32" cy="32" r="28" fill="${color}"/>`;
        break;
      case 'shield':
        shape = `<path d="M32 8 L52 20 L52 36 C52 48 42 56 32 56 C22 56 12 48 12 36 L12 20 Z" fill="${color}"/>`;
        break;
    }

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        ${shape}
        <text x="32" y="42" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">${letter}</text>
      </svg>
    `)}`;

    return svg;
  }

  /**
   * Generate enhanced NFT image with size support
   */
  private static generateNFTImage(contractAddress: string, tokenId: string, size: number = 300): string {
    const colors = [
      '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
      '#ef4444', '#ec4899', '#3b82f6', '#10b981'
    ];
    const color = colors[parseInt(tokenId) % colors.length];
    const shortAddress = contractAddress.slice(-4);

    const padding = size * 0.1; // 10% padding for better proportions
    const innerSize = size - (padding * 2);
    const fontSize = size * 0.08; // Larger, more readable font

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
          </linearGradient>
          <filter id="nftShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>

        <!-- Background with gradient -->
        <rect width="${size}" height="${size}" fill="url(#nftGrad)" rx="${size * 0.08}"/>

        <!-- Inner frame with better styling -->
        <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}"
              fill="none" stroke="white" stroke-width="3" rx="${innerSize * 0.06}" opacity="0.8"/>

        <!-- Crown icon for NFT -->
        <g transform="translate(${size/2 - 16}, ${size/2 - 40})" fill="white" opacity="0.9">
          <path d="M8 2L12 8L16 2L20 8L24 2L22 18H10L8 2Z" stroke="white" stroke-width="1.5"/>
        </g>

        <!-- NFT text -->
        <text x="${size/2}" y="${size/2 + 10}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" opacity="0.95">
          NFT
        </text>

        <!-- Token ID -->
        <text x="${size/2}" y="${size/2 + fontSize * 2}" text-anchor="middle" fill="white"
              font-family="Arial, sans-serif" font-size="${fontSize * 0.8}" opacity="0.8">
          #${tokenId}
        </text>

        <!-- Contract address -->
        <text x="${size/2}" y="${size - padding/2}" text-anchor="middle" fill="white"
              font-family="monospace" font-size="${fontSize * 0.6}" opacity="0.6">
          ${shortAddress}
        </text>

        <!-- Decorative corners -->
        <circle cx="${padding + 8}" cy="${padding + 8}" r="2" fill="white" opacity="0.6"/>
        <circle cx="${size - padding - 8}" cy="${padding + 8}" r="2" fill="white" opacity="0.6"/>
        <circle cx="${padding + 8}" cy="${size - padding - 8}" r="2" fill="white" opacity="0.6"/>
        <circle cx="${size - padding - 8}" cy="${size - padding - 8}" r="2" fill="white" opacity="0.6"/>
      </svg>
    `)}`;

    return svg;
  }

  // ===== NEW ENHANCED GENERATOR METHODS =====

  /**
   * Generate brand logo (placeholder - will be enhanced)
   */
  private static generateBrandLogo(variant: BrandVariant, size: number): string {
    const color = '#6366f1';
    const letter = 'C';

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="${color}"/>
        <text x="${size/2}" y="${size/2+8}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size/3}" font-weight="bold">${letter}</text>
      </svg>
    `)}`;

    return svg;
  }

  /**
   * Generate platform icon (placeholder - will be enhanced)
   */
  private static generatePlatformIcon(type: PlatformIconType): string {
    return this.generateBrandLogo('icon', 32);
  }

  /**
   * Generate token logo (placeholder - will be enhanced)
   */
  private static generateTokenLogo(address: string, symbol: string): string {
    return this.generateCryptoLogo(symbol, 'circle');
  }

  /**
   * Generate DeFi icon (placeholder - will be enhanced)
   */
  private static generateDeFiIcon(type: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4'];
    const color = colors[type.length % colors.length];
    const letter = type.charAt(0).toUpperCase();

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="${color}"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${letter}</text>
      </svg>
    `)}`;

    return svg;
  }

  /**
   * Generate collection logo (placeholder - will be enhanced)
   */
  private static generateCollectionLogo(name: string): string {
    const colors = ['#8b5cf6', '#06b6d4', '#10b981'];
    const color = colors[name.length % colors.length];
    const letter = name.charAt(0).toUpperCase();

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="8" fill="${color}"/>
        <text x="32" y="42" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${letter}</text>
      </svg>
    `)}`;

    return svg;
  }

  /**
   * Generate network icon (placeholder - will be enhanced)
   */
  private static generateNetworkIcon(network: string): string {
    return this.generateChainLogo(network, 'circle');
  }

  /**
   * Generate UI icon (placeholder - will be enhanced)
   */
  private static generateUIIcon(iconName: string, size: number): string {
    const color = '#6b7280';
    const letter = iconName.charAt(0).toUpperCase();

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="2" fill="${color}"/>
        <text x="${size/2}" y="${size/2+4}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size/2}" font-weight="bold">${letter}</text>
      </svg>
    `)}`;

    return svg;
  }

  /**
   * Generate background (placeholder - will be enhanced)
   */
  private static generateBackground(type: BackgroundType): string {
    const gradient = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bg)"/>
      </svg>
    `)}`;

    return gradient;
  }

  /**
   * Generate avatar (placeholder - will be enhanced)
   */
  private static generateAvatar(seed: string): string {
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];
    const color = colors[seed.length % colors.length];
    const letter = seed.charAt(0).toUpperCase();

    const svg = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="${color}"/>
        <text x="20" y="28" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${letter}</text>
      </svg>
    `)}`;

    return svg;
  }
}

export default ImageService
