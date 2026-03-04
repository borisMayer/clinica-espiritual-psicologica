# 🌿 Clínica Espiritual — Plataforma de Terapias Psicológicas Online

Plataforma web moderna para terapias psicológicas integradas con enfoque espiritual (teología cristiana y mística hebrea). Sesiones online, agenda inteligente, pagos seguros y dashboard de progreso personal.

---

## ✨ Funcionalidades MVP

- **Autenticación** — Email/password con JWT (NextAuth.js v5)
- **Agenda inteligente** — Slots en tiempo real, calendario FullCalendar
- **Pagos** — Mercado Pago (sesión única + paquetes), webhook automático
- **Video sesiones** — Daily.co, rooms privadas generadas on-demand
- **Dashboard paciente** — Historial, reportes, próximas sesiones
- **Chat seguro** — Mensajes encriptados paciente ↔ terapeuta
- **Notificaciones** — Email (Resend) + SMS (Twilio)
- **Compliance** — Datos sensibles encriptados AES-256, RLS en Postgres, GDPR

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js v5 + JWT |
| ORM | Prisma |
| Base de datos | Neon (Postgres serverless) |
| Pagos | Mercado Pago SDK |
| Video | Daily.co |
| Email | Resend |
| SMS | Twilio |
| Calendario | FullCalendar |
| Hosting | Vercel |

---

## 🚀 Setup Rápido

```bash
git clone https://github.com/borisMayer/clinica-espiritual-psicologica.git
cd clinica-espiritual-psicologica
bash setup.sh
cp .env.example .env.local  # completar credenciales
npx prisma generate && npx prisma db push
npm run dev
```

---

## 📁 Estructura del Proyecto

```
├── app/api/auth/register/     # POST registro paciente
├── app/api/appointments/slots/ # GET slots disponibles
├── app/api/payments/create/   # POST crear preferencia MP
├── app/api/payments/webhook/  # POST webhook Mercado Pago
├── app/api/sessions/start/    # POST iniciar sala Daily.co
├── lib/prisma.ts              # DB client singleton
├── lib/auth.ts                # NextAuth v5 config
├── lib/mercadopago.ts         # MP SDK setup
├── lib/daily.ts               # Daily.co API
├── lib/encryption.ts          # AES-256 datos sensibles
├── prisma/schema.prisma       # Schema completo (9 modelos)
├── middleware.ts              # Auth guard de rutas
├── docs/ARCHITECTURE.md       # Diagramas Mermaid + flujos
├── docs/schema.sql            # SQL raw para Neon
└── docs/DEPLOYMENT.md         # Guía paso a paso Vercel
```

---

## 🗺️ Flujo Principal

```
Registro → Login (JWT) → Ver agenda (slots) →
Reservar (PENDING) → Mercado Pago → Webhook (CONFIRMED) →
Daily.co room → Sesión → Reportes dashboard
```

---

## 🔐 Seguridad

- Notas clínicas y mensajes encriptados con **AES-256-GCM**
- **Row Level Security** en Postgres por rol
- JWT con expiración configurable
- Variables sensibles en `.env.local` (nunca en repo)

---

## 👥 Roles

| Rol | Permisos |
|-----|----------|
| `PATIENT` | Agendar, pagar, acceder a sus sesiones y reportes |
| `THERAPIST` | Gestionar agenda, sesiones, notas, chat |
| `ADMIN` | Acceso total |

📖 **Docs completas:** [ARCHITECTURE.md](docs/ARCHITECTURE.md) | [DEPLOYMENT.md](docs/DEPLOYMENT.md)
