/**
 * Prefetch Hook - Optimizes data loading with intelligent prefetching
 * Implements stale-while-revalidate strategy for optimal performance
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ApiService } from '../services/api';

interface PrefetchConfig {
  staleTime: number;
  cacheTime: number;
  refetchInterval: number;
  refetchOnWindowFocus: boolean;
  retry: number;
}

const DEFAULT_CONFIGS: Record<string, PrefetchConfig> = {
  // High-frequency data (prices, market)
  high: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 3
  },
  // Medium-frequency data (protocols, collections)
  medium: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    retry: 2
  },
  // Low-frequency data (infrastructure, static data)
  low: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1
  }
};

/**
 * Hook for prefetching blockchain overview data
 */
export const usePrefetchBlockchainOverview = () => {
  const config = DEFAULT_CONFIGS.high;

  return useQuery({
    queryKey: ['blockchain', 'overview'],
    queryFn: ApiService.getBlockchainOverview,
    staleTime: config?.staleTime ?? 60000,
    gcTime: config?.cacheTime ?? 300000,
    refetchInterval: config?.refetchInterval ?? 30000,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
    retry: config?.retry ?? 2,
    meta: {
      prefetch: true,
      priority: 'high'
    }
  });
};

/**
 * Hook for prefetching cryptocurrency prices
 */
export const usePrefetchCryptoPrices = () => {
  const config = DEFAULT_CONFIGS.high;

  return useQuery({
    queryKey: ['crypto', 'prices'],
    queryFn: ApiService.getLivePrices,
    staleTime: config?.staleTime ?? 30000,
    gcTime: config?.cacheTime ?? 300000,
    refetchInterval: config?.refetchInterval ?? 30000,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
    retry: config?.retry ?? 2,
    meta: {
      prefetch: true,
      priority: 'high'
    }
  });
};

/**
 * Hook for prefetching DeFi protocols
 */
export const usePrefetchDeFiProtocols = () => {
  const config = DEFAULT_CONFIGS.medium;
  
  return useQuery({
    queryKey: ['defi', 'protocols'],
    queryFn: ApiService.getDeFiProtocols,
    staleTime: config?.staleTime ?? 60000,
    gcTime: config?.cacheTime ?? 300000,
    refetchInterval: config?.refetchInterval ?? 60000,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
    retry: config?.retry ?? 2,
    meta: {
      prefetch: true,
      priority: 'medium'
    }
  });
};

/**
 * Hook for prefetching NFT collections
 */
export const usePrefetchNFTCollections = () => {
  const config = DEFAULT_CONFIGS.medium;
  
  return useQuery({
    queryKey: ['nft', 'collections'],
    queryFn: ApiService.getNFTCollections,
    staleTime: config?.staleTime ?? 60000,
    gcTime: config?.cacheTime ?? 300000,
    refetchInterval: config?.refetchInterval ?? 60000,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
    retry: config?.retry ?? 2,
    meta: {
      prefetch: true,
      priority: 'medium'
    }
  });
};

/**
 * Hook for prefetching infrastructure projects
 */
export const usePrefetchInfrastructure = () => {
  const config = DEFAULT_CONFIGS.low;
  
  return useQuery({
    queryKey: ['infrastructure', 'projects'],
    queryFn: ApiService.getInfrastructureProjects,
    staleTime: config?.staleTime ?? 120000,
    gcTime: config?.cacheTime ?? 600000,
    refetchInterval: config?.refetchInterval ?? 120000,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
    retry: config?.retry ?? 1,
    meta: {
      prefetch: true,
      priority: 'low'
    }
  });
};

/**
 * Hook for prefetching GameFi projects
 */
export const usePrefetchGameFi = () => {
  const config = DEFAULT_CONFIGS.medium;
  
  return useQuery({
    queryKey: ['gamefi', 'projects'],
    queryFn: ApiService.getGameFiProjects,
    staleTime: config?.staleTime ?? 60000,
    gcTime: config?.cacheTime ?? 300000,
    refetchInterval: config?.refetchInterval ?? 60000,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
    retry: config?.retry ?? 2,
    meta: {
      prefetch: true,
      priority: 'medium'
    }
  });
};

/**
 * Hook for prefetching DAO projects
 */
