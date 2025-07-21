/* eslint-disable react/prop-types */
import { ActionIcon, Box, Button, Chip, Group, LoadingOverlay, Modal, NativeSelect, Space, Text, TextInput, Tooltip } from "@mantine/core";
import { UserAuth } from "../context/AuthContext";
import { DataApp } from "../context/DataContext";
import { useEffect } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconBottle, IconCash, IconDeviceFloppy, IconEdit, IconSquarePlus, IconUser } from "@tabler/icons-react";
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { nanoid } from "nanoid";

const Pedido = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,productos,sucursales,parametricas,pedidos,toast,promociones } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);
  const [grupo, setGrupo] = useState('')
  const [idPedido, setIdPedido] = useState(null)
  const [idCaja, setIdCaja] = useState(0)
  const [detalle, setDetalle] = useState([])

  useEffect(() => {
    if(user?.sucursal) cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const cargarData = async () =>{
    if(productos.length == 0) await consumirAPI('/listarProductos', { opcion: 'PEDIDO',id:user.sucursal });
    await consumirAPI('/listarPedidos', { opcion: 'PEDIDOS',id:user.usuario ,id_sucursal:user.sucursal });
    if(sucursales.length==0) await consumirAPI('/listarSucursales', { opcion: 'T',id:0 })
    if(parametricas.length == 0) await consumirAPI('/listarClasificador', { opcion: 'T',id:0 })
    const id = await consumirAPI('/listarControlCajas', { opcion: 'ACTIVA',id:user.sucursal });
    setIdCaja(id[0]?.id_control_caja);
    if(promociones.length == 0) await consumirAPI('/listarPromociones', { opcion: 'SUCURSAL',id:user.sucursal });
  }
  const form = useForm({
      mode: 'uncontrolled',
      initialValues: {
        id_pedido:0,
        fid_usuario:0,
        fid_control_caja:0,
        mesa:'',
        metodo_pago:'',
        estado:'PENDIENTE',
        consumo:[],
      },
      // validate: {
      //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
      // },
    });

  const columns = useMemo(
    () => [
      { accessorKey: 'mesa',header: 'Mesa',},
      { accessorKey: 'metodo_pago',header: 'Método Pago',},
      { accessorKey: 'estado',header: 'Estado',},
      { accessorKey: 'consumo',header: 'Consumo',Cell:({cell})=>(
                <div>{cell.getValue()?.map(c => <div key={c.fid_producto || c.fid_promocion}>{c.producto || c.promocion}</div>)}</div>
              )},
    ],
    [],
  );

  const mostrarRegistro = (data) => {
    console.log('Mostrar registro:', data,idCaja);
    if(!idCaja){
      return toast(`Control Pedidos`, `Sucursal ${sucursales.find(f=>f.id_sucursal == user.sucursal)?.nombre} sin CAJA aperturada`, 'warning');
    }
    open();
    form.reset();
    if (data) form.setValues(data);
    if (!data) form.setValues({'estado':'PENDIENTE','metodo_pago':'EFECTIVO'})
  }

  //?:cuando se haga un nueov pedido, ocultar el gridtable de pedidos y mostrar un grid de los pedidos que haga, 🧴🧴🧴🚬 y elimianr del listado con doble clic, y un boton de confirmar para ajustar las cantidades si hay repetidos y mandar en loop el crud detalle

  //? igual hay que definir la logica de promociones, cuando haya algunas promociones que el precio del producto cambie dinamicamnete

  const table = useMantineReactTable({
    columns,
    data: pedidos,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <ActionIcon variant="subtle" title="Editar Pedido" onClick={() => mostrarRegistro(row.original)}>
          <IconEdit color="orange" />
        </ActionIcon>
        {['PENDIENTE','CONFIRMADO'].includes(row.original.estado) && <ActionIcon variant="subtle" title="Revisar Consumo" onClick={() => cargarDetalle(row.original)}>
          <IconBottle color="cyan" />
        </ActionIcon>}
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Realizar Pedido" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarRegistro()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md" variant="gradient" gradient={{ from: 'violet', to: '#2c0d57', deg: 180 }} >Nuevo Pedido</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 180 }} hiddenFrom="md" onClick={()=>mostrarRegistro()}>
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableHeadCellProps:{style: { fontWeight: 'bold', fontSize: '1.1rem'},},
    mantineTableProps:{striped: true,},
    localization:MRT_Localization_ES
  });

  const crudPedido = async (data,eliminar) => {
    let newPedido = { ...data };
    if (data.id_pedido) {
      newPedido = { ...data, operacion: 'U', usuario_registro: user.usuario };
    } else {
      newPedido = { ...data, operacion: 'I', usuario_registro: user.usuario, fid_usuario:user.usuario,fid_control_caja:idCaja};
    }
    if (eliminar) newPedido.operacion = 'D';
    const id = await consumirAPI('/crudPedido', newPedido);
    setIdPedido(id[0]?.message.split('|')[1]);
    close();
    // form.reset(); resetear el carrito
    await consumirAPI('/listarPedidos', { opcion: 'PEDIDOS',id:user.usuario ,id_sucursal:user.sucursal });
  }

  const cargarDetalle = async (data)=>{
    setIdPedido(data.id_pedido)
    setDetalle(data.consumo)
  }

  const eliminarDetalle = async(item)=>{
    console.log('rev',item);
    let pivot = []
    if(item.id) pivot = detalle.filter(f=>f.id != item.id)
    if(item.id_pedido_detalle){
      item.operacion = 'DF';
      await consumirAPI('/crudPedidoDetalle', item);
      pivot = detalle.filter(f=>f.id_pedido_detalle != item.id_pedido_detalle)
    } 
    setDetalle(pivot);
  }

  const agregarDetalle = (data)=>{
    console.log('el prodcuto',data,detalle);
    const newDetalle = {
        id: nanoid(10),
        operacion : 'I',
        fid_pedido: idPedido,
        fid_producto:data.id_producto,
        fid_promocion:data.id_promocion,
        nombre:data.id_producto ? productos.find(f=>f.id_producto == data.id_producto)?.descripcion:promociones.find(f=>f.id_promocion == data.id_promocion)?.nombre,
        cantidad: 1,
        descuento: 0,//?revisar a ca como sacr el valor de descuento
        precio_venta:data.precio,//? data.precio - (calculo de descauento) a este valor hacer el calculo con el monto de descuento
      }
    setDetalle([...(detalle || []),newDetalle])
    setGrupo('')
    console.log('el detalle',detalle);
  }

  const insertarDetalles = () =>{
    console.log('el detalle',detalle);
    detalle.forEach(async (d,i) => {
      if(d.id) await consumirAPI('/crudPedidoDetalle', d)
      if(i == detalle.length - 1){
        setIdPedido(null);
        setDetalle([]);
        await consumirAPI('/listarPedidos', { opcion: 'PEDIDOS',id:user.usuario ,id_sucursal:user.sucursal });
      }
    });
    
  }

  return (
    <div>
      <Text size='2rem' mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        {user?.sucursal && `Pedidos Sucursal - ${sucursales.find(f=>f.id_sucursal == user.sucursal)?.nombre}`}
        {!user?.sucursal && `No cuenta con sucursal vinculada. Por favor coordinar con el administrador`} 
      </Text>
      {idPedido && detalle?.length>0 &&
      <Box className="grid-detalle">
        {detalle.map(i=>(
          <Chip defaultChecked variant="light" size="lg" radius={"lg"} key={(i.id || i.id_pedido_detalle)} onClick={()=>eliminarDetalle(i)}>{i.nombre} - Bs. {Number(i.precio_venta).toFixed(2)}</Chip>
        ))
        }
        <Box className="total">
          <Button variant="gradient" leftSection={<IconCash size={14}/>} onClick={insertarDetalles}>
            Confirmar<Space w="lg"/>Bs. {detalle.reduce((ac,el)=>ac+Number(el.precio_venta),0).toFixed(2)}
          </Button>
          {/* TOTAL : <Space w="lg" />{detalle.reduce((ac,el)=>ac+Number(el.precio),0).toFixed(2)} */}
        </Box>
      </Box>}
      {idPedido>0 && <Box pos={"relative"} mb={10}>
        <Box className="grid-pedido">
          {parametricas.filter(f=>f.grupo == 'GRUPO_PRODUCTO').map(e => (
            <Box my={10} className="card-prod" key={e.id_clasificador} onClick={()=>setGrupo(e.nombre)}>
              <img className="card-bg" src={`../assets/${e.nombre}.png`} alt=""/>
              <p className="heading">{e.nombre}</p>
            </Box>
          ))}
        </Box>
      </Box>}
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_pedido?'Actualizar Pedido: '+ form.getValues().id_pedido:'Registrar Pedido'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudPedido(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <TextInput
              label="Mesa:"
              placeholder="Ubicación o número de la mesa"
              type='text'
              maxLength={100}
              required
              leftSection={<IconUser size={16} />}
              key={form.key('mesa')}
              {...form.getInputProps('mesa')}
            />
            <NativeSelect
              label="Método Pago:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.grupo == 'METODO_PAGO').map(e=>e.nombre)]}
              required
              leftSection={<IconUser size={16} />}
              key={form.key('metodo_pago')}
              {...form.getInputProps('metodo_pago')}
            />
            <NativeSelect
              label="Estado del Pedido:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.grupo == 'ESTADO_PEDIDO').map(e=>e.nombre)]}
              required
              disabled={user?.rol == 2}
              leftSection={<IconUser size={16} />}
              key={form.key('estado')}
              {...form.getInputProps('estado')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!form.getValues().id_pedido ? 'Registrar':'Actualizar'} Pedido</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={table} />
      </Box>
      <Modal opened={grupo && grupo != 'PROMOS'} onClose={()=>setGrupo('')} title={`Listado de ${grupo}`} size={"xl"}   overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
        <Box className="btn-list">
          {productos.filter(f=>f.grupo == grupo).map(p=>(
            <Button key={p.id_producto} variant="outline" color="#00dbde" onClick={()=>agregarDetalle(p)}>{p.descripcion} - {p.precio}</Button>
          )) }
        </Box>
      </Modal>
      <Modal opened={grupo && grupo == 'PROMOS'} onClose={()=>setGrupo('')} title={`Listado de Promociones`} size={"xl"}   overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
        <Box className="btn-list">
          {promociones.map(p=>(
            <Button key={p.id_promocion} variant="outline" color="#00dbde" onClick={()=>agregarDetalle(p)}>{p.nombre} - {p.precio}</Button>
          )) }
        </Box>
      </Modal>
    </div>
  )
}

export default Pedido