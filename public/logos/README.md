# 📁 Directorio de Logos de Organizaciones

Este directorio contiene los logos de las diferentes organizaciones del sistema.

## 📋 Logos Actuales

- **Gonvarri:** `gonvarri.svg` o `gonvarri.png` (en `/public/gonvarri_vector.png`)
- **Aurovitas:** `aurovitas.jpg` (en `/public/aurovitas-logo.jpg`)
- **Cosermo:** `cosermo.jpg` ✅ (activo)

## 🎨 Convención de Nombres

Los logos deben seguir este patrón:
- Nombre del archivo: `{slug-organizacion}.svg` o `.png`
- Ejemplo: Si la organización tiene slug `"cosermo"`, el logo debe ser `cosermo.svg`

## 📏 Especificaciones Recomendadas

### **SVG (Preferido)**
- Formato vectorial, se escala sin perder calidad
- Tamaño: flexible
- Fondo: transparente

### **PNG (Alternativa)**
- Dimensiones: 200x200px mínimo, 400x400px recomendado (Retina)
- Fondo: transparente
- Formato: PNG-24 o PNG-8 con alpha

## 🔄 Cómo Añadir un Nuevo Logo

1. **Guardar el archivo:**
   ```bash
   cp /ruta/al/logo.svg /public/logos/{slug-org}.svg
   ```

2. **Actualizar la BD (opcional):**
   ```sql
   UPDATE organizations
   SET settings = settings || '{"logo": "/logos/{slug-org}.svg"}'::jsonb
   WHERE slug = '{slug-org}';
   ```

3. **Verificar:**
   - URL: `http://localhost:3000/logos/{slug-org}.svg`
   - Login y verifica que aparece en el header

## 📚 Documentación

- Setup Cosermo: `/SETUP_COSERMO.md`
- Instrucciones logo: `/COSERMO_LOGO_INSTRUCTIONS.md`
- Multi-tenant: `/MULTI_TENANT_SETUP.md`


