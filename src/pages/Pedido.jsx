import { ActionIcon, Box, Button, Chip, Group, LoadingOverlay, Modal, NativeSelect, Text, TextInput, Tooltip } from "@mantine/core";
import { UserAuth } from "../context/AuthContext";
import { DataApp } from "../context/DataContext";
import { useEffect } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconDeviceFloppy, IconEdit, IconSquarePlus, IconUser } from "@tabler/icons-react";
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
    await consumirAPI('/listarProductos', { opcion: 'PEDIDO',id:user.sucursal });
    await consumirAPI('/listarPedidos', { opcion: 'PEDIDOS',id:user.usuario ,id_sucursal:user.sucursal });
    await consumirAPI('/listarSucursales', { opcion: 'T',id:0 })
    await consumirAPI('/listarClasificador', { opcion: 'T',id:0 })
    const id = await consumirAPI('/listarControlCajas', { opcion: 'ACTIVA',id:user.sucursal });
    setIdCaja(id[0]?.id_control_caja);
    const pedidoInciado = pedidos.find(f=>f.estado = 'PENDIENTE')
    console.log('iniciando',pedidos,pedidoInciado,id);
    
    if(pedidoInciado){
      setIdPedido(pedidoInciado.id_pedido)
      //tambien precargar los detalles
    } 
  }
//id_pedido,fid_usuario,fid_control_caja,mesa,metodo_pago,codigo_sync,estado
  const form = useForm({
      mode: 'uncontrolled',
      initialValues: {
        id_pedido:0,
        fid_usuario:0,
        fid_control_caja:0,
        mesa:'',
        metodo_pago:'',
        codigo_sync:'',
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
      { accessorKey: 'consumo',header: 'Consumo',},
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
        <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)}>
          <IconEdit color="orange" />
        </ActionIcon>
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
    await cargarData();

    //todo: hacer tipo carrito de compras y al ultimo confirmar pedido y registrar pedido y sus detalles 
  }

  const crudPedidoDetalle = async (data,eliminar) => {
    let newPedidoDetalle = { ...data };
    if (data.id_pedido) {
      newPedidoDetalle = { ...data, operacion: 'U'};
    } else {
      newPedidoDetalle = { ...data, operacion: 'I'};
    }
    if (eliminar) newPedidoDetalle.operacion = 'D';
    const id = await consumirAPI('/crudPedidoDetalle', newPedidoDetalle);
    // form.reset(); resetear el carrito
    await cargarDetalle();

    //todo: hacer tipo carrito de compras y al ultimo confirmar pedido y registrar pedido y sus detalles 
  }

  const cargarDetalle = async ()=>{
    await consumirAPI('/listarProductoDetalles', { opcion: 'PEDIDO',id:user.sucursal });
  }

  const eliminarDetalle = (item)=>{
    console.log('rev',item);
    
    const pivot = detalle.filter(f=>f.id != item.id)
    setDetalle(pivot);
  }

  const agregarDetalle = (data)=>{
    console.log('el prodcuto',data);
    const newDetalle = {
        id: nanoid(10),
        fid_pedido: idPedido,
        fid_producto:data.id_producto,
        fid_promocion:data.id_promocion,
        nombre:data.id_producto ? productos.find(f=>f.id_producto == data.id_producto)?.descripcion:promociones.find(f=>f.id_promocion == data.id_promocion)?.nombre,
        cantidad: 1,
        descuento: 0,//?revisar a ca como sacr el valor de descuento
        precio:data.precio,//? data.precio - (calculo de descauento) a este valor hacer el calculo con el monto de descuento
      }
    setDetalle([...detalle,newDetalle])
    setGrupo('')
    console.log('el detalle',detalle);
    // ,fid_pedido,fid_producto,cantidad,descuento,precio_unidad,fid_codigo_sync
  }

  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <Text size='2rem' mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        {user?.sucursal && `Pedidos Sucursal - ${sucursales.find(f=>f.id_sucursal == user.sucursal)?.nombre}`}
        {!user?.sucursal && `No cuenta con sucursal vinculada. Por favor coordinar con el administrador`} 
      </Text>
      {idPedido &&
      <Box className="grid-detalle">
        {detalle.map(i=>(
          <Chip defaultChecked variant="light" size="lg" radius={"lg"} key={i.id_producto || i.id_promocion} onClick={()=>eliminarDetalle(i)}>{i.nombre} - {i.precio}</Chip>
        ))
        }
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
        {!idPedido && <MantineReactTable table={table} />}
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