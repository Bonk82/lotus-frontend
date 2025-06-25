import { Button, Text } from "@mantine/core"
import { UserAuth } from '../context/AuthContext';
import { useEffect } from "react";
import { useState } from "react";
import apiClient from "../servicios/apiClient";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user } = UserAuth();
  const [menu, setMenu] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Usuario autenticado:', user);
    if (user) cargarMenu(user.rol);
    else setMenu([]);      
  }, [user])

  const cargarMenu = async (rol) => {
    try {
      const resp = await apiClient.get('/listarMenu', { params: {opcion:'ROL', id: rol } });
      setMenu(resp);
    } catch (error) {
      console.error('Error al cargar el menú:', error);
    }
  }

  return (
    <div>
      <Text size="lg" style={{marginBottom: '1rem'}}>Menú</Text>
      {menu.map((item, index) => (
        <Button key={index} variant="light" color="violet.4" onClick={() => navigate(item.ruta)}
        style={{ width: '100%', marginBottom: '0.8rem',letterSpacing: '0.4rem',fontWeight: 'bolder',fontSize: '1.2rem' }}>
          {item.descripcion}
        </Button>
      ))}
    </div>
  )
}

export default Navbar