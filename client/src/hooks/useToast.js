import { useState, useCallback } from 'react'

let _setToasts = null

export function useToastState() {
  const [toasts, setToasts] = useState([])
  _setToasts = setToasts
  return toasts
}

export function toast(message, type = 'success') {
  if (!_setToasts) return
  const id = Date.now()
  _setToasts(prev => [...prev, { id, message, type }])
  setTimeout(() => _setToasts(prev => prev.filter(t => t.id !== id)), 3200)
}
