/* eslint-disable react-hooks/exhaustive-deps */
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import {jwtDecode} from "jwt-decode";
import { useEffect } from 'react';

const ProtectedRoute = ({ children,allowedRoles }) => {
  const { user,logout } = UserAuth();
  // console.log('el user en protected',user);
  let storedUser;
  let userRole;

  useEffect(() => {
    revisarUser()
  }, [user])
  
  const revisarUser = () =>{
    if(!user){
      storedUser = localStorage.getItem('token');
      if (storedUser) {
        try {
          const decoded = jwtDecode(storedUser);
          // console.log('Token decodificado Protected:', decoded);
          if (decoded.exp * 1000 < Date.now()) {
            // console.log('token expirado');
            logout(); // Token expirado
            return <Navigate to="/login" replace />; // Redirige a la página de login
          }else{
            userRole = decoded.id_rol
          }
        } catch (error) {
          console.error('Error al verificar el token:', error);
          logout(); // Token inválido
          return <Navigate to="/login" replace />; // Redirige a la página de login
        }
      }
    }else{
      userRole = user.id_rol;
    }
    
    if (!user && !storedUser) {
      // console.log('sin user',user,storedUser);
      logout()
      return <Navigate to="/login" replace />; // Redirige a la página de login
    }
  
    // Verifica si el rol del usuario está permitido
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // console.log('allowed',allowedRoles,userRole,user)
      logout()
      return <Navigate to="/login" replace />;
    }
  }

  
  return children;
};

export default ProtectedRoute;