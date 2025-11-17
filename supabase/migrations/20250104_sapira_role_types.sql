-- Migration: Add Sapira role types for SAP users
-- Description: Allows SAP users to have specific role types (FDE, Advisory Lead, Account Manager)
--              Only users with @sapira.ai email can have SAP role

-- 1. Add sapira_role_type column to user_organizations
ALTER TABLE user_organizations
ADD COLUMN IF NOT EXISTS sapira_role_type TEXT CHECK (
  (role = 'SAP' AND sapira_role_type IN ('FDE', 'ADVISORY_LEAD', 'ACCOUNT_MANAGER'))
  OR (role != 'SAP' AND sapira_role_type IS NULL)
);

-- 2. Add sapira_role_type column to user_invitations (for tracking invitations)
ALTER TABLE user_invitations
ADD COLUMN IF NOT EXISTS sapira_role_type TEXT CHECK (
  (role = 'SAP' AND sapira_role_type IN ('FDE', 'ADVISORY_LEAD', 'ACCOUNT_MANAGER'))
  OR (role != 'SAP' AND sapira_role_type IS NULL)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_orgs_sapira_role_type 
ON user_organizations(sapira_role_type) 
WHERE sapira_role_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_invitations_sapira_role_type 
ON user_invitations(sapira_role_type) 
WHERE sapira_role_type IS NOT NULL;

-- 4. Add comments for documentation
COMMENT ON COLUMN user_organizations.sapira_role_type IS 
'Type of Sapira role (FDE, ADVISORY_LEAD, ACCOUNT_MANAGER). Only applicable when role = SAP.';

COMMENT ON COLUMN user_invitations.sapira_role_type IS 
'Type of Sapira role for invitation (FDE, ADVISORY_LEAD, ACCOUNT_MANAGER). Only applicable when role = SAP.';

