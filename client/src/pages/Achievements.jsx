import React from 'react'
import { useAuth, ACHIEVEMENTS_DEF } from '../context/AuthContext'

export default function Achievements() {
  const { achievements } = useAuth()

  return (
    <div className="anim-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>Achievements</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>Unlock badges by hitting your goals</p>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
          <span style={{ color: 'var(--mint)', fontWeight: 700, fontSize: '1.1rem' }}>{achievements.length}</span>
          {' '}/ {ACHIEVEMENTS_DEF.length} unlocked
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8 }}>
          <span>Overall progress</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{Math.round((achievements.length / ACHIEVEMENTS_DEF.length) * 100)}%</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 8, transition: 'width 1.2s ease',
            background: 'linear-gradient(90deg,var(--violet),var(--mint))',
            width: Math.round((achievements.length / ACHIEVEMENTS_DEF.length) * 100) + '%',
          }} />
        </div>
      </div>

      {/* className="ach-grid" makes it 2-col on mobile */}
      <div className="ach-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '1rem' }}>
        {ACHIEVEMENTS_DEF.map(a => {
          const unlocked = achievements.includes(a.id)
          return (
            <div key={a.id} style={{
              background: unlocked
                ? 'linear-gradient(135deg,var(--card),rgba(124,58,237,0.08))'
                : 'var(--card)',
              border: `1px solid ${unlocked ? 'var(--border2)' : 'var(--border)'}`,
              borderRadius: 16, padding: '1.5rem 1.25rem',
              textAlign: 'center', transition: 'all 0.3s',
              opacity: unlocked ? 1 : 0.45, filter: unlocked ? 'none' : 'grayscale(0.6)',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { if (unlocked) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--glow)' }}}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              {unlocked && (
                <div style={{
                  position: 'absolute', top: '0.6rem', right: '0.6rem',
                  fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px',
                  borderRadius: 20, background: 'var(--violet)', color: 'white',
                }}>Unlocked</div>
              )}
              <div style={{ fontSize: '2.75rem', marginBottom: '0.75rem', display: 'block' }}>{a.icon}</div>
              <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '0.875rem', fontWeight: 700, marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{a.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
