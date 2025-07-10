import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, MultiSelect, NativeSelect, NumberInput, Text, TextInput, Tooltip } from '@mantine/core';
import { IconBuilding, IconCashBanknote, IconDeviceFloppy, IconEdit, IconSquarePlus, IconTimeDuration15, IconTrash, IconUser } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';

const Control = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,promociones,sucursales,productos,parametricas,precios } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    cargarData('T')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async (opcion) =>{
    if(['T','P'].includes(opcion)) await consumirAPI('/listarPromociones', { opcion: 'T' });
    if(['T','S'].includes(opcion)) await consumirAPI('/listarSucursalProductos', { opcion: 'T' });
    if(productos.length == 0) await consumirAPI('/listarProductos', { opcion: 'T' });
    if(sucursales.length == 0) await consumirAPI('/listarSucursales', { opcion: 'T' });
  }

  const semana = [
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' },
  { value: '7', label: 'Domingo' },
];

  const formPromo = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_promocion:0,
      fid_sucursal:'',
      nombre:'',
      dias:'',//tipo 1,5,6 y en el form hacer un select multi chips
      hora_inicio:'',
      hora_fin:'',
      grupo_producto:'',
      fid_producto:'',
      descuento:'',
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const crudPromocion = async (data,eliminar) => {
    let newPromocion = { ...data };
    if (data.od_promocion) {
      newPromocion = { ...data, operacion: 'U', usuario_registro: user.usuario };
    } else {
      newPromocion = { ...data, operacion: 'I', usuario_registro: user.usuario };
    }
    if (eliminar) newPromocion.operacion = 'D';
    await consumirAPI('/crudPromocion', newPromocion);
    close();
    formPromo.reset();
    await cargarData('P');
  }

  const columnsPromo = useMemo(
    () => [
      { accessorKey: 'sucursal',header: 'Sucursal',},
      { accessorKey: 'nombre',header: 'Nombre Promoción',},
      { accessorKey: 'dias',header: 'Días',},
      { accessorKey: 'hora_inicio',header: 'Hora Inicio',},
      { accessorKey: 'hora_fin',header: 'Hora Fin',},
      { accessorKey: 'grupo_producto',header: 'Grupo Prodcuto',},
      { accessorKey: 'producto',header: 'Producto',},
      { accessorKey: 'descuento',header: 'Descuento',},
    ],
    [],
  );

  const mostrarPromo = (data) => {
    console.log('Mostrar registro:', data);
    open();
    formPromo.reset();
    if (data) formPromo.setValues(data);
  }

  const confirmar = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR la promoción:<br /> <strong>{e.nombre.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Promoción', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#240846' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudPromocion(e, true),
    });
  }

  const tablePromo = useMantineReactTable({
    columns: columnsPromo,
    data: promociones,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <ActionIcon variant="subtle" onClick={() => mostrarPromo(row.original)}>
          <IconEdit color="orange" />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => confirmar(row.original)}>
          <IconTrash color="crimson" />
        </ActionIcon>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nuevo Producto" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarPromo()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md">Nueva Promoción</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 90 }} hiddenFrom="md" onClick={()=>mostrarPromo()}>
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableHeadCellProps:{style: { fontWeight: 'bold', fontSize: '1.1rem'},},
    mantineTableProps:{striped: true,},
    localization:MRT_Localization_ES
  });

//id_sucursal_producto,fid_sucursal,fid_producto,existencia,precio,promocion,producto,sucursal
  const formPrecio = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_sucursal_producto:0,
      fid_sucursal:0,
      fid_producto:0,
      existencia:0,//tipo 1,5,6 y en el form hacer un select multi chips
      precio:0,
      promocion:0,
      producto:'',
      sucursal:'',
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const crudPrecios = async (data,eliminar) => {
    let newPrecio = { ...data };
    if (data.od_promocion) {
      newPrecio = { ...data, operacion: 'U',};
    } else {
      newPrecio = { ...data, operacion: 'I',};
    }
    if (eliminar) newPrecio.operacion = 'D';
    await consumirAPI('/crudSucursalProdcuto', newPrecio);
    close();
    formPrecio.reset();
    await cargarData();
  }

  const columnsPrecio = useMemo(
    () => [
      { accessorKey: 'sucursal',header: 'Sucursal',},
      { accessorKey: 'producto',header: 'Producto',},
      { accessorKey: 'existencia',header: 'Existencias',},
      { accessorKey: 'precio',header: 'Precio',},
      { accessorKey: 'promocion',header: 'Promocion',},
      { accessorKey: 'grupo_producto',header: 'Grupo Prodcuto',},
      { accessorKey: 'producto',header: 'Producto',},
      { accessorKey: 'descuento',header: 'Descuento',},
    ],
    [],
  );


  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <Text size='2rem' mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Gestión de Promociones
      </Text>
      <Box pos='relative'>
        <LoadingOverlay visible={loading} zIndex={39} overlayProps={{ radius: 'lg', blur: 4 }} loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}/>
        <Modal opened={opened} onClose={close} title={formPromo.getValues().id_promocion?'Actualizar Promoción: '+ formPromo.getValues().id_promocion:'Registrar Promoción'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={formPromo.onSubmit((values) => crudPromocion(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <NativeSelect
              label="Sucursal:"
              data={["SELECCIONE...",...sucursales.map((e) => {return{label:e.nombre,value:e.id_sucursal}}),]}
              required
              leftSection={<IconBuilding size={16} />}
              key={formPromo.key("fid_sucursal")}
              {...formPromo.getInputProps("fid_sucursal")}
            />
            <TextInput
              label="Nombre:"
              placeholder="Nombre de la promoción"
              leftSection={<IconBuilding size={16} />}
              type='text'
              maxLength={200}
              minLength={5}
              key={formPromo.key('nombre')}
              {...formPromo.getInputProps('nombre')}
            />
            <MultiSelect
              label="Días de promoción"
              placeholder="Seleccione los días"
              data={semana}
              key={formPromo.key('dias')}
              {...formPromo.getInputProps('dias')}
            />
            <TextInput
              label="Hora Inicio:"
              placeholder="10:00"
              leftSection={<IconTimeDuration15 size={16} />}
              type="time"
              key={formPromo.key('hora_inicio')}
              {...formPromo.getInputProps('hora_inicio')}
            />
            <TextInput
              label="Hora Fin:"
              placeholder="11:00"
              leftSection={<IconTimeDuration15 size={16} />}
              type="time"
              key={formPromo.key('hora_fin')}
              {...formPromo.getInputProps('hora_fin')}
            />
            <NativeSelect
              label="Grupo Producto:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.grupo=='GRUPO_PRODUCTO').map(e=>e.nombre)]}
              required
              leftSection={<IconUser size={16} />}
              key={formPromo.key('grupo')}
              {...formPromo.getInputProps('grupo')}
            />
            <NativeSelect
              label="Producto:"
              data={["SELECCIONE...",...sucursales.map((e) => {return{label:e.descripcion,value:e.id_producto}}),]}
              required
              leftSection={<IconBuilding size={16} />}
              key={formPromo.key("fid_producto")}
              {...formPromo.getInputProps("fid_producto")}
            />
            <NumberInput
              label="Descuento %:"
              placeholder="33"
              allowDecimal={true}
              decimalScale={2}
              min={0}
              max={100}
              suffix='%'
              leftSection={<IconCashBanknote size={16} />}
              key={formPromo.key('descuento')}
              {...formPromo.getInputProps('descuento')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!formPromo.getValues().id_proveedor ? 'Registrar':'Actualizar'} Proveedor</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={tablePromo} />
      </Box>
    </div>
  )
}

export default Control