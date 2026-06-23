import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from '../hooks/useToast'

export default function LoginPage() {
  const [tab, setTab]         = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const { login, register }   = useAuth()
  const navigate              = useNavigate()

  const doLogin = async () => {
    if (!email || !password) { setError('Email and password are required '); return }
    setError(''); setLoading(true)
    const res = await login(email, password)
    if (res.ok) { toast('Welcome back! 🌊', 'success'); navigate('/') }
    else setError(res.error)
    setLoading(false)
  }

  const doRegister = async () => {
    if (!name.trim())  { setError('Name is required '); return }
    if (!email)        { setError('Email is required '); return }
    if (password.length < 6) { setError('Password must be at least 6 characters long '); return }
    setError(''); setLoading(true)
    const res = await register(name, email, password)
    if (res.ok) {
      toast('Account created! You can now login 🚀', 'success')
      setTab('login'); setName(''); setPass('')
    } else setError(res.error)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--navy)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)', top: '-10%', left: '-5%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,245,160,0.1) 0%,transparent 70%)', bottom: '5%', right: '5%', pointerEvents: 'none' }} />

      <div style={{
        background: 'var(--card)', border: '1px solid var(--border2)',
        borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 420,
        boxShadow: 'var(--glow)', animation: 'slideUp 0.4s ease', position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 58, height: 58, borderRadius: 16,
            background: 'linear-gradient(135deg,var(--violet),var(--mint))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, marginBottom: '0.75rem',
          }}>🌊</div>
          <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.6rem', fontWeight: 800 }}>HabitFlow</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: 4 }}>Build habits. Level up your life.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, marginBottom: '1.5rem' }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '0.5rem', borderRadius: 8, cursor: 'pointer',
              border: 'none', fontSize: '0.875rem', fontWeight: 600,
              background: tab === t ? 'var(--violet)' : 'transparent',
              color: tab === t ? 'white' : 'var(--muted)',
              transition: 'all 0.2s', fontFamily: 'Inter,sans-serif',
            }}>{t === 'login' ? 'Sign In' : 'Create Account'}</button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem',
            fontSize: '0.85rem', color: '#FB7185',
          }}>⚠️ {error}</div>
        )}

        {tab === 'register' && (
          <Field label="Full Name">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" style={inp} />
          </Field>
        )}
        <Field label="Email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inp} autoComplete="email" />
        </Field>
        <Field label="Password">
          <input
            type="password" value={password} onChange={e => setPass(e.target.value)}
            placeholder="••••••••" style={inp} autoComplete="current-password"
            onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? doLogin() : doRegister())}
          />
        </Field>

        <button onClick={tab === 'login' ? doLogin : doRegister} disabled={loading} style={{
          width: '100%', padding: '0.8rem', borderRadius: 10,
          background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,var(--violet),#5B21B6)',
          color: 'white', border: 'none', fontSize: '0.9rem', fontWeight: 700,
          cursor: loading ? 'wait' : 'pointer', marginTop: '0.5rem',
          boxShadow: '0 4px 18px rgba(124,58,237,0.4)', transition: 'all 0.2s',
          fontFamily: 'Inter,sans-serif',
        }}>
          {loading ? '⏳ Please wait…' : tab === 'login' ? 'Sign In ✨' : 'Create Account 🚀'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
          {tab === 'login'
            ? <>New here? <span style={{ color: 'var(--violet2)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setTab('register'); setError('') }}>Create account →</span></>
            : <>Already have account? <span style={{ color: 'var(--violet2)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setTab('login'); setError('') }}>Sign in →</span></>}
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      {children}
    </div>
  )
}

const inp = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
  color: 'var(--text)', fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif',
}
