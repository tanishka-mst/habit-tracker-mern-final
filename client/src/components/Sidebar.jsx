import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, CheckSquare, BarChart2, Trophy, User, LogOut } from 'lucide-react'

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits',       icon: CheckSquare,     label: 'Habits'    },
  { to: '/analytics',   icon: BarChart2,        label: 'Analytics' },
  { to: '/achievements', icon: Trophy,           label: 'Achievements' },
  { to: '/profile',     icon: User,             label: 'Profile'   },
]

const S = {
  sidebar: {
    width: 240, minWidth: 240, background: 'var(--card)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 10,
    padding: '0 0 1.5rem',
  },
  logo: {
    padding: '1.5rem 1.5rem 1.25rem',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  logoIcon: {
    width: 38, height: 38, borderRadius: 10,
    background: 'linear-gradient(135deg,var(--violet),var(--mint))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, flexShrink: 0,
  },
  navSection: {
    padding: '0.5rem 1rem 0.25rem',
    fontSize: '0.65rem', color: 'var(--muted)',
    letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
    marginTop: '0.5rem',
  },
  userBox: {
    margin: 'auto 1rem 0',
    padding: '0.875rem 1rem',
    borderRadius: 12,
    background: 'var(--card2)',
    border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    cursor: 'pointer',
  },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg,var(--violet),var(--pink))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
  },
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const xp = user?.xp || 0
  const lvl = user?.level || 1
  const xpPct = Math.min((xp / (lvl * 500)) * 100, 100)

  return (
    <nav style={S.sidebar}>
      <div style={S.logo}>
        <div style={S.logoIcon}>🌊</div>
        <div>
          <div style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: '1.05rem' }}>HabitFlow</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Habit Tracker</div>
        </div>
      </div>

      <div style={S.navSection}>Main</div>
      {NAV.slice(0,2).map(n => <NavItem key={n.to} {...n} />)}
      <div style={S.navSection}>Insights</div>
      {NAV.slice(2,4).map(n => <NavItem key={n.to} {...n} />)}
      <div style={S.navSection}>Account</div>
      {NAV.slice(4).map(n => <NavItem key={n.to} {...n} />)}

      <button
        onClick={() => { logout(); navigate('/login') }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.65rem 1.25rem', margin: '0.1rem 0.75rem',
          borderRadius: 10, cursor: 'pointer', background: 'none',
          border: 'none', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 500,
          width: 'calc(100% - 1.5rem)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,63,94,0.1)'; e.currentTarget.style.color = '#FB7185' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)' }}
      >
        <LogOut size={18} /> Sign Out
      </button>

      <div style={S.userBox} onClick={() => navigate('/profile')}>
        <div style={S.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name?.split(' ')[0]}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--mint)', fontWeight: 500 }}>⚡ Level {lvl}</div>
        </div>
      </div>

      {/* XP bar */}
      <div style={{ padding: '0.75rem 1.25rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--muted)', marginBottom: 4 }}>
          <span>XP</span><span>{xp} / {lvl * 500}</span>
        </div>
        <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            background: 'linear-gradient(90deg,var(--violet),var(--mint))',
            width: xpPct + '%', transition: 'width 1s cubic-bezier(.4,0,.2,1)'
          }} />
        </div>
      </div>
    </nav>
  )
}

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink to={to} end={to === '/'} style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.65rem 1.25rem', margin: '0.1rem 0.75rem', borderRadius: 10,
      cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500,
      transition: 'all 0.2s',
      color: isActive ? 'var(--text)' : 'var(--muted)',
      background: isActive ? 'linear-gradient(135deg,rgba(124,58,237,0.22),rgba(16,245,160,0.06))' : 'transparent',
      border: isActive ? '1px solid var(--border2)' : '1px solid transparent',
    })}>
      <Icon size={18} />
      {label}
    </NavLink>
  )
}
