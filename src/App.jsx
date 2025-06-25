import { Route, Routes } from 'react-router-dom'
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { Burger, createTheme, Group, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from "@mantine/modals";
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
import Header from './components/Header';
import Navbar from './components/Navbar';
import { useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
// import { MantineLogo } from '@mantinex/mantine-logo';

const myTheme =createTheme({
  primaryColor:'violet',
  secondaryColor:'grape',
  fontFamily:'Michroma, sans-serif',
})


function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
  const location = useLocation();
  let inicio = false;
  
  if(location.pathname == '/login'){
    inicio = true;
    if(mobileOpened) toggleMobile();
    if(desktopOpened) toggleDesktop();
  } else{
    inicio = false;
  }
  
  return (
    <AuthProvider>
    <DataProvider>
      <MantineProvider defaultColorScheme="dark" forceColorScheme="dark" theme={myTheme}>
        <Notifications/>
        <ModalsProvider>
          <AppShell
            header={{ height: 60 }}
            navbar={{
              width: 300,
              breakpoint: 'sm',
              collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
            }}
            padding="md"
            transitionDuration={700}
            transitionTimingFunction='ease'
          >
            <AppShell.Header style={{ backgroundColor: 'black', color: '#9775fa' , borderBottom: '1px solid #9775fa'}}>
              <Group h="100%" px="md" style={{ justifyContent: 'space-between'}} color='primary'>
                <Group align="center" h="100%" gap="s" style={{ border:'1px solid black', color: '#9775fa', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <Burger color="violet.4" opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" disabled={inicio} />
                  <Burger color="violet.4" opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" disabled={inicio} />
                  LOTUS CLUB
                </Group>
                <Header/>
              </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
              <Navbar/>
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
                <Route path="*" element={<h1>404 Página no encontrada</h1>} />
              </Routes>
            </AppShell.Main>
          </AppShell>
        </ModalsProvider>
      </MantineProvider>
    </DataProvider>
    </AuthProvider>
  )
}

export default App
