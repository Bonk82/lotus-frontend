// src/context/AuthContext.jsx
import { useContext } from 'react';
import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../servicios/apiClient';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const login = async (userData) => {
    console.log({userData});
    const { user, pass } = userData;
    try {
      const resp = await apiClient.get('/login',{params:{operacion:'V', user, pass }});
      console.log({resp});
      setUser(userData);
      localStorage.setItem('token', JSON.stringify(resp));
      navigate('/'); // Redirige a la página principal después del login
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // Aquí podrías manejar el error, por ejemplo, mostrar un mensaje al usuario
      // throw error; // Re-lanza el error para que pueda ser manejado en el componente que llama a login
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('saliendo');
    // return redirect('/login');
    // navigate('/login'); // Redirige a la página de login después del logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};