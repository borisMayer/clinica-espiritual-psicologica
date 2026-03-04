# 🚀 Guía de Deployment — Clínica Espiritual Psicológica

## PASO 1 — Neon Database

1. Ir a [console.neon.tech](https://console.neon.tech) → Crear cuenta
2. **New Project** → Nombre: `clinica-espiritual`
3. Region: **US East** (o la más cercana)
4. Copiar la **Connection string** (formato: `postgresql://user:pass@ep-xxx.neon.tech/clinica`)
5. En el panel SQL, ejecutar el archivo `schema.sql` completo
6. Guardar ambas URLs (pooled y direct) para `.env.local`

```
DATABASE_URL=postgresql://...?pgbouncer=true    ← Para runtime (pooled)
DIRECT_URL=postgresql://...                      ← Para migraciones
```

---

## PASO 2 — GitHub Repository

```bash
# Clonar el repo existente
git clone https://github.com/borisMayer/clinica-espiritual-psicologica.git
cd clinica-espiritual-psicologica

# Instalar dependencias
bash setup.sh

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales reales

# Inicializar Prisma
npx prisma generate
npx prisma db push   # Solo para desarrollo inicial

# Verificar que conecta a Neon
npx prisma studio    # Abre UI visual de la DB

# Primer commit con boilerplate
git add .
git commit -m "feat: Next.js boilerplate + Prisma schema + API routes"
git push origin main
```

---

## PASO 3 — Mercado Pago

1. Ir a [mercadopago.com.ar](https://www.mercadopago.com.ar) → Crear cuenta business
2. **Mis aplicaciones** → Nueva aplicación: `clinica-espiritual`
3. Copiar credenciales de **TEST** primero:
   - `MP_ACCESS_TOKEN` = `TEST-xxxx...`
   - `MP_PUBLIC_KEY` = `TEST-xxxx...`
4. Configurar webhook en MP Dashboard:
   - URL: `https://tu-dominio.vercel.app/api/payments/webhook`
   - Eventos: `payment`
5. Para producción: solicitar activación de cuenta y usar credenciales `APP_USR-...`

**Test cards para desarrollo:**
```
Visa:       4509 9535 6623 3704 | CVV: 123 | Venc: 11/25
Mastercard: 5031 7557 3453 0604 | CVV: 123 | Venc: 11/25
```

---

## PASO 4 — Daily.co (Video)

1. Crear cuenta en [dashboard.daily.co](https://dashboard.daily.co)
2. **Developers** → API Key → Copiar
3. **Domain**: será `tu-nombre.daily.co`
4. Agregar al `.env.local`:
   ```
   DAILY_API_KEY=xxxxx
   DAILY_DOMAIN=tu-nombre.daily.co
   ```
5. Plan gratis: hasta 2000 minutos/mes (suficiente para MVP)

---

## PASO 5 — Resend (Email)

1. Crear cuenta en [resend.com](https://resend.com)
2. **API Keys** → Crear → Copiar
3. **Domains** → Agregar tu dominio y verificar DNS
4. Plan gratis: 3000 emails/mes
5. Agregar al `.env.local`:
   ```
   RESEND_API_KEY=re_xxxx
   RESEND_FROM_EMAIL=noreply@tudominio.com
   ```

---

## PASO 6 — Vercel Deployment

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy inicial (desde la carpeta del proyecto)
vercel

# Configurar variables de entorno en Vercel Dashboard:
# Project → Settings → Environment Variables
# Agregar TODAS las variables de .env.local
```

**Variables CRÍTICAS en Vercel:**
```
DATABASE_URL
DIRECT_URL
NEXTAUTH_SECRET
NEXTAUTH_URL          ← URL de producción: https://clinica-xxx.vercel.app
MP_ACCESS_TOKEN
MP_PUBLIC_KEY
DAILY_API_KEY
RESEND_API_KEY
ENCRYPTION_KEY
```

**Conectar GitHub para auto-deploy:**
1. Vercel Dashboard → Project → Settings → Git
2. Conectar repositorio `borisMayer/clinica-espiritual-psicologica`
3. Branch: `main` → cada push hace deploy automático

---

## PASO 7 — Post-deployment

```bash
# Verificar que Prisma puede conectar a Neon en producción
# (Ejecutar desde local apuntando a prod)
DATABASE_URL="tu-url-neon" npx prisma db push

# Correr seed inicial
npx prisma db seed
```

---

## Checklist Final Pre-Launch

- [ ] Variables de entorno configuradas en Vercel
- [ ] Neon DB schema aplicado
- [ ] Webhook MP apuntando a URL de producción
- [ ] Daily.co API key configurada
- [ ] Email de bienvenida probado con Resend
- [ ] SSL/HTTPS activo (Vercel lo hace automático)
- [ ] Dominio personalizado configurado en Vercel
- [ ] NEXTAUTH_URL actualizado con dominio real
- [ ] Test de pago completo con tarjeta de prueba
- [ ] Test de videollamada entre dos usuarios
