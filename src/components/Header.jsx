import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { UserAuth } from '../context/AuthContext';
import { IconPower } from '@tabler/icons-react';

const Header = () => {
  const { user, logout } = UserAuth();
  return (
    <Group h="100%" px="md" style={{ justifyContent: 'space-between' }}>
      <Text fz={'h3'} visibleFrom='md'>{user?.cuenta || 'Anónimo'} - {user?.rol || 'Desconocido'}</Text>
      <Text fz={'h6'} hiddenFrom='md'>{(user?.cuenta?.split('.')[0].substring(0,1)+user?.cuenta?.split('.')[0].substring(0,1) || 'N').toUpperCase()} - {user?.rol || 'N'}</Text>
      <Tooltip label="Cerrar Sesión" position="left" withArrow>
        <ActionIcon variant="filled" aria-label="Settings" onClick={logout}>
          <IconPower style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </Group>
  )
}

export default Header