# Mi Universo — despliegue controlado
Este cambio se entrega en una rama de revisión. No fusionar ni usar con datos clínicos reales sin auditoría.
1. Generar una clave de 32 bytes: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` y guardarla en Vercel como MI_UNIVERSO_ENCRYPTION_KEY (nunca en Git).
2. Ejecutar migración de Prisma en base de pruebas, con respaldo y revisión previa.
3. IMPORTANTE: el build existente usa `prisma db push --accept-data-loss`. Cambiarlo antes de cualquier despliegue y separar migraciones de build.
4. Verificar autorización por roles, expiración y revocación de enlaces, concurrencia y auditoría.
5. Incorporar enlace de navegación a /admin/mi-universo tras validar el módulo.
6. Pendiente para producción: rate limiting distribuido, CSRF/origin checks, protección de URLs sensibles en logs, controles antiabuso, gestión de claves, política de retención, consentimiento formal y revisión normativa chilena.
No son instrumentos psicométricos validados ni generan diagnóstico automático.
