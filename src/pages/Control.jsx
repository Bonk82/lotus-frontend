/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, MultiSelect, NativeSelect, NumberInput, Select, Text, TextInput, Tooltip } from '@mantine/core';
import { IconAlignLeft, IconBottle, IconBuilding, IconCashBanknote, IconCashMinus, IconCategoryPlus, IconDeviceFloppy, IconDialpad, IconEdit, IconHours24, IconMatrix, IconSquarePlus, IconTimeDuration15, IconTrash, IconUser } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import dayjs from 'dayjs';

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
      fid_sucursal:1,
      nombre:'',
      dias:[],//tipo 1,5,6 y en el form hacer un select multi chips
      hora_inicio:'',
      hora_fin:'',
      grupo_producto:'',
      productos:[],
      cantidad:0,
      precio:0,
      descuento:0,
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const crudPromocion = async (data,eliminar) => {
    console.log('la data',data);
    
    let newPromocion = { ...data };
    if (data.id_promocion) {
      newPromocion = { ...data, operacion: 'U', usuario_registro: user.usuario };
    } else {
      newPromocion = { ...data, operacion: 'I', usuario_registro: user.usuario };
    }
    if (eliminar) newPromocion.operacion = 'D';
    console.log('la newp',newPromocion);
    
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
      { accessorKey: 'dias_nombres',header: 'Días',Cell:({cell})=>(
                <div>{cell.getValue().split(', ')
                          .map((dia,index) => <div key={index}>{dia}</div>)}</div>
              )},
      { accessorKey: 'precio',header: 'Precio',},
      { accessorKey: 'hora_inicio',header: 'Hora Inicio',Cell:({cell})=>(
                <span>{cell.getValue() && dayjs('20250101 '+cell.getValue()).format('HH:mm')}</span>
              )},
      { accessorKey: 'hora_fin',header: 'Hora Fin',Cell:({cell})=>(
                <span>{cell.getValue() && dayjs('20250101 '+cell.getValue()).format('HH:mm')}</span>
              )},
      { accessorKey: 'grupo_producto',header: 'Grupo Prodcuto',},
      { accessorKey: 'productos',header: 'Productos',Cell:({cell})=>(
                <div>{cell.getValue()?.map(p => <div key={p.id_producto}>{p.descripcion} ({p.unidad})</div>)}</div>
              )},
      { accessorKey: 'cantidad',header: 'Cantidad',},
      { accessorKey: 'descuento',header: 'Descuento',Cell:({cell})=>(
                <span>{cell.getValue() && `${cell.getValue()}%`}</span>
              )},
    ],
    [],
  );

  const mostrarPromo = (data) => {
    console.log('Mostrar registro:', data);
    formPromo.reset();
    open();
    if (data){
      // data.dias = ['5','6','7']
      data.dias = data.dias.split(',');
      formPromo.setValues(data);
      // setDiasSel(['5','6','7'])
    } 
    console.log('form ahora',formPromo.getValues());
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
        <Tooltip label="Editar Promoción" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarPromo(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar Promoción" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => confirmar(row.original)}>
            <IconTrash color="crimson" />
          </ActionIcon>
        </Tooltip>
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
        <Tooltip label="Editar Precio" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarPrecio(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
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
      <Text size='clamp(1.5rem, 2vw, 2rem)' mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Gestión de Promociones
      </Text>
      <Box pos='relative'>
        <LoadingOverlay visible={loading} zIndex={39} overlayProps={{ radius: 'lg', blur: 4 }} loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}/>
        <Modal opened={opened} onClose={close} title={formPromo.getValues().id_promocion?'Actualizar Promoción: '+ formPromo.getValues().id_promocion:'Registrar Promoción'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={formPromo.onSubmit((values) => crudPromocion(values))} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <NativeSelect
              label="Sucursal:"
              data={[{label:'SELECCIONE...',value:0},...sucursales.map((e) => {return{label:e.nombre,value:e.id_sucursal}}),]}
              required
              leftSection={<IconBuilding size={16} />}
              key={formPromo.key("fid_sucursal")}
              {...formPromo.getInputProps("fid_sucursal")}
            />
            <TextInput
              label="Nombre:"
              placeholder="Nombre de la promoción"
              leftSection={<IconAlignLeft size={16} />}
              type='text'
              maxLength={200}
              minLength={5}
              required
              key={formPromo.key('nombre')}
              {...formPromo.getInputProps('nombre')}
            />
            <MultiSelect
              label="Días de promoción"
              leftSection={<IconHours24 size={16} />}
              placeholder="Seleccione los días"
              data={semana}
              clearable
              searchable
              required
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
              leftSection={<IconCategoryPlus size={16} />}
              key={formPromo.key('grupo_producto')}
              {...formPromo.getInputProps('grupo_producto')}
            />
            <MultiSelect
              label="Productos:"
              data={productos.map((e) => {return{label:`${e.descripcion} - ${e.unidad}`,value:e.id_producto.toString()}})}
              required
              searchable  
              clearable
              leftSection={<IconBottle size={16} />}
              key={formPromo.key("productos")}
              {...formPromo.getInputProps("productos")}
            />
            <NumberInput
              label="Cantidad:"
              placeholder="Cantidad de productos del mismo grupo"
              allowDecimal={false}
              min={0}
              max={20}
              leftSection={<IconDialpad size={16} />}
              key={formPromo.key('cantidad')}
              {...formPromo.getInputProps('cantidad')}
            />
             <NumberInput
              label="Precio:"
              placeholder="Precio final de la Promoción"
              allowDecimal={true}
              decimalScale={2}
              min={0}
              max={5000}
              prefix='Bs. '
              leftSection={<IconCashBanknote size={16} />}
              key={formPromo.key('precio')}
              {...formPromo.getInputProps('precio')}
            />
            <NumberInput
              label="Descuento %:"
              placeholder="33"
              allowDecimal={true}
              decimalScale={2}
              min={0}
              max={100}
              suffix='%'
              leftSection={<IconCashMinus size={16} />}
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
      <Text size='clamp(1.5rem, 2vw, 2rem)' my={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Gestión de Precios por Sucursal
      </Text>
      <Box pos='relative'>
        <LoadingOverlay visible={loading} zIndex={39} overlayProps={{ radius: 'lg', blur: 4 }} loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}/>
        <Modal opened={openedPrecio} onClose={closePrecio} title={formPrecio.getValues().id_sucursal_producto?'Actualizar Precio: '+ formPrecio.getValues().id_sucursal_producto:'Registrar Precio'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={formPrecio.onSubmit((values) => crudPrecio(values))} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <NativeSelect
              label="Sucursal:"
              data={[...sucursales.filter(f=>f.nombre != 'TODAS').map((e) => {return{label:e.nombre,value:e.id_sucursal}}),]}
              required
              leftSection={<IconBuilding size={16} />}
              key={formPrecio.key("fid_sucursal")}
              {...formPrecio.getInputProps("fid_sucursal")}
            />
            <Select
              label="Producto:"
              data={[...productos.filter(f=>f.pedido_minimo>0).map((e) => {return{label:`${e.descripcion} - ${e.unidad}`,value:e.id_producto.toString()}}),]}
              required
              searchable
              limit={5}
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
              leftSection={<IconMatrix size={16} />}
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