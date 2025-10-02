-- Migration: Create surveys system
-- Description: Tables for surveys, questions, and responses

-- Enums for survey system
CREATE TYPE survey_status AS ENUM ('draft', 'active', 'closed', 'archived');
CREATE TYPE survey_audience AS ENUM ('all', 'bu_specific', 'role_specific');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'rating', 'text', 'yes_no');

-- Main surveys table
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Creator and audience
  creator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_audience survey_audience NOT NULL DEFAULT 'all',
  target_bu_id UUID REFERENCES initiatives(id) ON DELETE SET NULL,
  target_roles TEXT[], -- Array of user_role values like ['EMP', 'BU']
  
  -- Status and dates
  status survey_status NOT NULL DEFAULT 'draft',
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Configuration
  allow_anonymous BOOLEAN DEFAULT false,
  allow_multiple_responses BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey questions table
CREATE TABLE survey_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  
  -- Question details
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB, -- For multiple_choice options: ["Option 1", "Option 2", ...]
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey responses table
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  
  -- Responder info
  responder_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if anonymous
  
  -- Response data
  response_value TEXT,
  response_data JSONB, -- For complex responses
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_surveys_org ON surveys(organization_id);
CREATE INDEX idx_surveys_creator ON surveys(creator_user_id);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_target_bu ON surveys(target_bu_id);
CREATE INDEX idx_survey_questions_survey ON survey_questions(survey_id);
CREATE INDEX idx_survey_questions_order ON survey_questions(survey_id, order_index);
CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_question ON survey_responses(question_id);
CREATE INDEX idx_survey_responses_responder ON survey_responses(responder_user_id);

-- Trigger to update updated_at on surveys
CREATE OR REPLACE FUNCTION update_surveys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_surveys_updated_at();

-- Comments for documentation
COMMENT ON TABLE surveys IS 'Main table for surveys created by CEOs and BU Managers';
COMMENT ON TABLE survey_questions IS 'Questions belonging to each survey';
COMMENT ON TABLE survey_responses IS 'Individual responses to survey questions';
COMMENT ON COLUMN surveys.target_audience IS 'Defines who can see this survey: all employees, specific BU, or specific roles';
COMMENT ON COLUMN surveys.allow_anonymous IS 'If true, responder_user_id can be null in responses';
COMMENT ON COLUMN survey_questions.options IS 'JSON array of options for multiple_choice questions';


