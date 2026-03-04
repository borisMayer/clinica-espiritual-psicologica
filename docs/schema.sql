-- ============================================================
-- CLÍNICA ESPIRITUAL — DB SCHEMA para Neon (PostgreSQL)
-- Compatible con Prisma ORM
-- ============================================================

-- EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('PATIENT', 'THERAPIST', 'ADMIN');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE payment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'IN_MEDIATION');
CREATE TYPE payment_type AS ENUM ('SINGLE_SESSION', 'PACKAGE_4', 'PACKAGE_8', 'PACKAGE_12');
CREATE TYPE session_type AS ENUM ('VIDEO', 'CHAT', 'HYBRID');
CREATE TYPE therapy_specialty AS ENUM ('BURNOUT_ESPIRITUAL', 'TERAPIA_FAMILIAR', 'SANACION_ALMA', 'TRANSFORMACION_PERSONAL', 'LIDERAZGO_ESPIRITUAL', 'DUELO', 'ANSIEDAD_ESPIRITUAL');
CREATE TYPE message_status AS ENUM ('SENT', 'DELIVERED', 'READ');
CREATE TYPE notification_type AS ENUM ('EMAIL', 'SMS', 'PUSH', 'WHATSAPP');

-- ============================================================
-- TABLA: users
-- ============================================================

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255),                          -- null si usa OAuth
  name              VARCHAR(255) NOT NULL,
  role              user_role NOT NULL DEFAULT 'PATIENT',
  phone             VARCHAR(20),
  avatar_url        VARCHAR(500),
  timezone          VARCHAR(100) DEFAULT 'America/Argentina/Buenos_Aires',
  language          VARCHAR(10) DEFAULT 'es',

  -- Campos específicos PACIENTE
  date_of_birth     DATE,
  emergency_contact VARCHAR(255),
  medical_notes     TEXT,                                  -- encriptado en app layer
  gdpr_consent      BOOLEAN NOT NULL DEFAULT FALSE,
  gdpr_consent_at   TIMESTAMP WITH TIME ZONE,

  -- Campos específicos TERAPEUTA
  bio               TEXT,
  specialties       therapy_specialty[],
  session_price     DECIMAL(10,2),
  session_duration  INTEGER DEFAULT 60,                    -- minutos
  is_verified       BOOLEAN DEFAULT FALSE,
  license_number    VARCHAR(100),

  -- Metadata
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at     TIMESTAMP WITH TIME ZONE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- TABLA: therapist_availability
-- Horarios disponibles del terapeuta (recurrentes)
-- ============================================================

