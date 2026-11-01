import 'server-only'
import { encrypt, decrypt } from '@/lib/mi-universo'
const PREFIX = 'enc:v1:'
export function protect(text: string) { return PREFIX + encrypt({ text }) }
export function reveal(text: string) {
  if (!text.startsWith(PREFIX)) return text // Existing legacy messages remain readable, not silently migrated.
  const value = decrypt(text.slice(PREFIX.length)) as { text: string }
  return value.text
}
