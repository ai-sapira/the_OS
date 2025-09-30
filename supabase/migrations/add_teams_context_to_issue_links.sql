-- Migration: add_teams_context_to_issue_links
-- Adds JSON column to store Teams conversation reference for proactive messaging

-- Add teams_context column to issue_links table
ALTER TABLE issue_links
ADD COLUMN IF NOT EXISTS teams_context JSONB;

-- Add comment to document the column structure
COMMENT ON COLUMN issue_links.teams_context IS 
'Stores Teams conversation reference for proactive messaging.
Structure:
{
  "service_url": "https://smba.trafficmanager.net/emea/",
  "tenant_id": "xxx-xxx-xxx",
  "channel_id": "msteams",
  "conversation": {
    "id": "xxx",
    "isGroup": false,
    "conversationType": "personal",
    "tenantId": "xxx"
  },
  "bot": {
    "id": "28:xxx",
    "name": "Sapira"
  },
  "user": {
    "id": "29:xxx",
    "name": "User Name",
    "aadObjectId": "xxx"
  }
}';

-- Optional: Create index for faster queries on issues with Teams context
CREATE INDEX IF NOT EXISTS idx_issue_links_teams_context 
ON issue_links USING GIN (teams_context) 
WHERE teams_context IS NOT NULL;

-- Optional: Add check to ensure teams_context is only set for Teams provider
ALTER TABLE issue_links
DROP CONSTRAINT IF EXISTS teams_context_provider_check;

ALTER TABLE issue_links
ADD CONSTRAINT teams_context_provider_check 
CHECK (
  (provider = 'teams' AND teams_context IS NOT NULL) OR 
  (provider != 'teams' AND teams_context IS NULL) OR
  teams_context IS NULL
);
