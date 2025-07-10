import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, MultiSelect, NativeSelect, NumberInput, Text, TextInput, Tooltip } from '@mantine/core';
import { IconBottle, IconBuilding, IconCashBanknote, IconDeviceFloppy, IconEdit, IconSquarePlus, IconTimeDuration15, IconTrash, IconUser } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';

const Control = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,promociones,sucursales,productos,parametricas,precios } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);
  const [openedPrecio, { open:openPrecio, close:closePrecio }] = useDisclosure(false);

  useEffect(() => {
    cargarData('T')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async (opcion) =>{
    console.log('entrando',user);
    
    if(['T','P'].includes(opcion)) await consumirAPI('/listarPromociones', { opcion: 'T' });
    if(['T','S'].includes(opcion)) await consumirAPI('/listarSucursalProductos', { opcion: 'T' });
    if(productos.length == 0) await consumirAPI('/listarProductos', { opcion: 'T' });
    if(sucursales.length == 0) await consumirAPI('/listarSucursales', { opcion: 'T' });
    if(parametricas.length == 0) await consumirAPI('/listarClasificador', { opcion: 'T' });
  }

  const semana = [
  { label: 'Lunes',value: '1' },
  { label: 'Martes',value: '2' },
  { label: 'Miércoles',value: '3' },
  { label: 'Jueves',value: '4' },
  { label: 'Viernes',value: '5' },
  { label: 'Sábado',value: '6' },
  { label: 'Domingo',value: '7' },
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
    if (data.id_promocion) {
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
//? hacer pruebas de calculos de promos cuando se sobrepongan
//? mejor creo es validar en PR al momento de registro o edicion
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
          <Button onClick={()=>mostrarPromo()} variant="gradient" gradient={{ from: "violet", to: "#2c0d57", deg: 180 }} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md">Nueva Promoción</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 180 }} hiddenFrom="md" onClick={()=>mostrarPromo()}>
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

  const crudPrecio = async (data,eliminar) => {
    let newPrecio = { ...data };
    if (data.id_sucursal_producto) {
      newPrecio = { ...data, operacion: 'U',};
    } else {
      newPrecio = { ...data, operacion: 'I',};
    }
    if (eliminar) newPrecio.operacion = 'D';
    await consumirAPI('/crudSucursalProdcuto', newPrecio);
    closePrecio();
    formPrecio.reset();
    await cargarData('S');
  }

  const columnsPrecio = useMemo(
    () => [
      { accessorKey: 'sucursal',header: 'Sucursal',},
      { accessorKey: 'producto',header: 'Producto',},
      { accessorKey: 'existencia',header: 'Existencias',},
      { accessorKey: 'precio',header: 'Precio',},
      { accessorKey: 'promocion',header: 'Promocion',},
    ],
    [],
  );
//? colocar unique (fid_producto,fid_sucursal) en precio 
  const mostrarPrecio = (data) => {
    console.log('Mostrar precio:', data);
    openPrecio();
    formPrecio.reset();
    if (data) formPrecio.setValues(data);
  }

  const tablePrecio = useMantineReactTable({
    columns: columnsPrecio,
    data: precios,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <ActionIcon variant="subtle" onClick={() => mostrarPrecio(row.original)}>
          <IconEdit color="orange" />
        </ActionIcon>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nuevo Precio" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarPrecio()} variant="gradient" gradient={{ from: "violet", to: "#2c0d57", deg: 180 }} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md">Nuevo Precio</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 180 }} hiddenFrom="md" onClick={()=>mostrarPrecio()}>
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
        Gestión de Promociones
      </Text>
      <Box pos='relative'>
        <LoadingOverlay visible={loading} zIndex={39} overlayProps={{ radius: 'lg', blur: 4 }} loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}/>
        <Modal opened={opened} onClose={close} title={formPromo.getValues().id_promocion?'Actualizar Promoción: '+ formPromo.getValues().id_promocion:'Registrar Promoción'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={formPromo.onSubmit((values) => crudPromocion(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <NativeSelect
              label="Sucursal:"
              data={[{label:'TODAS',value:1000},...sucursales.map((e) => {return{label:e.nombre,value:e.id_sucursal}}),]}
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
              // key={formPromo.key('dias')}
              // {...formPromo.getInputProps('dias')}
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
              data={["SELECCIONE...",...productos.map((e) => {return{label:e.descripcion,value:e.id_producto}}),]}
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
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!formPromo.getValues().id_promocion ? 'Registrar':'Actualizar'} Promoción</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={tablePromo} />
      </Box>
      <Text size='2rem' mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Gestión de Precios
      </Text>
      <Box pos='relative'>
        <LoadingOverlay visible={loading} zIndex={39} overlayProps={{ radius: 'lg', blur: 4 }} loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}/>
        <Modal opened={openedPrecio} onClose={closePrecio} title={formPrecio.getValues().id_sucursal_producto?'Actualizar Precio: '+ formPrecio.getValues().id_sucursal_producto:'Registrar Precio'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={formPrecio.onSubmit((values) => crudPrecio(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <NativeSelect
              label="Sucursal:"
              data={[{label:'TODAS',value:1000},...sucursales.map((e) => {return{label:e.nombre,value:e.id_sucursal}}),]}
              required
              leftSection={<IconBuilding size={16} />}
              key={formPrecio.key("fid_sucursal")}
              {...formPrecio.getInputProps("fid_sucursal")}
            />
            <NativeSelect
              label="Producto:"
              data={["SELECCIONE...",...productos.map((e) => {return{label:e.descripcion,value:e.id_producto}}),]}
              required
              leftSection={<IconBottle size={16} />}
              key={formPrecio.key("fid_producto")}
              {...formPrecio.getInputProps("fid_producto")}
            />
            <NumberInput
              label="Existencia:"
              placeholder="Cantidad de producto en stock"
              allowDecimal={false}
              min={0}
              max={9000}
              leftSection={<IconCashBanknote size={16} />}
              key={formPrecio.key('existencia')}
              {...formPrecio.getInputProps('existencia')}
            />
            <NumberInput
              label="Precio:"
              placeholder="Precio normal del producto"
              allowDecimal={true}
              decimalScale={2}
              min={0}
              max={9000}
              prefix='Bs. '
              leftSection={<IconCashBanknote size={16} />}
              key={formPrecio.key('precio')}
              {...formPrecio.getInputProps('precio')}
            />
            <NumberInput
              label="Precio en Promoción:"
              placeholder="Precio alternativo de promoción"
              allowDecimal={true}
              decimalScale={2}
              min={0}
              max={9000}
              prefix='Bs. '
              leftSection={<IconCashBanknote size={16} />}
              key={formPrecio.key('promocion')}
              {...formPrecio.getInputProps('promocion')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!formPrecio.getValues().id_sucursal_producto ? 'Registrar':'Actualizar'} Precio</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={tablePrecio} />
      </Box>
    </div>
  )
}

export default Control