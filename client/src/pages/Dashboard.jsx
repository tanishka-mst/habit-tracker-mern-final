import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, completedToday, streakFor } from '../context/AuthContext'
import HabitCard from '../components/HabitCard'
import { toast } from '../hooks/useToast'

export default function Dashboard({ onAddHabit, onEdit }) {
  const { habits, logs, markDone } = useAuth()
  const navigate = useNavigate()

  const active = useMemo(() => habits.filter(h => !h.archived), [habits])
  const done   = useMemo(() => active.filter(h => completedToday(h.id, logs)).length, [active, logs])
  const rate   = active.length ? Math.round((done / active.length) * 100) : 0
  const bestStreak = Math.max(0, ...active.map(h => streakFor(h.id, logs)))
  const totalLogs  = logs.filter(l => l.completed).length

  const handleDone = (id) => {
    const ok = markDone(id)
    if (ok) toast('Habit done! +15 XP 🔥', 'success')
    else toast('Already completed today', 'info')
    return ok
  }

  return (
    <div className="anim-up">
      {/* Stats — className="stats-grid" makes it 2-col on mobile */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Habits"   value={active.length} sub="Active habits"   icon="🎯" accent="var(--violet)" />
        <StatCard label="Done Today"     value={done}          sub="Completed"        icon="✅" accent="var(--mint)"   />
        <StatCard label="Completion"     value={rate + '%'}    sub="Today's rate"     icon="⚡" accent="var(--amber)"  />
        <StatCard label="Best Streak"    value={bestStreak}    sub="Days in a row"    icon="🔥" accent="var(--pink)"   />
      </div>

      {/* Today's habits */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>Today's Habits</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
            {rate === 100 ? '🎉 All done! Amazing job today!' : `${active.length - done} remaining · Keep going!`}
          </p>
        </div>
        <button onClick={() => navigate('/habits')} style={ghostBtn}>View all →</button>
      </div>

      {active.length === 0 ? (
        <EmptyState onAdd={onAddHabit} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
          {active.slice(0, 6).map(h => (
            <HabitCard key={h.id} habit={h} logs={logs} onDone={handleDone} onEdit={onEdit} mode="dashboard" />
          ))}
        </div>
      )}

      {/* Quick stats row */}
      {totalLogs > 0 && (
        <div style={{ marginTop: '2rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem 1.5rem' }}>
          <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>All-time stats</h3>
          <div className="stats-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            <MiniStat label="Total completions" value={totalLogs} />
            <MiniStat label="Habits created"    value={habits.length} />
            <MiniStat label="Best streak ever"  value={`${bestStreak}d`} />
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16,
      padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--glow)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '50%',
        background: accent, opacity: 0.07, transform: 'translate(20px,-20px)'
      }} />
      <div style={{
        position: 'absolute', top: '1rem', right: '1rem', width: 36, height: 36, borderRadius: 10,
        background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
      }}>{icon}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.35rem' }}>{sub}</div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '0.75rem 1rem' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🌱</div>
      <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No habits yet</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Create your first habit and start building momentum</p>
      <button onClick={onAdd} style={{ padding: '0.65rem 1.5rem', borderRadius: 10, background: 'linear-gradient(135deg,var(--violet),#5B21B6)', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
        + Add First Habit
      </button>
    </div>
  )
}

const ghostBtn = {
  padding: '0.4rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
  color: 'var(--text)', border: '1px solid var(--border)', fontSize: '0.8rem',
  fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif',
}
