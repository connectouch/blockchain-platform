/**
 * Add Holding Modal Component
 * Allows users to add new cryptocurrency holdings to their portfolio
 */

import React, { useState, useEffect } from 'react'
import { X, Search, Plus } from 'lucide-react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useRealTimePrices } from '../../hooks/useRealTimeData'

interface AddHoldingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface CryptoOption {
  symbol: string
  name: string
  currentPrice: number
}

export function AddHoldingModal({ isOpen, onClose, onSuccess }: AddHoldingModalProps) {
  const { addHolding } = usePortfolio()
  const { prices } = useRealTimePrices()
  
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    amount: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate crypto options from available prices
  useEffect(() => {
    const options: CryptoOption[] = Object.entries(prices).map(([symbol, data]) => ({
      symbol: symbol.toUpperCase(),
      name: symbol.charAt(0).toUpperCase() + symbol.slice(1), // Simple name formatting
      currentPrice: data.usd
    }))
    
    // Add common cryptocurrencies if not in prices
    const commonCryptos = [
      { symbol: 'BTC', name: 'Bitcoin', currentPrice: 43250 },
      { symbol: 'ETH', name: 'Ethereum', currentPrice: 2650 },
      { symbol: 'BNB', name: 'BNB', currentPrice: 315 },
      { symbol: 'ADA', name: 'Cardano', currentPrice: 0.52 },
      { symbol: 'SOL', name: 'Solana', currentPrice: 98 },
      { symbol: 'DOT', name: 'Polkadot', currentPrice: 7.85 },
      { symbol: 'LINK', name: 'Chainlink', currentPrice: 15.67 },
      { symbol: 'UNI', name: 'Uniswap', currentPrice: 8.92 }
    ]

    commonCryptos.forEach(crypto => {
      if (!options.find(opt => opt.symbol === crypto.symbol)) {
        options.push(crypto)
      }
    })

    setCryptoOptions(options.sort((a, b) => a.symbol.localeCompare(b.symbol)))
  }, [prices])

  // Filter crypto options based on search term
  const filteredOptions = cryptoOptions.filter(option =>
    option.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCryptoSelect = (option: CryptoOption) => {
    setFormData(prev => ({
      ...prev,
      symbol: option.symbol,
      name: option.name,
      purchasePrice: option.currentPrice.toString()
    }))
    setSearchTerm(option.symbol)
    setShowDropdown(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setFormData(prev => ({ ...prev, symbol: value.toUpperCase(), name: value }))
    setShowDropdown(value.length > 0)
  }

  const validateForm = () => {
    if (!formData.symbol || !formData.amount || !formData.purchasePrice) {
      setError('Please fill in all required fields')
      return false
    }

    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError('Amount must be a positive number')
      return false
    }

    if (isNaN(Number(formData.purchasePrice)) || Number(formData.purchasePrice) <= 0) {
      setError('Purchase price must be a positive number')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      await addHolding(
        formData.symbol.toLowerCase(),
        formData.name || formData.symbol,
        Number(formData.amount),
        Number(formData.purchasePrice),
        formData.purchaseDate,
        formData.notes || undefined
      )

      // Reset form
      setFormData({
        symbol: '',
        name: '',
        amount: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setSearchTerm('')
      
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add holding')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        symbol: '',
        name: '',
        amount: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setSearchTerm('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add Holding</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cryptocurrency Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cryptocurrency *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(searchTerm.length > 0)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search cryptocurrency (e.g., BTC, Bitcoin)"
                disabled={loading}
              />
            </div>
            
            {showDropdown && filteredOptions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredOptions.slice(0, 10).map((option) => (
                  <button
                    key={option.symbol}
                    type="button"
                    onClick={() => handleCryptoSelect(option)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-600 flex items-center justify-between"
                    disabled={loading}
                  >
                    <div>
                      <div className="text-white font-medium">{option.symbol}</div>
                      <div className="text-gray-400 text-sm">{option.name}</div>
                    </div>
                    <div className="text-green-400 text-sm">
                      ${option.currentPrice.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="any"
              min="0"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Purchase Price (USD) *
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleInputChange}
              step="any"
              min="0"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add any notes about this holding..."
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Adding Holding...
              </>
            ) : (
              <>
                <Plus className="mr-2 w-4 h-4" />
                Add Holding
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
