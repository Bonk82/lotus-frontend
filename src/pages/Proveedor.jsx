import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, NumberInput, Text, TextInput } from '@mantine/core';
import { IconBuilding, IconCashBanknote, IconDeviceFloppy, IconEdit, IconGps, IconPhone, IconRefresh, IconTrash, IconUser } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';

const Proveedor = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,proveedores,toast } = DataApp();

  const [opened, { open, close }] = useDisclosure(false);
  // const [id, setId] = useState(null)
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

  const crudproveedor = async (data,eliminar) => {
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

  // id_proveedor,nombre,direccion,referencia,telefonos,cuenta
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
    if (data) {
      // setId(data.id_proveedor);
      form.setValues(data);
    }
  }

  const confirmar = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR el proveedor: <strong>{e.nombre.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Proveedor', cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudproveedor(e, true),
    });
  }

  const table = useMantineReactTable({
    columns,
    data: proveedores,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {
      density: 'xs',
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)}>
          <IconEdit color="orange" />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => confirmar(row.original)}>
          <IconTrash color="crimson" />
        </ActionIcon>
      </Box>
    ),
    mantineTableHeadCellProps:{
      style: { fontWeight: 'bold', fontSize: '1.1rem'},
    },
    mantineTableProps:{
      striped: true,
    },
    localization:MRT_Localization_ES
  });

  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <h1>Proveedor</h1>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_proveedor?'Actualizar Proveedor: '+ form.getValues().id_proveedor:'Registrar Proveedor'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudproveedor(values))}>
            <TextInput
              label="Nombre:"
              placeholder="Nombre del proveedor o empresa"
              type='text'
              maxLength={100}
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
              leftSection={<IconPhone size={16} />}
              key={form.key('telefonos')}
              {...form.getInputProps('telefonos')}
            />
            <NumberInput
              label="Cuenta Bancaria:"
              placeholder="El numero de cuenta bancaria"
              allowDecimal={false}
              maxLength={15}
              leftSection={<IconCashBanknote size={16} />}
              key={form.key('cuenta')}
              {...form.getInputProps('cuenta')}
            />
            <Group justify="flex-end" mt="md">
              {!form.getValues().id_proveedor && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Proveedor</Button>}
              {form.getValues().id_proveedor && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Proveedor</Button>}
            </Group>
          </form>
        </Modal>
        <Button onClick={()=>mostrarRegistro()} style={{marginBottom:'1rem'}} size='sm'>Nuevo Proveedor</Button>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Proveedor