import React, { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts'

const CAT_COLORS = {
  Health: '#10F5A0', Fitness: '#FBBF24', Learning: '#38BDF8',
  Mindfulness: '#F472B6', General: '#9F67FF',
}
const CAT_EMOJI = {
  Health: '💊', Fitness: '💪', Learning: '📚', Mindfulness: '🧘', General: '⭐',
}

export default function Analytics() {
  const { habits, logs } = useAuth()
  const completed = logs.filter(l => l.completed)

  const weekData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      days.push({
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        date: ds,
        count: completed.filter(l => l.date === ds).length,
      })
    }
    return days
  }, [logs])

  const monthData = useMemo(() => {
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      days.push({
        date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        count: completed.filter(l => l.date === ds).length,
      })
    }
    return days
  }, [logs])

  const catData = useMemo(() => {
    const map = {}
    completed.forEach(l => {
      const h = habits.find(x => x.id === l.habitId)
      const c = h?.category || 'General'
      map[c] = (map[c] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value)
  }, [logs, habits])

  const heatmap = useMemo(() => {
    const cells = []
    for (let i = 34; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      cells.push({ date: ds, count: completed.filter(l => l.date === ds).length })
    }
    return cells
  }, [logs])

  const total = completed.length
  const weekCounts = weekData.map(d => d.count)
  const avg = weekCounts.length ? Math.round(weekCounts.reduce((a,b)=>a+b,0)/weekCounts.length) : 0
  const bestDayIdx = weekCounts.indexOf(Math.max(...weekCounts))
  const bestDay = weekData[bestDayIdx]?.day || '—'

  const tooltipStyle = {
    contentStyle: { background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--text)' },
    cursor: { fill: 'rgba(124,58,237,0.1)' }
  }

  return (
    <div className="anim-up">
      {/* Top stats */}
      <div className="stats-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <MiniCard label="Total Completions" value={total} accent="var(--violet)" />
        <MiniCard label="Avg. Per Day (7d)"  value={avg}   accent="var(--mint)" />
        <MiniCard label="Best Day This Week" value={bestDay} accent="var(--amber)" />
      </div>

      {/* Charts row — className="chart-row" makes it 1-col on mobile */}
      <div className="chart-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <ChartCard title="Weekly completions">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[6,6,0,0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#10F5A0" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By category">
          {catData.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', textAlign: 'center', paddingTop: '2rem' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
              {catData.map(c => {
                const max = catData[0].value
                return (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)', width: 100, flexShrink: 0 }}>
                      {CAT_EMOJI[c.name]} {c.name}
                    </span>
                    <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 7, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 7, transition: 'width 1s ease',
                        background: CAT_COLORS[c.name] || 'var(--violet2)',
                        width: Math.round((c.value / max) * 100) + '%',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, width: 28, textAlign: 'right' }}>{c.value}</span>
                  </div>
                )
              })}
            </div>
          )}
        </ChartCard>
      </div>

      {/* 30-day area */}
      <ChartCard title="30-day trend">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={monthData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Heatmap */}
      <ChartCard title="Activity heatmap — last 5 weeks">
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {['M','T','W','T','F','S','S'].map((d,i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: 'var(--muted)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {heatmap.map((c, i) => {
            const intensity = c.count === 0 ? 0.05 : c.count <= 1 ? 0.2 : c.count <= 3 ? 0.45 : c.count <= 5 ? 0.72 : 1
            return (
              <div key={i} title={`${c.date}: ${c.count} completions`} style={{
                aspectRatio: '1', borderRadius: 4,
                background: `rgba(124,58,237,${intensity})`,
                transition: 'transform 0.2s', cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              />
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: '0.7rem', color: 'var(--muted)' }}>
          <span>Less</span>
          {[0.05,0.2,0.45,0.72,1].map(o => (
            <div key={o} style={{ width: 12, height: 12, borderRadius: 3, background: `rgba(124,58,237,${o})` }} />
          ))}
          <span>More</span>
        </div>
      </ChartCard>
    </div>
  )
}

function MiniCard({ label, value, accent }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, borderRadius: '50%', background: accent, opacity: 0.08, transform: 'translate(15px,-15px)' }} />
      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '2rem', fontWeight: 800 }}>{value}</div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem' }}>
      <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>{title}</h3>
      {children}
    </div>
  )
}
