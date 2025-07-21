import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, NumberInput, Text, TextInput, Tooltip } from '@mantine/core';
import { IconCashBanknote, IconDeviceFloppy, IconEdit, IconGps, IconSquarePlus, IconTrash, IconUser } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';

const Parametrica = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,parametricas } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    if(parametricas.length ==0) await consumirAPI('/listarClasificador', { opcion: 'T' });
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_proveedor:0,
      grupo:'',
      orden:0,
      nombre:'',
      sub_grupo:'',
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const crudParametrica = async (data,eliminar) => {
    let newParametrica = { ...data };
    if (data.id_clasificador) {
      newParametrica = { ...data, operacion: 'U'};
    } else {
      newParametrica = { ...data, operacion: 'I'};
    }
    if (eliminar) newParametrica.operacion = 'D';
    await consumirAPI('/crudClasificador', newParametrica);
    close();
    form.reset();
    await cargarData();
  }
// grupo,orden,nombre,sub_grupo,fecha_creado,fecha_modificado
  const columns = useMemo(
    () => [
      { accessorKey: 'grupo',header: 'Grupo',},
      { accessorKey: 'orden',header: 'Orden',},
      { accessorKey: 'nombre',header: 'Nombre',},
      { accessorKey: 'sub_grupo',header: 'Sub Grupo',},
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
        Está seguro de ELIMINAR la paramétrica:<br /> <strong>{e.nombre.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Paramétrica', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#240846' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudParametrica(e, true),
    });
  }

  const table = useMantineReactTable({
    columns,
    data: parametricas,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
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
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nueva Paramétrica" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarRegistro()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md">Nueva Paramétrica</Button>
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
      <Text size='2rem' mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Gestión de Paramétricas
      </Text>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_clasificador?'Actualizar Paramétrica: '+ form.getValues().id_clasificador:'Registrar Paramétrica'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudParametrica(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <TextInput
              label="Grupo:"
              placeholder="Grupo clasificador"
              type='text'
              maxLength={100}
              leftSection={<IconGps size={16} />}
              key={form.key('grupo')}
              {...form.getInputProps('grupo')}
            />
            <NumberInput
              label="Orden:"
              placeholder="Orden jerarquico o de despliegue"
              allowDecimal={false}
              max={100}
              min={1}
              leftSection={<IconCashBanknote size={16} />}
              key={form.key('orden')}
              {...form.getInputProps('orden')}
            />
            <TextInput
              label="Nombre:"
              placeholder="Nombre del proveedor o empresa"
              type='text'
              maxLength={100}
              minLength={5}
              requiered
              leftSection={<IconUser size={16} />}
              key={form.key('nombre')}
              {...form.getInputProps('nombre')}
            />
            <TextInput
              label="Sub Grupo:"
              placeholder="Sub Grupo clasificador"
              type='text'
              maxLength={50}
              leftSection={<IconGps size={16} />}
              key={form.key('sub_grupo')}
              {...form.getInputProps('sub_grupo')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!form.getValues().id_clasificador ? 'Registrar':'Actualizar'} Paramétrica</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Parametrica