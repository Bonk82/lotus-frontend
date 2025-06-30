import { Box, Button, Text } from "@mantine/core"
import { UserAuth } from '../context/AuthContext';
import { useEffect } from "react";
import { useState } from "react";
import apiClient from "../servicios/apiClient";
import { useNavigate } from "react-router-dom";
import { IconBottle, IconCashRegister, IconTimeline, IconTools, IconUserCheck, IconUserCog, IconUsersGroup } from "@tabler/icons-react";

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

  const icons = [
    <IconUsersGroup key={1}/>,
    <IconBottle key={2} />,
    <IconUserCheck key={3} />,
    <IconUserCog key={4} />,
    <IconCashRegister key={5} />,
    <IconTimeline key={6} />,
    <IconTools key={7} />,
  ]

  return (
    <Box>
      <Text size="lg" style={{marginBottom: '1rem'}}>Menú</Text>
      {menu.map((item, index) => (
        <Button key={index} leftSection={icons[item.nivel -1]} justify='flex-start' variant="light" color="violet.4" fullWidth onClick={() => navigate(item.ruta)}
        style={{ marginBottom: '0.8rem',letterSpacing: '0.4rem',fontWeight: 'bolder',fontSize: '1.2rem' }}>
          {item.descripcion}
        </Button>
      ))}
    </Box>
  )
}

export default Navbar