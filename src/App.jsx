import { Route, Routes } from 'react-router-dom'
import '@mantine/core/styles.css';
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { Burger, createTheme, Group, MantineProvider, Skeleton } from '@mantine/core';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoutes'
import Dashboard from './pages/Dashboard';
import Proveedor from './pages/Proveedor';
import Inventario from './pages/Inventario';
import Personal from './pages/Personal';
import Pedido from './pages/Pedido';
import Caja from './pages/Caja';
import Control from './pages/Control';
import Parametrica from './pages/Parametrica';

import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
// import { MantineLogo } from '@mantinex/mantine-logo';

const myTheme =createTheme({
  primaryColor:'violet',
  fontFamily:'Michroma, sans-serif',
})


function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AuthProvider>
      <MantineProvider defaultColorScheme="dark" forceColorScheme="dark" theme={myTheme}>
        <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          LOOOGO{/* <MantineLogo size={30} /> */}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        Navbar
        {Array(15)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} mt="sm" animate={false} />
          ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/" element={<Dashboard/>} />
          <Route path="/proveedor" element={<ProtectedRoute><Proveedor/></ProtectedRoute>} />
          <Route path="/inventario" element={<ProtectedRoute><Inventario/></ProtectedRoute>} />
          <Route path="/personal" element={<ProtectedRoute><Personal/></ProtectedRoute>} />
          <Route path="/pedido" element={<ProtectedRoute><Pedido/></ProtectedRoute>} />
          <Route path="/caja" element={<ProtectedRoute><Caja/></ProtectedRoute>} />
          <Route path="/control" element={<ProtectedRoute><Control/></ProtectedRoute>} />
          <Route path="/parametrica" element={<ProtectedRoute><Parametrica/></ProtectedRoute>} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </AppShell.Main>
    </AppShell>
        
      </MantineProvider>
    </AuthProvider>
  )
}

export default App
