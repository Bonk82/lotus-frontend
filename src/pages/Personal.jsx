/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, NativeSelect, Text, TextInput, Tooltip } from '@mantine/core';
import { IconAlertHexagon, IconAlignLeft, IconBuilding, IconCalendar, IconDeviceFloppy, IconEdit, IconGps, IconId, IconMail, IconScan, IconSquarePlus, IconTrash, IconUser, IconUserCircle } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import dayjs from 'dayjs';

const Personal = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,sucursales,usuarios,roles,parametricas } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);
  const [openedUsuario, { open:openUsuario, close:closeUsuario }] = useDisclosure(false);

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    if(parametricas.length === 0) consumirAPI('/listarClasificador', { opcion: 'T' });
    consumirAPI('/listarSucursales', { opcion: 'T' });
    consumirAPI('/listarUsuarios', { opcion: 'T' });
    consumirAPI('/listarRoles', { opcion: 'T' });
  }

  const formSucursal = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_sucursal:0,
      codigo:'',
      nombre:'',
      direccion:'',
      ip:'',
      fid_encargado:null,
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const crudSucursal = async (data,eliminar) => {
    let newSucursal = { ...data };
    if (data.id_sucursal) {
      newSucursal = { ...data, operacion: 'U'};
    } else {
      newSucursal = { ...data, operacion: 'I'};
    }
    if (eliminar) newSucursal.operacion = 'D';
    await consumirAPI('/crudSucursal', newSucursal);
    close();
    formSucursal.reset();
    await cargarData();
  }

  const columnsSucursal = useMemo(
    () => [
      { accessorKey: 'codigo',header: 'Código',},
      { accessorKey: 'nombre',header: 'Nombre',},
      { accessorKey: 'direccion',header: 'Dirección',},
      { accessorKey: 'ip',header: 'IP',},
      { accessorKey: 'encargado',header: 'Encargado',},
    ],
    [],
  );

  const mostrarSucursal = (data) => {
    console.log('Mostrar registro:', data);
    open();
    formSucursal.reset();
    if (data) formSucursal.setValues(data);
  }

  const confirmarSucursal = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR la sucursal:<br /> <strong>{e.nombre.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Proveedor', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#240846' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudSucursal(e, true),
    });
  }

  const tableSucursal = useMantineReactTable({
    columns: columnsSucursal,
    data: sucursales,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <Tooltip label="Editar Sucursal" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarSucursal(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar Sucursal" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => confirmarSucursal(row.original)}>
            <IconTrash color="crimson" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nueva Sucursal" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarSucursal()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md" variant="gradient" gradient={{ from: "violet", to: "#2c0d57", deg: 180 }}>Nueva Sucursal</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 90 }} hiddenFrom="md" onClick={()=>mostrarSucursal()}>
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableHeadCellProps:{style: { fontWeight: 'bold', fontSize: '1.1rem'},},
    mantineTableProps:{striped:true},
    localization:MRT_Localization_ES
  });

  const formUsuario = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_usuario:0,
      fid_rol:null,
      fid_sucursal:null,
      ci:'',
      fecha_nacimiento:'',
      nombres:'',
      paterno:'',
      materno:'',
      correo:'',
      telefonos:0,
      estado:'ALTA'
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const crudUsuario = async (data,eliminar) => {
    let newUsuario = { ...data };
    if (data.id_usuario) {
      newUsuario = { ...data, operacion: 'U'};
    } else {
      newUsuario = { ...data, operacion: 'I'};
    }
    if (eliminar) newUsuario.operacion = 'D';
    await consumirAPI('/crudUsuario', newUsuario);
    closeUsuario();
    formUsuario.reset();
    await cargarData();
  }

  const columnsUsuario = useMemo(
    () => [
      { accessorKey: 'rol',header: 'Rol',},
      { accessorKey: 'sucursal',header: 'Sucursal',},
      { accessorKey: 'ci',header: 'Documento',},
      { accessorKey: 'fecha_nacimiento',header: 'Fecha Nacimiento',Cell:({cell})=>(
          <span>{dayjs(cell.getValue()).format('DD/MM/YYYY')}</span>)},
      { accessorKey: 'nombres',header: 'Nombres',},
      { accessorKey: 'paterno',header: 'Paterno',},
      { accessorKey: 'materno',header: 'Materno',},
      { accessorKey: 'correo',header: 'Correo',},
      { accessorKey: 'telefonos',header: 'Telefonos',},
      { accessorKey: 'estado',header: 'Estado',},
    ],
    [],
  );

  const mostrarUsuario = (data) => {
    formUsuario.reset();
    openUsuario();
    if (data) formUsuario.setValues(data);
    if (!data) formUsuario.setValues({estado:'ALTA',fid_rol:2});
  }

  const confirmarUsuario = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
          Está seguro de ELIMINAR al usuario:<br /> <strong>{e.cuenta.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Usuario', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#240846' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudUsuario(e, true),
    });
  }

  const tableUsuario= useMantineReactTable({
    columns: columnsUsuario,
    data: usuarios,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <Tooltip label="Editar Usuario" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarUsuario(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar Usuario" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => confirmarUsuario(row.original)}>
            <IconTrash color="crimson" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nuevo Usuario" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarUsuario()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md" variant="gradient" gradient={{ from: "violet", to: "#2c0d57", deg: 180 }}>Nuevo Usuario</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 90 }} hiddenFrom="md" onClick={()=>mostrarUsuario()}>
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
      <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} mb={'lg'} mt={15} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Gestión de Usuarios
      </Text>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={openedUsuario} onClose={closeUsuario} title={formUsuario.getValues().id_usuario?'Actualizar Usuario: '+ formUsuario.getValues().id_usuario:'Registrar Usuario'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'>   
          <form onSubmit={formUsuario.onSubmit((values) => crudUsuario(values))} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <NativeSelect
              label="Rol Asignado:"
              data={[{label:'SELECCIONE...',value:null},...roles.map(e=>{return {label:e.nombre,value:e.id_rol}})]}
              required
              leftSection={<IconUserCircle size={16} />}
              key={formUsuario.key('fid_rol')}
              {...formUsuario.getInputProps('fid_rol')}
            />
            <NativeSelect
              label="Sucursal Asignado:"
              data={[{label:'SELECCIONE...',value:null},...sucursales.map(e=>{return {label:e.nombre,value:e.id_sucursal}})]}
              leftSection={<IconBuilding size={16} />}
              key={formUsuario.key('fid_sucursal')}
              {...formUsuario.getInputProps('fid_sucursal')}
            />
            <TextInput
              label="Número Documento:"
              placeholder="Número de Cédula de Identidad"
              type='text'
              required
              maxLength={20}
              leftSection={<IconId size={16} />}
              key={formUsuario.key('ci')}
              {...formUsuario.getInputProps('ci')}
            />
            <TextInput
              label="Fecha Nacimiento:"
              placeholder='Fecha Nacimeinto'
              type='date'
              maxLength={20}
              leftSection={<IconCalendar size={16} />}
              key={formUsuario.key('fecha_nacimiento')}
              {...formUsuario.getInputProps('fecha_nacimiento')}
            />
            <TextInput
              label="Nombre:"
              placeholder="Nombre del usuario"
              type='text'
              maxLength={50}
              minLength={3}
              required
              leftSection={<IconAlignLeft size={16} />}
              key={formUsuario.key('nombres')}
              {...formUsuario.getInputProps('nombres')}
            />
            <TextInput
              label="Apellido Paterno:"
              placeholder="Apellido Paterno del usuario"
              type='text'
              maxLength={100}
              required
              leftSection={<IconAlignLeft size={16} />}
              key={formUsuario.key('paterno')}
              {...formUsuario.getInputProps('paterno')}
            />
            <TextInput
              label="Apellido Materno:"
              placeholder="Apellido Materno del usuario"
              type='text'
              maxLength={100}
              leftSection={<IconAlignLeft size={16} />}
              key={formUsuario.key('materno')}
              {...formUsuario.getInputProps('materno')}
            />
            <TextInput
              label="Email:"
              placeholder="Correo del usuario"
              type='email'
              maxLength={100}
              leftSection={<IconMail size={16} />}
              key={formUsuario.key('correo')}
              {...formUsuario.getInputProps('correo')}
            />
            <NativeSelect
              label="Estado del Usuario:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.grupo == 'ESTADO_USUARIO').map(e=>e.nombre)]}
              required
              leftSection={<IconAlertHexagon size={16} />}
              key={formUsuario.key('estado')}
              {...formUsuario.getInputProps('estado')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!formUsuario.getValues().id_usuario ? 'Registrar':'Actualizar'} Usuario</Button>
            </Group>
          </form>
        </Modal>
        <Box visibleFrom='md'>
          <MantineReactTable table={tableUsuario} />
        </Box>
        <Box hiddenFrom='md'>
          {usuarios.map(u=>(
            <div key={u.id_usuario} className='card-box bg-violet' onClick={()=>mostrarUsuario(u)}>
              <div className="inner">
                <strong>{u.cuenta}</strong>
                <p>{u.rol}</p>
              </div>
              <div className="icon"><IconUser size={60}/></div>
              <div className="card-box-footer">{u.estado}</div>
            </div>
          ))}
        </Box>
      </Box>

      <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} my={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Gestión de Sucursales
      </Text>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={formSucursal.getValues().id_sucursal?'Actualizar Sucursal: '+ formSucursal.getValues().id_sucursal:'Registrar Sucursal'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={formSucursal.onSubmit((values) => crudSucursal(values))} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <TextInput
              label="Código:"
              placeholder="Código de la sucursal"
              type='text'
              maxLength={20}
              requiered
              leftSection={<IconScan size={16} />}
              key={formSucursal.key('codigo')}
              {...formSucursal.getInputProps('codigo')}
            />
            <TextInput
              label="Nombre:"
              placeholder="Nombre de la sucursal"
              type='text'
              maxLength={100}
              minLength={5}
              requiered
              leftSection={<IconUser size={16} />}
              key={formSucursal.key('nombre')}
              {...formSucursal.getInputProps('nombre')}
            />
            <TextInput
              label="Dirección:"
              placeholder="Direccion de la sucursal"
              type='text'
              maxLength={50}
              leftSection={<IconGps size={16} />}
              key={formSucursal.key('direccion')}
              {...formSucursal.getInputProps('direccion')}
            />
            <TextInput
              label="IP:"
              placeholder="Dirección IP de la sucursal (caja)"
              type='text'
              maxLength={17}
              leftSection={<IconGps size={16} />}
              key={formSucursal.key('ip')}
              {...formSucursal.getInputProps('ip')}
            />
            <NativeSelect
              label="Encargado de Sucursal:"
              data={[{label:'SELECCIONE...',value:null},...usuarios.filter(f=>f.fid_rol == 4).map(e=>{return {label:e.cuenta,value:e.id_usuario}})]}
              leftSection={<IconUser size={16} />}
              key={formSucursal.key('fid_encargado')}
              {...formSucursal.getInputProps('fid_encargado')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!formSucursal.getValues().id_sucursal ? 'Registrar':'Actualizar'} Sucursal</Button>
            </Group>
          </form>
        </Modal>
        <Box visibleFrom='md'>
          <MantineReactTable table={tableSucursal}/>
        </Box>
        <Box hiddenFrom='md'>
          {sucursales.filter(f=>f.nombre != 'TODAS').map(s=>(
            <div key={s.id_sucursal} className='card-box bg-blue' onClick={()=>mostrarSucursal(s)}>
              <div className="inner">
                <strong>{s.nombre}</strong>
                <p>{s.direccion}</p>
              </div>
              <div className="icon"><IconBuilding size={60}/></div>
              <div className="card-box-footer">{s.codigo}</div>
            </div>
          ))}
        </Box>
      </Box>
    </div>
  )
}

export default Personal