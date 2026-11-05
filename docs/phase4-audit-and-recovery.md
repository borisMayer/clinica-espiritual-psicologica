# Fase 4 — Informe técnico preliminar (no certificación)
## Seguridad y privacidad
- Autenticación y autorización por rol para preferencias y exportación FHIR. No hay endpoint FHIR de escritura ni sincronización externa.
- FHIR: Bundle de lectura solicitado por el propio paciente, Patient y Observation de bienestar autodeclarado; el código local NO implica conformidad con perfiles clínicos nacionales. Validación FHIR externa pendiente.
- Internacionalización: traducción inicial del menú del portal y preferencias; el resto de páginas siguen en español. No afirmar localización completa.
- Accesibilidad: enlace de salto al contenido, navegación adaptable y etiquetas semánticas iniciales. Auditoría automatizada/manual WCAG 2.2 AA pendiente.
- Deuda crítica preexistente: next.config.js omite errores TypeScript/ESLint durante build. Requiere typecheck separado, revisión de dependencias, pruebas de roles y penetración.
- Los registros sensibles nuevos de fases anteriores usan AES-GCM, pero algunos campos históricos de historia clínica y mensajes antiguos permanecen sin cifrado de aplicación. Revisar permisos de BD, acceso a logs, retención y rotación de claves antes de procesar información clínica real.
## Carga y recuperación
- Se incluye un escenario k6 SOLO para una instancia aislada de staging con datos ficticios y autorización; nunca ejecutarlo sobre producción.
- Recuperación: habilitar snapshots/backups automáticos en Neon, PITR si está disponible; probar restauración en BD separada; verificar recuentos, integridad y claves de cifrado sin copiarlas a logs.
- No se han ejecutado pruebas de carga, restauración, pentest, accesibilidad formal ni certificación GDPR.
## Gates de producción
1. Build READY, typecheck y lint sin errores; pruebas automatizadas.
2. Pruebas de acceso cruzado, consentimientos, CSRF y descarga FHIR.
3. Prueba de restauración en entorno aislado, sin tocar BD de producción.
4. Revisión clínica y aprobación humana antes de promoción.
