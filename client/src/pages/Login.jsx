import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from '../hooks/useToast'
import api from '../services/api'

// ── Screens: 'login' | 'register' | 'forgot' | 'reset'
export default function LoginPage() {
  const [screen, setScreen]   = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Forgot password
  const [resetToken, setResetToken] = useState('')
  const [newPass, setNewPass]       = useState('')
  const [confirmPass, setConfirm]   = useState('')
  const [manualToken, setManualToken] = useState('')

  const { login, register } = useAuth()
  const navigate            = useNavigate()

  const reset = () => { setError(''); setEmail(''); setPass(''); setName('') }

  // ── Login ──
  const doLogin = async () => {
    if (!email || !password) { setError('Email and password are required'); return }
    setError(''); setLoading(true)
    const res = await login(email, password)
    if (res.ok) {
      toast('Welcome back! 🌊', 'success')
      navigate('/')
    } else {
      const msg = res.error?.toLowerCase() || ''
      if (msg.includes('not found') || msg.includes('no user') || msg.includes('invalid email')) {
        setError('You are not registered yet! Please create an account first.')
        setScreen('register')
      } else if (msg.includes('incorrect') || msg.includes('wrong') || msg.includes('password')) {
        setError('Incorrect password. Please try again.')
      } else {
        setError(res.error)
      }
    }
    setLoading(false)
  }

  // ── Register ──
  const doRegister = async () => {
    if (!name.trim())        { setError('Name is required'); return }
    if (!email)              { setError('Email is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError(''); setLoading(true)
    const res = await register(name, email, password)
    if (res.ok) {
      toast('Account created! You can now login 🚀', 'success')
      setScreen('login'); setName(''); setPass('')
    } else setError(res.error)
    setLoading(false)
  }

  // ── Forgot Password: Step 1 — get reset token ──
  const doForgot = async () => {
    if (!email) { setError('Please enter your email'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      if (data.success) {
        setResetToken(data.resetToken)
        toast('Reset token generated! Copy it below.', 'success')
      } else {
        setError(data.message || 'Something went wrong')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'User not found with this email')
    }
    setLoading(false)
  }

  // ── Reset Password: Step 2 — set new password ──
  const doReset = async () => {
    const token = resetToken || manualToken
    if (!token)              { setError('Please enter your reset token'); return }
    if (!newPass)            { setError('Please enter a new password'); return }
    if (newPass.length < 6)  { setError('Password must be at least 6 characters'); return }
    if (newPass !== confirmPass) { setError('Passwords do not match'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password: newPass })
      if (data.success) {
        toast('Password reset successful! Please login. ✅', 'success')
        setScreen('login'); setResetToken(''); setManualToken(''); setNewPass(''); setConfirm('')
      } else {
        setError(data.message || 'Invalid or expired token')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--navy)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* BG orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)', top: '-10%', left: '-5%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,245,160,0.1) 0%,transparent 70%)', bottom: '5%', right: '5%', pointerEvents: 'none' }} />

      <div style={{
        background: 'var(--card)', border: '1px solid var(--border2)',
        borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 420,
        boxShadow: 'var(--glow)', animation: 'slideUp 0.4s ease', position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 58, height: 58, borderRadius: 16,
            background: 'linear-gradient(135deg,var(--violet),var(--mint))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, marginBottom: '0.75rem',
          }}>🌊</div>
          <h1 style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.6rem', fontWeight: 800 }}>HabitFlow</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: 4 }}>
            {screen === 'forgot' ? 'Reset your password' :
             screen === 'reset'  ? 'Set a new password' :
             'Build habits. Level up your life.'}
          </p>
        </div>

        {/* Tabs — only for login/register */}
        {(screen === 'login' || screen === 'register') && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, marginBottom: '1.5rem' }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setScreen(t); setError('') }} style={{
                flex: 1, padding: '0.5rem', borderRadius: 8, cursor: 'pointer',
                border: 'none', fontSize: '0.875rem', fontWeight: 600,
                background: screen === t ? 'var(--violet)' : 'transparent',
                color: screen === t ? 'white' : 'var(--muted)',
                transition: 'all 0.2s', fontFamily: 'Inter,sans-serif',
              }}>{t === 'login' ? 'Sign In' : 'Create Account'}</button>
            ))}
          </div>
        )}

        {/* Error box */}
        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem',
            fontSize: '0.85rem', color: '#FB7185',
          }}>⚠️ {error}</div>
        )}

        {/* ── LOGIN SCREEN ── */}
        {screen === 'login' && <>
          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com" style={inp} autoComplete="email" />
          </Field>
          <Field label="Password">
            <input type="password" value={password} onChange={e => setPass(e.target.value)}
              placeholder="••••••••" style={inp} autoComplete="current-password"
              onKeyDown={e => e.key === 'Enter' && doLogin()} />
          </Field>
          {/* Forgot password link */}
          <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <span onClick={() => { setScreen('forgot'); setError('') }} style={{
              fontSize: '0.78rem', color: 'var(--violet2)', cursor: 'pointer', fontWeight: 600,
            }}>Forgot password?</span>
          </div>
          <PrimaryBtn onClick={doLogin} loading={loading}>Sign In ✨</PrimaryBtn>
          <BottomText>
            New here? <Link onClick={() => { setScreen('register'); setError('') }}>Create account →</Link>
          </BottomText>
        </>}

        {/* ── REGISTER SCREEN ── */}
        {screen === 'register' && <>
          <Field label="Full Name">
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Alex Johnson" style={inp} autoComplete="name" />
          </Field>
          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com" style={inp} autoComplete="email" />
          </Field>
          <Field label="Password">
            <input type="password" value={password} onChange={e => setPass(e.target.value)}
              placeholder="Min 6 characters" style={inp} autoComplete="new-password"
              onKeyDown={e => e.key === 'Enter' && doRegister()} />
          </Field>
          <PrimaryBtn onClick={doRegister} loading={loading}>Create Account 🚀</PrimaryBtn>
          <BottomText>
            Already have an account? <Link onClick={() => { setScreen('login'); setError('') }}>Sign in →</Link>
          </BottomText>
        </>}

        {/* ── FORGOT PASSWORD SCREEN ── */}
        {screen === 'forgot' && <>
          {!resetToken ? <>
            {/* Step 1: Enter email */}
            <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid var(--border2)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
              💡 Enter your registered email. You will get a reset token which you can use to set a new password.
            </div>
            <Field label="Registered Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com" style={inp}
                onKeyDown={e => e.key === 'Enter' && doForgot()} />
            </Field>
            <PrimaryBtn onClick={doForgot} loading={loading}>Get Reset Token</PrimaryBtn>
          </> : <>
            {/* Step 2: Show token + set new password */}
            <div style={{ background: 'rgba(16,245,160,0.08)', border: '1px solid rgba(16,245,160,0.3)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--mint)', fontWeight: 600, marginBottom: '0.5rem' }}>✅ Reset Token Generated! (valid for 15 mins)</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Copy this token and paste it below:</div>
              <div style={{
                background: 'var(--navy)', borderRadius: 8, padding: '0.6rem 0.75rem',
                fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text)',
                wordBreak: 'break-all', letterSpacing: '0.03em',
              }}>{resetToken}</div>
              <button onClick={() => { navigator.clipboard.writeText(resetToken); toast('Token copied! ✅', 'success') }} style={{
                marginTop: '0.5rem', padding: '0.3rem 0.75rem', borderRadius: 6,
                background: 'rgba(16,245,160,0.15)', border: '1px solid rgba(16,245,160,0.3)',
                color: 'var(--mint)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
              }}>Copy Token</button>
            </div>
            <Field label="New Password">
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="Min 6 characters" style={inp} />
            </Field>
            <Field label="Confirm New Password">
              <input type="password" value={confirmPass} onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat new password" style={inp}
                onKeyDown={e => e.key === 'Enter' && doReset()} />
            </Field>
            <PrimaryBtn onClick={doReset} loading={loading}>Reset Password ✅</PrimaryBtn>
          </>}
          <BottomText>
            Remember your password? <Link onClick={() => { setScreen('login'); setError(''); setResetToken('') }}>Back to Sign In →</Link>
          </BottomText>
        </>}

        {/* ── RESET SCREEN (manual token entry) ── */}
        {screen === 'reset' && <>
          <Field label="Reset Token">
            <input value={manualToken} onChange={e => setManualToken(e.target.value)}
              placeholder="Paste your reset token here" style={inp} />
          </Field>
          <Field label="New Password">
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
              placeholder="Min 6 characters" style={inp} />
          </Field>
          <Field label="Confirm Password">
            <input type="password" value={confirmPass} onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat new password" style={inp}
              onKeyDown={e => e.key === 'Enter' && doReset()} />
          </Field>
          <PrimaryBtn onClick={doReset} loading={loading}>Reset Password ✅</PrimaryBtn>
          <BottomText>
            <Link onClick={() => { setScreen('forgot'); setError('') }}>← Back</Link>
          </BottomText>
        </>}
      </div>
    </div>
  )
}

// ── Reusable components ──
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      {children}
    </div>
  )
}

function PrimaryBtn({ onClick, loading, children }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: '100%', padding: '0.8rem', borderRadius: 10,
      background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,var(--violet),#5B21B6)',
      color: 'white', border: 'none', fontSize: '0.9rem', fontWeight: 700,
      cursor: loading ? 'wait' : 'pointer', marginTop: '0.25rem',
      boxShadow: '0 4px 18px rgba(124,58,237,0.4)', transition: 'all 0.2s',
      fontFamily: 'Inter,sans-serif',
    }}>
      {loading ? '⏳ Please wait…' : children}
    </button>
  )
}

function BottomText({ children }) {
  return (
    <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
      {children}
    </p>
  )
}

function Link({ onClick, children }) {
  return (
    <span onClick={onClick} style={{ color: 'var(--violet2)', cursor: 'pointer', fontWeight: 600 }}>
      {children}
    </span>
  )
}

const inp = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
  color: 'var(--text)', fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif',
}
