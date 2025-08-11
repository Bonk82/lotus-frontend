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

const Proveedor = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,proveedores } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    await consumirAPI('/listarProveedores', { opcion: 'T' });
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_proveedor:0,
      nombre:'',
      direccion:'',
      referencia:'',
      telefonos:'',
      cuenta:'',
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const crudProveedor = async (data,eliminar) => {
    let newProveedor = { ...data };
    if (data.id_proveedor) {
      newProveedor = { ...data, operacion: 'U', usuario_registro: user.usuario };
    } else {
      newProveedor = { ...data, operacion: 'I', usuario_registro: user.usuario };
    }
    if (eliminar) newProveedor.operacion = 'D';
    await consumirAPI('/crudProveedor', newProveedor);
    close();
    form.reset();
    await cargarData();
  }

  const columns = useMemo(
    () => [
      { accessorKey: 'nombre',header: 'Nombre',},
      { accessorKey: 'direccion',header: 'Dirección',},
      { accessorKey: 'referencia',header: 'Referencia',},
      { accessorKey: 'telefonos',header: 'Teléfonos',},
      { accessorKey: 'cuenta',header: 'Cuenta Bancaria',},
    ],
    [],
  );

  const mostrarRegistro = (data) => {
    console.log('Mostrar registro:', data);
    open();
    form.reset();
    if (data) form.setValues(data);
  }

  const confirmar = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR el proveedor:<br /> <strong>{e.nombre.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Proveedor', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#240846' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudProveedor(e, true),
    });
  }

  const table = useMantineReactTable({
    columns,
    data: proveedores,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <Tooltip label="Editar Proveedor" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar Proveedor" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => confirmar(row.original)}>
            <IconTrash color="crimson" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nuevo Producto" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarRegistro()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md">Nuevo Proveedor</Button>
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
      <Text size='clamp(1.5rem, 2vw, 2rem)' mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Gestión de Proveedores
      </Text>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_proveedor?'Actualizar Proveedor: '+ form.getValues().id_proveedor:'Registrar Proveedor'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudProveedor(values))} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <TextInput
              label="Nombre:"
              placeholder="Nombre del proveedor o empresa"
              type='text'
              maxLength={100}
              required
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
            <TextInput
              label="Cuenta Bancaria:"
              placeholder="Banco y núumero de cuenta bancaria"
              maxLength={20}
              minLength={8}
              leftSection={<IconCashBanknote size={16} />}
              key={form.key('cuenta')}
              {...form.getInputProps('cuenta')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!form.getValues().id_proveedor ? 'Registrar':'Actualizar'} Proveedor</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Proveedor