CREATE TABLE therapist_availability (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom, 1=Lun...
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_availability_therapist ON therapist_availability(therapist_id);

-- ============================================================
-- TABLA: appointments
-- Citas agendadas (estado: pending → confirmed → completed)
-- ============================================================

CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  therapist_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  scheduled_at    TIMESTAMP WITH TIME ZONE NOT NULL,
  duration        INTEGER NOT NULL DEFAULT 60,              -- minutos
  status          appointment_status NOT NULL DEFAULT 'PENDING',
  session_type    session_type NOT NULL DEFAULT 'VIDEO',
  specialty       therapy_specialty,

  -- Video
  daily_room_url  VARCHAR(500),
  daily_room_name VARCHAR(255),
  daily_token_patient   TEXT,
  daily_token_therapist TEXT,

  -- Notas (encriptadas en app layer)
  patient_notes   TEXT,
  therapist_notes TEXT,                                    -- solo terapeuta puede ver
  session_summary TEXT,                                    -- resumen para paciente

  -- Cancelación
  cancelled_at    TIMESTAMP WITH TIME ZONE,
  cancelled_by    UUID REFERENCES users(id),
  cancel_reason   TEXT,

  -- Metadata
  reminder_sent   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_therapist ON appointments(therapist_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================================
-- TABLA: payments
-- Pagos procesados por Mercado Pago
-- ============================================================

CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id            UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  appointment_id        UUID REFERENCES appointments(id) ON DELETE SET NULL,

  -- Mercado Pago
  mp_preference_id      VARCHAR(255) UNIQUE,               -- ID preferencia MP
  mp_payment_id         VARCHAR(255) UNIQUE,               -- ID pago real MP
  mp_merchant_order_id  VARCHAR(255),
  mp_status             VARCHAR(50),                       -- approved, rejected...
  mp_status_detail      VARCHAR(100),

  -- Datos del pago
  amount                DECIMAL(10,2) NOT NULL,
  currency              VARCHAR(3) DEFAULT 'ARS',
  payment_type          payment_type NOT NULL DEFAULT 'SINGLE_SESSION',
  sessions_included     INTEGER DEFAULT 1,                 -- para paquetes
  sessions_used         INTEGER DEFAULT 0,

  -- Estado interno
  status                payment_status NOT NULL DEFAULT 'PENDING',
  paid_at               TIMESTAMP WITH TIME ZONE,
  refunded_at           TIMESTAMP WITH TIME ZONE,
  refund_reason         TEXT,

  -- Metadata
  metadata              JSONB DEFAULT '{}',                -- datos extra MP
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_mp_payment ON payments(mp_payment_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- TABLA: sessions
-- Registro de sesiones de video/chat realizadas
-- ============================================================

CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES users(id),
  therapist_id    UUID NOT NULL REFERENCES users(id),

  -- Tiempo real
  started_at      TIMESTAMP WITH TIME ZONE,
  ended_at        TIMESTAMP WITH TIME ZONE,
  duration_actual INTEGER,                                  -- minutos reales

  -- Daily.co
  daily_session_id  VARCHAR(255),
  recording_url     VARCHAR(500),                          -- si se graba (opcional)

  -- Estado
  patient_joined    BOOLEAN DEFAULT FALSE,
  therapist_joined  BOOLEAN DEFAULT FALSE,
  was_completed     BOOLEAN DEFAULT FALSE,

  -- Evaluación post-sesión
  patient_rating    SMALLINT CHECK (patient_rating BETWEEN 1 AND 5),
  patient_feedback  TEXT,

  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_appointment ON sessions(appointment_id);
CREATE INDEX idx_sessions_patient ON sessions(patient_id);

-- ============================================================
-- TABLA: messages
-- Chat seguro entre paciente y terapeuta
-- ============================================================

CREATE TABLE messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  content       TEXT NOT NULL,                             -- encriptado en app layer
  status        message_status DEFAULT 'SENT',
  is_deleted    BOOLEAN DEFAULT FALSE,

  sent_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at       TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, sent_at);

-- ============================================================
-- TABLA: notifications
-- Notificaciones enviadas (email, SMS)
-- ============================================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,

  type            notification_type NOT NULL,
  subject         VARCHAR(255),
  body            TEXT,
  template_id     VARCHAR(100),

  sent_at         TIMESTAMP WITH TIME ZONE,
  delivered_at    TIMESTAMP WITH TIME ZONE,
  failed_at       TIMESTAMP WITH TIME ZONE,
  error_message   TEXT,

  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

-- ============================================================
-- TABLA: audit_logs
-- Trazabilidad para compliance GDPR/HIPAA
-- ============================================================

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,                       -- 'VIEW_RECORD', 'UPDATE_USER', etc
  resource    VARCHAR(100),                                -- tabla afectada
  resource_id UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- TABLA: packages
-- Paquetes de sesiones comprados
-- ============================================================

CREATE TABLE packages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES users(id),
  payment_id      UUID NOT NULL REFERENCES payments(id),
  therapist_id    UUID REFERENCES users(id),               -- null = flexible

  total_sessions  INTEGER NOT NULL,
  used_sessions   INTEGER DEFAULT 0,
  expires_at      TIMESTAMP WITH TIME ZONE,                -- null = sin vencimiento
  is_active       BOOLEAN DEFAULT TRUE,

  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: próximas citas del paciente
CREATE VIEW v_upcoming_appointments AS
SELECT
  a.id,
  a.scheduled_at,
  a.status,
  a.session_type,
  a.specialty,
  a.daily_room_url,
  p.name AS patient_name,
  p.email AS patient_email,
  t.name AS therapist_name,
  t.avatar_url AS therapist_avatar,
  t.session_price
FROM appointments a
JOIN users p ON a.patient_id = p.id
JOIN users t ON a.therapist_id = t.id
WHERE a.status IN ('CONFIRMED', 'PENDING')
  AND a.scheduled_at > NOW()
ORDER BY a.scheduled_at ASC;

-- Vista: resumen de paciente (dashboard)
CREATE VIEW v_patient_summary AS
SELECT
  u.id AS patient_id,
  u.name,
  u.email,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'COMPLETED') AS total_sessions_completed,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status IN ('CONFIRMED','PENDING')) AS upcoming_sessions,
  SUM(pay.amount) FILTER (WHERE pay.status = 'APPROVED') AS total_paid,
  MAX(a.scheduled_at) FILTER (WHERE a.status = 'COMPLETED') AS last_session_at
FROM users u
LEFT JOIN appointments a ON u.id = a.patient_id
LEFT JOIN payments pay ON u.id = pay.patient_id
WHERE u.role = 'PATIENT'
GROUP BY u.id, u.name, u.email;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Paciente solo ve sus propios appointments
CREATE POLICY patient_appointments ON appointments
  FOR SELECT USING (
    patient_id = current_setting('app.current_user_id')::UUID
    OR therapist_id = current_setting('app.current_user_id')::UUID
  );

-- Mensajes: solo participantes del hilo
CREATE POLICY message_privacy ON messages
  FOR ALL USING (
    sender_id = current_setting('app.current_user_id')::UUID
    OR receiver_id = current_setting('app.current_user_id')::UUID
  );

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DATOS INICIALES (seed)
-- ============================================================

-- Admin por defecto
INSERT INTO users (email, name, role, is_active, email_verified_at)
VALUES ('admin@clinicaespiritual.com', 'Administrador', 'ADMIN', TRUE, NOW());
