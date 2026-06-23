import React, { useEffect, useRef, useState } from 'react'
import { completedToday, streakFor } from '../context/AuthContext'
import { Edit2, Archive, Trash2 } from 'lucide-react'

const CAT_STYLES = {
  Health:      { bg: 'rgba(16,245,160,0.12)', color: 'var(--mint)',   emoji: '💊' },
  Fitness:     { bg: 'rgba(251,191,36,0.12)', color: 'var(--amber)',  emoji: '💪' },
  Learning:    { bg: 'rgba(56,189,248,0.12)', color: 'var(--sky)',    emoji: '📚' },
  Mindfulness: { bg: 'rgba(244,114,182,0.12)',color: 'var(--pink)',   emoji: '🧘' },
  General:     { bg: 'rgba(124,58,237,0.12)', color: 'var(--violet2)',emoji: '⭐' },
}
// Day letter from date — Mon=M, Tue=T, etc.
const DAY_LETTERS = ['S','M','T','W','T','F','S'] // Sunday=0

export default function HabitCard({ habit, logs, onDone, onEdit, onArchive, onDelete, mode = 'dashboard' }) {
  const ringRef   = useRef(null)
  const [popped, setPopped] = useState(false)

  const done   = completedToday(habit.id, logs)
  const streak = streakFor(habit.id, logs)
  const total  = logs.filter(l => l.habitId === habit.id && l.completed).length
  const weekPct = habit.goal > 0 ? Math.min(Math.round((total % 7 / habit.goal) * 100), 100) : 0

  const R    = 28
  const circ = 2 * Math.PI * R
  const off  = circ - (weekPct / 100) * circ
  const ringColor = done ? '#10F5A0' : '#7C3AED'

  // Animate ring on mount
  useEffect(() => {
    if (!ringRef.current) return
    ringRef.current.style.strokeDashoffset = circ
    const timer = setTimeout(() => {
      if (ringRef.current) ringRef.current.style.strokeDashoffset = off
    }, 120)
    return () => clearTimeout(timer)
  }, [off, circ])

  const handleDone = () => {
    const ok = onDone(habit.id)
    if (ok) { setPopped(true); setTimeout(() => setPopped(false), 700) }
  }

  // Week dots — last 7 days, each dot shows the actual day letter
  
    // Week dots — Monday to Sunday of current week, future days greyed out
const weekDots = ['M','T','W','T','F','S','S'].map((letter, i) => {
  // i=0 → Monday, i=6 → Sunday
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayDay = today.getDay()                    // 0=Sun,1=Mon...6=Sat
  const mondayOffset = todayDay === 0 ? -6 : 1 - todayDay  // days since monday
  const dt = new Date(today)
  dt.setDate(today.getDate() + mondayOffset + i)     // this week's Mon+i
  const ds       = dt.toISOString().split('T')[0]
  const isToday  = dt.getTime() === today.getTime()
  const isFuture = dt.getTime() > today.getTime()
  const did      = logs.some(l => l.habitId === habit.id && l.date === ds && l.completed)
  return (
    <div key={i} title={ds} style={{
      width: 26, height: 26, borderRadius: 7,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.6rem', fontWeight: 600,
      opacity: isFuture ? 0.3 : 1,
      border: `1px solid ${did ? 'rgba(16,245,160,0.4)' : isToday ? 'var(--violet2)' : 'var(--border)'}`,
      background: did ? 'rgba(16,245,160,0.15)' : 'transparent',
      color: did ? 'var(--mint)' : isToday ? 'var(--violet2)' : 'var(--muted)',
      transition: 'all 0.2s',
    }}>{letter}</div>
  )
})

  const cat = habit.category || 'General'
  const catStyle = CAT_STYLES[cat] || CAT_STYLES.General

  return (
    <div style={{
      background: done
        ? 'linear-gradient(135deg,var(--card),rgba(16,245,160,0.05))'
        : 'var(--card)',
      border: `1px solid ${done ? 'rgba(16,245,160,0.28)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)', padding: '1.25rem',
      transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
      animation: 'slideUp 0.38s ease both',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = done ? 'rgba(16,245,160,0.45)' : 'var(--border2)'; e.currentTarget.style.boxShadow = 'var(--glow)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = done ? 'rgba(16,245,160,0.28)' : 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Pop burst */}
      {popped && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '3rem', pointerEvents: 'none', zIndex: 5,
          animation: 'burst 0.6s ease forwards',
        }}>✅</div>
      )}

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase',
            background: catStyle.bg, color: catStyle.color,
          }}>
            {catStyle.emoji} {cat}
          </div>
          <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>
            {habit.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
            🔄 {habit.frequency} · Goal: {habit.goal}×
          </div>
        </div>

        {/* Ring */}
        <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              ref={ringRef}
              cx="32" cy="32" r={R} fill="none"
              stroke={ringColor} strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '0.75rem', fontWeight: 700, color: ringColor }}>{weekPct}%</div>
            <div style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>{total} done</div>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1rem' }}>🔥</span>
        <span style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.1rem', fontWeight: 800, color: 'var(--amber)' }}>{streak}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>day streak</span>
        {streak >= 7 && (
          <span style={{
            marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700,
            background: 'rgba(251,191,36,0.15)', color: 'var(--amber)',
            padding: '2px 8px', borderRadius: 20,
          }}>🏅 On fire!</span>
        )}
      </div>

      {/* Week dots */}
      <div style={{ display: 'flex', gap: 5, marginBottom: '1rem' }}>{weekDots}</div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {done ? (
          <button disabled style={{
            flex: 1, padding: '0.4rem 0.75rem', borderRadius: 8,
            background: 'rgba(16,245,160,0.08)', color: 'var(--mint)',
            border: '1px solid rgba(16,245,160,0.25)', fontSize: '0.78rem', fontWeight: 600,
            cursor: 'default', fontFamily: 'Inter,sans-serif',
          }}>✅ Done for today!</button>
        ) : (
          <button onClick={handleDone} style={{
            flex: 1, padding: '0.4rem 0.75rem', borderRadius: 8,
            background: 'linear-gradient(135deg,var(--mint2),#06B681)',
            color: '#0A0F1E', border: 'none', fontSize: '0.78rem', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 3px 12px rgba(16,245,160,0.3)',
            fontFamily: 'Inter,sans-serif', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 18px rgba(16,245,160,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 3px 12px rgba(16,245,160,0.3)' }}
          >Mark Complete ✓</button>
        )}
        {mode === 'full' && (
          <>
            <IconBtn icon={<Edit2 size={14} />} title="Edit" onClick={() => onEdit(habit)} color="var(--sky)" />
            <IconBtn icon={<Archive size={14} />} title="Archive" onClick={() => onArchive(habit.id)} color="var(--amber)" />
            <IconBtn icon={<Trash2 size={14} />} title="Delete" onClick={() => onDelete(habit.id)} color="#FB7185" />
          </>
        )}
      </div>
    </div>
  )
}

function IconBtn({ icon, title, onClick, color }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
      color: color || 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = color }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--border)' }}
    >{icon}</button>
  )
}