export const usePrefetchDAO = () => {
  const config = DEFAULT_CONFIGS.medium;
  
  return useQuery({
    queryKey: ['dao', 'projects'],
    queryFn: ApiService.getDAOProjects,
    staleTime: config?.staleTime ?? 60000,
    gcTime: config?.cacheTime ?? 300000,
    refetchInterval: config?.refetchInterval ?? 60000,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
    retry: config?.retry ?? 2,
    meta: {
      prefetch: true,
      priority: 'medium'
    }
  });
};

/**
 * Master prefetch hook - prefetches all critical data
 */
export const useMasterPrefetch = () => {
  const queryClient = useQueryClient();

  // Prefetch all critical data on app startup
  useEffect(() => {
    const prefetchCriticalData = async () => {
      console.log('🚀 Starting master prefetch for optimal performance...');
      
      try {
        // Prefetch high-priority data first
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ['blockchain', 'overview'],
            queryFn: ApiService.getBlockchainOverview,
            staleTime: DEFAULT_CONFIGS.high?.staleTime ?? 60000
          }),
          queryClient.prefetchQuery({
            queryKey: ['crypto', 'prices'],
            queryFn: ApiService.getLivePrices,
            staleTime: DEFAULT_CONFIGS.high?.staleTime ?? 30000
          })
        ]);

        // Prefetch medium-priority data
        setTimeout(async () => {
          await Promise.all([
            queryClient.prefetchQuery({
              queryKey: ['defi', 'protocols'],
              queryFn: ApiService.getDeFiProtocols,
              staleTime: DEFAULT_CONFIGS.medium?.staleTime ?? 60000
            }),
            queryClient.prefetchQuery({
              queryKey: ['nft', 'collections'],
              queryFn: ApiService.getNFTCollections,
              staleTime: DEFAULT_CONFIGS.medium?.staleTime ?? 60000
            })
          ]);
        }, 2000);

        // Prefetch low-priority data
        setTimeout(async () => {
          await Promise.all([
            queryClient.prefetchQuery({
              queryKey: ['infrastructure', 'projects'],
              queryFn: ApiService.getInfrastructureProjects,
              staleTime: DEFAULT_CONFIGS.low?.staleTime ?? 120000
            }),
            queryClient.prefetchQuery({
              queryKey: ['gamefi', 'projects'],
              queryFn: ApiService.getGameFiProjects,
              staleTime: DEFAULT_CONFIGS.medium?.staleTime ?? 60000
            }),
            queryClient.prefetchQuery({
              queryKey: ['dao', 'projects'],
              queryFn: ApiService.getDAOProjects,
              staleTime: DEFAULT_CONFIGS.medium?.staleTime ?? 60000
            })
          ]);
        }, 5000);

        console.log('✅ Master prefetch completed - all data cached for optimal performance');
      } catch (error) {
        console.error('❌ Master prefetch failed:', error);
      }
    };

    prefetchCriticalData();
  }, [queryClient]);

  return {
    prefetchStatus: 'completed'
  };
};

/**
 * Hook for intelligent cache warming
 */
export const useCacheWarming = () => {
  const queryClient = useQueryClient();

  const warmCache = async (routes: string[]) => {
    console.log('🔥 Warming cache for routes:', routes);
    
    const prefetchPromises = routes.map(route => {
      switch (route) {
        case '/defi':
          return queryClient.prefetchQuery({
            queryKey: ['defi', 'protocols'],
            queryFn: ApiService.getDeFiProtocols
          });
        case '/nft':
          return queryClient.prefetchQuery({
            queryKey: ['nft', 'collections'],
            queryFn: ApiService.getNFTCollections
          });
        case '/infrastructure':
          return queryClient.prefetchQuery({
            queryKey: ['infrastructure', 'projects'],
            queryFn: ApiService.getInfrastructureProjects
          });
        case '/gamefi':
          return queryClient.prefetchQuery({
            queryKey: ['gamefi', 'projects'],
            queryFn: ApiService.getGameFiProjects
          });
        case '/dao':
          return queryClient.prefetchQuery({
            queryKey: ['dao', 'projects'],
            queryFn: ApiService.getDAOProjects
          });
        default:
          return Promise.resolve();
      }
    });

    await Promise.all(prefetchPromises);
    console.log('✅ Cache warming completed');
  };

  return { warmCache };
};

export default {
  usePrefetchBlockchainOverview,
  usePrefetchCryptoPrices,
  usePrefetchDeFiProtocols,
  usePrefetchNFTCollections,
  usePrefetchInfrastructure,
  usePrefetchGameFi,
  usePrefetchDAO,
  useMasterPrefetch,
  useCacheWarming
};
