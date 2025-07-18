/* eslint-disable react/prop-types */
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import {jwtDecode} from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const { user,logout } = UserAuth();
  console.log('el user en protected',user);
  let storedUser;
  if(!user){
    storedUser = localStorage.getItem('token');
    if (storedUser) {
      try {
        const decoded = jwtDecode(storedUser);
        // console.log('Token decodificado Protected:', decoded);
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
  }

  if (!user && !storedUser) {
    return <Navigate to="/login" replace />; // Redirige a la página de login
  }

  // if (!user) {
  //   console.log('No hay usuario autenticado, redirigiendo a login');
  //   logout(); // Asegúrate de limpiar el estado del usuario
  //   return <Navigate to="/login" replace />; // Redirige a la página de login
  // }
  
  return children;
};

export default ProtectedRoute;