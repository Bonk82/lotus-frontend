import { Route, Routes } from 'react-router-dom'
import '@mantine/core/styles.css';
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { createTheme, MantineProvider } from '@mantine/core';
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoutes'
import Dashboard from './pages/Dashboard';
import Proveedor from './pages/Proveedor';
import Inventario from './pages/Inventario';
import Personal from './pages/Personal';
import Pedido from './pages/Pedido';
import Caja from './pages/Caja';
import Control from './pages/Control';
import Parametrica from './pages/Parametrica';

const myTheme =createTheme({
  primaryColor:'cyan',
  fontFamily:'Michroma, sans-serif',
})


function App() {
  return (
    <AuthProvider>
      <MantineProvider defaultColorScheme="dark" forceColorScheme="dark" theme={myTheme}>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/" element={<Dashboard/>} />
          <Route path="/proveedor" element={<ProtectedRoute><Proveedor/></ProtectedRoute>} />
          <Route path="/inventario" element={<ProtectedRoute><Inventario/></ProtectedRoute>} />
          <Route path="/personal" element={<ProtectedRoute><Personal/></ProtectedRoute>} />
          <Route path="/pedido" element={<ProtectedRoute><Pedido/></ProtectedRoute>} />
          <Route path="/caja" element={<ProtectedRoute><Caja/></ProtectedRoute>} />
          <Route path="/control" element={<ProtectedRoute><Control/></ProtectedRoute>} />
          <Route path="/parametrica" element={<ProtectedRoute><Parametrica/></ProtectedRoute>} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </MantineProvider>
    </AuthProvider>
  )
}

export default App
