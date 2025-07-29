import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText,
  Download,
  Upload,
  Calculator,
  Calendar,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Globe,
  Shield,
  Target,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface TaxTransaction {
  id: string
  date: string
  type: 'buy' | 'sell' | 'trade' | 'stake' | 'unstake' | 'defi_yield' | 'airdrop' | 'mining'
  asset: string
  amount: number
  price: number
  value: number
  costBasis?: number
  gainLoss?: number
  taxableEvent: boolean
  description: string
  chain: string
  txHash?: string
}

interface TaxSummary {
  totalGains: number
  totalLosses: number
  netGainLoss: number
  shortTermGains: number
  longTermGains: number
  ordinaryIncome: number
  stakingRewards: number
  defiYield: number
  airdrops: number
  taxOwed: number
  effectiveRate: number
}

interface TaxJurisdiction {
  code: string
  name: string
  shortTermRate: number
  longTermRate: number
  ordinaryRate: number
  hasStakingTax: boolean
  hasDefiTax: boolean
  currency: string
}

interface TaxReportingSystemProps {
  taxYear: number
  onYearChange?: (year: number) => void
  onExport?: (format: string, data: any) => void
}

const TaxReportingSystem: React.FC<TaxReportingSystemProps> = ({
  taxYear = 2024,
  onYearChange,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'reports' | 'settings'>('summary')
  const [transactions, setTransactions] = useState<TaxTransaction[]>([])
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null)
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('US')
  const [costBasisMethod, setCostBasisMethod] = useState<'FIFO' | 'LIFO' | 'HIFO' | 'SpecificID'>('FIFO')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isCalculating, setIsCalculating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Tax jurisdictions
  const jurisdictions: TaxJurisdiction[] = [
    {
      code: 'US',
      name: 'United States',
      shortTermRate: 37,
      longTermRate: 20,
      ordinaryRate: 37,
      hasStakingTax: true,
      hasDefiTax: true,
      currency: 'USD'
    },
    {
      code: 'UK',
      name: 'United Kingdom',
      shortTermRate: 20,
      longTermRate: 20,
      ordinaryRate: 45,
      hasStakingTax: true,
      hasDefiTax: true,
      currency: 'GBP'
    },
    {
      code: 'CA',
      name: 'Canada',
      shortTermRate: 53.5,
      longTermRate: 26.8,
      ordinaryRate: 53.5,
      hasStakingTax: true,
      hasDefiTax: true,
      currency: 'CAD'
    },
    {
      code: 'DE',
      name: 'Germany',
      shortTermRate: 42,
      longTermRate: 0,
      ordinaryRate: 42,
      hasStakingTax: true,
      hasDefiTax: true,
      currency: 'EUR'
    }
  ]

  // Initialize tax data
  useEffect(() => {
    const mockTransactions: TaxTransaction[] = [
      {
        id: 'tx1',
        date: '2024-01-15',
        type: 'buy',
        asset: 'BTC',
        amount: 0.5,
        price: 42000,
        value: 21000,
        taxableEvent: false,
        description: 'Purchased Bitcoin',
        chain: 'Bitcoin',
        txHash: 'abc123...'
      },
      {
        id: 'tx2',
        date: '2024-03-20',
        type: 'sell',
        asset: 'BTC',
        amount: 0.2,
        price: 48000,
        value: 9600,
        costBasis: 8400,
        gainLoss: 1200,
        taxableEvent: true,
        description: 'Sold Bitcoin',
        chain: 'Bitcoin',
        txHash: 'def456...'
      },
      {
        id: 'tx3',
        date: '2024-02-10',
        type: 'stake',
        asset: 'ETH',
        amount: 2,
        price: 2800,
        value: 5600,
        taxableEvent: false,
        description: 'Staked Ethereum',
        chain: 'Ethereum',
        txHash: 'ghi789...'
      },
      {
        id: 'tx4',
        date: '2024-04-05',
        type: 'defi_yield',
        asset: 'USDC',
        amount: 150,
        price: 1,
        value: 150,
        taxableEvent: true,
        description: 'DeFi yield farming rewards',
        chain: 'Ethereum',
        txHash: 'jkl012...'
      },
      {
        id: 'tx5',
        date: '2024-05-12',
        type: 'airdrop',
        asset: 'ARB',
        amount: 500,
        price: 1.2,
        value: 600,
        taxableEvent: true,
        description: 'Arbitrum airdrop',
        chain: 'Arbitrum',
        txHash: 'mno345...'
      }
    ]

    const mockSummary: TaxSummary = {
      totalGains: 2850,
      totalLosses: 450,
      netGainLoss: 2400,
      shortTermGains: 1200,
      longTermGains: 1200,
      ordinaryIncome: 750,
      stakingRewards: 320,
      defiYield: 280,
      airdrops: 150,
      taxOwed: 1680,
      effectiveRate: 28.5
    }

    setTransactions(mockTransactions)
    setTaxSummary(mockSummary)
  }, [taxYear, selectedJurisdiction, costBasisMethod])

  // Calculate taxes
  const calculateTaxes = () => {
    setIsCalculating(true)
    setTimeout(() => {
      // Simulate tax calculation
      setIsCalculating(false)
    }, 3000)
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || tx.type === selectedType
    return matchesSearch && matchesType
  })

  // Export data
  const exportData = (format: 'csv' | 'pdf' | 'turbotax' | 'taxact') => {
    onExport?.(format, { transactions, summary: taxSummary, jurisdiction: selectedJurisdiction })
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    const jurisdiction = jurisdictions.find(j => j.code === selectedJurisdiction)
    const currency = jurisdiction?.currency || 'USD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  // Get transaction type color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-blue-400'
      case 'sell': return 'text-green-400'
      case 'trade': return 'text-purple-400'
      case 'stake': return 'text-yellow-400'
      case 'defi_yield': return 'text-green-400'
      case 'airdrop': return 'text-pink-400'
      default: return 'text-white/60'
    }
  }

  // Get gain/loss color
  const getGainLossColor = (value: number) => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-white/60'
  }

  const currentJurisdiction = jurisdictions.find(j => j.code === selectedJurisdiction)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Tax Reporting</h2>
          <p className="text-white/60">Automated crypto tax calculation and reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={taxYear}
            onChange={(e) => onYearChange?.(Number(e.target.value))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value={2024} className="bg-gray-800">2024</option>
            <option value={2023} className="bg-gray-800">2023</option>
            <option value={2022} className="bg-gray-800">2022</option>
            <option value={2021} className="bg-gray-800">2021</option>
          </select>
          <button
            onClick={calculateTaxes}
            disabled={isCalculating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
          >
            <Calculator className={`w-4 h-4 ${isCalculating ? 'animate-pulse' : ''}`} />
            {isCalculating ? 'Calculating...' : 'Calculate Taxes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {[
          { id: 'summary', label: 'Tax Summary', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'transactions', label: 'Transactions', icon: <FileText className="w-4 h-4" /> },
          { id: 'reports', label: 'Reports', icon: <Download className="w-4 h-4" /> },
          { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'summary' && taxSummary && (
            <div className="space-y-6">
              {/* Tax Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Net Gain/Loss</h3>
                  <p className={`text-3xl font-bold ${getGainLossColor(taxSummary.netGainLoss)}`}>
                    {formatCurrency(taxSummary.netGainLoss)}
                  </p>
                </div>
                <div className="glass-card p-6 text-center">
                  <DollarSign className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Tax Owed</h3>
                  <p className="text-3xl font-bold text-red-400">
                    {formatCurrency(taxSummary.taxOwed)}
                  </p>
                </div>
                <div className="glass-card p-6 text-center">
                  <Percent className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Effective Rate</h3>
                  <p className="text-3xl font-bold text-yellow-400">
                    {taxSummary.effectiveRate.toFixed(1)}%
                  </p>
                </div>
                <div className="glass-card p-6 text-center">
                  <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Jurisdiction</h3>
                  <p className="text-xl font-bold text-white">{currentJurisdiction?.name}</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Capital Gains</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Short-term gains:</span>
                      <span className={getGainLossColor(taxSummary.shortTermGains)}>
                        {formatCurrency(taxSummary.shortTermGains)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Long-term gains:</span>
                      <span className={getGainLossColor(taxSummary.longTermGains)}>
                        {formatCurrency(taxSummary.longTermGains)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Total losses:</span>
                      <span className="text-red-400">{formatCurrency(taxSummary.totalLosses)}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between font-bold">
                        <span className="text-white">Net capital gains:</span>
                        <span className={getGainLossColor(taxSummary.netGainLoss)}>
                          {formatCurrency(taxSummary.netGainLoss)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Ordinary Income</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Staking rewards:</span>
                      <span className="text-green-400">{formatCurrency(taxSummary.stakingRewards)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">DeFi yield:</span>
                      <span className="text-green-400">{formatCurrency(taxSummary.defiYield)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Airdrops:</span>
                      <span className="text-green-400">{formatCurrency(taxSummary.airdrops)}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between font-bold">
                        <span className="text-white">Total ordinary income:</span>
                        <span className="text-green-400">{formatCurrency(taxSummary.ordinaryIncome)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Rates */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Tax Rates ({currentJurisdiction?.name})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{currentJurisdiction?.shortTermRate}%</div>
                    <div className="text-white/60">Short-term Capital Gains</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{currentJurisdiction?.longTermRate}%</div>
                    <div className="text-white/60">Long-term Capital Gains</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{currentJurisdiction?.ordinaryRate}%</div>
                    <div className="text-white/60">Ordinary Income</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400"
                  />
                </div>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all" className="bg-gray-800">All Types</option>
                  <option value="buy" className="bg-gray-800">Buy</option>
                  <option value="sell" className="bg-gray-800">Sell</option>
                  <option value="trade" className="bg-gray-800">Trade</option>
                  <option value="stake" className="bg-gray-800">Stake</option>
                  <option value="defi_yield" className="bg-gray-800">DeFi Yield</option>
                  <option value="airdrop" className="bg-gray-800">Airdrop</option>
                </select>

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                    showDetails 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {showDetails ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Details
                </button>
              </div>

              {/* Transactions List */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Transactions ({filteredTransactions.length})</h3>
                <div className="space-y-3">
                  {filteredTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="p-4 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${tx.taxableEvent ? 'bg-red-400' : 'bg-green-400'}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium capitalize ${getTransactionTypeColor(tx.type)}`}>
                                {tx.type.replace('_', ' ')}
                              </span>
                              <span className="text-white font-bold">{tx.amount} {tx.asset}</span>
                            </div>
                            <p className="text-white/60 text-sm">{tx.description}</p>
                            {showDetails && (
                              <p className="text-white/40 text-xs">{tx.chain} • {tx.txHash?.slice(0, 10)}...</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-medium">{formatCurrency(tx.value)}</div>
                          <div className="text-white/60 text-sm">{tx.date}</div>
                          {tx.gainLoss !== undefined && (
                            <div className={`text-sm font-medium ${getGainLossColor(tx.gainLoss)}`}>
                              {tx.gainLoss >= 0 ? '+' : ''}{formatCurrency(tx.gainLoss)}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Export Tax Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Standard Formats</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => exportData('csv')}
                        className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <FileText className="w-6 h-6 text-blue-400" />
                        <div className="text-left">
                          <div className="text-white font-medium">CSV Export</div>
                          <div className="text-white/60 text-sm">Spreadsheet-compatible format</div>
                        </div>
                      </button>
                      <button
                        onClick={() => exportData('pdf')}
                        className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <FileText className="w-6 h-6 text-red-400" />
                        <div className="text-left">
                          <div className="text-white font-medium">PDF Report</div>
                          <div className="text-white/60 text-sm">Professional tax summary</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Tax Software</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => exportData('turbotax')}
                        className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Calculator className="w-6 h-6 text-green-400" />
                        <div className="text-left">
                          <div className="text-white font-medium">TurboTax</div>
                          <div className="text-white/60 text-sm">Direct import format</div>
                        </div>
                      </button>
                      <button
                        onClick={() => exportData('taxact')}
                        className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Calculator className="w-6 h-6 text-purple-400" />
                        <div className="text-left">
                          <div className="text-white font-medium">TaxAct</div>
                          <div className="text-white/60 text-sm">Compatible format</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Tax Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Tax Jurisdiction
                      </label>
                      <select
                        value={selectedJurisdiction}
                        onChange={(e) => setSelectedJurisdiction(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      >
                        {jurisdictions.map(jurisdiction => (
                          <option key={jurisdiction.code} value={jurisdiction.code} className="bg-gray-800">
                            {jurisdiction.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Cost Basis Method
                      </label>
                      <select
                        value={costBasisMethod}
                        onChange={(e) => setCostBasisMethod(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="FIFO" className="bg-gray-800">FIFO (First In, First Out)</option>
                        <option value="LIFO" className="bg-gray-800">LIFO (Last In, First Out)</option>
                        <option value="HIFO" className="bg-gray-800">HIFO (Highest In, First Out)</option>
                        <option value="SpecificID" className="bg-gray-800">Specific Identification</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Import Data</h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60 mb-2">Import transaction data</p>
                      <p className="text-white/40 text-sm">CSV, Excel, or exchange exports</p>
                      <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
                        Choose File
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default TaxReportingSystem
