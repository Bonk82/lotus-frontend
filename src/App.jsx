import { Route, Routes } from 'react-router-dom'
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import './App.css'
import { AuthProvider } from './context/AuthContext'
import { Burger, createTheme, em, Group, Image, MantineProvider, Text } from '@mantine/core';
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
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import Header from './components/Header';
import Navbar from './components/Navbar';
import { useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';

const myTheme =createTheme({
  primaryColor:'violet',
  primaryShade: 7,
  // colors: {
  //   grape: ['#f8f0ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87', '#4c1d95'],
  // },
  secondaryColor:'grape',
  fontFamily:'Michroma, sans-serif',
  cursorType:'pointer',
  defaultGradient:{
    from:'violet',
    to:'#2c0d57',
    deg:180,
  },
})


function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
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
        <Notifications position="top-right" zIndex={400}/>
        <ModalsProvider>
          <AppShell
            header={{ height: 60}}
            navbar={{
              width: 300 ,
              breakpoint: 'sm',
              collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
            }}
            transitionDuration={600}
            transitionTimingFunction='ease'
            style={{maxWidth: '100vw', overflowX: 'hidden'}}
          >
            <AppShell.Header style={{ backgroundColor: 'black', color: '#9775fa' , borderBottom: '1px solid #9775fa',boxShadow: '0 2px 10px rgba(144, 64, 168, 0.7)'}}>
              <Group h="100%" px="md" style={{ justifyContent: 'space-between'}} color='primary'>
                <Group align="center" h="100%" w={'50%'} gap="s" style={{color: '#9775fa', fontSize: '1.2rem', fontWeight: 'bold',display:"flex" }}>
                  <Burger color="violet.4" opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" disabled={inicio} />
                  <Burger color="violet.4" opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" disabled={inicio} />
                  <Image src={'./assets/LOGO.png'} h={55} w={'auto'}></Image>
                  <Text size='xl' fw={700} visibleFrom='md'>LOTUS CLUB</Text>
                </Group>
                <Header/>
              </Group>
            </AppShell.Header>
            <AppShell.Navbar w={isMobile ? '100vw' : 300} p="sm" style={{overflow:'hidden',borderRight:'1px solid #9775fa'}} bg={{base:'#180c26',md:'transparent'}} onClick={toggleMobile}>
              <Navbar/>
            </AppShell.Navbar>
            <AppShell.Main style={{position:"relative"}}>
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
