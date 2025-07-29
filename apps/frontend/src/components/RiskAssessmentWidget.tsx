import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Users,
  Code,
  Lock,
  Eye,
  RefreshCw,
  Info
} from 'lucide-react'

interface RiskFactor {
  id: string
  name: string
  score: number // 1-10 (10 = safest)
  weight: number // importance weight
  description: string
  status: 'good' | 'warning' | 'critical'
  details: string[]
}

interface AuditInfo {
  firm: string
  date: string
  status: 'passed' | 'failed' | 'pending'
  criticalIssues: number
  mediumIssues: number
  lowIssues: number
  reportUrl?: string
}

interface ProtocolRisk {
  id: string
  name: string
  overallScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: RiskFactor[]
  audits: AuditInfo[]
  tvlHistory: { date: string; tvl: number }[]
  lastUpdated: string
  recommendations: string[]
  warnings: string[]
}

interface RiskAssessmentWidgetProps {
  protocols?: any[]
  selectedProtocol?: string
  className?: string
}

const RiskAssessmentWidget: React.FC<RiskAssessmentWidgetProps> = ({
  protocols = [],
  selectedProtocol,
  className = ''
}) => {
  const [protocolRisks, setProtocolRisks] = useState<ProtocolRisk[]>([])
  const [activeProtocol, setActiveProtocol] = useState<string>(selectedProtocol || '')
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  // Generate risk assessments for protocols
  useEffect(() => {
    const generateRiskAssessments = () => {
      const riskAssessments = protocols.map((protocol, index) => {
        // Generate realistic risk factors
        const factors: RiskFactor[] = [
          {
            id: 'smart-contract',
            name: 'Smart Contract Security',
            score: Math.floor(Math.random() * 3) + 7, // 7-10
            weight: 0.25,
            description: 'Code quality and security audit results',
            status: 'good',
            details: ['Multiple audits completed', 'No critical vulnerabilities', 'Bug bounty program active']
          },
          {
            id: 'liquidity',
            name: 'Liquidity Risk',
            score: Math.floor(Math.random() * 4) + 6, // 6-10
            weight: 0.20,
            description: 'Protocol liquidity and exit capability',
            status: protocol.tvl > 100000000 ? 'good' : 'warning',
            details: ['High TVL provides good liquidity', 'Multiple exit routes available']
          },
          {
            id: 'centralization',
            name: 'Centralization Risk',
            score: Math.floor(Math.random() * 5) + 5, // 5-10
            weight: 0.15,
            description: 'Governance and control distribution',
            status: 'warning',
            details: ['Some admin keys present', 'Governance token distribution could be better']
          },
          {
            id: 'market',
            name: 'Market Risk',
            score: Math.floor(Math.random() * 4) + 5, // 5-9
            weight: 0.15,
            description: 'Market volatility and correlation risks',
            status: 'warning',
            details: ['High correlation with ETH', 'Volatile market conditions']
          },
          {
            id: 'regulatory',
            name: 'Regulatory Risk',
            score: Math.floor(Math.random() * 3) + 6, // 6-9
            weight: 0.10,
            description: 'Regulatory compliance and legal risks',
            status: 'good',
            details: ['Operating in compliant jurisdictions', 'Legal framework established']
          },
          {
            id: 'operational',
            name: 'Operational Risk',
            score: Math.floor(Math.random() * 4) + 6, // 6-10
            weight: 0.15,
            description: 'Team competency and operational stability',
            status: 'good',
            details: ['Experienced team', 'Strong operational track record']
          }
        ]

        // Calculate overall score
        const overallScore = factors.reduce((sum, factor) => sum + factor.score * factor.weight, 0)
        
        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' | 'critical'
        if (overallScore >= 8.5) riskLevel = 'low'
        else if (overallScore >= 7) riskLevel = 'medium'
        else if (overallScore >= 5) riskLevel = 'high'
        else riskLevel = 'critical'

        // Generate audit info
        const audits: AuditInfo[] = [
          {
            firm: 'CertiK',
            date: '2024-01-15',
            status: 'passed',
            criticalIssues: 0,
            mediumIssues: Math.floor(Math.random() * 3),
            lowIssues: Math.floor(Math.random() * 5) + 1,
            reportUrl: '#'
          },
          {
            firm: 'ConsenSys Diligence',
            date: '2023-11-20',
            status: 'passed',
            criticalIssues: 0,
            mediumIssues: Math.floor(Math.random() * 2),
            lowIssues: Math.floor(Math.random() * 4) + 2,
            reportUrl: '#'
          }
        ]

        // Generate recommendations and warnings
        const recommendations = [
          'Consider diversifying across multiple protocols',
          'Monitor TVL changes for liquidity risks',
          'Stay updated on governance proposals',
          'Set up price alerts for significant movements'
        ]

        const warnings = riskLevel === 'high' || riskLevel === 'critical' ? [
          'High risk protocol - invest only what you can afford to lose',
          'Consider smaller position sizes',
          'Monitor closely for any changes'
        ] : []

        return {
          id: protocol.id || `protocol-${index}`,
          name: protocol.name,
          overallScore,
          riskLevel,
          factors,
          audits,
          tvlHistory: [], // Would be populated with real data
          lastUpdated: new Date().toISOString(),
          recommendations,
          warnings
        }
      })

      setProtocolRisks(riskAssessments)
      if (riskAssessments.length > 0 && !activeProtocol) {
        setActiveProtocol(riskAssessments[0].id)
      }
      setIsLoading(false)
    }

    if (protocols.length > 0) {
      generateRiskAssessments()
    }
  }, [protocols, selectedProtocol])

  // Get current protocol risk
  const currentRisk = protocolRisks.find(risk => risk.id === activeProtocol)

  // Get risk level configuration
  const getRiskConfig = (level: string) => {
    const configs = {
      low: {
        color: 'text-green-400',
        bg: 'bg-green-400/20',
        border: 'border-green-400/30',
        icon: CheckCircle
      },
      medium: {
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/20',
        border: 'border-yellow-400/30',
        icon: AlertTriangle
      },
      high: {
        color: 'text-orange-400',
        bg: 'bg-orange-400/20',
        border: 'border-orange-400/30',
        icon: AlertTriangle
      },
      critical: {
        color: 'text-red-400',
        bg: 'bg-red-400/20',
        border: 'border-red-400/30',
        icon: XCircle
      }
    }
    return configs[level as keyof typeof configs] || configs.medium
  }

  // Get factor status configuration
  const getFactorConfig = (status: string) => {
    const configs = {
      good: { color: 'text-green-400', icon: CheckCircle },
      warning: { color: 'text-yellow-400', icon: AlertTriangle },
      critical: { color: 'text-red-400', icon: XCircle }
    }
    return configs[status as keyof typeof configs] || configs.warning
  }

  // Get audit status configuration
  const getAuditConfig = (status: string) => {
    const configs = {
      passed: { color: 'text-green-400', bg: 'bg-green-400/20' },
      failed: { color: 'text-red-400', bg: 'bg-red-400/20' },
      pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/20' }
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  if (isLoading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
          <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-20 bg-white/5 rounded"></div>
          <div className="h-32 bg-white/5 rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentRisk) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
        </div>
        <div className="text-center py-8 text-white/60">
          <Info className="w-8 h-8 mx-auto mb-2" />
          <p>No protocol selected for risk assessment</p>
        </div>
      </div>
    )
  }

  const riskConfig = getRiskConfig(currentRisk.riskLevel)
  const RiskIcon = riskConfig.icon

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Protocol Selector */}
      {protocolRisks.length > 1 && (
        <div className="mb-4">
          <select
            value={activeProtocol}
            onChange={(e) => setActiveProtocol(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-400"
          >
            {protocolRisks.map(risk => (
              <option key={risk.id} value={risk.id} className="bg-gray-800">
                {risk.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Overall Risk Score */}
      <div className={`p-4 rounded-lg border ${riskConfig.border} ${riskConfig.bg} mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">{currentRisk.name}</h4>
            <p className="text-white/60 text-sm">Overall Risk Assessment</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <RiskIcon className={`w-5 h-5 ${riskConfig.color}`} />
              <span className={`text-lg font-bold ${riskConfig.color} capitalize`}>
                {currentRisk.riskLevel}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {(typeof currentRisk.overallScore === 'number' && !isNaN(currentRisk.overallScore) ? currentRisk.overallScore : 0).toFixed(1)}/10
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="space-y-3 mb-6">
        <h4 className="text-white font-medium">Risk Factors</h4>
        {currentRisk.factors.map((factor) => {
          const factorConfig = getFactorConfig(factor.status)
          const FactorIcon = factorConfig.icon

          return (
            <div key={factor.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FactorIcon className={`w-4 h-4 ${factorConfig.color}`} />
                  <span className="text-white text-sm font-medium">{factor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">Weight: {(typeof factor.weight === 'number' && !isNaN(factor.weight) ? factor.weight * 100 : 0).toFixed(0)}%</span>
                  <span className="text-white font-medium">{factor.score}/10</span>
                </div>
              </div>
              <p className="text-white/60 text-xs mb-2">{factor.description}</p>
              
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 pt-2"
                >
                  <ul className="space-y-1">
                    {factor.details.map((detail, idx) => (
                      <li key={idx} className="text-xs text-white/50 flex items-start gap-2">
                        <span className="text-white/30 mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      {/* Audit Information */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">Security Audits</h4>
        <div className="space-y-2">
          {currentRisk.audits.map((audit, index) => {
            const auditConfig = getAuditConfig(audit.status)

            return (
              <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{audit.firm}</span>
                    <div className={`px-2 py-1 rounded-full ${auditConfig.bg}`}>
                      <span className={`text-xs ${auditConfig.color} capitalize`}>
                        {audit.status}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-white/60">{audit.date}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-red-400">Critical: {audit.criticalIssues}</span>
                    <span className="text-yellow-400">Medium: {audit.mediumIssues}</span>
                    <span className="text-green-400">Low: {audit.lowIssues}</span>
                  </div>
                  {audit.reportUrl && (
                    <a href={audit.reportUrl} target="_blank" rel="noopener noreferrer"
                       className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      Report <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Warnings */}
      {currentRisk.warnings.length > 0 && (
        <div className="mb-6">
          <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-red-400 font-medium text-sm mb-1">Risk Warnings</h5>
                <ul className="space-y-1">
                  {currentRisk.warnings.map((warning, idx) => (
                    <li key={idx} className="text-xs text-white/70">• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-3">Recommendations</h4>
        <div className="space-y-2">
          {currentRisk.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-white/70">
              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 text-xs text-white/50">
        Last updated: {new Date(currentRisk.lastUpdated).toLocaleDateString()}
      </div>
    </div>
  )
}

export default RiskAssessmentWidget
