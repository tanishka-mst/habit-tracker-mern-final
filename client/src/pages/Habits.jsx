import React, { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import HabitCard from '../components/HabitCard'
import { toast } from '../hooks/useToast'

const CATS = ['All', 'Health', 'Fitness', 'Learning', 'Mindfulness', 'General']

export default function Habits({ onAddHabit, onEdit }) {
  const { habits, logs, markDone, archiveHabit, deleteHabit } = useAuth()
  const [filterCat, setFilterCat] = useState('All')
  const [showArchived, setShowArchived] = useState(false)

  const filtered = useMemo(() => {
    let h = habits.filter(x => (showArchived ? x.archived : !x.archived))
    if (filterCat !== 'All') {
      h = h.filter(x => x.category === filterCat)
    }
    return h
  }, [habits, filterCat, showArchived])

  const handleDone = (id) => {
    const ok = markDone(id)
    if (ok) toast('Habit done! +15 XP 🔥', 'success')
    else toast('Already completed today', 'info')
    return ok
  }

  const handleDelete = (id) => {
    deleteHabit(id)
    toast('Habit deleted', 'error')
  }

  const handleArchive = (id) => {
    archiveHabit(id)
    toast('Habit archived 🗄', 'info')
  }

  return (
    <div className="anim-up">
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
          {CATS.map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                fontFamily: 'Inter,sans-serif',
                background: filterCat === c ? 'var(--violet)' : 'rgba(255,255,255,0.06)',
                color: filterCat === c ? 'white' : 'var(--muted)',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowArchived(a => !a)}
          style={{
            padding: '0.35rem 0.9rem',
            borderRadius: 20,
            background: showArchived ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)',
            color: showArchived ? 'var(--amber)' : 'var(--muted)',
            border: `1px solid ${showArchived ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter,sans-serif',
          }}
        >
          🗄 {showArchived ? 'Active habits' : 'Archived'}
        </button>

        <button
          onClick={onAddHabit}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: 10,
            background: 'linear-gradient(135deg,var(--violet),#5B21B6)',
            color: 'white',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Add Habit
        </button>
      </div>

      {/* Summary */}
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
        {filtered.length} {showArchived ? 'archived' : 'active'} habit{filtered.length !== 1 ? 's' : ''}
        {filterCat !== 'All' ? ` in ${filterCat}` : ''}
      </p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
          <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>
            Nothing here
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
            {showArchived
              ? 'No archived habits'
              : filterCat !== 'All'
              ? `No habits in "${filterCat}"`
              : 'Add your first habit!'}
          </p>

          {!showArchived && (
            <button
              onClick={onAddHabit}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: 10,
                background: 'linear-gradient(135deg,var(--violet),#5B21B6)',
                color: 'white',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Add Habit
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
          {filtered.map(h => (
            <HabitCard
              key={h.id}
              habit={h}
              logs={logs}
              onDone={handleDone}
              onEdit={onEdit}
              onArchive={handleArchive}
              onDelete={handleDelete}
              mode="full"
            />
          ))}
        </div>
      )}
    </div>
  )
}