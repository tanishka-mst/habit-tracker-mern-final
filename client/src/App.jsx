import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import HabitModal from './components/HabitModal'
import ToastContainer from './components/ToastContainer'
import { toast } from './hooks/useToast'
import { LayoutDashboard, CheckSquare, BarChart2, Trophy, User } from 'lucide-react'

import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Habits       from './pages/Habits'
import Analytics    from './pages/Analytics'
import Achievements from './pages/Achievements'
import Profile      from './pages/Profile'

const BOTTOM_NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Home'    },
  { to: '/habits',       icon: CheckSquare,     label: 'Habits'  },
  { to: '/analytics',    icon: BarChart2,        label: 'Stats'   },
  { to: '/achievements', icon: Trophy,           label: 'Awards'  },
  { to: '/profile',      icon: User,             label: 'Profile' },
]

function ProtectedLayout() {
  const { user, addHabit, updateHabit } = useAuth()
  const location = useLocation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)

  if (!user) return <Navigate to="/login" replace />

  const openAdd  = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (habit) => { setEditing(habit); setModalOpen(true) }

  const handleSave = (form, editId) => {
    if (editId) {
      updateHabit(editId, form)
      toast('Habit updated ✏️', 'success')
    } else {
      addHabit(form)
      toast(`"${form.title}" created! 🚀`, 'success')
    }
  }

  return (
    <>
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="main-wrapper" style={{ marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topbar path={location.pathname} onAddHabit={openAdd} />
        <main className="main-padding" style={{ padding: '2rem', flex: 1 }}>
          <Routes>
            <Route path="/"             element={<Dashboard    onAddHabit={openAdd} onEdit={openEdit} />} />
            <Route path="/habits"       element={<Habits       onAddHabit={openAdd} onEdit={openEdit} />} />
            <Route path="/analytics"    element={<Analytics   />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/profile"      element={<Profile      />} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom nav — shown only on mobile via CSS */}
      <nav className="bottom-nav">
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, textDecoration: 'none', padding: '0.25rem 0.75rem',
            color: isActive ? 'var(--violet2)' : 'var(--muted)',
            transition: 'color 0.2s',
          })}>
            <Icon size={20} />
            <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <HabitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editing={editing}
      />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/*"     element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  )
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : children
}
