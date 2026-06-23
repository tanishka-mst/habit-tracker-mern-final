import React from 'react'
import { useToastState } from '../hooks/useToast'

const ICONS = { success: '✅', error: '❌', info: '💡', warning: '⚠️' }

export default function ToastContainer() {
  const toasts = useToastState()

  return (
    <div style={{
      position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none'
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'var(--card2)', border: '1px solid var(--border2)',
          borderRadius: '12px', padding: '0.85rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontSize: '0.875rem', boxShadow: 'var(--glow)',
          maxWidth: '340px', pointerEvents: 'all',
          animation: 'slideUp 0.3s ease'
        }}>
          <span style={{ fontSize: '1.1rem' }}>{ICONS[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
