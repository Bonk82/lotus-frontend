/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Alert, Box, Button, Grid, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Select, Table, Text, Textarea, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconBottle, IconBottleOff, IconBuilding, IconCash, IconCashBanknote, IconCheck, IconCreditCard, IconDatabase, IconDeviceFloppy, IconEdit, IconLibraryPlus, IconLock, IconMoneybag, IconNumber, IconRefreshAlert, IconSettings, IconSquarePlus, IconTrash, IconUser } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import dayjs from 'dayjs';
import { modals } from '@mantine/modals';

const Caja = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,cajas,sucursales,parametricas,usuarios,pedidos,toast,productos } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);
  const [openedPedido, { open:openPedido, close:closePedido }] = useDisclosure(false);
  const [openedFaltantes, { open:openFaltantes, close:closeFaltantes }] = useDisclosure(false);
  const [idApertura, setIdApertura] = useState(null)
  const [idEmpleado, setIdEmpleado] = useState(null)
  const [desface, setDesface] = useState(null)
  const [cambio, setCambio] = useState(0)
  const [motivo, setMotivo] = useState('')
  const [faltantes, setFaltantes] = useState([])

  useEffect(() => {
    if(user) cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const icono = <IconAlertCircle/>

  const cargarData = async () =>{
    const id = await consumirAPI('/listarControlCajas', { opcion: 'ACTIVA',id:user.sucursal});
    if(id[0]){
      setIdApertura(id[0]?.id_control_caja);
      const f1 = dayjs(`${id[0]?.inicio}`);
      const horas_apertura = dayjs().diff(f1,'h')
      horas_apertura>16 ? setDesface(dayjs(id[0]?.fecha).format('DD/MM/YYYY')):null;
    } else{
      setIdApertura(null);
      setDesface(null);
    }
    await consumirAPI('/listarControlCajas', { opcion: 'cc.fid_sucursal',id:user.sucursal });
    if(sucursales.length == 0) await consumirAPI('/listarSucursales', { opcion: 'T'});
    if(parametricas.length == 0) await consumirAPI('/listarClasificador', { opcion: 'T'});
    if(productos.length == 0) await consumirAPI('/listarProductos', { opcion: 'T'});
    await consumirAPI('/listarUsuarios', { opcion: 'AA',id:user.sucursal});
    await consumirAPI('/listarPedidos', { opcion: 'CONTROL_CAJA',id:idApertura || id[0]?.id_control_caja});
    
  }

  const refrescarPedidos = async () =>{
    await consumirAPI('/listarPedidos', { opcion: 'CONTROL_CAJA',id:idApertura });
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_control_caja:0,
      fid_sucursal:0,
      fid_usuario_inicio:0,
      monto_inicio:0,
      fid_usuario_cierre:null,
      monto_cierre_qr:0,
      monto_cierre_tarjeta:0,
      monto_cierre_efectivo:0,
      observaciones:'',
      estado:'APERTURA',
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const crudCaja = async (data,eliminar) => {
    const min_efectivo = pedidos.length > 0 ? Number(pedidos.filter(f=>f.metodo_pago == 'EFECTIVO').reduce((ac,el)=>ac+Number(el.consumo?.reduce((ac,el)=>ac+Number(el.precio_venta),0)),0)) + Number(data.monto_inicio) : cajas.filter(f=>f.id_control_caja == data.id_control_caja)[0]?.monto_cierre_efectivo || 0;

    if(Number(data.monto_cierre_efectivo) < min_efectivo && !data.observaciones){
      toast('Control Caja', `El monto de cierre efectivo es menor al monto total de pedidos en efectivo, debe justificar en observaciones`, 'warning');
      return false;
    }
    let newCaja = { ...data };
    if (data.id_control_caja) {
      newCaja = { ...data, operacion: 'U' };
    } else {
      newCaja = { ...data, operacion: 'I', fid_usuario_inicio: user.usuario };
    }
    if (eliminar) newCaja.operacion = 'D';
    if (!newCaja.fid_sucursal) newCaja.fid_sucursal = user.sucursal;
    if (newCaja.estado !== 'APERTURA') newCaja.fid_usuario_cierre = user.usuario
    await consumirAPI('/crudControlCaja', newCaja);
    close();
    form.reset();
    await cargarData();
  }

  const crudUsuario = async (data) => {
    let newUsuario = { ...data };
    newUsuario = { ...data, operacion: 'AU' };
    await consumirAPI('/crudUsuario', newUsuario);
    await consumirAPI('/listarUsuarios', { opcion: 'AA',id:user.sucursal});
  }

  const columns = useMemo(
    () => [
      { accessorKey: 'sucursal',header: 'Sucursal',},
      { accessorKey: 'fecha',header: 'Fecha',Cell:({cell})=>(
          <span>{dayjs(cell.getValue()).format('DD/MM/YYYY')}</span>
        ) },
      { accessorKey: 'usuario_inicio',header: 'Usuario Inicio',},
      { accessorKey: 'monto_inicio',header: 'Monto Inicio', mantineTableBodyCellProps: {align: 'right'}},
      { accessorKey: 'usuario_cierre',header: 'Usuario Cierre',},
      { accessorKey: 'monto_cierre_qr',header: 'Cierre QR',mantineTableBodyCellProps: {align: 'right'}},
      { accessorKey: 'monto_cierre_tarjeta',header: 'Cierre TRJ',mantineTableBodyCellProps: {align: 'right'}},
      { accessorKey: 'monto_cierre_efectivo',header: 'Cierre EFE',mantineTableBodyCellProps: {align: 'right'}},
      { accessorKey: 'observaciones',header: 'Observaciones',size:150},
      { accessorKey: 'estado',header: 'Estado Caja'},
    ],
    [],
  );

  const mostrarRegistro = (data) => {
    if(data == 'CERRAR'){
      if(pedidos.filter(f=>!['CONCILIADO','ANULADO'].includes(f.estado)).length > 0){
        toast(`Control Caja`, `Aún cuenta con pedidos por CONCILIAR.`, 'warning');
        return false;
      }
      data = cajas.find(f=>f.id_control_caja == idApertura);
      data.estado = 'CIERRE';
      data.fid_usuario_cierre = user.usuario;
      data.monto_cierre_efectivo = pedidos.filter(f=>f.metodo_pago == 'EFECTIVO').reduce((ac,el)=>ac+Number(el.consumo?.reduce((ac,el)=>ac+Number(el.precio_venta),0)),Number(data.monto_inicio)).toFixed(2);
      data.monto_cierre_tarjeta = pedidos.filter(f=>f.metodo_pago == 'TARJETA').reduce((ac,el)=>ac+Number(el.consumo?.reduce((ac,el)=>ac+Number(el.precio_venta),0)),0).toFixed(2);
      data.monto_cierre_qr = pedidos.filter(f=>f.metodo_pago == 'QR').reduce((ac,el)=>ac+Number(el.consumo?.reduce((ac,el)=>ac+Number(el.precio_venta),0)),0).toFixed(2);
    } 
    open();
    form.reset();
    if (data) form.setValues(data);
    if (!data) form.setValues({fid_sucursal:user.sucursal,fid_usuario_inicio:user.usuario});
  }

  const table = useMantineReactTable({
    columns,
    data: cajas,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <Tooltip label="Editar Caja" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)} disabled={row.original.estado == 'CIERRE FINAL'}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box style={{display:"flex", gap:"0.5rem"}}>
        <Tooltip label="Aperturar Nueva Caja" position="bottom" withArrow>
          <Box>
            <Button onClick={()=>mostrarRegistro()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md" variant="gradient" gradient={{ from: "violet", to: "#2c0d57", deg: 180 }}>Aperturar Caja</Button>
            <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 180 }} hiddenFrom="md" onClick={()=>mostrarRegistro()}>
              <IconSquarePlus />
            </ActionIcon>
          </Box>
        </Tooltip>
        {idApertura && <Tooltip label="Cerrar Caja" position="bottom" withArrow>
          <Box>
            <Button onClick={()=>mostrarRegistro('CERRAR')} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md" variant="gradient" gradient={{ from: "#40c9ff", to: "#115e7cff", deg: 180 }}>Cerrar Caja</Button>
            <ActionIcon variant="gradient" size="xl" gradient={{ from: '#43ffff', to: '#005375', deg: 180 }} hiddenFrom="md" onClick={()=>mostrarRegistro('CERRAR')}>
              <IconLock />
            </ActionIcon>
          </Box>
        </Tooltip>}
        {idApertura && <Tooltip label="Refrescar Pedidos" position="bottom" withArrow>
          <Box>
            <Button onClick={refrescarPedidos} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md" variant='light' color='violet'>Refrescar</Button>
            {/* <ActionIcon variant="gradient" size="xl" gradient={{ from: '#ffc343ff', to: '#755000ff', deg: 180 }} hiddenFrom="md" onClick={refrescarPedidos}>
              <IconLock />
            </ActionIcon> */}
            <ActionIcon variant="light" size="xl" hiddenFrom="md" onClick={refrescarPedidos}>
              <IconRefreshAlert />
            </ActionIcon>
          </Box>
        </Tooltip>}
        {idApertura && <Tooltip label="Descontar Productos" position="bottom" withArrow>
          <Box>
            <Button onClick={()=>openFaltantes()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md" variant='light' color='cyan'>Descontar</Button>
            {/* <ActionIcon variant="gradient" size="xl" gradient={{ from: '#ff6f43ff', to: '#750e00ff', deg: 180 }} hiddenFrom="md" onClick={()=>openFaltantes()}>
              <IconLock />
            </ActionIcon> */}
            <ActionIcon variant="light" color='cyan' size="xl" hiddenFrom="md" onClick={()=>openFaltantes()}>
              <IconBottleOff />
            </ActionIcon>
          </Box>
        </Tooltip>}
      </Box>
    ),
    mantineTableHeadCellProps:{style: { fontWeight: 'bold', fontSize: '1.1rem'},},
    mantineTableProps:{striped: true,},
    localization:MRT_Localization_ES
  });

  const habilitarUsuario = (usuario) =>{
    if(desface) {
      toast(`Control Caja`, `La CAJA de fecha ${desface} aún con fue CERRADA debidamente.`, 'warning');
      return false;
    }
    if(!idApertura){
      toast(`Control Caja`, `Aún no cuenta con una caja aperturada para la sucursal`, 'warning');
      return false;
    }
    usuario.estado = usuario.estado == 'ALTA' ? 'ASIGNADO' : 'ALTA';
    usuario.fid_sucursal = user.sucursal;
    crudUsuario(usuario);
  }

  const formPedido = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_pedido:0,
      fid_usuario:0,
      fid_control_caja:0,
      mesa:'',
      metodo_pago:'',
      estado:'',
      monto_total:0,
      monto_efectivo:0,
      cambio:0,
    }
  });

  const mostrarPedido = (data) => {
    if(data.estado == 'CONCILIADO') return false;
    data.monto_total = data.consumo?.reduce((ac,el)=>ac+Number(el.precio_venta),0).toFixed(2);
    console.log('Mostrar registro:', data);
    openPedido();
    formPedido.setValues(data);
  }

  const cerrarPedido = async (data) => {
    let elPedido = { ...data };
    elPedido = { ...data, operacion: 'U', usuario_registro: user.usuario };
    elPedido.estado = 'PAGADO'
    await consumirAPI('/crudPedido', elPedido);
    closePedido();
    await consumirAPI('/listarPedidos', {  opcion: 'CONTROL_CAJA',id:idApertura });
  }

  const calcularCambio = ()=>{
    // console.log(formPedido.getValues().monto_total,formPedido.getValues().monto_efectivo);
    const dif = Number(formPedido.getValues().monto_efectivo) - Number(formPedido.getValues().monto_total)
    setCambio(dif)
  }

  const descontarProductos = async () => {
    //todo: registrar el ingreso
    //todo: registrar el detalle con numeros negativos
    let newIngreso = {
      operacion: 'I',
      id_ingreso: 0,
      fid_proveedor: null,
      fid_sucursal: user.sucursal,
      motivo,
      fecha_ingreso: dayjs().format('YYYY-MM-DD'),
      usuario_registro: user.usuario
    };
    const idIngreso = await consumirAPI('/crudIngreso', newIngreso);
    console.log('el id del ingreso:', idIngreso);
    faltantes.forEach(element => {
      let detalle = {
        operacion: 'I',
        id_ingreso_detalle: 0,
        fid_ingreso: idIngreso[0]?.message?.split('|')[1],
        fid_producto: element.id_producto,
        cantidad: -element.cantidad,
        precio_compra: 0,
        usuario_registro: user.usuario
      };
      consumirAPI('/crudIngresoDetalle', detalle);
    });
    closeFaltantes();
  }

  const detalleFaltantes = (c) => {
    const rows = c.map((row) => (
      <Table.Tr key={row.id_producto}>
        <Table.Td>{row.producto}</Table.Td>
        <Table.Td>{row.cantidad}</Table.Td>
        <Table.Td>
          <Box style={{ gap: "0.8rem", display: "flex" }}>
            <ActionIcon variant="subtle" onClick={console.log(row)}>
              <IconTrash color="crimson" />
            </ActionIcon>
          </Box>
        </Table.Td>
      </Table.Tr>
    ));
    const ths = (
      <Table.Tr>
        <Table.Th>Producto</Table.Th>
        <Table.Th>Cantidad</Table.Th>
        <Table.Th>Cancelar</Table.Th>
      </Table.Tr>
    );
    return (
      <>
      {c.length >0 &&
        <Table captionSide="top" width={50} striped highlightOnHover>
          <Table.Caption style={{ backgroundColor: "transparent",fontSize:'1.5rem' }}>
            Productos para Descontar
          </Table.Caption>
          <Table.Thead style={{lineHeight:'0.6rem',marginTop:'0.7rem'}}>{ths}</Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      }
      </>
    );
  };

  const confirmarConciliacion = (idEmpleado)=>{
    const filtrados = pedidos.filter(f=>f.fid_usuario == idEmpleado && !['CONCILIADO','ANULADO'].includes(f.estado));
    if(filtrados.some(f=>f.estado == 'PENDIENTE')){
      toast('Conciliación de Pedidos', `Existen pedidos pendientes para el usuario`, 'warning');
      return false;
    }
    const total_qr = filtrados.filter(f=>f.metodo_pago == 'QR').reduce((ac,el)=>ac+Number(el.consumo?.reduce((ac,el)=>ac+Number(el.precio_venta),0)),0).toFixed(2);
    const total_trj = filtrados.filter(f=>f.metodo_pago == 'TARJETA').reduce((ac,el)=>ac+Number(el.consumo?.reduce((ac,el)=>ac+Number(el.precio_venta),0)),0).toFixed(2);
    const total_efe = filtrados.filter(f=>f.metodo_pago == 'EFECTIVO').reduce((ac,el)=>ac+Number(el.consumo?.reduce((ac,el)=>ac+Number(el.precio_venta),0)),0).toFixed(2);

    const monto_inicio = Number(cajas.find(f=>f.id_control_caja == idApertura)?.monto_inicio) || 0;
    modals.openConfirmModal({
      title: 'Confirmar Conciliación',
      centered: true,
      children: (
        <Box py={10} style={{display:'flex',flexDirection:'column',gap:'0.8rem'}}>
        <Text size="sm">Está seguro de CONCILIAR {filtrados.length} pedidos</Text>
        <Text size="sm">Total QR (Bs.): {total_qr}</Text>
        <Text size="sm">Total Tarjeta (Bs.): {total_trj}</Text>
        <Text size="sm">Total Efectivo (Bs.): {Number(total_efe)+Number(monto_inicio)}</Text>
        </Box>
      ),
      labels: { confirm: 'Conciliar Pedidos', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#240846' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => conciliarPedidos(filtrados),
    });
  }

  const conciliarPedidos = async (porConciliar) => {
    let pedidosJoin = porConciliar.map(p=>p.id_pedido).join(',');
    let elPedido = { 
      operacion: 'CONCILIAR',
      id_pedido: pedidosJoin,
      fid_control_caja: idApertura,
      estado: 'CONCILIADO',
      usuario_registro: user.usuario
    };
    const r = await consumirAPI('/crudPedido', elPedido);
    if(r) toast('Conciliación de Pedidos', `Se han conciliado ${porConciliar.length} pedido(s) del usuario ${porConciliar[0]?.cuenta}`, 'success');
    setIdEmpleado(null);
    await consumirAPI('/listarPedidos', {  opcion: 'CONTROL_CAJA',id:idApertura });
  }

  return (
    <div>
      {pedidos.length>0 &&
        <>
        <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
          Control Pedidos 
        </Text>
        <Button onClick={()=>setIdEmpleado(null)} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md" variant='light' color='violet'>Ver pedidos por usuario</Button>
        <Box className="cards-pedidos">
          {!idEmpleado && pedidos.reduce((agrupador, objetoActual) => {
              const clave = objetoActual.cuenta;
              const grupoExistente = agrupador.find(grupo => grupo.cuenta === clave);
              if (grupoExistente) {
                grupoExistente.detalle.push(objetoActual);
              } else {
                agrupador.push({cuenta: clave,detalle: [objetoActual] });
              }
              console.log('agrupador:', agrupador);
              return agrupador;
            }, []).map(c=>(
            <Box className={`card ${c.detalle?.every(f=>f.estado=='CONCILIADO') ? 'ok' : 'bad'}`} key={c.cuenta} onClick={()=>setIdEmpleado(pedidos.find(f=>f.cuenta == c.cuenta).fid_usuario)}>
              <strong className="tip">{c.cuenta}</strong>
              <p className="second-text"><IconLibraryPlus size={'14px'}/> {c.detalle?.length} Pedido(s)</p>
              <p className="total"> TOTAL x CONCILIAR : {c.detalle?.filter(f=>f.estado!='CONCILIADO')?.reduce((ac,el)=>ac+Number(el.consumo?.reduce((ac,el)=>ac+Number(el.precio_venta),0) || 0),0).toFixed(2)}</p>
            </Box>
            ))
          }
          {idEmpleado > 0 && pedidos.filter(f=>f.fid_usuario == idEmpleado).map(p=>(
            <Box className={`card ${p.estado == 'CONCILIADO' ? 'ok' : 'bad'}`} key={p.id_pedido} onClick={()=>mostrarPedido(p)}>
              <strong className="tip">{p.id_pedido} - {p.mesa}</strong>
              {p.consumo?.map(c=>(
                <p className="second-text" key={c.id_pedido_detalle}><IconCheck size={'14px'}/> {c.nombre}</p>
                ))
              }
              <p className="total"><i>{p.metodo_pago}</i> TOTAL : {p.consumo?.reduce((ac,el)=>ac+Number(el.precio_venta),0).toFixed(2) || 0.00}</p>
            </Box>
            ))
          }
        </Box>
        {(idEmpleado > 0 && pedidos.some(f=>f.fid_usuario == idEmpleado && f.estado != 'CONCILIADO'))  && (<Button onClick={()=>confirmarConciliacion(idEmpleado)} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md" variant='outline' color='cyan'>Conciliar pedidos de {pedidos.find(f=>f.fid_usuario == idEmpleado)?.cuenta}</Button>)}
        </>
      }
      <Modal opened={openedFaltantes} onClose={closeFaltantes} title={'Descontar Productos'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'>
        <Box>
          <Grid my={12} display='flex' align='start'>
            <Grid.Col span={{ base: 12, lg: 12 }}>
              <Textarea value={motivo} onChange={(event) => setMotivo(event.currentTarget.value)}/>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 2 }}>
              <NumberInput
                label="Cantidad:"
                placeholder="Cantiad del mismo producto"
                allowDecimal={false}
                min={1}
                max={100}
                leftSection={<IconDatabase size={16} />}
                id='laCantidad'
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 10 }}>
              <Select
                label="Producto:"
                data={productos.filter(f=> f.pedido_minimo >0).map((e) => {return{label:e.descripcion,value:e.id_producto.toString()}})}
                limit={5}
                searchable
                onChange={(value) => {
                  if(value){
                    const prod = productos.find(f=>f.id_producto == value);
                    if(!faltantes.find(f=>f.id_producto == value)){
                      const cant = document.getElementById('laCantidad').value;
                      setFaltantes([...faltantes,{id_producto:prod.id_producto,producto:prod.descripcion,cantidad:cant?Number(cant):1}]);
                      document.getElementById('laCantidad').value = 1;
                    }
                  }
                }}
                leftSection={<IconBottle size={16} />}
              />
            </Grid.Col>
          </Grid>
          {/* <MultiSelect data={[]} value={faltantes} onChange={setFaltantes} /> */}
          
          {detalleFaltantes(faltantes)}
          <Button fullWidth leftSection={<IconDeviceFloppy/>} style={{marginTop:'1rem'}} onClick={descontarProductos}>
            Descontar Productos
          </Button>
        </Box>
      </Modal>
      <Modal opened={openedPedido} onClose={closePedido} title={'Cerrar Pedido'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
        <form onSubmit={formPedido.onSubmit((values) => cerrarPedido(values))} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <NumberInput
            label="Monto Total Pedido:"
            allowDecimal={true}
            decimalScale={2}
            min={0}
            max={10000}
            prefix='Bs. '
            readOnly
            leftSection={<IconCash size={16} />}
            key={formPedido.key('monto_total')}
            {...formPedido.getInputProps('monto_total')}
          />
          <NativeSelect
            label="Método Pago:"
            data={[...parametricas.filter(f=>f.grupo == 'METODO_PAGO').map((e) => e.nombre)]}
            disabled
            leftSection={<IconCreditCard size={16} />}
            key={formPedido.key("metodo_pago")}
            {...formPedido.getInputProps("metodo_pago")}
          />
          {formPedido.getValues().metodo_pago == 'EFECTIVO' &&
           <>
            <NumberInput
            label="Monto Efectivo:"
            placeholder="Monto dado en efectivo" 
            allowDecimal={false}
            min={10}
            max={10000}
            prefix='Bs. '
            required
            onKeyUpCapture={calcularCambio}
            leftSection={<IconCash size={16} />}
            key={formPedido.key('monto_efectivo')}
            {...formPedido.getInputProps('monto_efectivo')}
            />
            <Text size="xl" c="cyan.3">Monto Devolución: {cambio}</Text>
           </>
          }
          <Group justify="flex-end" mt="md">
            <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Cerrar Pedido</Button>
          </Group>
        </form>
      </Modal>
      <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Control de Cajas 
      </Text>
      {desface && <Alert variant="light" color="cyan" title="Alerta Control Caja" icon={icono}>
        La CAJA de fecha {desface} aún con fue CERRADA debidamente.
      </Alert>}
      <Box pos='relative'>
        <LoadingOverlay visible={loading}  zIndex={39} overlayProps={{ radius: 'lg', blur: 4 }} loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_control_caja?'Actualizar CAJA: '+ form.getValues().id_control_caja:'Registrar CAJA'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudCaja(values))} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <NativeSelect
              label="Sucursal:"
              data={[...sucursales.map((e) => {return{label:e.nombre,value:e.id_sucursal}}),]}
              disabled
              leftSection={<IconBuilding size={16} />}
              key={form.key("fid_sucursal")}
              {...form.getInputProps("fid_sucursal")}
            />
            <NativeSelect
              label="Usuario Apertura:"
              data={[{label:user?.cuenta,value:user?.usuario},...usuarios.map((e) => {return{label:e.cuenta,value:e.id_usuario}}),]}
              disabled
              leftSection={<IconUser size={16} />}
              key={form.key("fid_usuario_inicio")}
              {...form.getInputProps("fid_usuario_inicio")}
            />
            <NumberInput
              label="Monto Apertura:"
              placeholder="1000"
              allowDecimal={true}
              decimalScale={2}
              min={0}
              max={100000}
              prefix='Bs. '
              required
              thousandSeparator=","
              leftSection={<IconMoneybag size={16} />}
              key={form.key('monto_inicio')}
              {...form.getInputProps('monto_inicio')}
            />
            {form.getValues().id_control_caja > 0 &&
              <>
                <NativeSelect
                  label="Usuario Cierre:"
                  data={[{label:user?.cuenta,value:user?.usuario},...usuarios.map((e) => {return{label:e.cuenta,value:e.id_usuario}}),]}
                  disabled
                  leftSection={<IconUser size={16} />}
                  key={form.key("fid_usuario_cierre")}
                  {...form.getInputProps("fid_usuario_cierre")}
                />
                <NumberInput
                  label="Monto Cierre QR:"
                  placeholder="30000"
                  allowDecimal={true}
                  decimalScale={2}
                  min={0}
                  max={100000}
                  required
                  prefix='Bs. '
                  thousandSeparator=","
                  leftSection={<IconCashBanknote size={16} />}
                  key={form.key('monto_cierre_qr')}
                  {...form.getInputProps('monto_cierre_qr')}
                />
                <NumberInput
                  label="Monto Cierre Tarjeta:"
                  placeholder="30000"
                  allowDecimal={true}
                  decimalScale={2}
                  min={0}
                  max={100000}
                  required
                  prefix='Bs. '
                  thousandSeparator=","
                  leftSection={<IconCashBanknote size={16} />}
                  key={form.key('monto_cierre_tarjeta')}
                  {...form.getInputProps('monto_cierre_tarjeta')}
                />
                <NumberInput
                  label="Monto Cierre Efectivo:"
                  placeholder="30000"
                  allowDecimal={true}
                  decimalScale={2}
                  min={0}
                  max={100000}
                  required
                  prefix='Bs. '
                  thousandSeparator=","
                  leftSection={<IconCashBanknote size={16} />}
                  key={form.key('monto_cierre_efectivo')}
                  {...form.getInputProps('monto_cierre_efectivo')}
                />
                <Textarea
                  label="Observaciones:"
                  placeholder="observaciones para el cierre de caja"
                  maxLength={1000}
                  minRows={2}
                  autosize
                  leftSection={<IconUser size={16} />}
                  key={form.key('observaciones')}
                  {...form.getInputProps('observaciones')}
                />
                <NativeSelect
                  label="Estado Caja:"
                  data={['SELECCIONE...',...parametricas.filter(f=>f.grupo == 'ESTADO_CAJA').map(e=>e.nombre)]}
                  required
                  leftSection={<IconSettings size={16} />}
                  key={form.key("estado")}
                  {...form.getInputProps("estado")}
                />
              </>
            }
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!form.getValues().id_control_caja ? 'Registrar':'Actualizar'} Caja</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={table} />
      </Box>

      <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} mt={15} mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        {`Usuarios para ${sucursales.find(f=>f.id_sucursal == user?.sucursal)?.nombre}`}
      </Text>
      <Box pos="relative" className="grid-usuarios">
        {usuarios.map(u => {
          if (u.estado === 'ALTA') {
            return (
              <Button key={u.id_usuario} onClick={() => habilitarUsuario(u)} size="lg" variant="outline">
                {u.cuenta}
              </Button>
            );
          }
          if (u.estado === 'ASIGNADO') {
            return (
              <Button key={u.id_usuario} onClick={() => habilitarUsuario(u)} size="lg" variant="filled" color="violet">
                {u.cuenta}
              </Button>
            );
          }
          return (<Box key={u.id_usuario}></Box>); // Importante: retornar null para otros estados
        })}
      </Box>
    </div>
  )
}

export default Caja