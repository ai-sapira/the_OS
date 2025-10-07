# 🎨 Añadir Logo de Cosermo

Instrucciones para añadir el logo de Cosermo cuando lo tengas disponible.

---

## 📁 Paso 1: Guardar el Archivo del Logo

1. **Ubicación recomendada:**
   ```
   /public/logos/cosermo.svg    (preferido - vectorial)
   ```
   o
   ```
   /public/logos/cosermo.png    (alternativa - bitmap)
   ```

2. **Formatos soportados:**
   - ✅ **SVG** (recomendado) - se escala sin perder calidad
   - ✅ **PNG** - buena calidad, fondo transparente
   - ⚠️ **JPG** - no recomendado (sin transparencia)

3. **Dimensiones recomendadas:**
   - SVG: cualquier tamaño (se escala automáticamente)
   - PNG: 200x200px o 400x400px (para pantallas Retina)

---

## 🗄️ Paso 2: Actualizar Base de Datos (Opcional)

Si quieres almacenar la referencia del logo en la BD:

```sql
UPDATE organizations
SET settings = settings || '{"logo": "/logos/cosermo.svg"}'::jsonb
WHERE id = '33333333-3333-3333-3333-333333333333';
```

Verifica:
```sql
SELECT name, settings->'logo' as logo_path
FROM organizations
WHERE slug = 'cosermo';
```

---

## 🎨 Paso 3: Actualizar el Frontend (Si es necesario)

### **Opción A: Si el sistema ya muestra logos automáticamente**

Simplemente guarda el archivo en `/public/logos/cosermo.svg` y el sistema lo detectará.

### **Opción B: Si necesitas configurar manualmente**

Busca el componente que muestra logos de organizaciones (probablemente en `components/header.tsx` o `components/organization-list.tsx`) y verifica que use la ruta correcta.

Ejemplo de código que podría estar ya implementado:
```tsx
const logoPath = organization.settings?.logo || `/logos/${organization.slug}.svg`;

<img src={logoPath} alt={organization.name} />
```

---

## 🔍 Verificación

1. **Verifica que el archivo existe:**
   ```bash
   ls -la /Users/pablosenabre/Sapira/the_OS/public/logos/cosermo.*
   ```

2. **Prueba en el navegador:**
   ```
   http://localhost:3000/logos/cosermo.svg
   ```
   Debería mostrar el logo directamente.

3. **Login y verifica:**
   - Login: `ceo@cosermo.com` / `cosermo123`
   - El logo debería aparecer en el header o selector de org

---

## 📂 Estructura de Logos Actual

```
/public/logos/
├── gonvarri.svg (o .png)
├── aurovitas.svg (o .png)
├── cosermo.svg ⬅️ Tu nuevo logo aquí
└── ...
```

---

## 🎨 Ejemplo de Logo SVG Simple (Placeholder)

Si necesitas un logo temporal mientras preparas el real:

```svg
<!-- /public/logos/cosermo.svg -->
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#4A90E2"/>
  <text x="50" y="55" font-size="24" fill="white" text-anchor="middle" font-family="Arial">C</text>
</svg>
```

---

## 🔧 Comando Rápido (Cuando tengas el logo)

```bash
# Copiar logo a la ubicación correcta
cp /ruta/al/logo-cosermo.svg /Users/pablosenabre/Sapira/the_OS/public/logos/cosermo.svg

# Verificar
ls -la /Users/pablosenabre/Sapira/the_OS/public/logos/
```

---

## ⚙️ Configuración Avanzada (Opcional)

Si quieres configuraciones más específicas del logo:

```sql
UPDATE organizations
SET settings = settings || '{
  "logo": "/logos/cosermo.svg",
  "logo_dark": "/logos/cosermo-dark.svg",
  "logo_small": "/logos/cosermo-icon.svg"
}'::jsonb
WHERE id = '33333333-3333-3333-3333-333333333333';
```

Esto permitiría:
- Logo diferente para modo oscuro
- Icono pequeño para el header
- Logo grande para pantallas de login

---

## 📝 Checklist

- [ ] Logo guardado en `/public/logos/cosermo.svg` (o `.png`)
- [ ] Archivo accesible en `http://localhost:3000/logos/cosermo.svg`
- [ ] Base de datos actualizada (opcional)
- [ ] Logo visible en el header al hacer login
- [ ] Logo visible en selector de organizaciones (si aplica)

---

## 🐛 Troubleshooting

### **El logo no se muestra**
1. Verifica que el archivo existe en `/public/logos/`
2. Verifica que el nombre sea exactamente `cosermo.svg` (minúsculas)
3. Limpia cache del navegador (Ctrl+Shift+R)
4. Verifica permisos del archivo: `chmod 644 public/logos/cosermo.svg`

### **El logo se ve pixelado**
- Usa SVG en lugar de PNG
- Si usas PNG, asegúrate de que sea al menos 400x400px

### **404 Not Found al acceder al logo**
- Verifica que esté en `/public/` (no en `/src/` ni otra carpeta)
- Reinicia el servidor de desarrollo: `pnpm dev`

---

## 📚 Archivos Relacionados

- **Setup completo:** `/SETUP_COSERMO.md`
- **Script SQL:** `/scripts/setup-cosermo.sql`
- **Logos existentes:** `/public/logos/`

---

**Cuando tengas el logo listo, avísame y te ayudo a integrarlo! 🎨**


