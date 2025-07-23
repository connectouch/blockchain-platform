/**
 * Onboarding Flow Component for Connectouch Platform
 * Implements Phase 3 UX/UI Enhancement - Progressive User Onboarding
 */

import React, { useState, useEffect } from 'react'
import { authService } from '../../services/authService'
import { Spinner, ProgressBar } from '../ui/LoadingStates'
import './OnboardingFlow.css'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<OnboardingStepProps>
  isOptional?: boolean
  estimatedTime?: string
}

export interface OnboardingStepProps {
  onNext: () => void
  onPrevious: () => void
  onSkip?: () => void
  isLoading?: boolean
  stepData?: any
  setStepData?: (data: any) => void
}

export interface OnboardingFlowProps {
  onComplete: (userData: any) => void
  onSkip: () => void
  className?: string
}

/**
 * Welcome Step Component
 * Implements Rule #15 - Human-Centric Authoring
 */
const WelcomeStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  return (
    <div className="onboarding-step onboarding-step--welcome">
      <div className="onboarding-step__icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#4ECDC4" opacity="0.1"/>
          <path d="M32 16L40 24H36V40H28V24H24L32 16Z" fill="#4ECDC4"/>
        </svg>
      </div>
      <h2 className="onboarding-step__title">Welcome to Connectouch</h2>
      <p className="onboarding-step__description">
        Your AI-powered DeFi intelligence platform. Let's get you set up in just a few minutes 
        to unlock the full potential of blockchain analytics and trading insights.
      </p>
      <div className="onboarding-step__features">
        <div className="feature-item">
          <span className="feature-item__icon">📊</span>
          <span className="feature-item__text">Real-time market analytics</span>
        </div>
        <div className="feature-item">
          <span className="feature-item__icon">🤖</span>
          <span className="feature-item__text">AI-powered insights</span>
        </div>
        <div className="feature-item">
          <span className="feature-item__icon">🔗</span>
          <span className="feature-item__text">Multi-chain support</span>
        </div>
      </div>
      <button 
        className="onboarding-step__button onboarding-step__button--primary"
        onClick={onNext}
      >
        Get Started
      </button>
    </div>
  )
}

/**
 * Wallet Connection Step Component
 * Implements Rule #29 - Ground truth validation
 */
