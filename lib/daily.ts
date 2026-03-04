// lib/daily.ts — Daily.co Video Rooms
export async function createDailyRoom(appointmentId: string, expiresAt: Date) {
  const res = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `sesion-${appointmentId}`,
      privacy: 'private',
      properties: {
        exp: Math.floor(expiresAt.getTime() / 1000),
        max_participants: 2,
        enable_chat: true,
        enable_screenshare: false,
        lang: 'es',
      },
    }),
  })
  if (!res.ok) throw new Error('Error creando sala Daily.co')
  return res.json()
}

export async function createDailyToken(roomName: string, userId: string, isOwner: boolean) {
  const res = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_id: userId,
        is_owner: isOwner,
        exp: Math.floor((Date.now() + 2 * 60 * 60 * 1000) / 1000),
      },
    }),
  })
  if (!res.ok) throw new Error('Error creando token Daily.co')
  const data = await res.json()
  return data.token as string
}
