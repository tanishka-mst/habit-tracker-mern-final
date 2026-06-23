
import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import HabitModal from './components/HabitModal'
import ToastContainer from './components/ToastContainer'
import { toast } from './hooks/useToast'

import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Habits       from './pages/Habits'
import Analytics    from './pages/Analytics'
import Achievements from './pages/Achievements'
import Profile      from './pages/Profile'

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
      <Sidebar />
      <div style={{ marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topbar path={location.pathname} onAddHabit={openAdd} />
        <main style={{ padding: '2rem', flex: 1 }}>
          <Routes>
            <Route path="/"             element={<Dashboard    onAddHabit={openAdd} onEdit={openEdit} />} />
            <Route path="/habits"       element={<Habits       onAddHabit={openAdd} onEdit={openEdit} />} />
            <Route path="/analytics"   element={<Analytics   />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/profile"      element={<Profile      />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

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


