-- ============================================
-- LIMPIAR ISSUES DE GONVARRI
-- ============================================
-- Este script borra todos los issues creados para Gonvarri
-- para empezar de cero con el bot de Teams

-- Ver cuántos issues hay actualmente
SELECT COUNT(*) as total_issues 
FROM issues 
WHERE organization_id = '01234567-8901-2345-6789-012345678901';

-- Ver los keys de los issues
SELECT key, title, state, origin, created_at
FROM issues 
WHERE organization_id = '01234567-8901-2345-6789-012345678901'
ORDER BY created_at DESC;

-- ============================================
-- BORRAR TODO (ejecutar solo si estás seguro)
-- ============================================

-- 1. Borrar primero las actividades relacionadas
DELETE FROM issue_activity 
WHERE organization_id = '01234567-8901-2345-6789-012345678901';

-- 2. Borrar los labels asociados
DELETE FROM issue_labels 
WHERE issue_id IN (
  SELECT id FROM issues 
  WHERE organization_id = '01234567-8901-2345-6789-012345678901'
);

-- 3. Borrar los links (Teams conversations)
DELETE FROM issue_links 
WHERE issue_id IN (
  SELECT id FROM issues 
  WHERE organization_id = '01234567-8901-2345-6789-012345678901'
);

-- 4. Finalmente borrar los issues
DELETE FROM issues 
WHERE organization_id = '01234567-8901-2345-6789-012345678901';

-- Verificar que se borraron
SELECT COUNT(*) as total_issues_remaining 
FROM issues 
WHERE organization_id = '01234567-8901-2345-6789-012345678901';

-- ============================================
-- RESULTADO: Debería mostrar 0 issues
-- ============================================

