import { ActionIcon, Box, Button, Group, Kbd, LoadingOverlay, Modal, NativeSelect, NumberInput, Table, Text, TextInput, Tooltip } from "@mantine/core";
import { UserAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { DataApp } from "../context/DataContext";
import { useForm } from "@mantine/form";
import { useMemo } from "react";
import { modals } from "@mantine/modals";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconBottle, IconCategoryPlus, IconDatabase, IconDeviceFloppy, IconEdit, IconFileBarcode, IconGlassGin, IconNumber10, IconSquarePlus, IconTicket, IconTrash } from "@tabler/icons-react";
import { MRT_Localization_ES } from "mantine-react-table/locales/es/index.esm.mjs";

const Inventario = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,productos,parametricas } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    if(parametricas.length === 0) consumirAPI('/listarClasificador', { opcion: 'T' });
    await consumirAPI('/listarProductos', { opcion: 'T' });
  }
  
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_producto:0,
      codigo:'',
      descripcion:'',
      unidad:'',
      capacidad:'',
      pedido_minimo:10,
      tipo_pruducto:'',
      grupo:'',
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });
  
  const crudProducto = async (data,eliminar) => {
    let newProducto = { ...data };
    if (data.id_producto) {
      newProducto = { ...data, operacion: 'U', usuario_registro: user.usuario };
    } else {
      newProducto = { ...data, operacion: 'I', usuario_registro: user.usuario };
    }
    if (eliminar) newProducto.operacion = 'D';
    await consumirAPI('/crudProducto', newProducto);
    close();
    form.reset();
    await cargarData();
  }
  
  const columns = useMemo(
    () => [
      { accessorKey: 'codigo',header: 'Código',},
      { accessorKey: 'descripcion',header: 'Descripción',},
      { accessorKey: 'unidad',header: 'Unidad Presentación',},
      { accessorKey: 'capacidad',header: 'Capacidad',},
      { accessorKey: 'pedido_minimo',header: 'Pedido Mínimo',},
      { accessorKey: 'tipo_pruducto',header: 'Tipo Producto',},
      { accessorKey: 'grupo',header: 'Grupo',},
    ],
    [],
  );

  const mostrarRegistro = (data) => {
    console.log('Mostrar registro:', data,parametricas);
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
        Está seguro de ELIMINAR el producto:<br /><strong>{e.descripcion.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Producto', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#240846' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudProducto(e, true),
    });
  }
  
  const table = useMantineReactTable({
    columns,
    data: productos,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',columnPinning: {
      left: ['mrt-row-expand'],
    },},
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
      <Tooltip label="Registrar Nuevo Producto" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarRegistro()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md">Nuevo Producto</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 90 }} hiddenFrom="md" onClick={()=>mostrarRegistro()}>
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableProps:{striped: true,},
    localization:MRT_Localization_ES,
    renderDetailPanel:({row}) => (
    <Box style={{width:'clamp(350px,40%,600px)'}} p='md'>
      <Kbd color='orange'>Composición del Producto</Kbd>
      {row.original?.componentes && componenetes(row.original?.componentes)}
    </Box>
  )
  });


  const componenetes = (c)=>{
    const rows = c.map((element) => (
      <Table.Tr key={element.id_componente}>
        <Table.Td>{element.item}</Table.Td>
        <Table.Td>{element.cantidad}</Table.Td>
        <Table.Td>{element.unidad}</Table.Td>
      </Table.Tr>
    ));

    const ths = (
      <Table.Tr>
        <Table.Th>Item</Table.Th>
        <Table.Th>Cantidad</Table.Th>
        <Table.Th>unidad</Table.Th>
      </Table.Tr>
    );

    return (
      <Table captionSide="top" width={50} striped highlightOnHover>
        <Table.Caption style={{backgroundColor:"transparent"}}>Composición del Producto</Table.Caption>
        <Table.Thead>{ths}</Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    );
  }

  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <Text size='2rem' mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Gestión de Productos
      </Text>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_producto?'Actualizar Producto: '+ form.getValues().id_producto:'Registrar Producto'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudProducto(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <TextInput
              label="Código:"
              placeholder="NC001-750"
              type='text'
              maxLength={20}
              leftSection={<IconFileBarcode size={16} />}
              key={form.key('codigo')}
              required
              {...form.getInputProps('codigo')}
            />
            <TextInput
              label="Nombre Producto:"
              placeholder="Cerveza Paceña 750ml"
              type='text'
              maxLength={100}
              leftSection={<IconTicket size={16} />}
              key={form.key('descripcion')}
              required
              {...form.getInputProps('descripcion')}
            />
            <NativeSelect
              label="Tipo de Presentación:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.grupo === 'UNIDAD_MEDIDA').map(e=>e.nombre)]}
              required
              leftSection={<IconBottle size={16} />}
              key={form.key('unidad')}
              {...form.getInputProps('unidad')}
            />
            <TextInput
              label="Tamaño Presentación:"
              placeholder="750 ml"
              leftSection={<IconDatabase size={16} />}
              type='text'
              maxLength={100}
              required
              key={form.key('capacidad')}
              {...form.getInputProps('capacidad')}
            />
            <NumberInput
              label="Stock Mínimo:"
              placeholder="10"
              allowDecimal={false}
              max={1000}
              min={1}
              required
              leftSection={<IconNumber10 size={16} />}
              key={form.key('pedido_minimo')}
              {...form.getInputProps('pedido_minimo')}
            />
            <NativeSelect
              label="Grupo Producto:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.grupo === 'GRUPO_PRODUCTO').map(e=>e.nombre)]}
              required
              leftSection={<IconGlassGin size={16} />}
              key={form.key('grupo')}
              {...form.getInputProps('grupo')}
            />
            <NativeSelect
              label="Tipo Producto:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.grupo === 'TIPO_PRODUCTO').map(e=>e.nombre)]}
              required
              leftSection={<IconCategoryPlus size={16} />}
              key={form.key('tipo_producto')}
              {...form.getInputProps('tipo_producto')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!form.getValues().id_producto ? 'Registrar':'Actualizar'} Producto</Button>
              {/* {form.getValues().id_producto && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Producto</Button>} */}
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Inventario