const WalletConnectionStep: React.FC<OnboardingStepProps> = ({ 
  onNext, 
  onPrevious, 
  onSkip,
  isLoading,
  stepData,
  setStepData 
}) => {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async (walletType: string) => {
    setConnecting(true)
    setError(null)

    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockWalletData = {
        address: '0x742d35Cc6634C0532925a3b8D4C2C4e0C8b83265',
        chainId: 1,
        walletType
      }

      setStepData?.({ ...stepData, wallet: mockWalletData })
      onNext()
    } catch (err) {
      setError('Failed to connect wallet. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="onboarding-step onboarding-step--wallet">
      <h2 className="onboarding-step__title">Connect Your Wallet</h2>
      <p className="onboarding-step__description">
        Connect your crypto wallet to access personalized portfolio analytics and trading features.
      </p>

      {error && (
        <div className="onboarding-step__error" role="alert">
          {error}
        </div>
      )}

      <div className="wallet-options">
        <button 
          className="wallet-option"
          onClick={() => connectWallet('metamask')}
          disabled={connecting}
        >
          <img src="/icons/metamask.svg" alt="MetaMask" className="wallet-option__icon" />
          <span className="wallet-option__name">MetaMask</span>
          <span className="wallet-option__description">Connect using MetaMask</span>
        </button>

        <button 
          className="wallet-option"
          onClick={() => connectWallet('walletconnect')}
          disabled={connecting}
        >
          <img src="/icons/walletconnect.svg" alt="WalletConnect" className="wallet-option__icon" />
          <span className="wallet-option__name">WalletConnect</span>
          <span className="wallet-option__description">Scan with mobile wallet</span>
        </button>

        <button 
          className="wallet-option"
          onClick={() => connectWallet('coinbase')}
          disabled={connecting}
        >
          <img src="/icons/coinbase.svg" alt="Coinbase Wallet" className="wallet-option__icon" />
          <span className="wallet-option__name">Coinbase Wallet</span>
          <span className="wallet-option__description">Connect with Coinbase</span>
        </button>
      </div>

      {connecting && (
        <div className="onboarding-step__loading">
          <Spinner text="Connecting wallet..." />
        </div>
      )}

      <div className="onboarding-step__actions">
        <button 
          className="onboarding-step__button onboarding-step__button--secondary"
          onClick={onPrevious}
          disabled={connecting}
        >
          Previous
        </button>
        <button 
          className="onboarding-step__button onboarding-step__button--ghost"
          onClick={onSkip}
          disabled={connecting}
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

/**
 * Preferences Setup Step Component
 * Implements Rule #17 - Modular architecture
 */
const PreferencesStep: React.FC<OnboardingStepProps> = ({ 
  onNext, 
  onPrevious,
  stepData,
  setStepData 
}) => {
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    defaultChain: 'ethereum',
    notifications: {
      email: false,
      push: true,
      trading: true,
      portfolio: true
    },
    dashboard: {
      layout: 'default',
      widgets: ['portfolio', 'trading', 'news', 'analytics']
    }
  })

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const handleNext = () => {
    setStepData?.({ ...stepData, preferences })
    onNext()
  }

  return (
    <div className="onboarding-step onboarding-step--preferences">
      <h2 className="onboarding-step__title">Customize Your Experience</h2>
      <p className="onboarding-step__description">
        Set up your preferences to personalize your Connectouch experience.
      </p>

      <div className="preferences-form">
        <div className="preference-group">
          <label className="preference-label">Theme</label>
          <div className="preference-options">
            <button 
              className={`preference-option ${preferences.theme === 'light' ? 'preference-option--active' : ''}`}
              onClick={() => handlePreferenceChange('theme', 'light')}
            >
              ☀️ Light
            </button>
            <button 
              className={`preference-option ${preferences.theme === 'dark' ? 'preference-option--active' : ''}`}
              onClick={() => handlePreferenceChange('theme', 'dark')}
            >
              🌙 Dark
            </button>
          </div>
        </div>

        <div className="preference-group">
          <label className="preference-label">Default Blockchain</label>
          <select 
            className="preference-select"
            value={preferences.defaultChain}
            onChange={(e) => handlePreferenceChange('defaultChain', e.target.value)}
          >
            <option value="ethereum">Ethereum</option>
            <option value="binance-smart-chain">Binance Smart Chain</option>
            <option value="polygon">Polygon</option>
            <option value="avalanche">Avalanche</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
        </div>

        <div className="preference-group">
          <label className="preference-label">Notifications</label>
          <div className="preference-checkboxes">
            <label className="preference-checkbox">
              <input 
                type="checkbox"
                checked={preferences.notifications.push}
                onChange={(e) => handleNotificationChange('push', e.target.checked)}
              />
              <span className="preference-checkbox__label">Push notifications</span>
            </label>
            <label className="preference-checkbox">
              <input 
                type="checkbox"
                checked={preferences.notifications.trading}
                onChange={(e) => handleNotificationChange('trading', e.target.checked)}
              />
              <span className="preference-checkbox__label">Trading alerts</span>
            </label>
            <label className="preference-checkbox">
              <input 
                type="checkbox"
                checked={preferences.notifications.portfolio}
                onChange={(e) => handleNotificationChange('portfolio', e.target.checked)}
              />
              <span className="preference-checkbox__label">Portfolio updates</span>
            </label>
          </div>
        </div>
      </div>

      <div className="onboarding-step__actions">
        <button 
          className="onboarding-step__button onboarding-step__button--secondary"
          onClick={onPrevious}
        >
          Previous
        </button>
        <button 
          className="onboarding-step__button onboarding-step__button--primary"
          onClick={handleNext}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

/**
 * Completion Step Component
 * Implements Rule #31 - Complete handling
 */
const CompletionStep: React.FC<OnboardingStepProps & { onComplete: (data: any) => void, stepData: any }> = ({ 
  onComplete,
  stepData 
}) => {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    
    try {
      // Save user data and preferences
      await new Promise(resolve => setTimeout(resolve, 1500))
      onComplete(stepData)
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="onboarding-step onboarding-step--completion">
      <div className="onboarding-step__icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#4ECDC4" opacity="0.1"/>
          <path d="M26 32L30 36L38 28" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="onboarding-step__title">You're All Set!</h2>
      <p className="onboarding-step__description">
        Welcome to Connectouch! Your personalized DeFi intelligence platform is ready to use.
      </p>

      <div className="completion-summary">
        <h3 className="completion-summary__title">What's Next?</h3>
        <ul className="completion-summary__list">
          <li>Explore your personalized dashboard</li>
          <li>Check out real-time market analytics</li>
          <li>Set up your first trading alerts</li>
          <li>Connect with DeFi protocols</li>
        </ul>
      </div>

      <button 
        className="onboarding-step__button onboarding-step__button--primary onboarding-step__button--large"
        onClick={handleComplete}
        disabled={isCompleting}
      >
        {isCompleting ? (
          <Spinner size="small" text="Setting up your account..." />
        ) : (
          'Enter Connectouch'
        )}
      </button>
    </div>
  )
}

/**
 * Main Onboarding Flow Component
 * Implements Rule #32 - Context engine integration
 */
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSkip,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepData, setStepData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Introduction to Connectouch',
      component: WelcomeStep,
      estimatedTime: '1 min'
    },
    {
      id: 'wallet',
      title: 'Connect Wallet',
      description: 'Link your crypto wallet',
      component: WalletConnectionStep,
      isOptional: true,
      estimatedTime: '2 min'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      component: PreferencesStep,
      estimatedTime: '2 min'
    },
    {
      id: 'completion',
      title: 'Complete',
      description: 'Finish setup',
      component: CompletionStep,
      estimatedTime: '1 min'
    }
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkipStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onSkip()
    }
  }

  const StepComponent = currentStepData.component

  return (
    <div className={`onboarding-flow ${className}`}>
      <div className="onboarding-flow__header">
        <div className="onboarding-flow__progress">
          <ProgressBar 
            progress={progress}
            text={`Step ${currentStep + 1} of ${steps.length}: ${currentStepData.title}`}
          />
        </div>
        <button 
          className="onboarding-flow__skip"
          onClick={onSkip}
          aria-label="Skip onboarding"
        >
          Skip Setup
        </button>
      </div>

      <div className="onboarding-flow__content">
        <StepComponent
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkipStep}
          isLoading={isLoading}
          stepData={stepData}
          setStepData={setStepData}
          {...(currentStep === steps.length - 1 && { onComplete })}
        />
      </div>

      <div className="onboarding-flow__footer">
        <div className="onboarding-flow__steps">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`onboarding-flow__step ${
                index === currentStep ? 'onboarding-flow__step--active' : ''
              } ${
                index < currentStep ? 'onboarding-flow__step--completed' : ''
              }`}
            >
              <span className="onboarding-flow__step-number">{index + 1}</span>
              <span className="onboarding-flow__step-title">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OnboardingFlow
