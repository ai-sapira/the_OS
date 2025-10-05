-- ============================================
-- Script de Debug para Issues de Triage
-- ============================================
-- Este script te ayuda a verificar el estado de los issues
-- y diagnosticar problemas con la página de triage

-- ============================================
-- 1. Ver todos los issues recientes
-- ============================================
SELECT 
  i.key,
  i.title,
  i.state,
  i.origin,
  i.priority,
  i.snooze_until,
  i.created_at,
  i.triaged_at,
  init.name as initiative_name,
  p.name as project_name,
  u_assignee.name as assignee_name,
  u_reporter.name as reporter_name
FROM issues i
LEFT JOIN initiatives init ON init.id = i.initiative_id
LEFT JOIN projects p ON p.id = i.project_id
LEFT JOIN users u_assignee ON u_assignee.id = i.assignee_id
LEFT JOIN users u_reporter ON u_reporter.id = i.reporter_id
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
ORDER BY i.created_at DESC
LIMIT 20;

-- ============================================
-- 2. Issues en TRIAGE (los que deberían aparecer)
-- ============================================
SELECT 
  i.key,
  i.title,
  i.state,
  i.origin,
  i.snooze_until,
  CASE 
    WHEN i.snooze_until IS NULL THEN 'No snoozed'
    WHEN i.snooze_until < NOW() THEN 'Snooze expired (should appear)'
    ELSE 'Still snoozed (should NOT appear)'
  END as snooze_status,
  i.created_at
FROM issues i
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.state = 'triage'
ORDER BY i.created_at DESC;

-- ============================================
-- 3. Issues creados desde TEAMS
-- ============================================
SELECT 
  i.key,
  i.title,
  i.state,
  i.created_at,
  i.triaged_at,
  il.provider,
  il.url as teams_url,
  CASE 
    WHEN il.teams_context IS NOT NULL THEN 'Has Teams context (can receive messages)'
    ELSE 'No Teams context'
  END as teams_status
FROM issues i
LEFT JOIN issue_links il ON il.issue_id = i.id AND il.provider = 'teams'
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.origin = 'teams'
ORDER BY i.created_at DESC
LIMIT 10;

-- ============================================
-- 4. Issues CANCELADOS (rechazados en triage)
-- ============================================
SELECT 
  i.key,
  i.title,
  i.state,
  i.created_at,
  i.triaged_at,
  u.name as triaged_by,
  ia.action,
  ia.payload->>'reason' as decline_reason
FROM issues i
LEFT JOIN users u ON u.id = i.triaged_by_user_id
LEFT JOIN issue_activity ia ON ia.issue_id = i.id AND ia.action = 'declined'
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.state = 'canceled'
ORDER BY i.triaged_at DESC
LIMIT 10;

-- ============================================
-- 5. Issues ACEPTADOS (movidos de triage a todo)
-- ============================================
SELECT 
  i.key,
  i.title,
  i.state,
  i.priority,
  init.name as initiative,
  p.name as project,
  u_assignee.name as assignee,
  i.triaged_at,
  u_triage.name as triaged_by
FROM issues i
LEFT JOIN initiatives init ON init.id = i.initiative_id
LEFT JOIN projects p ON p.id = i.project_id
LEFT JOIN users u_assignee ON u_assignee.id = i.assignee_id
LEFT JOIN users u_triage ON u_triage.id = i.triaged_by_user_id
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.state = 'todo'
  AND i.triaged_at IS NOT NULL
ORDER BY i.triaged_at DESC
LIMIT 10;

-- ============================================
-- 6. Actividad reciente en triage
-- ============================================
SELECT 
  i.key,
  ia.action,
  ia.created_at,
  u.name as actor,
  ia.payload
FROM issue_activity ia
JOIN issues i ON i.id = ia.issue_id
LEFT JOIN users u ON u.id = ia.actor_user_id
WHERE ia.organization_id = '01234567-8901-2345-6789-012345678901'
  AND ia.action IN ('accepted', 'declined', 'snoozed', 'duplicated')
ORDER BY ia.created_at DESC
LIMIT 15;

-- ============================================
-- 7. Resumen de estados
-- ============================================
SELECT 
  state,
  COUNT(*) as count,
  COUNT(CASE WHEN origin = 'teams' THEN 1 END) as from_teams
FROM issues
WHERE organization_id = '01234567-8901-2345-6789-012345678901'
GROUP BY state
ORDER BY count DESC;

-- ============================================
-- 8. Buscar un issue específico por KEY
-- ============================================
-- Descomenta y reemplaza 'GON-XXX' con el key del issue que buscas
/*
SELECT 
  i.*,
  init.name as initiative_name,
  p.name as project_name,
  u_assignee.name as assignee_name,
  u_reporter.name as reporter_name,
  u_triage.name as triaged_by_name
FROM issues i
LEFT JOIN initiatives init ON init.id = i.initiative_id
LEFT JOIN projects p ON p.id = i.project_id
LEFT JOIN users u_assignee ON u_assignee.id = i.assignee_id
LEFT JOIN users u_reporter ON u_reporter.id = i.reporter_id
LEFT JOIN users u_triage ON u_triage.id = i.triaged_by_user_id
WHERE i.key = 'GON-XXX';

-- Ver las actividades de ese issue
SELECT * FROM issue_activity 
WHERE issue_id = (SELECT id FROM issues WHERE key = 'GON-XXX')
ORDER BY created_at;

-- Ver links de Teams de ese issue
SELECT * FROM issue_links 
WHERE issue_id = (SELECT id FROM issues WHERE key = 'GON-XXX');
*/

-- ============================================
-- 9. Verificar usuarios con permisos de triage
-- ============================================
SELECT 
  id,
  name,
  email,
  role,
  active
FROM users
WHERE organization_id = '01234567-8901-2345-6789-012345678901'
  AND role IN ('SAP', 'CEO', 'BU')
  AND active = true
ORDER BY role, name;

-- ============================================
-- 10. Issues problemáticos (en triage hace más de 7 días)
-- ============================================
SELECT 
  i.key,
  i.title,
  i.state,
  i.created_at,
  EXTRACT(DAY FROM (NOW() - i.created_at)) as days_in_triage,
  u.name as reporter
FROM issues i
LEFT JOIN users u ON u.id = i.reporter_id
WHERE i.organization_id = '01234567-8901-2345-6789-012345678901'
  AND i.state = 'triage'
  AND i.created_at < NOW() - INTERVAL '7 days'
ORDER BY i.created_at;

