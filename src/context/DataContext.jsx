// src/context/AuthContext.jsx
import { useContext } from 'react';
import { createContext, useState } from 'react';
import apiClient from '../servicios/apiClient';
import { notifications } from '@mantine/notifications';
import classes from '../toast.module.css';
import { useEffect } from 'react';
import { UserAuth } from './AuthContext';

// eslint-disable-next-line react-refresh/only-export-components
export const DataContext = createContext();
// eslint-disable-next-line react/prop-types
export const DataProvider = ({ children }) => {
  const { user, logout} = UserAuth();
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [roles, setRoles] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [cajas, setCajas] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [ingresoDetalles, setIngresoDetalles] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [precios, setPrecios] = useState([]);
  const [parametricas, setParametricas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    if(user) consumirAPI('/listarClasificador', { opcion: 'T' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const toast = (title,message,type) =>{
    let color = type
    if(type == 'success') color = 'violet.9';
    if(type == 'info') color = 'blue.9';
    if(type == 'warning') color = 'cyan.9';
    if(type == 'error') color = 'rgba(143, 0, 0, 1)';
    notifications.show({
      title,
      message,
      color,
      classNames: classes,
    })
  }

  const consumirAPI = async( ruta,parametros) =>{
    setLoading(true);
    parametros.cache = new Date().getTime();
    try {
      const resp = await apiClient.get(ruta, { params: { ...parametros }});
      if(ruta === '/listarProductos') setProductos(resp);
      if(ruta === '/listarProveedores') setProveedores(resp);
      if(ruta === '/listarSucursales') setSucursales(resp);
      if(ruta === '/listarRoles') setRoles(resp);
      if(ruta === '/listarComponentes') setComponentes(resp);
      if(ruta === '/listarControlCajas') setCajas(resp);
      if(ruta === '/listarIngresos') setIngresos(resp);
      if(ruta === '/listarIngresoDetalles') setIngresoDetalles(resp);
      if(ruta === '/listarPedidos') setPedidos(resp);
      if(ruta === '/listarPromociones') setPromociones(resp);
      if(ruta === '/listarSucursalProductos') setPrecios(resp);
      if(ruta === '/listarClasificador') setParametricas(resp);
      if(ruta === '/listarUsuarios') setUsuarios(resp);
      console.log('API Response:', ruta, resp);
      
      if(ruta.startsWith('/crud') && resp[0]?.message) {
        toast(`Control ${ruta.replace('/crud','')}`, resp[0].message, 'success');
      }
      if([401,402,403].includes(resp.status)) logout();
      return resp;
    } catch (error) {
      console.error('Error al consumir data:', error);
      if(error.message?.includes('Token') || error.includes('Token')){
        logout();
      }else{
        toast('Error API:',error.message || error,'error')
      }
    }finally {
      setLoading(false);
    }
  }

  const subirArchivo = async(ruta,formData) =>{
    setLoading(true);
    try {
      const resp = await apiClient.post(ruta, formData,{ headers: { 'Content-Type': 'multipart/form-data' } });
      toast('Archivo subido', resp.message, 'success');
      return resp;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      toast('Error al subir archivo:', error.message || error, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DataContext.Provider value={{ loading,productos, proveedores, sucursales, roles, componentes, cajas, ingresos, ingresoDetalles, pedidos, promociones, consumirAPI,toast,parametricas,usuarios,precios,subirArchivo }}>
      {children}
    </DataContext.Provider>
  );
};

export const DataApp = () => {
  return useContext(DataContext);
};