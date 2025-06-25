import { ActionIcon, Group } from '@mantine/core';
import { UserAuth } from '../context/AuthContext';
import { IconPower } from '@tabler/icons-react';

const Header = () => {
  const { user, logout } = UserAuth();
  return (
    <Group h="100%" px="md" style={{ justifyContent: 'space-between' }}>
      <strong>{user?.cuenta || 'Anónimo'} - {user?.rol || 'Desconocido'}</strong>
      <ActionIcon variant="filled" aria-label="Settings" onClick={logout}>
        <IconPower style={{ width: '70%', height: '70%' }} stroke={1.5} />
      </ActionIcon>
    </Group>
  )
}

export default Header