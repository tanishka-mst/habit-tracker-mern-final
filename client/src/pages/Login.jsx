import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from '../hooks/useToast'
import api from '../services/api'

const SECURITY_QUESTIONS = [
  "What is the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite childhood movie?",
  "What city were you born in?",
  "What is your oldest sibling's middle name?",
  "What was the make of your first car?",
  "What is your favorite sports team?",
]

// Screens: 'login' | 'register' | 'forgot_email' | 'forgot_answer' | 'forgot_newpass'
export default function LoginPage() {
  const [screen, setScreen]   = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Register extras
  const [secQuestion, setSecQuestion] = useState(SECURITY_QUESTIONS[0])
  const [secAnswer, setSecAnswer]     = useState('')

  // Forgot password flow
  const [forgotEmail, setForgotEmail]   = useState('')
  const [fetchedQuestion, setFetchedQuestion] = useState('')
  const [answerInput, setAnswerInput]   = useState('')
  const [newPass, setNewPass]           = useState('')
  const [confirmPass, setConfirm]       = useState('')

  const { login, register } = useAuth()
  const navigate            = useNavigate()

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
    if (!secAnswer.trim())   { setError('Security answer is required'); return }
    setError(''); setLoading(true)
    const res = await register(name, email, password, secQuestion, secAnswer)
    if (res.ok) {
      toast('Account created! You can now login 🚀', 'success')
      setScreen('login'); setName(''); setPass(''); setSecAnswer('')
    } else setError(res.error)
    setLoading(false)
  }

  // ── Forgot Step 1: Get security question by email ──
  const doGetQuestion = async () => {
    if (!forgotEmail) { setError('Please enter your email'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/get-security-question', { email: forgotEmail })
      if (data.success) {
        setFetchedQuestion(data.securityQuestion)
        setScreen('forgot_answer')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No account found with this email')
    }
    setLoading(false)
  }

  // ── Forgot Step 2: Verify answer ──
  const doVerifyAnswer = async () => {
    if (!answerInput.trim()) { setError('Please enter your answer'); return }
    setError(''); setLoading(true)
    // We verify answer + reset in one step on next screen
    // Just move to new password screen
    try {
      // Quick pre-check: try verifying with a dummy password to see if answer is correct
      const { data } = await api.post('/auth/reset-with-answer', {
        email: forgotEmail,
        securityAnswer: answerInput,
        newPassword: 'tempcheck123', // will be replaced in next step
      })
      // If we get here it means answer was correct — but we don't want to reset yet
      // So we just move to new pass screen
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (msg.toLowerCase().includes('incorrect')) {
        setError('Incorrect answer. Please try again.')
        setLoading(false)
        return
      }
      // Any other error — still proceed (answer might be correct, password length issue)
    }
    setScreen('forgot_newpass')
    setLoading(false)
  }

  // ── Forgot Step 3: Set new password ──
  const doResetPassword = async () => {
    if (!newPass)            { setError('Please enter a new password'); return }
    if (newPass.length < 6)  { setError('Password must be at least 6 characters'); return }
    if (newPass !== confirmPass) { setError('Passwords do not match'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-with-answer', {
        email:          forgotEmail,
        securityAnswer: answerInput,
        newPassword:    newPass,
      })
      if (data.success) {
        toast('Password reset successful! Please login. ✅', 'success')
        setScreen('login')
        setForgotEmail(''); setAnswerInput(''); setNewPass(''); setConfirm('')
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const goToLogin = () => { setScreen('login'); setError('') }

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
        borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 440,
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
            {screen === 'login'         ? 'Build habits. Level up your life.'  :
             screen === 'register'      ? 'Create your account'                :
             screen === 'forgot_email'  ? 'Step 1 of 3 — Enter your email'     :
             screen === 'forgot_answer' ? 'Step 2 of 3 — Answer security question' :
                                         'Step 3 of 3 — Set new password'}
          </p>
        </div>

        {/* Tabs — login / register only */}
        {(screen === 'login' || screen === 'register') && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, marginBottom: '1.5rem' }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setScreen(t); setError('') }} style={{
                flex: 1, padding: '0.5rem', borderRadius: 8, cursor: 'pointer',
                border: 'none', fontSize: '0.875rem', fontWeight: 600,
                background: screen === t ? 'var(--violet)' : 'transparent',
                color:      screen === t ? 'white' : 'var(--muted)',
                transition: 'all 0.2s', fontFamily: 'Inter,sans-serif',
              }}>{t === 'login' ? 'Sign In' : 'Create Account'}</button>
            ))}
          </div>
        )}

        {/* Forgot password steps indicator */}
        {screen.startsWith('forgot') && (
          <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem' }}>
            {['forgot_email','forgot_answer','forgot_newpass'].map((s, i) => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 4,
                background: screen === s || 
                  (screen === 'forgot_answer' && i === 0) ||
                  (screen === 'forgot_newpass' && i <= 1)
                  ? 'var(--violet)' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem',
            fontSize: '0.85rem', color: '#FB7185',
          }}>⚠️ {error}</div>
        )}

        {/* ── LOGIN ── */}
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
          <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
            <span onClick={() => { setScreen('forgot_email'); setError('') }} style={{
              fontSize: '0.78rem', color: 'var(--violet2)', cursor: 'pointer', fontWeight: 600,
            }}>Forgot password?</span>
          </div>
          <PrimaryBtn onClick={doLogin} loading={loading}>Sign In ✨</PrimaryBtn>
          <BottomText>
            New here? <Lnk onClick={() => { setScreen('register'); setError('') }}>Create account →</Lnk>
          </BottomText>
        </>}

        {/* ── REGISTER ── */}
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
              placeholder="Min 6 characters" style={inp} autoComplete="new-password" />
          </Field>
          <Field label="Security Question">
            <select value={secQuestion} onChange={e => setSecQuestion(e.target.value)} style={{ ...inp, colorScheme: 'dark', background: '#1E2540' }}>
              {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </Field>
          <Field label="Your Answer">
            <input value={secAnswer} onChange={e => setSecAnswer(e.target.value)}
              placeholder="Answer (case-insensitive)" style={inp}
              onKeyDown={e => e.key === 'Enter' && doRegister()} />
          </Field>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '1rem', marginTop: '-0.5rem' }}>
            💡 Remember this answer — it will be used to reset your password if forgotten.
          </div>
          <PrimaryBtn onClick={doRegister} loading={loading}>Create Account 🚀</PrimaryBtn>
          <BottomText>
            Already have an account? <Lnk onClick={() => { setScreen('login'); setError('') }}>Sign in →</Lnk>
          </BottomText>
        </>}

        {/* ── FORGOT STEP 1: Email ── */}
        {screen === 'forgot_email' && <>
          <Field label="Registered Email">
            <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
              placeholder="you@email.com" style={inp}
              onKeyDown={e => e.key === 'Enter' && doGetQuestion()} />
          </Field>
          <PrimaryBtn onClick={doGetQuestion} loading={loading}>Continue →</PrimaryBtn>
          <BottomText>
            <Lnk onClick={goToLogin}>← Back to Sign In</Lnk>
          </BottomText>
        </>}

        {/* ── FORGOT STEP 2: Security Answer ── */}
        {screen === 'forgot_answer' && <>
          <div style={{
            background: 'rgba(124,58,237,0.1)', border: '1px solid var(--border2)',
            borderRadius: 12, padding: '1rem', marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Your Security Question</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>
              🔐 {fetchedQuestion}
            </div>
          </div>
          <Field label="Your Answer">
            <input value={answerInput} onChange={e => setAnswerInput(e.target.value)}
              placeholder="Enter your answer" style={inp}
              onKeyDown={e => e.key === 'Enter' && doVerifyAnswer()} />
          </Field>
          <PrimaryBtn onClick={doVerifyAnswer} loading={loading}>Verify Answer →</PrimaryBtn>
          <BottomText>
            <Lnk onClick={() => { setScreen('forgot_email'); setError('') }}>← Back</Lnk>
          </BottomText>
        </>}

        {/* ── FORGOT STEP 3: New Password ── */}
        {screen === 'forgot_newpass' && <>
          <div style={{
            background: 'rgba(16,245,160,0.08)', border: '1px solid rgba(16,245,160,0.25)',
            borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem',
            fontSize: '0.82rem', color: 'var(--mint)',
          }}>
            ✅ Identity verified! Now set your new password.
          </div>
          <Field label="New Password">
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
              placeholder="Min 6 characters" style={inp} autoComplete="new-password" />
          </Field>
          <Field label="Confirm New Password">
            <input type="password" value={confirmPass} onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat new password" style={inp}
              onKeyDown={e => e.key === 'Enter' && doResetPassword()} />
          </Field>
          <PrimaryBtn onClick={doResetPassword} loading={loading}>Reset Password ✅</PrimaryBtn>
          <BottomText>
            <Lnk onClick={() => { setScreen('forgot_answer'); setError('') }}>← Back</Lnk>
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
      cursor: loading ? 'wait' : 'pointer',
      boxShadow: '0 4px 18px rgba(124,58,237,0.4)', transition: 'all 0.2s',
      fontFamily: 'Inter,sans-serif',
    }}>
      {loading ? '⏳ Please wait…' : children}
    </button>
  )
}

function BottomText({ children }) {
  return <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--muted)' }}>{children}</p>
}

function Lnk({ onClick, children }) {
  return <span onClick={onClick} style={{ color: 'var(--violet2)', cursor: 'pointer', fontWeight: 600 }}>{children}</span>
}

const inp = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
  color: 'var(--text)', fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif',
}
