import React from 'react'
import { useNavigate } from 'react-router-dom'

const LogoutButton: React.FC = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <button className="btn-primary" onClick={handleLogout}>
      Log Out
    </button>
  )
}

export default LogoutButton
