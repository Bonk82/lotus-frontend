import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput, Tooltip } from '@mantine/core';
import { IconBuilding, IconCashBanknote, IconDeviceFloppy, IconEdit, IconMoneybag, IconSettings, IconSquarePlus, IconUser } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

const Caja = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,cajas,sucursales,parametricas,usuarios } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);
  const [idApertura, setIdApertura] = useState(null)

  useEffect(() => {
    if(user) cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const cargarData = async () =>{
    const id = await consumirAPI('/listarControlCajas', { opcion: 'ACTIVA',id:user.sucursal});
    if(id) setIdApertura(id[0]?.id_control_caja);
    await consumirAPI('/listarControlCajas', { opcion: 'cc.fid_sucursal',id:user.sucursal });
    if(sucursales.length == 0) await consumirAPI('/listarSucursales', { opcion: 'T'});
    if(parametricas.length == 0) await consumirAPI('/listarClasificador', { opcion: 'T'});
    await consumirAPI('/listarUsuarios', { opcion: 'AA',id:user.sucursal});
  }
//id_control_caja,fid_sucursal,fecha,fid_usuario_inicio,inicio,monto_inicio,fid_usuario_cierre,cierre,monto_cierre_qr,monto_cierre_tarjeta,monto_cierre_efectivo,observaciones,estado
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_control_caja:0,
      fid_sucursal:user?.sucursal,
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
      data = cajas.find(f=>f.id_control_caja == idApertura)
      data.estado = 'CIERRE'
    } 
    console.log('Mostrar registro:', data);
    open();
    form.reset();
    if (data) form.setValues(data);
    // if(!data) form.setValues({'estado':'APERTURA'})
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
    usuario.estado = usuario.estado == 'ALTA' ? 'ASIGNADO' : 'ALTA';
    usuario.fid_sucursal = user.sucursal;
    crudUsuario(usuario);
  }

  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <Text size='2rem' mb={'lg'} h={40} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Control de Cajas 
      </Text>
      <Box pos='relative'>
        <LoadingOverlay visible={loading}  zIndex={39} overlayProps={{ radius: 'lg', blur: 4 }} loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_control_caja?'Actualizar CAJA: '+ form.getValues().id_control_caja:'Registrar CAJA'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudCaja(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <NativeSelect
              label="Sucursal:"
              data={["SELECCIONE...",...sucursales.map((e) => {return{label:e.nombre,value:e.id_sucursal}}),]}
              value={user?.sucursal}
              disabled
              leftSection={<IconBuilding size={16} />}
              key={form.key("fid_sucursal")}
              {...form.getInputProps("fid_sucursal")}
            />
            <TextInput
              label="Usuario Apertura:"
              leftSection={<IconUser size={16} />}
              type='text'
              readOnly
              value={user?.cuenta}
              key={form.key('fid_usuario_inicio')}
              {...form.getInputProps('fid_usuario_inicio')}
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
                <TextInput
                  label="Usuario Cierre:"
                  leftSection={<IconUser size={16} />}
                  type='text'
                  readOnly
                  value={user?.cuenta}
                  key={form.key('fid_usuario_cierre')}
                  {...form.getInputProps('fid_usuario_cierre')}
                />
                <NumberInput
                  label="Monto Cierre QR:"
                  placeholder="30000"
                  allowDecimal={true}
                  decimalScale={2}
                  min={0}
                  max={100000}
                  required
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
        {`Habilitar Usuarios para sucursal ${sucursales.find(f=>f.id_sucursal == user?.sucursal)?.nombre}`}
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