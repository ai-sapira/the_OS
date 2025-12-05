-- Migration: Create FDE Conversations System
-- Date: 2025-01-04
-- Description: Adds support for multi-thread conversations between users and FDEs

-- ============================================================
-- 1. Create fde_conversations table
-- ============================================================

CREATE TABLE IF NOT EXISTS fde_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Slack thread tracking
  slack_thread_ts VARCHAR(50),
  slack_channel_id VARCHAR(50),
  
  -- Conversation metadata
  title VARCHAR(255) DEFAULT 'Nueva conversación',
  topic VARCHAR(100), -- Optional topic categorization
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'resolved', 'archived')),
  
  -- Participants
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  participant_ids UUID[] DEFAULT '{}',
  
  -- Preview/summary data for list view
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_sender VARCHAR(100),
  unread_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE fde_conversations IS 'Threads/conversations between org users and FDE team via Slack';
COMMENT ON COLUMN fde_conversations.slack_thread_ts IS 'Slack thread timestamp - unique identifier for the thread in Slack';
COMMENT ON COLUMN fde_conversations.status IS 'Conversation state: active (ongoing), pending (waiting for FDE), resolved (closed), archived';
COMMENT ON COLUMN fde_conversations.topic IS 'Optional categorization: support, billing, integration, feedback, etc.';

-- ============================================================
-- 2. Create indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_fde_conversations_org ON fde_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_fde_conversations_thread ON fde_conversations(slack_thread_ts) WHERE slack_thread_ts IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fde_conversations_status ON fde_conversations(status);
CREATE INDEX IF NOT EXISTS idx_fde_conversations_last_msg ON fde_conversations(organization_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_fde_conversations_creator ON fde_conversations(created_by) WHERE created_by IS NOT NULL;

-- Unique constraint: one thread per org+slack_thread combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_fde_conversations_org_thread 
  ON fde_conversations(organization_id, slack_thread_ts) 
  WHERE slack_thread_ts IS NOT NULL;

-- ============================================================
-- 3. Add conversation_id to fde_messages
-- ============================================================

-- First check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fde_messages' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE fde_messages 
    ADD COLUMN conversation_id UUID REFERENCES fde_conversations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Index for faster message lookup by conversation
CREATE INDEX IF NOT EXISTS idx_fde_messages_conversation ON fde_messages(conversation_id);

-- ============================================================
-- 4. Migrate existing messages to conversations
-- ============================================================

-- Create conversations for existing messages (group by thread or create one per org if no threads)
INSERT INTO fde_conversations (
  organization_id,
  slack_thread_ts,
  slack_channel_id,
  title,
  status,
  created_at,
  last_message,
  last_message_at,
  message_count
)
SELECT 
  m.organization_id,
  m.slack_thread_ts,
  MAX(m.slack_channel_id) as slack_channel_id,
  COALESCE(
    'Conversación de ' || TO_CHAR(MIN(m.created_at), 'DD Mon YYYY'),
    'Conversación inicial'
  ) as title,
  'active' as status,
  MIN(m.created_at) as created_at,
  (
    SELECT content FROM fde_messages sub 
    WHERE sub.organization_id = m.organization_id 
      AND COALESCE(sub.slack_thread_ts, 'none') = COALESCE(m.slack_thread_ts, 'none')
    ORDER BY created_at DESC LIMIT 1
  ) as last_message,
  MAX(m.created_at) as last_message_at,
  COUNT(*) as message_count
FROM fde_messages m
WHERE NOT EXISTS (
  SELECT 1 FROM fde_conversations c 
  WHERE c.organization_id = m.organization_id 
    AND COALESCE(c.slack_thread_ts, 'none') = COALESCE(m.slack_thread_ts, 'none')
)
GROUP BY m.organization_id, m.slack_thread_ts
ON CONFLICT DO NOTHING;

-- Update messages with their conversation_id
UPDATE fde_messages m
SET conversation_id = c.id
FROM fde_conversations c
WHERE m.organization_id = c.organization_id
  AND COALESCE(m.slack_thread_ts, 'none') = COALESCE(c.slack_thread_ts, 'none')
  AND m.conversation_id IS NULL;

-- ============================================================
-- 5. Triggers for automatic updates
-- ============================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fde_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_fde_conversations_updated_at ON fde_conversations;
CREATE TRIGGER trigger_update_fde_conversations_updated_at
  BEFORE UPDATE ON fde_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_fde_conversations_updated_at();

-- Update conversation when new message is added
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the conversation with new message info
  UPDATE fde_conversations
  SET 
    last_message = LEFT(NEW.content, 200),
    last_message_at = NEW.created_at,
    last_message_sender = NEW.sender_name,
    message_count = message_count + 1,
    -- Increment unread count only if message is from FDE
    unread_count = CASE 
      WHEN NEW.sender_type = 'fde' THEN unread_count + 1 
      ELSE unread_count 
    END,
    -- Update status based on who sent
    status = CASE
      WHEN NEW.sender_type = 'user' THEN 'pending'
      WHEN NEW.sender_type = 'fde' THEN 'active'
      ELSE status
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON fde_messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON fde_messages
  FOR EACH ROW
  WHEN (NEW.conversation_id IS NOT NULL)
  EXECUTE FUNCTION update_conversation_on_new_message();

-- ============================================================
-- 6. Row Level Security
-- ============================================================

ALTER TABLE fde_conversations ENABLE ROW LEVEL SECURITY;

-- Allow users to see conversations in their organizations
DROP POLICY IF EXISTS fde_conversations_org_select ON fde_conversations;
CREATE POLICY fde_conversations_org_select ON fde_conversations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to create conversations in their organizations
DROP POLICY IF EXISTS fde_conversations_org_insert ON fde_conversations;
CREATE POLICY fde_conversations_org_insert ON fde_conversations
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to update conversations in their organizations
DROP POLICY IF EXISTS fde_conversations_org_update ON fde_conversations;
CREATE POLICY fde_conversations_org_update ON fde_conversations
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- 7. Helper functions
-- ============================================================

-- Function to get or create a conversation for a thread
CREATE OR REPLACE FUNCTION get_or_create_fde_conversation(
  p_organization_id UUID,
  p_slack_thread_ts VARCHAR(50),
  p_slack_channel_id VARCHAR(50) DEFAULT NULL,
  p_title VARCHAR(255) DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM fde_conversations
  WHERE organization_id = p_organization_id
    AND slack_thread_ts = p_slack_thread_ts;
  
  -- If not found, create new one
  IF v_conversation_id IS NULL THEN
    INSERT INTO fde_conversations (
      organization_id,
      slack_thread_ts,
      slack_channel_id,
      title,
      created_by
    ) VALUES (
      p_organization_id,
      p_slack_thread_ts,
      p_slack_channel_id,
      COALESCE(p_title, 'Nueva conversación'),
      p_created_by
    )
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(p_conversation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE fde_conversations
  SET unread_count = 0
  WHERE id = p_conversation_id
    AND organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    );
    
  UPDATE fde_messages
  SET is_read = true
  WHERE conversation_id = p_conversation_id
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. Enable Realtime
-- ============================================================

-- Enable realtime for conversations table
ALTER PUBLICATION supabase_realtime ADD TABLE fde_conversations;


