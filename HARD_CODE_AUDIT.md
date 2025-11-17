# Auditoría de Hardcode y Dependencias Frágiles

## Middleware
- ✅ `middleware.ts` ahora distingue rutas públicas/privadas, fija la cookie `sapira-org-slug` y redirige sesiones activas hacia `/issues`.
- Pendiente: contemplar dominios personalizados (subdominios por organización) cuando los tengamos configurados.

## AuthProvider y selección de organización
- ✅ Persistimos la organización seleccionada en Supabase (`users.organization_id`) mediante `/api/auth/select-org` y la restablecemos al iniciar sesión.
- ✅ `/api/user/organizations` usa la sesión actual en lugar de `userId` por query string.
- Pendiente: mover la lista de organizaciones a un endpoint que filtre por slug/hostname para multi-tenant completo.

## Rutas y redirects
- ✅ `app/page.tsx` redirige a `/issues` cuando ya hay sesión.
- Pendiente: definir dashboards específicos por organización en lugar de `/issues` como fallback global.
- Pendiente: añadir guardas de UX en cada página cuando `currentOrg` sea nulo.

## Componentes que asumen datos
- Pendiente: revisar vistas (`projects`, `initiatives`, `users`, etc.) para que manejen la ausencia de `currentOrg` y eliminen IDs hardcodeados.
- Pendiente: revisar scripts/documentos de seeds para evitar IDs fijos en despliegues productivos.

## Variables de entorno
- ✅ Eliminados los fallbacks con claves públicas; ahora todas las entradas fallan en build si faltan las variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

## Admin App
- Pendiente: exponer (y consumir) metadata adicional de organización (branding, textos) para las landings.
- Pendiente: revisar el uso del `service_role` en las API del admin para añadir cache/paginación y endurecer permisos.

## Próximos pasos sugeridos
1. Diseñar un `OrgSettings` (tabla o vista) gestionado desde el Admin para branding y textos personalizados.
2. Integrar detección por dominio/hostname en el middleware (multi-tenant real con subdominios).
3. Añadir guardas en componentes privados para manejar `currentOrg` nulo y ofrecer selección guiada.
4. Refactorizar vistas principales (`issues`, `projects`, `initiatives`) para que dependan solo de datos filtrados por org.
5. Actualizar documentación en `docs/` con el flujo end-to-end (alta de org → dominios → landing → registro/login).
