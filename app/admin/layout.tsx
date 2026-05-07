'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', section: 'principal' },
  { href: '/admin/agenda', icon: 'ti-calendar-event', label: 'Agenda', section: 'principal' },
  { href: '/admin/pacientes', icon: 'ti-users', label: 'Pacientes', section: 'principal' },
  { href: '/admin/terapeutas', icon: 'ti-stethoscope', label: 'Terapeutas', section: 'principal' },
  { href: '/admin/pagos', icon: 'ti-credit-card', label: 'Pagos', section: 'gestion' },
  { href: '/admin/reportes', icon: 'ti-chart-bar', label: 'Reportes', section: 'gestion' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const name = session?.user?.name ?? 'Admin'
  const initial = name[0]?.toUpperCase() ?? 'A'

  return (
    <>
      {/* Tabler Icons CDN */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        .admin-root { display: flex; min-height: 100vh; background: #F7F4EE; font-family: 'DM Sans', sans-serif; }

        /* Sidebar */
        .admin-sidebar {
          width: ${collapsed ? '64px' : '224px'};
          background: #071B14;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 50;
          transition: width 0.2s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
        }

        .sidebar-logo {
          padding: ${collapsed ? '20px 14px' : '20px 20px'};
          border-bottom: 0.5px solid rgba(200,169,107,0.12);
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          white-space: nowrap;
          min-height: 68px;
        }

        .logo-icon {
          width: 28px; height: 28px;
          border: 1px solid rgba(200,169,107,0.6);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 12px; color: #C8A96B;
        }
        .logo-text { opacity: ${collapsed ? '0' : '1'}; transition: opacity 0.15s; }
        .logo-name { font-family: 'DM Serif Display', serif; color: #F7F4EE; font-size: 13px; line-height: 1.2; }
        .logo-sub { color: rgba(247,244,238,0.25); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }

        .sidebar-profile {
          padding: ${collapsed ? '14px' : '16px 20px'};
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 0.5px solid rgba(200,169,107,0.08);
          flex-shrink: 0;
          overflow: hidden;
          white-space: nowrap;
        }

        .sidebar-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a7c59, #C8A96B);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Serif Display', serif;
          color: #F7F4EE; font-size: 13px;
          flex-shrink: 0;
          position: relative;
        }
        .online-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 8px; height: 8px;
          background: #4ade80; border-radius: 50%;
          border: 1.5px solid #071B14;
        }
        .profile-text { opacity: ${collapsed ? '0' : '1'}; transition: opacity 0.15s; min-width: 0; }
        .profile-name { color: #F7F4EE; font-size: 12px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; }
        .profile-role { color: rgba(247,244,238,0.3); font-size: 9px; margin-top: 1px; }

        .sidebar-nav { padding: 10px 10px; flex: 1; overflow-y: auto; overflow-x: hidden; }
        .sidebar-nav::-webkit-scrollbar { width: 0; }

        .nav-section {
          color: rgba(247,244,238,0.2);
          font-size: 8px; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 10px 10px 4px;
          white-space: nowrap;
          opacity: ${collapsed ? '0' : '1'};
          transition: opacity 0.1s;
          height: ${collapsed ? '0' : 'auto'};
          overflow: hidden;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: ${collapsed ? '0' : '10px'};
          padding: ${collapsed ? '10px 0' : '8px 10px'};
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          border-radius: 8px;
          margin-bottom: 1px;
          text-decoration: none;
          position: relative;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .nav-link:hover { background: rgba(200,169,107,0.08); }
        .nav-link.active { background: rgba(200,169,107,0.12); }
        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 50%; transform: translateY(-50%);
          width: 2px; height: 16px;
          background: #C8A96B;
          border-radius: 0 2px 2px 0;
        }
        .nav-icon {
          font-size: 16px;
          color: rgba(247,244,238,0.3);
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .nav-link:hover .nav-icon { color: rgba(247,244,238,0.6); }
        .nav-link.active .nav-icon { color: #C8A96B; }
        .nav-label {
          font-size: 12px; font-weight: 400;
          color: rgba(247,244,238,0.4);
          opacity: ${collapsed ? '0' : '1'};
          transition: opacity 0.1s;
        }
        .nav-link:hover .nav-label { color: rgba(247,244,238,0.75); }
        .nav-link.active .nav-label { color: #F7F4EE; font-weight: 500; }

        .sidebar-bottom {
          padding: ${collapsed ? '14px' : '14px 16px'};
          border-top: 0.5px solid rgba(200,169,107,0.08);
          flex-shrink: 0;
        }

        .bottom-link {
          display: flex; align-items: center; gap: 8px;
          padding: ${collapsed ? '8px 0' : '7px 8px'};
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          border-radius: 7px;
          text-decoration: none;
          color: rgba(247,244,238,0.3);
          font-size: 11px;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .bottom-link:hover { color: rgba(247,244,238,0.6); background: rgba(255,255,255,0.04); }
        .bottom-link.danger:hover { color: #f87171; }
        .bottom-text { opacity: ${collapsed ? '0' : '1'}; transition: opacity 0.1s; }

        .collapse-btn {
          position: absolute;
          top: 22px; right: -10px;
          width: 20px; height: 20px;
          background: #071B14;
          border: 0.5px solid rgba(200,169,107,0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: rgba(247,244,238,0.4);
          font-size: 10px;
          z-index: 60;
          transition: all 0.15s;
        }
        .collapse-btn:hover { color: #C8A96B; border-color: rgba(200,169,107,0.5); }

        /* Main */
        .admin-main {
          margin-left: ${collapsed ? '64px' : '224px'};
          flex: 1;
          transition: margin-left 0.2s cubic-bezier(0.4,0,0.2,1);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .admin-topbar {
          height: 52px;
          background: #F7F4EE;
          border-bottom: 0.5px solid rgba(7,27,20,0.07);
          display: flex;
          align-items: center;
          padding: 0 32px;
          gap: 12px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .breadcrumb { display: flex; align-items: center; gap: 6px; }
        .bc-item { font-size: 12px; color: rgba(7,27,20,0.35); }
        .bc-sep { color: rgba(7,27,20,0.2); font-size: 10px; }
        .bc-current { font-size: 12px; color: #071B14; font-weight: 500; }

        .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }

        .topbar-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px; font-weight: 500;
          cursor: pointer; border: none;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .topbar-btn.secondary { background: rgba(7,27,20,0.06); color: rgba(7,27,20,0.55); }
        .topbar-btn.primary { background: #071B14; color: #F7F4EE; }
        .topbar-btn:hover { opacity: 0.8; }

        .admin-content {
          flex: 1;
          padding: 32px;
          max-width: 1200px;
          width: 100%;
        }

        /* Tooltip for collapsed */
        .nav-link[data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          left: calc(100% + 10px);
          top: 50%; transform: translateY(-50%);
          background: #071B14;
          border: 0.5px solid rgba(200,169,107,0.2);
          color: #F7F4EE;
          font-size: 11px;
          padding: 5px 10px;
          border-radius: 6px;
          white-space: nowrap;
          z-index: 100;
          opacity: ${collapsed ? '1' : '0'};
          pointer-events: none;
        }
      `}</style>

      <div className="admin-root">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {/* Collapse toggle */}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Colapsar menú">
            <i className={`ti ${collapsed ? 'ti-chevron-right' : 'ti-chevron-left'}`} style={{fontSize:'10px'}} />
          </button>

          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-icon">✦</div>
            <div className="logo-text">
              <div className="logo-name">Clínica del Alma</div>
              <div className="logo-sub">Panel profesional</div>
            </div>
          </div>

          {/* Profile */}
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {initial}
              <div className="online-dot" />
            </div>
            <div className="profile-text">
              <div className="profile-name">{name}</div>
              <div className="profile-role">Logoterapeuta · Admin</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            <div className="nav-section">Principal</div>
            {NAV_ITEMS.filter(i => i.section === 'principal').map(item => {
              const active = pathname?.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}
                  className={`nav-link${active ? ' active' : ''}`}
                  data-tooltip={collapsed ? item.label : undefined}>
                  <i className={`ti ${item.icon} nav-icon`} aria-hidden="true" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              )
            })}

            <div className="nav-section" style={{marginTop:'8px'}}>Gestión</div>
            {NAV_ITEMS.filter(i => i.section === 'gestion').map(item => {
              const active = pathname?.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}
                  className={`nav-link${active ? ' active' : ''}`}
                  data-tooltip={collapsed ? item.label : undefined}>
                  <i className={`ti ${item.icon} nav-icon`} aria-hidden="true" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom */}
          <div className="sidebar-bottom">
            <Link href="/" className="bottom-link">
              <i className="ti ti-arrow-left" style={{fontSize:'13px', flexShrink:0}} aria-hidden="true" />
              <span className="bottom-text">Sitio público</span>
            </Link>
            <Link href="/api/auth/signout" className="bottom-link danger">
              <i className="ti ti-logout" style={{fontSize:'13px', flexShrink:0}} aria-hidden="true" />
              <span className="bottom-text">Cerrar sesión</span>
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="admin-main">
          {/* Topbar */}
          <header className="admin-topbar">
            <div className="breadcrumb">
              <span className="bc-item">Clínica del Alma</span>
              <span className="bc-sep">›</span>
              <span className="bc-current">
                {NAV_ITEMS.find(i => pathname?.startsWith(i.href))?.label ?? 'Panel'}
              </span>
            </div>
            <div className="topbar-right">
              <button className="topbar-btn secondary">
                <i className="ti ti-search" style={{fontSize:'12px'}} aria-hidden="true" />
                Buscar
              </button>
              <Link href="/admin/agenda" className="topbar-btn primary" style={{textDecoration:'none'}}>
                <i className="ti ti-plus" style={{fontSize:'12px'}} aria-hidden="true" />
                Nueva sesión
              </Link>
            </div>
          </header>

          {/* Page content */}
          <div className="admin-content">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
