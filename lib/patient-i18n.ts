export const translations = {
 es: { dashboard:'Inicio', agenda:'Mi agenda', messages:'Mensajes', reports:'Mis reportes', tracking:'Mi seguimiento', preparation:'Preparar sesión', privacy:'Privacidad', language:'Idioma', accessibility:'Accesibilidad', skip:'Saltar al contenido', title:'Preferencias del portal', description:'Selecciona el idioma y revisa tus derechos de privacidad.', noExternal:'No se exportan datos clínicos automáticamente.' },
 en: { dashboard:'Home', agenda:'My appointments', messages:'Messages', reports:'My reports', tracking:'My progress', preparation:'Prepare session', privacy:'Privacy', language:'Language', accessibility:'Accessibility', skip:'Skip to content', title:'Portal preferences', description:'Choose your language and review your privacy rights.', noExternal:'Clinical data is never exported automatically.' },
} as const
export type Locale = keyof typeof translations
export function locale(value: string | null | undefined): Locale { return value === 'en' ? 'en' : 'es' }
