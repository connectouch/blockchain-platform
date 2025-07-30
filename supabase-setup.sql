-- Supabase Database Setup Script
-- Creates all necessary tables and functions for the platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create system_health table for monitoring
CREATE TABLE IF NOT EXISTS system_health (
  id SERIAL PRIMARY KEY,
  service_name VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL,
  response_time INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_message TEXT,
  last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crypto_prices_cache table for caching price data
CREATE TABLE IF NOT EXISTS crypto_prices_cache (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'latest',
  prices_data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nft_collections_cache table for caching NFT data
CREATE TABLE IF NOT EXISTS nft_collections_cache (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'latest',
  collections_data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_analysis_cache table for caching AI analysis
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_type VARCHAR(100) NOT NULL,
  input_data JSONB NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table for tracking user activity
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_data JSONB,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform_metrics table for analytics
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_system_health_updated_at ON system_health;
CREATE TRIGGER update_system_health_updated_at
  BEFORE UPDATE ON system_health
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crypto_prices_cache_updated_at ON crypto_prices_cache;
CREATE TRIGGER update_crypto_prices_cache_updated_at
  BEFORE UPDATE ON crypto_prices_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nft_collections_cache_updated_at ON nft_collections_cache;
CREATE TRIGGER update_nft_collections_cache_updated_at
  BEFORE UPDATE ON nft_collections_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_analysis_cache_updated_at ON ai_analysis_cache;
CREATE TRIGGER update_ai_analysis_cache_updated_at
  BEFORE UPDATE ON ai_analysis_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial system health records
INSERT INTO system_health (service_name, status, response_time, error_count, error_message)
VALUES 
  ('Database', 'healthy', 5, 0, NULL),
  ('CoinMarketCap API', 'healthy', 200, 0, NULL),
  ('Alchemy Blockchain', 'healthy', 150, 0, NULL),
  ('OpenAI GPT-4', 'healthy', 300, 0, NULL),
  ('Backend Server', 'healthy', 10, 0, NULL),
  ('Price Data API', 'healthy', 50, 0, NULL),
  ('Market Overview', 'healthy', 30, 0, NULL),
  ('DeFi Protocols', 'healthy', 40, 0, NULL)
ON CONFLICT (service_name) DO UPDATE SET
  status = EXCLUDED.status,
  response_time = EXCLUDED.response_time,
  error_count = EXCLUDED.error_count,
  error_message = EXCLUDED.error_message,
  last_check = NOW();

-- Insert initial crypto prices cache
INSERT INTO crypto_prices_cache (id, prices_data)
VALUES ('latest', '[
  {
    "symbol": "BTC",
    "name": "Bitcoin",
    "price": 43250.50,
    "price_change_24h": 1250.30,
    "price_change_percentage_24h": 2.98,
    "market_cap": 847500000000,
    "market_cap_rank": 1,
    "volume_24h": 28500000000,
    "circulating_supply": 19600000,
    "total_supply": 21000000,
    "max_supply": 21000000,
    "ath": 69000,
    "ath_change_percentage": -37.32,
    "ath_date": "2021-11-10T14:24:11.849Z",
    "atl": 67.81,
    "atl_change_percentage": 63650.45,
    "atl_date": "2013-07-06T00:00:00.000Z"
  },
  {
    "symbol": "ETH",
    "name": "Ethereum",
    "price": 2650.75,
    "price_change_24h": 85.20,
    "price_change_percentage_24h": 3.32,
    "market_cap": 318750000000,
    "market_cap_rank": 2,
    "volume_24h": 15200000000,
    "circulating_supply": 120280000,
    "total_supply": 120280000,
    "max_supply": null,
    "ath": 4878.26,
    "ath_change_percentage": -45.65,
    "ath_date": "2021-11-10T14:24:19.604Z",
    "atl": 0.432979,
    "atl_change_percentage": 612150.23,
    "atl_date": "2015-10-20T00:00:00.000Z"
  }
]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  prices_data = EXCLUDED.prices_data,
  updated_at = NOW();

-- Insert initial NFT collections cache
INSERT INTO nft_collections_cache (id, collections_data)
VALUES ('latest', '[
  {
    "id": "bored-ape-yacht-club",
    "name": "Bored Ape Yacht Club",
    "symbol": "BAYC",
    "contractAddress": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    "floorPrice": 12.5,
    "volume24h": 892.5,
    "change24h": 5.2,
    "owners": 5432,
    "totalSupply": 10000,
    "marketCap": 125000,
    "averagePrice": 15.7,
    "sales24h": 89,
    "chain": "ethereum",
    "verified": true,
    "image": "https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?auto=format&dpr=1&w=384",
    "description": "A collection of 10,000 unique Bored Ape NFTs",
    "rarityEnabled": true,
    "traits": []
  },
  {
    "id": "cryptopunks",
    "name": "CryptoPunks",
    "symbol": "PUNK",
    "contractAddress": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
    "floorPrice": 45.2,
    "volume24h": 1250.8,
    "change24h": -2.1,
    "owners": 3456,
    "totalSupply": 10000,
    "marketCap": 452000,
    "averagePrice": 52.3,
    "sales24h": 34,
    "chain": "ethereum",
    "verified": true,
    "image": "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqHgy_Jp9uv3iukP9H847yaGb_RBMIDxaUB3MfkRIKjOYzgI?auto=format&dpr=1&w=384",
    "description": "The original NFT collection on Ethereum",
    "rarityEnabled": true,
    "traits": []
  }
]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  collections_data = EXCLUDED.collections_data,
  updated_at = NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_health_service_name ON system_health(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON system_health(status);
CREATE INDEX IF NOT EXISTS idx_system_health_last_check ON system_health(last_check);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_cache_updated_at ON crypto_prices_cache(updated_at);
CREATE INDEX IF NOT EXISTS idx_nft_collections_cache_updated_at ON nft_collections_cache(updated_at);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_cache_type ON ai_analysis_cache(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_cache_created_at ON ai_analysis_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_name ON platform_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_recorded_at ON platform_metrics(recorded_at);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Enable Row Level Security (RLS) for security
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_prices_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_collections_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON system_health FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON crypto_prices_cache FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON nft_collections_cache FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON ai_analysis_cache FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON user_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON platform_metrics FOR SELECT USING (true);

-- Create policies for service role full access
CREATE POLICY "Allow service role full access" ON system_health FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON crypto_prices_cache FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON nft_collections_cache FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON ai_analysis_cache FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON user_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access" ON platform_metrics FOR ALL USING (auth.role() = 'service_role');
