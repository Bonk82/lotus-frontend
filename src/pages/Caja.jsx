/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Alert, Box, Button, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconBuilding, IconCashBanknote, IconDeviceFloppy, IconEdit, IconMoneybag, IconSettings, IconSquarePlus, IconUser } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import dayjs from 'dayjs';

const Caja = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,cajas,sucursales,parametricas,usuarios,pedidos,toast } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);
  const [openedPedido, { open:openPedido, close:closePedido }] = useDisclosure(false);
  const [idApertura, setIdApertura] = useState(null)
  const [desface, setDesface] = useState(null)

  useEffect(() => {
    if(user) cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const icono = <IconAlertCircle/>

  const cargarData = async () =>{
    const id = await consumirAPI('/listarControlCajas', { opcion: 'ACTIVA',id:user.sucursal});
    if(id) setIdApertura(id[0]?.id_control_caja);
    await consumirAPI('/listarControlCajas', { opcion: 'cc.fid_sucursal',id:user.sucursal });
    if(sucursales.length == 0) await consumirAPI('/listarSucursales', { opcion: 'T'});
    if(parametricas.length == 0) await consumirAPI('/listarClasificador', { opcion: 'T'});
    await consumirAPI('/listarUsuarios', { opcion: 'AA',id:user.sucursal});
    await consumirAPI('/listarPedidos', { opcion: 'p.fid_control_caja',id:idApertura});
    const f1 = dayjs(`${id[0]?.inicio}`);
    const horas_apertura = dayjs().diff(f1,'h')
    horas_apertura>16 ? setDesface(dayjs(id[0]?.fecha).format('DD/MM/YYYY')):null;
    
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
      { accessorKey: 'monto_inicio',header: 'Monto Inicio',},
      { accessorKey: 'usuario_cierre',header: 'usuario Cierre',},
      { accessorKey: 'monto_cierre_qr',header: 'Cierre QR',},
      { accessorKey: 'monto_cierre_tarjeta',header: 'Cierre TRJ',},
      { accessorKey: 'monto_cierre_efectivo',header: 'Cierre EFE',},
      { accessorKey: 'observaciones',header: 'Observaciones',},
      { accessorKey: 'estado',header: 'Estado Caja',},
    ],
    [],
  );

  const mostrarRegistro = (data) => {
    if(data == 'CERRAR'){
      data = cajas.find(f=>f.id_control_caja == idApertura);
      data.estado = 'CIERRE';
      data.fid_usuario_cierre = user.usuario;
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
          <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box style={{display:"flex", gap:"1rem"}}>
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
              <IconSquarePlus />
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
      estado:''
    }
  });

  const mostrarPedido = (data) => {
    console.log('Mostrar registro:', data);
    openPedido();
    formPedido.setValues(data);
  }

  const cerrarPedido = async (data) => {
    let elPedido = { ...data };
    elPedido = { ...data, operacion: 'U', usuario_registro: user.usuario };
    await consumirAPI('/crudPedido', elPedido);
    closePedido();
    await consumirAPI('/listarPedidos', {  opcion: 'p.fid_control_caja',id:idApertura });
  }

  return (
    <div>
      {pedidos.length>0 &&
        <>
        <Text size='2rem' mb={'lg'} h={40} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
          Control Pedidos 
        </Text>
        {pedidos.map(p=>(
            <Box className="cards" key={p.id_pedido} onClick={()=>mostrarPedido(p)}>
              <Box className="card red">
                  <strong className="tip">{p.id_pedido} - {p.mesa}</strong>
                  {p.consumo.map(c=>(
                    <p className="second-text" key={c.id_pedido_detalle}>🟣 {c.nombre}</p>
                    ))
                  }
                  <p className="total"> TOTAL: {p.consumo.reduce((ac,el)=>ac+Number(el.precio_venta),0).toFixed(2)}</p>
              </Box>
            </Box>
          ))
        }
        </>
      }
      <Modal opened={openedPedido} onClose={closePedido} title={'Cerrar Pedido'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
        <form onSubmit={formPedido.onSubmit((values) => cerrarPedido(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
          <NativeSelect
            label="Sucursal:"
            data={[...sucursales.map((e) => {return{label:e.nombre,value:e.id_sucursal}}),]}
            disabled
            leftSection={<IconBuilding size={16} />}
            key={formPedido.key("fid_sucursal")}
            {...formPedido.getInputProps("fid_sucursal")}
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
            leftSection={<IconMoneybag size={16} />}
            key={formPedido.key('monto_inicio')}
            {...formPedido.getInputProps('monto_inicio')}
          />
          <Group justify="flex-end" mt="md">
            <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Cerrar Pedido</Button>
          </Group>
        </form>
      </Modal>
      <Text size='2rem' mb={'lg'} h={40} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Control de Cajas 
      </Text>
      {desface && <Alert variant="light" color="cyan" title="Alerta Control Caja" icon={icono}>
        La CAJA de fecha {desface} aún con fue CERRADA debidamente.
      </Alert>}
      <Box pos='relative'>
        <LoadingOverlay visible={loading}  zIndex={39} overlayProps={{ radius: 'lg', blur: 4 }} loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_control_caja?'Actualizar CAJA: '+ form.getValues().id_control_caja:'Registrar CAJA'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudCaja(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
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
              leftSection={<IconMoneybag size={16} />}
              key={form.key('monto_inicio')}
              {...form.getInputProps('monto_inicio')}
            />
            {form.getValues().id_control_caja > 0 &&
              <Box>
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
                  leftSection={<IconCashBanknote size={16} />}
                  key={form.key('monto_cierre_efectivo')}
                  {...form.getInputProps('monto_cierre_efectivo')}
                />
                <TextInput
                  label="Observaciones:"
                  placeholder="observaciones para el cierre de caja"
                  type='text'
                  maxLength={1000}
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
              </Box>
            }
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!form.getValues().id_control_caja ? 'Registrar':'Actualizar'} Caja</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={table} />
      </Box>

      <Text size='2rem' mt={15} mb={'lg'} h={40} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
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