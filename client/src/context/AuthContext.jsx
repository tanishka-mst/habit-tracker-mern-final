import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]                 = useState(null)
  const [loading, setLoading]           = useState(true)
  const [habits, setHabits]             = useState([])
  const [logs, setLogs]                 = useState([])
  const [achievements, setAchievements] = useState([])

  // ── Boot: restore session from localStorage ──
  useEffect(() => {
    const token     = localStorage.getItem('hf_token')
    const savedUser = localStorage.getItem('hf_user')
    if (token && savedUser) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(JSON.parse(savedUser))
      fetchAllData()
    }
    setLoading(false)
  }, [])

  // ── Fetch all real data ──
  const fetchAllData = async () => {
    await Promise.all([fetchHabits(), fetchLogs(), fetchAchievements()])
  }

  // GET /api/habits → { success, habits }
  const fetchHabits = async () => {
    try {
      const { data } = await api.get('/habits')
      const mapped = (data.habits || []).map(mapHabit)
      setHabits(mapped)
      return mapped
    } catch (err) {
      console.error('fetchHabits failed:', err.response?.data || err.message)
      return []
    }
  }

  // GET /api/logs → { success, logs }
  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/logs')
      const mapped = (data.logs || []).map(mapLog)
      setLogs(mapped)
      return mapped
    } catch (err) {
      console.error('fetchLogs failed:', err.response?.data || err.message)
      return []
    }
  }

  // GET /api/achievements → { success, achievements: [{badgeName, earnedAt}] }
  const fetchAchievements = async () => {
    try {
      const { data } = await api.get('/achievements')
      // badgeName is the id stored in DB
      const ids = (data.achievements || []).map(a => a.badgeName)
      setAchievements(ids)
      return ids
    } catch (err) {
      console.error('fetchAchievements failed:', err.response?.data || err.message)
      return []
    }
  }

  // ── Auth ──

  // POST /api/auth/login → { success, token, user: {id,name,email,level,xp} }
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data.success && data.token) {
        localStorage.setItem('hf_token', data.token)
        localStorage.setItem('hf_user',  JSON.stringify(data.user))
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        setUser(data.user)
        await fetchAllData()
        return { ok: true }
      }
      return { ok: false, error: data.message || 'Login failed' }
    } catch (err) {
      console.error('login failed:', err.response?.data || err.message)
      return { ok: false, error: err.response?.data?.message || 'Server se connect nahi ho pa raha. Backend chal raha hai?' }
    }
  }

  // POST /api/auth/register → { success, message, user }
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      if (data.success) return { ok: true }
      return { ok: false, error: data.message || 'Registration failed' }
    } catch (err) {
      console.error('register failed:', err.response?.data || err.message)
      return { ok: false, error: err.response?.data?.message || 'Server se connect nahi ho pa raha' }
    }
  }

  const logout = () => {
    localStorage.removeItem('hf_token')
    localStorage.removeItem('hf_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null); setHabits([]); setLogs([]); setAchievements([])
  }

  // ── Habits CRUD ──

  // POST /api/habits → { success, habit }
  const addHabit = useCallback(async (form) => {
    try {
      const { data } = await api.post('/habits', {
        title:     form.title,
        category:  form.category  || 'General',
        frequency: form.frequency || 'Daily',
        goal:      form.goal      || 1,
      })
      const mapped = mapHabit(data.habit)
      setHabits(prev => [...prev, mapped])
      return mapped
    } catch (err) {
      console.error('addHabit failed:', err.response?.data || err.message)
    }
  }, [])

  // PUT /api/habits/:id → { success, habit }
  const updateHabit = useCallback(async (id, patch) => {
    try {
      await api.put(`/habits/${id}`, patch)
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...patch } : h))
    } catch (err) {
      console.error('updateHabit failed:', err.response?.data || err.message)
    }
  }, [])

  // DELETE /api/habits/:id → { success }
  const deleteHabit = useCallback(async (id) => {
    try {
      await api.delete(`/habits/${id}`)
      setHabits(prev => prev.filter(h => h.id !== id))
      setLogs(prev => prev.filter(l => l.habitId !== id))
    } catch (err) {
      console.error('deleteHabit failed:', err.response?.data || err.message)
    }
  }, [])

  // PUT /api/habits/archive/:id → { success, habit }
  const archiveHabit = useCallback(async (id) => {
    try {
      await api.put(`/habits/archive/${id}`)
      setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: true } : h))
    } catch (err) {
      console.error('archiveHabit failed:', err.response?.data || err.message)
    }
  }, [])

  // POST /api/logs/:habitId/complete → { success, log }
  const markDone = useCallback(async (habitId) => {
    const today = todayStr()
    // Optimistic duplicate check
    if (logs.some(l => l.habitId === habitId && l.date === today)) return false
    try {
      const { data } = await api.post(`/logs/${habitId}/complete`)
      if (data.success) {
        const newLog = mapLog(data.log)
        const nextLogs = [...logs, newLog]
        setLogs(nextLogs)

        // XP: optimistic update locally
        const u = { ...user, xp: (user.xp || 0) + 15 }
        const lvl = u.level || 1
        if (u.xp >= lvl * 500) { u.level = lvl + 1; u.xp = 0 }
        setUser(u)
        localStorage.setItem('hf_user', JSON.stringify(u))

        // Check achievements locally
        checkAchievementsLocal(nextLogs, habits, u, achievements, setAchievements)
        return true
      }
      return false
    } catch (err) {
      // 400 = already completed today
      if (err.response?.status === 400) return false
      console.error('markDone failed:', err.response?.data || err.message)
      return false
    }
  }, [logs, habits, user, achievements])

  const value = {
    user, habits, logs, achievements, loading,
    login, register, logout,
    addHabit, updateHabit, deleteHabit, archiveHabit, markDone,
    fetchAllData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

// ── Mappers: MongoDB doc → frontend shape ──
function mapHabit(h) {
  return {
    id:        h._id,
    title:     h.title,
    category:  h.category  || 'General',
    frequency: h.frequency || 'Daily',
    goal:      h.goal      || 1,
    archived:  h.archived  || false,
    createdAt: h.createdAt,
  }
}

function mapLog(l) {
  return {
    id:        l._id,
    habitId:   typeof l.habitId === 'object' ? l.habitId._id : l.habitId,
    date:      (l.date || '').split('T')[0],
    completed: l.completed,
  }
}

// ── Helpers ──
export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function streakFor(habitId, logs) {
  const dates = logs
    .filter(l => l.habitId === habitId && l.completed)
    .map(l => l.date)
    .sort().reverse()
  let streak = 0
  const base = new Date()
  for (let i = 0; i < dates.length; i++) {
    const exp = new Date(base)
    exp.setDate(base.getDate() - i)
    if (dates[i] === exp.toISOString().split('T')[0]) streak++
    else break
  }
  return streak
}

export function completedToday(habitId, logs) {
  return logs.some(l => l.habitId === habitId && l.date === todayStr() && l.completed)
}

export const ACHIEVEMENTS_DEF = [
  { id: 'first',   icon: '🌱', name: 'First Step',    desc: 'Complete your first habit',  check: (logs) => logs.filter(l=>l.completed).length >= 1 },
  { id: 'ten',     icon: '🔟', name: 'Perfect Ten',    desc: 'Complete 10 habits total',   check: (logs) => logs.filter(l=>l.completed).length >= 10 },
  { id: 'fifty',   icon: '🥇', name: 'Half Century',   desc: 'Complete 50 habits total',   check: (logs) => logs.filter(l=>l.completed).length >= 50 },
  { id: 'century', icon: '💯', name: 'Centurion',      desc: 'Complete 100 habits total',  check: (logs) => logs.filter(l=>l.completed).length >= 100 },
  { id: 'five',    icon: '✋', name: 'High Five',      desc: 'Create 5 habits',            check: (_, habits) => habits.length >= 5 },
  { id: 'variety', icon: '🌈', name: 'Variety Pack',   desc: 'Habits in 4+ categories',    check: (_, habits) => new Set(habits.map(h=>h.category)).size >= 4 },
  { id: 'week',    icon: '📅', name: 'Week Warrior',   desc: '7-day streak on any habit',  check: (logs, habits) => habits.some(h => streakFor(h.id, logs) >= 7) },
  { id: 'month',   icon: '🗓', name: 'Monthly Master', desc: '30-day streak on any habit', check: (logs, habits) => habits.some(h => streakFor(h.id, logs) >= 30) },
  { id: 'level5',  icon: '⚡', name: 'Power User',     desc: 'Reach level 5',              check: (_, __, user) => (user?.level || 0) >= 5 },
]

function checkAchievementsLocal(logs, habits, user, current, setAch) {
  const newOnes = ACHIEVEMENTS_DEF.filter(a => !current.includes(a.id) && a.check(logs, habits, user))
  if (newOnes.length) setAch(prev => [...prev, ...newOnes.map(a => a.id)])
}
