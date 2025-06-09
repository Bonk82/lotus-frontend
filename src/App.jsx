import { Route, Routes } from 'react-router-dom'

import './App.css'
import Login from './components/Login'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoutes'
import About from './components/About'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/about" element={<ProtectedRoute><About/></ProtectedRoute>} />
        <Route path="/contact" element={<h1>Contact Page</h1>} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
