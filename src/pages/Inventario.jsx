import { ActionIcon, Box, Button, Group, Kbd, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput } from "@mantine/core";
import { UserAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { DataApp } from "../context/DataContext";
import { useForm } from "@mantine/form";
import { useMemo } from "react";
import { modals } from "@mantine/modals";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconBottle, IconCategoryPlus, IconDatabase, IconDeviceFloppy, IconEdit, IconFileBarcode, IconGlassGin, IconNumber10, IconRefresh, IconTicket, IconTrash } from "@tabler/icons-react";
import { MRT_Localization_ES } from "mantine-react-table/locales/es/index.esm.mjs";

const Inventario = () => {
  const { user } = UserAuth();
    const { loading,consumirAPI,proveedores,parametricas } = DataApp();
    const [opened, { open, close }] = useDisclosure(false);
  
    useEffect(() => {
      cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  
    const cargarData = async () =>{
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
          Está seguro de ELIMINAR el producto: <strong>{e.descripcion.toUpperCase()}</strong>
          </Text>
        ),
        labels: { confirm: 'Eliminar Producto', cancel: "Cancelar" },
        confirmProps: { color: 'red' },
        onCancel: () => console.log('Cancel'),
        onConfirm: () => crudProducto(e, true),
      });
    }
  
    const table = useMantineReactTable({
      columns,
      data: proveedores,
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
      mantineTableHeadCellProps:{style: { fontWeight: 'bold', fontSize: '1.1rem'},},
      mantineTableProps:{striped: true,},
      localization:MRT_Localization_ES,
      renderDetailPanel:({row}) => (
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
        }}
      >
        {/* <h2>{row.original.nombre}</h2>
        <p>{row.original.direccion} {row.original.referencia}</p>
        <strong>{row.original.telefonos}</strong><br /> */}
        {console.log('lo q llega sub',row)}
      
        <Kbd color='orange'>MOSTRANDO EL DETALLE</Kbd>
      </Box>
    )
    });


  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <h1>Gestión de Prodcutos</h1>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_producto?'Actualizar Proveedor: '+ form.getValues().id_producto:'Registrar Proveedor'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudProducto(values))}>
            <TextInput
              label="Código:"
              placeholder="NC001-750"
              type='text'
              maxLength={20}
              leftSection={<IconFileBarcode size={16} />}
              key={form.key('codigo')}
              {...form.getInputProps('codigo')}
            />
            <TextInput
              label="Nombre Producto:"
              placeholder="Cerveza Paceña 750ml"
              type='text'
              maxLength={100}
              leftSection={<IconTicket size={16} />}
              key={form.key('descripcion')}
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
              key={form.key('capacidad')}
              {...form.getInputProps('capacidad')}
            />
            <NumberInput
              label="Stock Mínimo:"
              placeholder="10"
              allowDecimal={false}
              max={1000}
              min={1}
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
              {!form.getValues().id_producto && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Producto</Button>}
              {form.getValues().id_producto && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Producto</Button>}
            </Group>
          </form>
        </Modal>
        <Button onClick={()=>mostrarRegistro()} style={{marginBottom:'1rem'}} size='sm'>Nuevo Producto</Button>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Inventario