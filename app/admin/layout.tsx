'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const NAV_MAIN = [
  { href: '/admin/dashboard', label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/agenda', label: 'Agenda',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/admin/pacientes', label: 'Pacientes',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/admin/terapeutas', label: 'Terapeutas',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]
const NAV_GESTION = [
  { href: '/admin/pagos', label: 'Pagos',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { href: '/admin/reportes', label: 'Reportes',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
]

function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <path d={d}/>
    </svg>
  )
}

const S = {
  sidebar: (w: number): React.CSSProperties => ({
    width: w, background: '#071B14',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', height: '100vh', zIndex: 50,
    transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
    overflow: 'hidden', flexShrink: 0,
  }),
  logo: (collapsed: boolean): React.CSSProperties => ({
    padding: collapsed ? '18px 16px' : '18px 20px',
    borderBottom: '0.5px solid rgba(200,169,107,0.1)',
    display: 'flex', alignItems: 'center', gap: 10,
    minHeight: 64, flexShrink: 0, overflow: 'hidden',
  }),
  logoIcon: (): React.CSSProperties => ({
    width: 28, height: 28, flexShrink: 0,
    border: '1px solid rgba(200,169,107,0.55)',
    borderRadius: 7,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#C8A96B', fontSize: 13,
  }),
  profile: (collapsed: boolean): React.CSSProperties => ({
    padding: collapsed ? '14px 14px' : '14px 18px',
    borderBottom: '0.5px solid rgba(200,169,107,0.07)',
    display: 'flex', alignItems: 'center', gap: 10,
    flexShrink: 0, overflow: 'hidden',
  }),
  avatar: (): React.CSSProperties => ({
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg, #4a7c59, #C8A96B)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Serif Display', Georgia, serif",
    color: '#F7F4EE', fontSize: 14, flexShrink: 0, position: 'relative',
  }),
  navLink: (active: boolean, collapsed: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center',
    gap: collapsed ? 0 : 10,
    padding: collapsed ? '11px 0' : '9px 10px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    borderRadius: 8, marginBottom: 1,
    textDecoration: 'none', position: 'relative',
    background: active ? 'rgba(200,169,107,0.12)' : 'transparent',
    transition: 'background 0.15s',
  }),
  navIconColor: (active: boolean): React.CSSProperties => ({
    color: active ? '#C8A96B' : 'rgba(247,244,238,0.35)', display: 'flex',
  }),
  navLabel: (active: boolean): React.CSSProperties => ({
    fontSize: 12, whiteSpace: 'nowrap',
    color: active ? '#F7F4EE' : 'rgba(247,244,238,0.45)',
    fontWeight: active ? 500 : 400,
  }),
  activePill: (): React.CSSProperties => ({
    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
    width: 2, height: 16, background: '#C8A96B', borderRadius: '0 2px 2px 0',
  }),
  sectionLabel: (): React.CSSProperties => ({
    color: 'rgba(247,244,238,0.2)', fontSize: 8.5,
    letterSpacing: '0.13em', textTransform: 'uppercase' as const,
    padding: '12px 10px 5px',
  }),
  bottomLink: (): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 8px', borderRadius: 7,
    textDecoration: 'none', fontSize: 11,
    color: 'rgba(247,244,238,0.3)',
  }),
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const name = session?.user?.name ?? 'Admin'
  const initial = name[0]?.toUpperCase() ?? 'A'
  const W = collapsed ? 64 : 224
  const currentPage = [...NAV_MAIN, ...NAV_GESTION].find(i => pathname?.startsWith(i.href))?.label ?? 'Panel'

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#F7F4EE', fontFamily:"'DM Sans',system-ui,sans-serif"}}>

      {/* ── SIDEBAR ── */}
      <aside style={S.sidebar(W)}>

        {/* Collapse btn */}
        <button onClick={() => setCollapsed(c => !c)} aria-label="Colapsar menú" style={{
          position:'absolute', top:18, right:-10,
          width:20, height:20, background:'#071B14',
          border:'0.5px solid rgba(200,169,107,0.3)', borderRadius:'50%',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', color:'rgba(247,244,238,0.5)', fontSize:10, zIndex:60,
          fontFamily:'monospace',
        }}>
          {collapsed ? '›' : '‹'}
        </button>

        {/* Logo */}
        <div style={S.logo(collapsed)}>
          <div style={S.logoIcon()}>✦</div>
          {!collapsed && (
            <div style={{whiteSpace:'nowrap'}}>
              <div style={{fontFamily:"'DM Serif Display',Georgia,serif", color:'#F7F4EE', fontSize:13, lineHeight:1.2}}>
                Clínica del Alma
              </div>
              <div style={{color:'rgba(247,244,238,0.25)', fontSize:8.5, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:2}}>
                Panel profesional
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={S.profile(collapsed)}>
          <div style={S.avatar()}>
            {initial}
            <div style={{position:'absolute', bottom:1, right:1, width:8, height:8, background:'#4ade80', borderRadius:'50%', border:'1.5px solid #071B14'}} />
          </div>
          {!collapsed && (
            <div style={{minWidth:0, whiteSpace:'nowrap'}}>
              <div style={{color:'#F7F4EE', fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis'}}>{name}</div>
              <div style={{color:'rgba(247,244,238,0.3)', fontSize:9.5, marginTop:1}}>Logoterapeuta · Admin</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{padding:'10px', flex:1, overflowY:'auto', overflowX:'hidden'}}>
          {!collapsed && <div style={S.sectionLabel()}>Principal</div>}
          {NAV_MAIN.map(item => {
            const active = !!pathname?.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={S.navLink(active, collapsed)}>
                {active && <div style={S.activePill()} />}
                <span style={S.navIconColor(active)}><Icon d={item.icon} /></span>
                {!collapsed && <span style={S.navLabel(active)}>{item.label}</span>}
              </Link>
            )
          })}

          {!collapsed
            ? <div style={{...S.sectionLabel(), paddingTop:16}}>Gestión</div>
            : <div style={{height:10}} />
          }
          {NAV_GESTION.map(item => {
            const active = !!pathname?.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={S.navLink(active, collapsed)}>
                {active && <div style={S.activePill()} />}
                <span style={S.navIconColor(active)}><Icon d={item.icon} /></span>
                {!collapsed && <span style={S.navLabel(active)}>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{padding: collapsed ? '12px 8px' : '12px 14px', borderTop:'0.5px solid rgba(200,169,107,0.08)', flexShrink:0}}>
          <Link href="/" style={{...S.bottomLink(), justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 8}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0}}>
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            {!collapsed && <span>Sitio público</span>}
          </Link>
          <Link href="/api/auth/signout" style={{...S.bottomLink(), color:'rgba(247,244,238,0.25)', justifyContent: collapsed ? 'center' : 'flex-start', gap: collapsed ? 0 : 8}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{flexShrink:0}}>
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            {!collapsed && <span>Cerrar sesión</span>}
          </Link>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{
        marginLeft: W, flex:1,
        display:'flex', flexDirection:'column', minHeight:'100vh',
        transition:'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Topbar */}
        <header style={{
          height:52, background:'#F7F4EE',
          borderBottom:'0.5px solid rgba(7,27,20,0.07)',
          display:'flex', alignItems:'center',
          padding:'0 32px', gap:12,
          flexShrink:0, position:'sticky', top:0, zIndex:40,
        }}>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span style={{fontSize:12, color:'rgba(7,27,20,0.35)'}}>Clínica del Alma</span>
            <span style={{color:'rgba(7,27,20,0.2)', fontSize:11}}>›</span>
            <span style={{fontSize:12, color:'#071B14', fontWeight:500}}>{currentPage}</span>
          </div>
          <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:8}}>
            <Link href="/admin/agenda" style={{
              display:'flex', alignItems:'center', gap:5,
              padding:'7px 14px',
              background:'#071B14', color:'#F7F4EE',
              borderRadius:8, fontSize:12, fontWeight:500,
              textDecoration:'none',
            }}>
              <span style={{fontSize:16, lineHeight:1}}>+</span> Nueva sesión
            </Link>
          </div>
        </header>

        {/* Content */}
        <div style={{flex:1, padding:'32px', maxWidth:1200}}>
          {children}
        </div>
      </div>
    </div>
  )
}
