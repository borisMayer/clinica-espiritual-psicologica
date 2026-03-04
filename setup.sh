#!/bin/bash
# ============================================================
# SETUP SCRIPT — Clínica Espiritual Psicológica
# Ejecutar: bash setup.sh
# ============================================================

echo "🌿 Iniciando setup de Clínica Espiritual..."

# 1. Crear proyecto Next.js
npx create-next-app@latest clinica-espiritual-psicologica \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

cd clinica-espiritual-psicologica

# 2. Instalar dependencias core
npm install \
  @prisma/client \
  prisma \
  next-auth@beta \
  @auth/prisma-adapter \
  @mercadopago/sdk-js \
  @daily-co/daily-js \
  resend \
  twilio \
  @fullcalendar/react \
  @fullcalendar/daygrid \
  @fullcalendar/timegrid \
  @fullcalendar/interaction \
  bcryptjs \
  jsonwebtoken \
  zod \
  react-hook-form \
  @hookform/resolvers \
  date-fns \
  axios \
  clsx \
  tailwind-merge

# 3. shadcn/ui
npx shadcn@latest init --defaults
npx shadcn@latest add button card input label select textarea badge avatar dialog sheet tabs toast

# 4. Dev dependencies
npm install -D \
  @types/bcryptjs \
  @types/jsonwebtoken \
  @types/node

# 5. Prisma init
npx prisma init

echo "✅ Dependencias instaladas"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Copia .env.example → .env.local y completa las variables"
echo "2. npx prisma db push"
echo "3. npx prisma generate"
echo "4. npm run dev"
