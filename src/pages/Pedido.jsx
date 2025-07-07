import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, NativeSelect, Text, TextInput, Tooltip } from "@mantine/core";
import { UserAuth } from "../context/AuthContext";
import { DataApp } from "../context/DataContext";
import { useEffect } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconDeviceFloppy, IconEdit, IconSquarePlus, IconUser } from "@tabler/icons-react";
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';

const Pedido = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,productos,sucursales,parametricas,pedidos } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);
  const [grupo, setGrupo] = useState('')

  useEffect(() => {
    if(user?.sucursal) cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    await consumirAPI('/listarProductos', { opcion: 'PEDIDO',id:user.sucursal });
    await consumirAPI('/listarPedidos', { opcion: 'PEDIDOS',id:user.usuario ,id_sucursal:user.sucursal });
    if(sucursales.lenght == 0) await consumirAPI('/listarSucursales', { opcion: 'T',id:0 })
    if(parametricas.lenght == 0) await consumirAPI('/listarClasificador', { opcion: 'T',id:0 })
    //todo: 'PEDIDOS' seria select * from pedido where (control_caja where fid_sucucarsal = id and APERTURA) solo una caja puede estar disponible por sucursal por nocche
  console.log('las parametricas',parametricas);
  
  }
//id_pedido,fid_usuario,fid_control_caja,mesa,metodo_pago,codigo_sync,estado
  const form = useForm({
      mode: 'uncontrolled',
      initialValues: {
        id_pedido:0,
        fid_usuario:0,
        fid_control_caja:0,
        mesa:'',
        metodo_pago:'',
        codigo_sync:'',
        estado:'',
        consumo:[],
      },
      // validate: {
      //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
      // },
    });

  const columns = useMemo(
    () => [
      { accessorKey: 'mesa',header: 'Mesa',},
      { accessorKey: 'metodo_pago',header: 'Método Pago',},
      { accessorKey: 'estado',header: 'Estado',},
      { accessorKey: 'consumo',header: 'Consumo',},
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
    data: pedidos,
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

  const crudPedido = async (data,eliminar) => {
    let newPedido = { ...data };
    if (data.id_pedido) {
      newPedido = { ...data, operacion: 'U', usuario_registro: user.usuario };
    } else {
      newPedido = { ...data, operacion: 'I', usuario_registro: user.usuario };
    }
    if (eliminar) newPedido.operacion = 'D';
    await consumirAPI('/crudProveedor', newPedido);
    close();
    // form.reset(); resetear el carrito
    await cargarData();

    //todo: hacer tipo carrito de compras y al ultimo confirmar pedido y registrar pedido y sus detalles 
  }

  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <Text size='2rem' mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        {user?.sucursal && `Pedidos Sucursal - ${sucursales.find(f=>f.id_sucursal == user.sucursal)?.nombre}`}
        {!user?.sucursal && `No cuenta con sucursal vinculada. Por favor coordinar con el administrador`} 
      </Text>
      <div className="grid-pedido">
        {parametricas.filter(f=>f.grupo == 'GRUPO_PRODUCTO').map(e => (
          <Box my={10} className="card-prod" key={e.id_clasificador} onClick={()=>setGrupo(e.grupo)}>
            <img className="card-bg" src={`../assets/${e.nombre}.png`} alt=""/>
            <p className="heading">{e.nombre}</p>
          </Box>
        ))}
      </div>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={form.getValues().id_proveedor?'Actualizar Proveedor: '+ form.getValues().id_proveedor:'Registrar Proveedor'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={form.onSubmit((values) => crudPedido(values))} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <TextInput
              label="Mesa:"
              placeholder="Ubicación o número de la mesa"
              type='text'
              maxLength={100}
              requiered
              leftSection={<IconUser size={16} />}
              key={form.key('mesa')}
              {...form.getInputProps('mesa')}
            />
            <NativeSelect
              label="Método Pago:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.grupo == 'METODO_PAGO').map(e=>e.nombre)]}
              required
              leftSection={<IconUser size={16} />}
              key={form.key('metodo_pago')}
              {...form.getInputProps('metodo_pago')}
            />
            <NativeSelect
              label="Estado del Pedido:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.grupo == 'ESTADO_PEDIDO').map(e=>e.nombre)]}
              required
              leftSection={<IconUser size={16} />}
              key={form.key('estado')}
              {...form.getInputProps('estado')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!form.getValues().id_proveedor ? 'Registrar':'Actualizar'} Proveedor</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={table} />
      </Box>
      <Modal opened={grupo} onClose={()=>setGrupo('')} title={`Listado de ${grupo}`} size={"xl"} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
        <div className="card-list">
          {productos.filter(f=>f.grupo == grupo).map(p=>(
            <p key={p.id_producto}><span>{p.nombre}</span></p>
          )) }
        </div>
      </Modal>
      {<Box>

      </Box>}
    </div>
  )
}

export default Pedido