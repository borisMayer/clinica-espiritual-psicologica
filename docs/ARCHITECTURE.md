# 🏛️ Arquitectura — Clínica Espiritual de Terapias Psicológicas Online

## 1. High-Level Architecture

```mermaid
graph TB
  subgraph CLIENT["🌐 Cliente (Browser / Mobile)"]
    UI["Next.js 14 App Router<br/>React + Tailwind CSS"]
  end

  subgraph VERCEL["▲ Vercel (Serverless)"]
    API["Next.js API Routes<br/>/api/*"]
    AUTH["NextAuth.js<br/>JWT + Sessions"]
    EDGE["Edge Middleware<br/>Auth Guard / Rate Limit"]
  end

  subgraph SERVICES["🔌 Servicios Externos"]
    MP["Mercado Pago SDK<br/>Pagos + Webhooks"]
    DAILY["Daily.co<br/>Video Calls"]
    TWILIO["Twilio<br/>SMS + WhatsApp"]
    RESEND["Resend<br/>Emails transaccionales"]
    CAL["FullCalendar<br/>Agenda UI"]
  end

  subgraph DB["🗄️ Neon (Postgres Serverless)"]
    PG["PostgreSQL<br/>Prisma ORM"]
    subgraph TABLES["Tablas principales"]
      U["users"]
      A["appointments"]
      P["payments"]
      S["sessions"]
      M["messages"]
      N["notifications"]
    end
  end

  subgraph STORAGE["📁 Storage"]
    R2["Cloudflare R2<br/>Archivos / Reportes"]
  end

  UI --> EDGE
  EDGE --> AUTH
  EDGE --> API
  API --> PG
  API --> MP
  API --> DAILY
  API --> TWILIO
  API --> RESEND
  MP -->|"webhook /api/webhooks/mp"| API
  DAILY -->|"room URL"| UI
  PG --- TABLES
  API --> R2
```

---

## 2. Flujo de Datos Principal

```mermaid
sequenceDiagram
  participant P as 🧑 Paciente
  participant FE as Next.js Frontend
  participant API as API Routes
  participant DB as Neon Postgres
  participant MP as Mercado Pago
  participant D as Daily.co
  participant E as Email/SMS

  Note over P,E: ── REGISTRO ──
  P->>FE: Completa formulario registro
  FE->>API: POST /api/auth/register
  API->>DB: INSERT users
  API->>E: Email bienvenida
  API-->>FE: JWT token

  Note over P,E: ── AGENDA ──
  P->>FE: Ver slots disponibles
  FE->>API: GET /api/appointments/slots
  API->>DB: SELECT availability WHERE therapist_id
  API-->>FE: Slots libres
  P->>FE: Selecciona slot + terapeuta
  FE->>API: POST /api/appointments/create
  API->>DB: INSERT appointment (status=pending)

  Note over P,E: ── PAGO ──
  API->>MP: Crear preferencia de pago
  MP-->>API: preference_id + init_point URL
  FE->>P: Redirect a Mercado Pago
  P->>MP: Completa pago
  MP->>API: Webhook payment.approved
  API->>DB: UPDATE appointment SET status=confirmed
  API->>DB: INSERT payment record
  API->>E: Email confirmación paciente + terapeuta

  Note over P,E: ── SESIÓN ──
  P->>FE: Accede a sesión (post-login)
  FE->>API: POST /api/sessions/start
  API->>D: Create Daily.co room
  D-->>API: room URL + token
  API-->>FE: URL videollamada
  FE->>P: Abre sala de video
  API->>DB: INSERT session record
```

---

