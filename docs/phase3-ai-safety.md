# Fase 3 — Seguridad y calidad de IA (revisión de diseño)
- **Alcance actual:** asistente de preguntas deterministas y resumen literal opcional; NO utiliza modelo generativo, APIs de IA ni inferencias clínicas.
- **Consentimiento:** por defecto desactivado. El resumen solo se devuelve a la cuenta del paciente tras activarlo; no se comparte automáticamente con profesionales ni con terceros.
- **Almacenamiento:** respuestas cifradas AES-256-GCM con clave existente MI_UNIVERSO_ENCRYPTION_KEY en registros nuevos AuditLog. No se ejecutan migraciones ni modificaciones de datos clínicos previos.
- **Acceso:** sesión PATIENT activa para GET/PUT; control Origin en PUT; no-cache, no-referrer. No se incluyen notas de historia clínica ni diario privado en resúmenes.
- **Limitaciones:** revocar el consentimiento impide mostrar nuevos resúmenes, pero no elimina registros históricos cifrados. La exportación mediante portapapeles es decisión del paciente.
- **Pendiente antes de producción:** pruebas de autorización cruzada, restauración y retención de datos, revisión de accesibilidad, controles de abuso, pruebas de compilación y aceptación clínica. No activar IA generativa sin evaluación de privacidad, sesgos, alucinaciones, riesgo de autolesión, supervisión humana y acuerdo con proveedor.
