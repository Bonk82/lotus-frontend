import { ActionIcon, Button, Dialog, Group, Text, TextInput, Tooltip } from '@mantine/core';
import { UserAuth } from '../context/AuthContext';
import { IconPower } from '@tabler/icons-react';
import { useDisclosure, useReducedMotion } from '@mantine/hooks';
import { DataApp } from '../context/DataContext';
import apiClient from '../servicios/apiClient';
import { useForm } from '@mantine/form';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const { user, logout } = UserAuth();
  const { consumirAPI } = DataApp();
  const [opened, { toggle, close }] = useDisclosure(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { pass: '', new_pass: '' },
  });

  const cambiarPassword = () => {
    if(user?.cuenta){
      console.log('el usuario',user.cuenta);
      opened ? close() : toggle();
    }
  }

  const actualizarPassword = async (data) => {
    console.log('la data',data);
    
    const { pass, new_pass } = data;
    // try {
    //   const { pass, new_pass } = form.getValues();
    //   const cambio = await apiClient.get('/login',{params:{operacion:'CP', user, pass,new_pass }});
    //   console.log(cambio);
    // } catch (error) {
    //   console.error('Error al cambiar la contraseña:', error);
    // }finally{
    //   close();
    // }
    const resp = await consumirAPI("/login", {operacion:'CP', user:user.cuenta, pass,new_pass });
    console.log('respuesta cp',resp);
    if(resp?.newToken){
      // const decoded = jwtDecode(resp.newToken);
      // setUser(decoded);
      localStorage.setItem('token', resp.newToken);
      localStorage.setItem('ip', resp.ip);
    }
    form.reset();
    close();
  }

  return (
    <>
    <Group h="100%" style={{ justifyContent: 'space-between' }}>
      <Text fz={'h3'} visibleFrom='md' onClick={cambiarPassword}>{user?.cuenta || 'Anónimo'} - {user?.rol || 'Desconocido'}</Text>
      <Text fz={'h6'} hiddenFrom='md' onClick={cambiarPassword}>{(user?.cuenta?.split('.')[0].substring(0,1)+user?.cuenta?.split('.')[1].substring(0,1) || 'N').toUpperCase()} - {user?.rol || 'N'}</Text>
      <Tooltip label="Cerrar Sesión" position="left" withArrow>
        <ActionIcon variant="filled" aria-label="Settings" onClick={logout}>
          <IconPower style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </Group>
    <Dialog opened={opened} withCloseButton onClose={close} size="lg" radius="md">
      <Text size="sm" mb="xs" fw={500}>
        Cambio de contraseña para la cuenta <strong>{user?.cuenta}</strong>
      </Text>
      <Group align="flex-end">
        <form onSubmit={form.onSubmit((values) => actualizarPassword(values))} style={{width:'100%'}}>
          <TextInput placeholder="contraseña actual" key={form.key('pass')} {...form.getInputProps("pass")} style={{ flex: '1 1 250px' }} />
          <TextInput placeholder="nueva contraseña" key={form.key('new_pass')} {...form.getInputProps("new_pass")} style={{ flex: '1 1 250px',margin:'1rem 0' }} />
          <Button type='submit' fullWidth>Actualizar</Button>
        </form>
      </Group>
    </Dialog>
    </>
  )
}

export default Header