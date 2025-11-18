-- Automation and Integration Tables
-- For n8n, HyperSwitch, and repository sync tracking

-- N8N Events Log
CREATE TABLE IF NOT EXISTS n8n_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_n8n_events_type ON n8n_events(event_type);
CREATE INDEX idx_n8n_events_processed ON n8n_events(processed, received_at);

-- Repository Sync Log
CREATE TABLE IF NOT EXISTS repository_syncs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_repo TEXT NOT NULL,
  target_repo TEXT DEFAULT 'sano1233/istani',
  commit_sha TEXT NOT NULL,
  commit_message TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, success, failed
  error_message TEXT,
  files_changed TEXT[],
  metadata JSONB
);

CREATE INDEX idx_repo_syncs_source ON repository_syncs(source_repo, synced_at DESC);
CREATE INDEX idx_repo_syncs_status ON repository_syncs(status);

-- Auto-Fix Log
CREATE TABLE IF NOT EXISTS auto_fixes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository TEXT NOT NULL,
  pr_number INTEGER,
  file_path TEXT,
  error_type TEXT,
  error_message TEXT,
  fix_applied TEXT,
  fixed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'success', -- success, failed, partial
  metadata JSONB
);

CREATE INDEX idx_auto_fixes_repo ON auto_fixes(repository, fixed_at DESC);
CREATE INDEX idx_auto_fixes_pr ON auto_fixes(pr_number);

-- Deployment Log
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository TEXT NOT NULL,
  environment TEXT NOT NULL, -- production, staging, development
  commit_sha TEXT NOT NULL,
  branch TEXT,
  deployed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, success, failed, rolling_back
  deployment_url TEXT,
  error_message TEXT,
  metadata JSONB
);

CREATE INDEX idx_deployments_repo ON deployments(repository, deployed_at DESC);
CREATE INDEX idx_deployments_status ON deployments(status);

-- HyperSwitch Payment Events
CREATE TABLE IF NOT EXISTS hyperswitch_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payment_id TEXT,
  payment_intent_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false
);

CREATE INDEX idx_hyperswitch_payment_id ON hyperswitch_events(payment_id);
CREATE INDEX idx_hyperswitch_intent_id ON hyperswitch_events(payment_intent_id);
CREATE INDEX idx_hyperswitch_processed ON hyperswitch_events(processed, received_at);

-- Repository Connections
CREATE TABLE IF NOT EXISTS repository_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_repo TEXT NOT NULL UNIQUE,
  target_repo TEXT DEFAULT 'sano1233/istani',
  enabled BOOLEAN DEFAULT true,
  auto_sync BOOLEAN DEFAULT true,
  auto_merge BOOLEAN DEFAULT true,
  auto_deploy BOOLEAN DEFAULT true,
  sync_schedule TEXT DEFAULT '*/15 * * * *', -- Cron expression
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  config JSONB
);

CREATE INDEX idx_repo_connections_enabled ON repository_connections(enabled, auto_sync);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for repository_connections
CREATE TRIGGER update_repository_connections_updated_at
  BEFORE UPDATE ON repository_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (if needed)
ALTER TABLE n8n_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hyperswitch_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to access all
CREATE POLICY "Service role can access all automation tables"
  ON n8n_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all automation tables"
  ON repository_syncs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all automation tables"
  ON auto_fixes FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all automation tables"
  ON deployments FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all automation tables"
  ON hyperswitch_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all automation tables"
  ON repository_connections FOR ALL
  USING (auth.role() = 'service_role');
