import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import {jwtDecode} from "jwt-decode";

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children }) => {
  const { user,ball,logout } = UserAuth();
  // const navigate = useNavigate();
  console.log('el user',user,ball);
 
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    try {
      // Aquí podrías hacer una petición a tu backend para verificar el token
      // Si no tienes backend, puedes verificar la expiración del token JWT
      const decoded = jwtDecode(userData.token);
      if (decoded.exp * 1000 < Date.now()) {
        logout(); // Token expirado
        return <Navigate to="/login" replace />; // Redirige a la página de login
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      logout(); // Token inválido
      return <Navigate to="/login" replace />; // Redirige a la página de login
    }
  }

  if (!user || storedUser) {
    return <Navigate to="/login" replace />; // Redirige a la página de login
  }
  
  return children;
};

export default ProtectedRoute;