import React from 'react'
import { useFloatingAI } from '../contexts/FloatingAIContext'
import FloatingAIAssistant from './FloatingAIAssistant'

const FloatingAIWrapper: React.FC = () => {
  const { 
    aiContext, 
    updateContext, 
    updatePortfolio, 
    updatePreferences 
  } = useFloatingAI()

  // Don't render if AI is disabled
  if (!aiContext.isAIEnabled) {
    return null
  }

  const handleTradeAction = (action: any) => {
    console.log('Trade action:', action)
    
    // In a real implementation, this would:
    // 1. Validate the trade parameters
    // 2. Check user permissions and balance
    // 3. Execute the trade through the trading API
    // 4. Update portfolio data
    // 5. Show confirmation/error messages
    
    // For demo purposes, we'll just log and show a notification
    if (action.type === 'trade') {
      const message = `${action.action.toUpperCase()} ${action.amount} ${action.asset}`
      console.log(`Executing trade: ${message}`)
      
      // Simulate trade execution
      setTimeout(() => {
        console.log(`Trade executed: ${message}`)
        // Update portfolio data after trade
        updatePortfolio({
          ...aiContext.portfolioData,
          lastTrade: {
            action: action.action,
            amount: action.amount,
            asset: action.asset,
            timestamp: new Date(),
            status: 'completed'
          }
        })
      }, 2000)
    }
  }

  const handlePortfolioAction = (action: any) => {
    console.log('Portfolio action:', action)
    
    switch (action.action) {
      case 'view':
        // Navigate to portfolio page or update context
        updateContext('portfolio')
        break
      case 'analyze':
        // Trigger portfolio analysis
        console.log('Analyzing portfolio...')
        break
      case 'rebalance':
        // Suggest rebalancing strategies
        console.log('Generating rebalancing suggestions...')
        break
      default:
        console.log('Unknown portfolio action:', action.action)
    }
  }

  const handleNavigationAction = (action: any) => {
    console.log('Navigation action:', action)
    
    if (action.type === 'navigation' && action.action === 'navigate') {
      // Map common page names to actual routes
      const pageMap: { [key: string]: string } = {
        'portfolio': '/portfolio',
        'defi': '/defi',
        'nft': '/nft',
        'dao': '/dao',
        'infrastructure': '/infrastructure',
        'multichain': '/multi-chain',
        'multi-chain': '/multi-chain',
        'gamefi': '/gamefi',
        'gaming': '/gamefi',
        'tools': '/web3-tools',
        'web3': '/web3-tools',
        'analysis': '/analysis',
        'analytics': '/analysis',
        'dashboard': '/',
        'home': '/'
      }
      
      const targetPage = pageMap[action.page.toLowerCase()]
      if (targetPage) {
        // In a real app, you'd use React Router's navigate function
        window.location.href = targetPage
      } else {
        console.log(`Unknown page: ${action.page}`)
      }
    }
  }

  const handleSettingsChange = (settings: any) => {
    console.log('Settings change:', settings)
    updatePreferences(settings)
  }

  return (
    <FloatingAIAssistant
      currentFeature={aiContext.currentFeature}
      contextData={aiContext.contextData}
      portfolioData={aiContext.portfolioData}
      userPreferences={aiContext.userPreferences}
      onTradeAction={handleTradeAction}
      onPortfolioAction={handlePortfolioAction}
      onNavigationAction={handleNavigationAction}
      onSettingsChange={handleSettingsChange}
    />
  )
}

export default FloatingAIWrapper
