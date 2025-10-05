-- ============================================
-- Enable RLS on All Tables
-- ============================================
-- Las políticas existen pero RLS no está habilitado
-- Esto causa que las inserciones fallen

-- Enable RLS on core tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Enable RLS on issues tables (CRÍTICO para el bot)
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_labels ENABLE ROW LEVEL SECURITY;

-- Enable RLS on surveys tables
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Verificar que RLS está habilitado
DO $$
BEGIN
  RAISE NOTICE 'RLS enabled on all tables';
END $$;

