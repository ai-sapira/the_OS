-- Ver todas las organizaciones y sus datos
SELECT 
  o.id,
  o.name,
  o.slug,
  (SELECT COUNT(*) FROM issues WHERE organization_id = o.id) as num_issues,
  (SELECT COUNT(*) FROM projects WHERE organization_id = o.id) as num_projects,
  (SELECT COUNT(*) FROM initiatives WHERE organization_id = o.id) as num_initiatives
FROM organizations o
ORDER BY o.name;
