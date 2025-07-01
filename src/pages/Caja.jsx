import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, NumberInput, Text, TextInput, Tooltip } from '@mantine/core';
import { IconBuilding, IconCashBanknote, IconDeviceFloppy, IconEdit, IconGps, IconPhone, IconSquarePlus, IconTrash, IconUser } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';

const Caja = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,cajas } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    if(cajas.length == 0) await consumirAPI('/listarControlCajas', { opcion: 'T' });
  }
//id_control_caja,fid_sucursal,fecha,fid_usuario_inicio,inicio,monto_inicio,fid_usuario_cierre,cierre,monto_cierre_qr,monto_cierre_tarjeta,monto_cierre_efectivo,observaciones,estado
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_control_caja:0,
      fid_sucursal:0,
      sucursal:'',
      fid_usuario_inicio:0,
      usuario_inicio:'',
      monto_inicio:'',
      fid_usuario_cierre:0,
      usuario_cierre:'',
      monto_cierre_qr:'',
      monto_cierre_tarjeta:'',
      monto_cierre_efectivo:'',
      observaciones:'',
      estado:'',
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
    if (newCaja.fid_sucursal === '') newCaja.fid_sucursal = user.fid_sucursal;
    if (newCaja.estado !== 'APERTURA') newCaja.fid_usuario_cierre = user.usuario
    await consumirAPI('/crudProveedor', newCaja);
    close();
    form.reset();
    await cargarData();
  }

  const columns = useMemo(
    () => [
      { accessorKey: 'sucursal',header: 'Sucursal',},
      { accessorKey: 'usuario_inicio',header: 'Usuario Inicio',},
      { accessorKey: 'monto_inicio',header: 'Monto Inicio',},
      { accessorKey: 'usuario_cierre',header: 'usuario Cierre',},
      { accessorKey: 'monto_cierre_qr',header: 'Cierre QR (Bs.)',},
      { accessorKey: 'monto_cierre_tarjeta',header: 'Cierre Tarjeta (Bs.)',},
      { accessorKey: 'monto_cierre_efectivo',header: 'Cierre Efectivo (Bs.)',},
      { accessorKey: 'observaciones',header: 'Observaciones',},
      { accessorKey: 'estado',header: 'Estado Caja',},
    ],
    [],
  );

  const mostrarRegistro = (data) => {
    console.log('Mostrar registro:', data);
    open();
    form.reset();
    if (data) form.setValues(data);
  }

  const table = useMantineReactTable({
    columns,
    data: cajas,
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
      <Tooltip label="Aperturar Nueva Caja" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarRegistro()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md">Nueva Caja</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 90 }} hiddenFrom="md" onClick={()=>mostrarRegistro()}>
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableHeadCellProps:{style: { fontWeight: 'bold', fontSize: '1.1rem'},},
    mantineTableProps:{striped: true,},
    localization:MRT_Localization_ES
  });

  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <Text size='2rem' mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Control de Cajas 
      </Text>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_control_caja?'Actualizar Proveedor: '+ form.getValues().id_control_caja:'Registrar Proveedor'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudCaja(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <TextInput
              label="Nombre:"
              placeholder="Nombre del proveedor o empresa"
              type='text'
              maxLength={100}
              requiered
              leftSection={<IconUser size={16} />}
              key={form.key('nombre')}
              {...form.getInputProps('nombre')}
            />
            <TextInput
              label="Dirección:"
              placeholder="Dirección del local"
              type='text'
              maxLength={100}
              leftSection={<IconGps size={16} />}
              key={form.key('direccion')}
              {...form.getInputProps('direccion')}
            />
            <TextInput
              label="Referencia:"
              placeholder="Referencias para llegar al local"
              leftSection={<IconBuilding size={16} />}
              type='text'
              maxLength={100}
              key={form.key('referencia')}
              {...form.getInputProps('referencia')}
            />
            <NumberInput
              label="Teléfonos:"
              placeholder="70611111"
              allowDecimal={false}
              maxLength={30}
              min={100000}
              required
              leftSection={<IconPhone size={16} />}
              key={form.key('telefonos')}
              {...form.getInputProps('telefonos')}
            />
            <NumberInput
              label="Cuenta Bancaria:"
              placeholder="El numero de cuenta bancaria"
              allowDecimal={false}
              maxLength={15}
              min={100000}
              leftSection={<IconCashBanknote size={16} />}
              key={form.key('cuenta')}
              {...form.getInputProps('cuenta')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!form.getValues().id_control_caja ? 'Registrar':'Actualizar'} Caja</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Caja