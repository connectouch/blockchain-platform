import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, X, Minimize2, Maximize2 } from 'lucide-react'
import { CryptoLocalImage } from './ui/LocalImage';
import { directApiService } from '../services/directApiService';

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  lastUpdated: string;
}

interface RunningPriceTickerProps {
  position?: 'top' | 'bottom';
  height?: number;
  speed?: number;
  updateInterval?: number;
  symbols?: string[];
  showControls?: boolean;
}

const RunningPriceTicker: React.FC<RunningPriceTickerProps> = ({
  position = 'bottom',
  height = 60,
  speed = 50, // pixels per second
  updateInterval = 30000,
  symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'LINK', 'UNI', 'AVAX', 'MATIC', 'ATOM', 'XRP'],
  showControls = true
}) => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch real-time prices using direct API service
  const fetchPrices = async () => {
    try {
      setError(null);
      console.log('🔄 Fetching ticker prices...');

      const symbolIds = symbols.map(symbol => {
        const symbolMap: { [key: string]: string } = {
          'BTC': 'bitcoin',
          'ETH': 'ethereum',
          'BNB': 'binancecoin',
          'ADA': 'cardano',
          'SOL': 'solana',
          'DOT': 'polkadot',
          'LINK': 'chainlink',
          'UNI': 'uniswap',
          'AVAX': 'avalanche-2',
          'MATIC': 'polygon',
          'ATOM': 'cosmos',
          'XRP': 'ripple'
        };
        return symbolMap[symbol] || symbol.toLowerCase();
      });

      const data = await directApiService.getCryptoPrices(symbolIds);

      if (data && data.length > 0) {
        // Transform the data to match our interface
        const transformedPrices: CryptoPrice[] = data.map((coin: any) => ({
          symbol: coin.symbol?.toUpperCase() || 'N/A',
          name: coin.name || 'Unknown',
          price: coin.current_price || 0,
          change24h: coin.price_change_percentage_24h || 0,
          lastUpdated: coin.last_updated || new Date().toISOString()
        }));

        // Use the transformed prices directly since we already filtered by symbols
        let filteredPrices = transformedPrices;

        // If we don't have enough data, add all available prices
        if (filteredPrices.length < 6) {
          filteredPrices = transformedPrices.slice(0, 12);
        }

        setPrices(filteredPrices);
        setLastUpdate(new Date());
        setIsLoading(false);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setIsLoading(false);
    }
  };

  // Auto-fetch prices on mount and set up interval
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="w-3 h-3" /> : 
      <TrendingDown className="w-3 h-3" />;
  };

  // Create ticker content
  const createTickerContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-8">
          <span className="text-white/70">Loading live prices...</span>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center space-x-4">
          <span className="text-red-400">⚠️ {error}</span>
          <button 
            onClick={fetchPrices}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Retry
          </button>
        </div>
      );
    }

    // Create the ticker items - duplicate for seamless loop
    const tickerItems = [...prices, ...prices, ...prices].map((crypto, index) => (
      <div key={`${crypto.symbol}-${index}`} className="flex items-center space-x-3 mx-8">
        <CryptoLocalImage
          identifier={crypto.symbol}
          alt={`${crypto.symbol} logo`}
          size="sm"
          className="w-6 h-6"
        />
        <span className="font-bold text-white text-lg">
          {crypto.symbol}
        </span>
        <span className="font-mono text-white text-lg">
          {formatPrice(crypto.price)}
        </span>
        <div className={`flex items-center space-x-1 ${getChangeColor(crypto.change24h)}`}>
          {getChangeIcon(crypto.change24h)}
          <span className="text-sm font-medium">
            {formatChange(crypto.change24h)}
          </span>
        </div>
        <span className="text-gray-400 text-xl">•</span>
      </div>
    ));

    return tickerItems;
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-${position === 'top' ? 'b' : 't'} border-gray-700 shadow-2xl`}
      style={{ height: isMinimized ? '40px' : `${height}px` }}
    >
      {/* Controls */}
      {showControls && (
        <div className="absolute top-2 right-2 flex items-center space-x-2 z-10">
          {lastUpdate && (
            <span className="text-xs text-gray-400">
              {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-white transition-colors bg-black/50 rounded"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-white transition-colors bg-black/50 rounded"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Live indicator */}
      <div className="absolute top-2 left-2 flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-300 font-medium">LIVE</span>
      </div>

      {/* Scrolling ticker content */}
      {!isMinimized && (
        <div className="h-full flex items-center overflow-hidden">
          <motion.div
            className="flex items-center whitespace-nowrap"
            animate={{
              x: [0, -2000] // Adjust based on content width
            }}
            transition={{
              duration: 2000 / speed, // Calculate duration based on speed
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {createTickerContent()}
          </motion.div>
        </div>
      )}

      {/* Minimized state */}
      {isMinimized && (
        <div className="h-full flex items-center justify-center">
          <span className="text-white/70 text-sm">Live Crypto Prices</span>
        </div>
      )}
    </div>
  );
};

export default RunningPriceTicker;
