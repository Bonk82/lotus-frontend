// src/context/AuthContext.jsx
import { useContext } from 'react';
import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ball, setBall] = useState(0)

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log({userData});
    setBall(5)
    navigate('/'); // Redirige a la página principal después del login
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('saliendo');
    setBall(10)
    // return redirect('/login');
    // navigate('/login'); // Redirige a la página de login después del logout
  };

  return (
    <AuthContext.Provider value={{ user,ball, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};