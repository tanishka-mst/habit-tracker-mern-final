import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const INITIAL = { title: '', category: 'General', frequency: 'Daily', goal: 1 }

export default function HabitModal({ open, onClose, onSave, editing }) {
  const [form, setForm] = useState(INITIAL)

  useEffect(() => {
    if (editing) setForm({ title: editing.title, category: editing.category, frequency: editing.frequency, goal: editing.goal })
    else setForm(INITIAL)
  }, [editing, open])

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave(form, editing?.id)
    onClose()
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      className="modal-wrap"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div className="modal-inner" style={{
        background: 'var(--card2)', border: '1px solid var(--border2)',
        borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--glow)',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Mobile drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.12)', margin: '0 auto 1.25rem' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.2rem', fontWeight: 700 }}>
            {editing ? 'Edit Habit' : 'Add New Habit'}
          </h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
            color: 'var(--muted)', width: 32, height: 32, borderRadius: 8,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><X size={16} /></button>
        </div>

        <Field label="Habit Name">
          <input
            autoFocus
            value={form.title}
            onChange={e => set('title', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Read 20 pages"
            maxLength={60}
            style={inputStyle}
          />
        </Field>

        {/* className="form-row" makes it 1-col on mobile */}
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Category">
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
              {['General','Health','Fitness','Learning','Mindfulness'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Frequency">
            <select value={form.frequency} onChange={e => set('frequency', e.target.value)} style={inputStyle}>
              <option>Daily</option><option>Weekly</option>
            </select>
          </Field>
        </div>

        <Field label="Weekly Goal (times)">
          <input
            type="number" min={1} max={7} value={form.goal}
            onChange={e => set('goal', parseInt(e.target.value) || 1)}
            style={inputStyle}
          />
        </Field>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Btn ghost onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
          <Btn primary onClick={handleSave} style={{ flex: 1 }}>
            {editing ? 'Save Changes' : 'Create Habit 🚀'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
  border: '1px solid var(--border)', background: '#1E2540',
  color: '#F0EEFF', fontSize: '0.9rem', outline: 'none',
  fontFamily: 'Inter,sans-serif', transition: 'border-color 0.2s',
  colorScheme: 'dark',
}

function Btn({ primary, ghost, children, onClick, style: s }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.7rem 1.25rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600,
    cursor: 'pointer', border: 'none', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s', ...s
  }
  if (primary) return <button onClick={onClick} style={{ ...base, background: 'linear-gradient(135deg,var(--violet),#5B21B6)', color: 'white', boxShadow: '0 4px 15px rgba(124,58,237,0.35)' }}>{children}</button>
  if (ghost)   return <button onClick={onClick} style={{ ...base, background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid var(--border)' }}>{children}</button>
  return <button onClick={onClick} style={base}>{children}</button>
}
