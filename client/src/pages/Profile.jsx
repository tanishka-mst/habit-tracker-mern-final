import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, habits, logs, achievements, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const level = user.level || 1
  const xp = user.xp || 0
  const xpNeeded = level * 500
  const xpPct = Math.min((xp / xpNeeded) * 100, 100)

  const totalLogs = logs.filter(l => l.completed).length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="anim-up">
      {/* ===== Profile Header ===== */}
      <div
        style={{
          background: 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(16,245,160,0.08))',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--violet),var(--pink))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#fff',
            border: '3px solid rgba(124,58,237,0.5)',
          }}
        >
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>

        <div>
          <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.5rem', fontWeight: 800 }}>
            {user.name}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: 4 }}>
            {user.email}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: '0.5rem',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid var(--border2)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--violet2)',
            }}
          >
            ⚡ Level {level} · {xp} XP
          </div>
        </div>
      </div>

      {/* ===== Stats ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard label="Habits Created" value={habits.length} accent="var(--violet)" />
        <StatCard label="Total Completions" value={totalLogs} accent="var(--mint)" />
        <StatCard label="Achievements" value={achievements.length} accent="var(--amber)" />
      </div>

      {/* ===== XP Progress ===== */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: '0.95rem', fontWeight: 700 }}>
          XP Progress
        </h3>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--muted)',
            margin: '0.75rem 0',
          }}
        >
          <span>Level {level}</span>
          <span>Level {level + 1}</span>
        </div>

        <div
          style={{
            height: 12,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${xpPct}%`,
              background: 'linear-gradient(90deg,var(--violet),var(--mint))',
              transition: 'width 1s ease',
            }}
          />
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '0.75rem',
            fontSize: '0.875rem',
            color: 'var(--muted)',
          }}
        >
          <strong style={{ color: 'var(--text)' }}>{xp}</strong> / {xpNeeded} XP to next level
        </div>
      </div>

      {/* ===== Account ===== */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '1.5rem',
        }}
      >
        <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: '0.95rem', fontWeight: 700 }}>
          Account
        </h3>

        <button
          onClick={handleLogout}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 10,
            background: 'rgba(244,63,94,0.12)',
            color: '#FB7185',
            border: '1px solid rgba(244,63,94,0.3)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  )
}

/* ===== Stat Card ===== */
function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '1.25rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: accent,
          opacity: 0.08,
          transform: 'translate(12px,-12px)',
        }}
      />

      <div
        style={{
          fontSize: '0.7rem',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </div>

      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '2rem', fontWeight: 800 }}>
        {value}
      </div>
    </div>
  )
}