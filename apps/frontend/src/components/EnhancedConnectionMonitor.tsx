import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  X,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap
} from 'lucide-react';
import { connectionHealthService } from '../services/connectionHealthService';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'checking' | 'reconnecting';
  responseTime: number;
  errorCount: number;
  lastSuccess: Date | null;
}

interface HealthReport {
  timestamp: Date;
  services: ServiceStatus[];
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
}

const EnhancedConnectionMonitor: React.FC = () => {
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [autoReconnecting, setAutoReconnecting] = useState(false);

  useEffect(() => {
    // Start monitoring
    connectionHealthService.startMonitoring();

    // Listen for health reports
    const handleHealthReport = (report: HealthReport) => {
      setHealthReport(report);
    };

    const handleServiceReconnecting = () => {
      setAutoReconnecting(true);
      setTimeout(() => setAutoReconnecting(false), 3000);
    };

    const handleServiceHealthy = ({ name }: { name: string }) => {
      console.log(`✅ Service ${name} is now healthy`);
    };

    const handleServiceUnhealthy = ({ name, error }: { name: string; error: string }) => {
      console.warn(`❌ Service ${name} is unhealthy: ${error}`);
    };

    connectionHealthService.on('health-report', handleHealthReport);
    connectionHealthService.on('service-reconnecting', handleServiceReconnecting);
    connectionHealthService.on('service-healthy', handleServiceHealthy);
    connectionHealthService.on('service-unhealthy', handleServiceUnhealthy);

    return () => {
      connectionHealthService.off('health-report', handleHealthReport);
      connectionHealthService.off('service-reconnecting', handleServiceReconnecting);
      connectionHealthService.off('service-healthy', handleServiceHealthy);
      connectionHealthService.off('service-unhealthy', handleServiceUnhealthy);
      connectionHealthService.stopMonitoring();
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'unhealthy':
        return <WifiOff className="w-4 h-4 text-red-400" />;
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'reconnecting':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getOverallIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Wifi className="w-5 h-5 text-green-400" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'unhealthy':
        return <WifiOff className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'unhealthy':
        return 'text-red-400';
      case 'checking':
        return 'text-blue-400';
      case 'reconnecting':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatServiceName = (name: string) => {
    const nameMap: Record<string, string> = {
      'backend-health': 'Backend Server',
      'backend-prices': 'Price Data API',
      'backend-overview': 'Market Overview',
      'backend-defi': 'DeFi Protocols',
      'backend-ai': 'AI Services',
      'coinmarketcap': 'CoinMarketCap API',
      'alchemy': 'Alchemy Blockchain',
      'openai': 'OpenAI GPT-4'
    };
    
    return nameMap[name] || name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleForceReconnect = () => {
    setAutoReconnecting(true);
    connectionHealthService.forceReconnectAll();
    setTimeout(() => setAutoReconnecting(false), 5000);
  };

  if (!isVisible) return null;

  // Show minimal indicator if no health report yet
  if (!healthReport) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-16 right-4 z-40"
      >
        <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-2xl">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="text-white text-sm">Initializing connection monitoring...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  const healthyCount = healthReport.services.filter(s => s.status === 'healthy').length;
  const totalCount = healthReport.services.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-16 right-4 z-40 max-w-sm"
    >
      <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            {getOverallIcon(healthReport.overallHealth)}
            <div>
              <div className="text-sm font-medium text-white">
                System Health
              </div>
              <div className="text-xs text-gray-400">
                {healthyCount}/{totalCount} services online
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {autoReconnecting && (
              <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 hover:bg-white/10 rounded"
            >
              {isExpanded ? 
                <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/10 p-3 space-y-2">
                {healthReport.services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-2 bg-white/5 rounded"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="text-sm text-white">
                          {formatServiceName(service.name)}
                        </div>
                        <div className={`text-xs ${getStatusColor(service.status)}`}>
                          {service.status}
                          {service.responseTime > 0 && ` (${service.responseTime}ms)`}
                        </div>
                      </div>
                    </div>
                    
                    {service.errorCount > 0 && (
                      <div className="text-xs text-red-400">
                        {service.errorCount} errors
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Actions */}
                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    Last check: {healthReport.timestamp.toLocaleTimeString()}
                  </div>
                  <button
                    onClick={handleForceReconnect}
                    disabled={autoReconnecting}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-xs rounded transition-colors flex items-center space-x-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${autoReconnecting ? 'animate-spin' : ''}`} />
                    <span>Reconnect All</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EnhancedConnectionMonitor;