## 3. Stack Tecnológico Justificado

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Frontend | Next.js 14 (App Router) | SSR + SSG, SEO, file-based routing, deploy Vercel nativo |
| Auth | NextAuth.js v5 | JWT + sessions, providers Email/OAuth, integra Prisma |
| ORM | Prisma | Type-safe, migraciones, compatible Neon/Postgres |
| DB | Neon Postgres (serverless) | Branching, auto-scale, compatible Prisma, free tier generoso |
| Pagos | Mercado Pago SDK oficial | Requerido; soporta LATAM, webhooks, split payments |
| Video | Daily.co | API simple, SDK React, rooms temporales, sin infra propia |
| Email | Resend | Moderno, React Email templates, excelente deliverability |
| SMS | Twilio | Estándar industria, WhatsApp Business API disponible |
| Calendario | FullCalendar | Open-source, React component, agenda + disponibilidad |
| Storage | Cloudflare R2 | S3-compatible, barato, para reportes PDF y archivos |
| Hosting | Vercel | Serverless functions, edge, integración GitHub nativa |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, accesible, customizable |

---

## 4. Roles y Permisos

```
ADMIN
  ├── Gestionar terapeutas y pacientes
  ├── Ver todos los pagos y reportes
  ├── Configurar disponibilidad global
  └── Acceso total al sistema

THERAPIST  
  ├── Ver/gestionar sus propias citas
  ├── Iniciar sesiones de video
  ├── Crear notas clínicas y reportes
  ├── Chatear con pacientes asignados
  └── Ver su propio calendario

PATIENT
  ├── Ver slots disponibles y agendar
  ├── Pagar sesiones (Mercado Pago)
  ├── Acceder a sus sesiones (video/chat)
  ├── Ver su historial y reportes
  └── Mensajes con su terapeuta
```

---

## 5. Compliance GDPR/HIPAA-like

- **Encriptación en tránsito**: TLS 1.3 (Vercel + Neon)
- **Encriptación en reposo**: Neon encripta datos en disco
- **Datos sensibles**: Notas clínicas encriptadas con AES-256 (campo level)
- **Auditoría**: Tabla `audit_logs` con todas las acciones
- **Retención**: Política configurable, datos borrados bajo solicitud
- **Consentimiento**: Checkbox explícito en registro, guardado en DB
- **Acceso mínimo**: Row-level security (RLS) en Postgres por rol
- **Backups**: Neon point-in-time recovery automático
- **Videos**: Daily.co no graba por defecto; configurar end-to-end encryption

---

## 6. Estructura de Carpetas (Monorepo)

```
clinica-espiritual-psicologica/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Auth guard
│   │   ├── dashboard/page.tsx    # Patient dashboard
│   │   ├── agenda/page.tsx       # Calendario + reservas
│   │   ├── sesiones/page.tsx     # Video sessions
│   │   ├── mensajes/page.tsx     # Chat seguro
│   │   └── reportes/page.tsx     # Progreso y notas
│   ├── (admin)/
│   │   ├── layout.tsx            # Admin guard
│   │   ├── terapeutas/page.tsx
│   │   ├── pacientes/page.tsx
│   │   └── pagos/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── appointments/
│   │   │   ├── route.ts          # GET list, POST create
│   │   │   └── slots/route.ts    # GET available slots
│   │   ├── payments/
│   │   │   ├── create/route.ts   # POST - crear preferencia MP
│   │   │   └── webhook/route.ts  # POST - webhook MP
│   │   ├── sessions/
│   │   │   ├── start/route.ts    # POST - crear room Daily.co
│   │   │   └── end/route.ts      # POST - cerrar sesión
│   │   ├── messages/route.ts
│   │   └── users/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── calendar/                 # FullCalendar wrapper
│   ├── video/                    # Daily.co component
│   └── dashboard/
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth config
│   ├── mercadopago.ts            # MP SDK setup
│   ├── daily.ts                  # Daily.co API
│   ├── resend.ts                 # Email client
│   └── twilio.ts                 # SMS client
├── prisma/
│   ├── schema.prisma             # DB Schema
│   └── migrations/
├── emails/                       # React Email templates
│   ├── WelcomeEmail.tsx
│   ├── AppointmentConfirmed.tsx
│   └── SessionReminder.tsx
├── types/
│   └── index.ts
├── middleware.ts                 # Auth guard + rate limiting
├── .env.local                    # Variables de entorno
└── package.json
```
