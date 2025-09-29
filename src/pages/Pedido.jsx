/* eslint-disable react/prop-types */
import { ActionIcon, Box, Button, Chip, Group, LoadingOverlay, Modal, NativeSelect, NumberFormatter, NumberInput, Space, Text, TextInput, Tooltip } from "@mantine/core";
import { UserAuth } from "../context/AuthContext";
import { DataApp } from "../context/DataContext";
import { useEffect } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconArrowBackUpDouble, IconBottle, IconCash, IconDeviceFloppy, IconEdit, IconSquarePlus, IconTrash, IconUser } from "@tabler/icons-react";
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { nanoid } from "nanoid";
import { modals } from "@mantine/modals";

const Pedido = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,productos,sucursales,parametricas,pedidos,toast,promociones } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);
  const [grupo, setGrupo] = useState('')
  const [idPedido, setIdPedido] = useState(null)
  const [tipoPago, setTipoPago] = useState('')
  const [idCaja, setIdCaja] = useState(0)
  const [totalConciliar, setTotalConciliar] = useState(0)
  const [detalle, setDetalle] = useState([])
  const [cambio, setCambio] = useState(0)

  useEffect(() => {
    if(user?.sucursal) cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const cargarData = async () =>{
    await consumirAPI('/listarProductos', { opcion: 'PEDIDO',id:user.sucursal });
    const pivot = await consumirAPI('/listarPedidos', { opcion: 'PEDIDOS',id:user.usuario ,id_sucursal:user.sucursal });
    if(sucursales.length==0) await consumirAPI('/listarSucursales', { opcion: 'T',id:0 })
    if(parametricas.length == 0) await consumirAPI('/listarClasificador', { opcion: 'T',id:0 })
    const id = await consumirAPI('/listarControlCajas', { opcion: 'ACTIVA',id:user.sucursal });
    setIdCaja(id[0]?.id_control_caja);
    if(promociones.length == 0) await consumirAPI('/listarPromociones', { opcion: 'SUCURSAL',id:user.sucursal });
    let total = 0;
    pivot.forEach(p=>{
      if(p.estado != 'CONCILIADO') total += Number(p.total)
    })
    setTotalConciliar(total);
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
      // { accessorKey: 'estado',header: 'ID - Estado',},
      { accessorFn: (row) => `${row.id_pedido} - ${row.estado}`,header: 'ID - Estado',id:'estado',},
      { accessorKey: 'total',header: 'Total Bs.',},
      { accessorKey: 'mesa',header: 'Mesa',},
      { accessorKey: 'metodo_pago',header: 'Método Pago',},
      { accessorKey: 'consumo',header: 'Consumo',Cell:({cell})=>(
                <div>
                  <ul>
                    {cell.getValue()?.map(c => <li key={nanoid(5)}>{c.producto || c.promocion}</li>)}
                  </ul>
                </div>
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

  const table = useMantineReactTable({
    columns,
    data: pedidos,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        {!['CONCILIADO'].includes(row.original.estado) &&
        <>
        <Tooltip label="Editar Pedido" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Revisar Consumo" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => cargarDetalle(row.original)}>
            <IconBottle color="cyan" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Anular Pedido" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => confirmarAnular(row.original)}>
            <IconArrowBackUpDouble color="red" />
          </ActionIcon>
        </Tooltip>
        </>
        }
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <>
        <Box style={{display:'flex',width:'100%',justifyContent:'start',alignItems:'start',gap:'1rem'}} visibleFrom="md">
          <Tooltip label="Realizar Pedido" position="bottom" withArrow>
            <Button onClick={()=>mostrarRegistro()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md" variant="gradient" gradient={{ from: 'violet', to: '#2c0d57', deg: 180 }} >Nuevo Pedido</Button>
          </Tooltip>
          <Text size="lg" fs="italic" c="cyan" fw={700} visibleFrom="md">Monto por Conciliar: <NumberFormatter prefix="Bs. " value={totalConciliar} thousandSeparator /></Text>
        </Box>
        <Box style={{display:'flex',flexDirection:'column',width:'100%',justifyContent:'start',alignItems:'start',gap:'1rem'}} hiddenFrom="md">
          <Tooltip label="Realizar Pedido" position="bottom" withArrow>
            <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 180 }} onClick={()=>mostrarRegistro()}>
              <IconSquarePlus />
            </ActionIcon>
          </Tooltip>
          <Text size="md" fs="italic" c="cyan" fw={700}><NumberFormatter prefix="Bs. " value={totalConciliar} thousandSeparator /></Text>
        </Box>
      </>
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
    if (eliminar) newPedido.operacion = 'A';
    const id = await consumirAPI('/crudPedido', newPedido);
    if(!eliminar){
      setTipoPago(newPedido.metodo_pago);
      setIdPedido(id[0]?.message?.split('|')[1]);
      close();
    }
    // form.reset(); resetear el carrito
    const pivot = await consumirAPI('/listarPedidos', { opcion: 'PEDIDOS',id:user.usuario ,id_sucursal:user.sucursal });
    let total = 0;
    pivot.forEach(p=>{
      if(p.estado != 'CONCILIADO') total += Number(p.total)
    })
    setTotalConciliar(total);
  }

  const cargarDetalle = async (data)=>{
    setIdPedido(data.id_pedido);
    setDetalle(data.consumo);
    setTipoPago(data.metodo_pago);
    setCambio(0);
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
        const pivot = await consumirAPI('/listarPedidos', { opcion: 'PEDIDOS',id:user.usuario ,id_sucursal:user.sucursal });
        let total = 0;
        pivot.forEach(p=>{
        if(p.estado != 'CONCILIADO') total += Number(p.total)
    })
    setTotalConciliar(total);
      }
    });
  }

  const calcularCambio = (event)=>{
    console.log(event);
    
    // console.log(formPedido.getValues().monto_total,formPedido.getValues().monto_efectivo);
    const total = detalle.reduce((ac,el)=>ac+Number(el.precio_venta),0).toFixed(0) 
    const dif = Number(event.target.defaultValue.replace('Bs. ','').replace(',','')) - Number(total)
    setCambio(dif)
  }

  const confirmarAnular = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Anulación',
      centered: true,
      children: (
        <Text size="sm">Está seguro de ANULAR el pedido</Text>
      ),
      labels: { confirm: 'Anular Pedido', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#240846' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudPedido(e,true),
    });
  }

  return (
    <div>
      <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        {user?.sucursal && `Pedidos Sucursal - ${sucursales.find(f=>f.id_sucursal == user.sucursal)?.nombre}`}
        {!user?.sucursal && `No cuenta con sucursal vinculada. Por favor coordinar con el administrador`} 
      </Text>
      {idPedido && detalle?.length>0 &&
      <Box className="grid-detalle">
        {detalle.map(i=>(
          <Chip defaultChecked variant="light" size="md" radius={"lg"} key={(i.id || i.id_pedido_detalle)} onClick={()=>eliminarDetalle(i)}>{i.nombre} - Bs. {Number(i.precio_venta).toFixed(0)}</Chip>
        ))
        }
        <Box className="total">
          <Button variant="gradient" leftSection={<IconCash size={14}/>} onClick={insertarDetalles}>
            Confirmar<Space w="lg"/>Bs. {detalle.reduce((ac,el)=>ac+Number(el.precio_venta),0).toFixed(0)}
          </Button>
          {/* TOTAL : <Space w="lg" />{detalle.reduce((ac,el)=>ac+Number(el.precio),0).toFixed(2)} */}
        </Box>
        <Text size='sm' color='dimmed'>Método de Pago: {tipoPago}</Text>
        {tipoPago == 'QR' && <img style={{maxWidth:'350px'}} src="../assets/qr01.jpeg" alt="QR de Pago"/>}
        {tipoPago == 'EFECTIVO' && <Box style={{textAlign:'right'}}>
            <NumberInput
              label="Monto Efectivo:"
              placeholder="Monto dado en efectivo" 
              allowDecimal={false}
              min={10}
              max={10000}
              prefix='Bs. '
              onKeyUpCapture={(event)=>calcularCambio(event)}
              leftSection={<IconCash size={16} />}
              width={'250px'}
              />
            <Text size="xl" c="cyan.3">Monto Devolución: {cambio}</Text>
          </Box>}
      </Box>}
      {idPedido>0 && <Box pos={"relative"} mb={10}>
        <Box className="grid-pedido">
          {parametricas.filter(f=>f.grupo == 'GRUPO_PRODUCTO' && f.sub_grupo == 'VENTA').map(e => (
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
          <form onSubmit={form.onSubmit((values) => crudPedido(values))} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
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
              data={[...parametricas.filter(f=>f.grupo == 'METODO_PAGO').map(e=>e.nombre)]}
              required
              leftSection={<IconUser size={16} />}
              key={form.key('metodo_pago')}
              {...form.getInputProps('metodo_pago')}
            />
            <NativeSelect
              label="Estado del Pedido:"
              data={[...parametricas.filter(f=>f.grupo == 'ESTADO_PEDIDO' && !['CONCILIADO','ANULADO'].includes(f.nombre)).map(e=>e.nombre)]}
              required
              disabled={!form.getValues().id_pedido}
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