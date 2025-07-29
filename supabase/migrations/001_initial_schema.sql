-- Connectouch Blockchain AI Platform - Initial Database Schema
-- Migration: 001_initial_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Cryptocurrency prices and market data
CREATE TABLE IF NOT EXISTS crypto_prices (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  price_change_24h DECIMAL(10,4),
  price_change_percentage_24h DECIMAL(10,4),
  market_cap BIGINT,
  market_cap_rank INTEGER,
  volume_24h BIGINT,
  circulating_supply BIGINT,
  total_supply BIGINT,
  max_supply BIGINT,
  ath DECIMAL(20,8),
  ath_change_percentage DECIMAL(10,4),
  ath_date TIMESTAMPTZ,
  atl DECIMAL(20,8),
  atl_change_percentage DECIMAL(10,4),
  atl_date TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol)
);

-- DeFi protocols data
CREATE TABLE IF NOT EXISTS defi_protocols (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  tvl BIGINT,
  tvl_change_24h DECIMAL(10,4),
  apy DECIMAL(8,4),
  category VARCHAR(50),
  chain VARCHAR(50),
  token_address VARCHAR(100),
  website_url VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, chain)
);

-- NFT collections data
CREATE TABLE IF NOT EXISTS nft_collections (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(20),
  contract_address VARCHAR(100) NOT NULL,
  chain VARCHAR(50) NOT NULL,
  floor_price DECIMAL(20,8),
  floor_price_change_24h DECIMAL(10,4),
  volume_24h DECIMAL(20,8),
  volume_change_24h DECIMAL(10,4),
  market_cap DECIMAL(20,8),
  total_supply INTEGER,
  owners_count INTEGER,
  description TEXT,
  image_url VARCHAR(255),
  external_url VARCHAR(255),
  discord_url VARCHAR(255),
  twitter_username VARCHAR(100),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contract_address, chain)
);

-- User portfolios
CREATE TABLE IF NOT EXISTS user_portfolios (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  total_value DECIMAL(20,8) DEFAULT 0,
  total_value_change_24h DECIMAL(10,4) DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio holdings
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id BIGSERIAL PRIMARY KEY,
  portfolio_id BIGINT REFERENCES user_portfolios(id) ON DELETE CASCADE,
  symbol VARCHAR(10) NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  average_price DECIMAL(20,8),
  current_price DECIMAL(20,8),
  total_value DECIMAL(20,8),
  profit_loss DECIMAL(20,8),
  profit_loss_percentage DECIMAL(10,4),
  wallet_address VARCHAR(100),
  chain VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI analysis results
CREATE TABLE IF NOT EXISTS ai_analysis (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL,
  input_data JSONB,
  result JSONB,
  confidence_score DECIMAL(3,2),
  model_used VARCHAR(50),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System health monitoring
CREATE TABLE IF NOT EXISTS system_health (
  id BIGSERIAL PRIMARY KEY,
  service_name VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time INTEGER,
  error_count INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  last_check TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark',
  currency VARCHAR(10) DEFAULT 'USD',
  language VARCHAR(10) DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  price_alerts BOOLEAN DEFAULT true,
  portfolio_alerts BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Price alerts
CREATE TABLE IF NOT EXISTS price_alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(10) NOT NULL,
  alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('above', 'below', 'change')),
  target_price DECIMAL(20,8),
  percentage_change DECIMAL(10,4),
  is_active BOOLEAN DEFAULT true,
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON crypto_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_last_updated ON crypto_prices(last_updated);
CREATE INDEX IF NOT EXISTS idx_defi_protocols_chain ON defi_protocols(chain);
CREATE INDEX IF NOT EXISTS idx_defi_protocols_category ON defi_protocols(category);
CREATE INDEX IF NOT EXISTS idx_nft_collections_chain ON nft_collections(chain);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON ai_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_system_health_service ON system_health(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_last_check ON system_health(last_check);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_symbol ON price_alerts(symbol);

-- Enable Row Level Security
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own portfolios
CREATE POLICY "Users can view own portfolios" ON user_portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios" ON user_portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON user_portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON user_portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own portfolio holdings
CREATE POLICY "Users can view own holdings" ON portfolio_holdings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_holdings.portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own holdings" ON portfolio_holdings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_holdings.portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own holdings" ON portfolio_holdings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_holdings.portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own holdings" ON portfolio_holdings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_holdings.portfolio_id 
      AND user_id = auth.uid()
    )
  );

-- Users can only access their own AI analysis
CREATE POLICY "Users can view own analysis" ON ai_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis" ON ai_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only access their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own price alerts
CREATE POLICY "Users can view own alerts" ON price_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON price_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON price_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON price_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Public read access for market data
CREATE POLICY "Public read access crypto prices" ON crypto_prices
  FOR SELECT USING (true);

CREATE POLICY "Public read access defi protocols" ON defi_protocols
  FOR SELECT USING (true);

CREATE POLICY "Public read access nft collections" ON nft_collections
  FOR SELECT USING (true);

CREATE POLICY "Public read access system health" ON system_health
  FOR SELECT USING (true);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_portfolios_updated_at 
  BEFORE UPDATE ON user_portfolios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at 
  BEFORE UPDATE ON portfolio_holdings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at 
  BEFORE UPDATE ON price_alerts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
