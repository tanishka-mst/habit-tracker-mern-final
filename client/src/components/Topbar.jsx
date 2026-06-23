import React from 'react'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES = {
  '/':              'Dashboard',
  '/habits':        'My Habits',
  '/analytics':     'Analytics',
  '/achievements':  'Achievements',
  '/profile':       'Profile',
}

export default function Topbar({ path, onAddHabit }) {
  const { user } = useAuth()
  const title = PAGE_TITLES[path] || 'HabitFlow'
  const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header style={{
      background: 'rgba(10,15,30,0.88)', backdropFilter: 'blur(18px)',
      borderBottom: '1px solid var(--border)',
      padding: '1rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 9,
    }}>
      <div>
        <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.25rem', fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>{dateStr}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onAddHabit}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.55rem 1.25rem', borderRadius: 10,
            background: 'linear-gradient(135deg,var(--violet),#5B21B6)',
            color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
            transition: 'all 0.2s', fontFamily: 'Inter,sans-serif',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 15px rgba(124,58,237,0.4)' }}
        >
          + New Habit
        </button>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg,var(--violet),var(--pink))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  )
}
