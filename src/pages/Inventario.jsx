/* eslint-disable react/prop-types */
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Select, Table, Text, TextInput, Tooltip,} from "@mantine/core";
import { UserAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { DataApp } from "../context/DataContext";
import { useForm } from "@mantine/form";
import { useMemo } from "react";
import { modals } from "@mantine/modals";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconBottle, IconBuilding, IconCalendar, IconCash, IconCategoryPlus, IconDatabase, IconDatabaseExclamation, IconDatabaseImport, IconDeviceFloppy, IconEdit, IconEye, IconFileBarcode, IconGlassGin, IconMaximize, IconSquarePlus, IconTicket, IconTrash,} from "@tabler/icons-react";
import { MRT_Localization_ES } from "mantine-react-table/locales/es/index.esm.mjs";
import dayjs from "dayjs";
import { useState } from "react";

const Inventario = () => {
  const { user } = UserAuth();
  const { loading, consumirAPI, productos, parametricas,ingresos,proveedores,sucursales,ingresoDetalles } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);
  const [openedIngreso, { open:openIngreso, close:closeIngreso }] = useDisclosure(false);
  const [openedID, { open:openID, close:closeID }] = useDisclosure(false);
  const [openedComponente, { open:openComponente, close:closeComponente }] = useDisclosure(false);
  // const [idComponente, setIdComponente] = useState(null);
  const [elIdIngreso, setElIdIngreso] = useState(null);

  useEffect(() => {
    cargarData("T");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarData = async (opcion) => {
    if (parametricas.length === 0)
      consumirAPI("/listarClasificador", { opcion: "T" });
    if (["T", "P"].includes(opcion))
      await consumirAPI("/listarProductos", { opcion: "T" });
    if (["T", "I"].includes(opcion))
      await consumirAPI("/listarIngresos", { opcion: "T" });
    if (["T", "ID"].includes(opcion) && elIdIngreso)
      await consumirAPI("/listarIngresoDetalles", { opcion: "id.fid_ingreso",id:elIdIngreso });
    if (["T", "PR"].includes(opcion))
      await consumirAPI("/listarProveedores", { opcion: "T" });
    if (["T", "S"].includes(opcion))
      await consumirAPI("/listarSucursales", { opcion: "T" });
  };

//#region PRODUCTO  
  const formProducto = useForm({
    mode: "uncontrolled",
    initialValues: {
      id_producto: 0,
      codigo: "",
      descripcion: "",
      unidad: "",
      capacidad: "",
      pedido_minimo: 10,
      tipo_producto: "",
      grupo: "",
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const crudProducto = async (data, eliminar) => {
    let newProducto = { ...data };
    if (data.id_producto) {
      newProducto = { ...data, operacion: "U", usuario_registro: user.usuario };
    } else {
      newProducto = { ...data, operacion: "I", usuario_registro: user.usuario };
    }
    if (eliminar) newProducto.operacion = "D";
    await consumirAPI("/crudProducto", newProducto);
    close();
    formProducto.reset();
    await cargarData("P");
  };

  const columnsProducto = useMemo(
    () => [
      { accessorKey: "codigo", header: "Código" },
      { accessorKey: "descripcion", header: "Descripción" },
      { accessorKey: "grupo", header: "Grupo" },
      { accessorKey: "unidad", header: "Unidad Presentación" },
      { accessorKey: "capacidad", header: "Capacidad" },
      { accessorKey: "pedido_minimo", header: "Pedido Mínimo" },
      { accessorKey: "tipo_producto", header: "Tipo Producto" },
    ],
    []
  );

  const mostrarProducto = (data) => {
    console.log("Mostrar registro:", data, parametricas);
    open();
    formProducto.reset();
    if (data) formProducto.setValues(data);
  };

  const confirmarProducto = (e) => {
    modals.openConfirmModal({
      title: "Confirmar Eliminación",
      centered: true,
      children: (
        <Text size="sm">
          Está seguro de ELIMINAR el producto:
          <br />
          <strong>{e.descripcion.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: "Eliminar Producto", cancel: "Cancelar" },
      confirmProps: { color: "violet" },
      cancelProps: { style: { backgroundColor: "#240846" } },
      overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => crudProducto(e, true),
    });
  };

  const tableProducto = useMantineReactTable({
    columns: columnsProducto,
    data: productos,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {
      density: "xs",
      columnPinning: {
        left: ["mrt-row-expand"],
      },
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{ gap: "0.8rem", display: "flex" }}>
        <Tooltip label="Editar Producto" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarProducto(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar Producto" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => confirmarProducto(row.original)}>
            <IconTrash color="crimson" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nuevo Producto" position="bottom" withArrow>
        <Box>
          <Button
            onClick={() => mostrarProducto()}
            style={{ marginBottom: "1rem" }}
            size="sm"
            visibleFrom="md"
            variant="gradient" gradient={{ from: "violet", to: "#2c0d57", deg: 180 }}
          >
            Nuevo Producto
          </Button>
          <ActionIcon
            variant="gradient"
            size="xl"
            gradient={{ from: "violet", to: "#2c0d57", deg: 180 }}
            hiddenFrom="md"
            onClick={() => mostrarProducto()}
          >
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableProps: { striped: true },
    localization: MRT_Localization_ES,
    renderDetailPanel: ({ row }) => (
      <Box style={{ width: "clamp(350px,50%,800px)", minHeight:'40px' }} p="xs">
        {/* {row.original?.componentes && componenetes(row.original)} */}
        {componenetes(row.original)}
      </Box>
    ),
  });
//#endregion  

//#region INGRESO
  const formIngreso = useForm({
    mode: "uncontrolled",
    initialValues: {
      id_ingreso: 0,
      fid_proveedor: null,
      proveedor:'',
      fid_sucursal: null,
      sucursal:'',
      motivo: "",
      fecha_ingreso: "",
    }
  });

  const crudIngreso = async (data, eliminar) => {
    let newIngreso = { ...data };
    if (data.id_ingreso) {
      newIngreso = { ...data, operacion: "U", usuario_registro: user.usuario };
    } else {
      newIngreso = { ...data, operacion: "I", usuario_registro: user.usuario };
    }
    if (eliminar) newIngreso.operacion = "D";
    await consumirAPI("/crudIngreso", newIngreso);
    closeIngreso();
    formIngreso.reset();
    await cargarData("I");
  };

  const columnsIngreso = useMemo(
    () => [
      { accessorKey: "id_ingreso", header: "N°" },
      { accessorKey: "proveedor", header: "Proveedor" },
      { accessorKey: "sucursal", header: "Cucursal" },
      { accessorKey: "motivo", header: "Motivo" },
      { accessorKey: "fecha_ingreso", header: "Fecha de Ingreso",Cell:({cell})=>(
          <span>{dayjs(cell.getValue()).format('DD/MM/YYYY')}</span>
        ) },
    ],
    []
  );

  const mostrarIngreso = (data) => {
    console.log("Mostrar registro:", data);
    // if(dayjs(data?.fecha_registro).isBefore(dayjs().add(1,'day')))
    openIngreso();
    formIngreso.reset();
    if (data) formIngreso.setValues(data);
    formIngreso.setValues({fecha_ingreso:dayjs(data?.fecha_ingreso).format('YYYY-MM-DD')})
  };

  const confirmarIngreso = (e) => {
    modals.openConfirmModal({
      title: "Confirmar Eliminación",
      centered: true,
      children: (
        <Text size="sm">
          Está seguro de ELIMINAR el ingreso:<br />
          <strong>{`${e.id_ingreso} - ${e.motivo.toUpperCase()}`}</strong><br />
           y todo su detalle ?
        </Text>
      ),
      labels: { confirm: "Eliminar Ingreso", cancel: "Cancelar" },
      confirmProps: { color: "violet" },
      cancelProps: { style: { backgroundColor: "#240846" } },
      overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => crudIngreso(e, true),
    });
  };

  const toogleMostrarDetalle = (v) =>{
    elIdIngreso == v ? setElIdIngreso(null) : setElIdIngreso(v);
    if(elIdIngreso) cargarData('ID');
  }

  const tableIngreso = useMantineReactTable({
    columns: columnsIngreso,
    data: ingresos,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: { density: "xs",},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{ gap: "0.8rem", display: "flex" }}>
        <Tooltip label="REvisar Detalle" position="bottom" withArrow>
          <ActionIcon variant="subtle" title="Ver Detalle" onClick={() => toogleMostrarDetalle(row.original.id_ingreso)}>
            <IconEye color="cyan" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Editar Ingreso" position="bottom" withArrow>
          <ActionIcon variant="subtle" title="Editar" onClick={() => mostrarIngreso(row.original)} disabled={dayjs(row.original.fecha_registro).isBefore(dayjs().add(-1,'day'))}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar Ingreso" position="bottom" withArrow>
          <ActionIcon variant="subtle" title="Eliminar" onClick={() => confirmarIngreso(row.original)} disabled={dayjs(row.original.fecha_registro).isBefore(dayjs().add(-1,'day'))}>
            <IconTrash color="crimson" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nuevo Producto" position="bottom" withArrow>
        <Box>
          <Button onClick={() => mostrarIngreso()} style={{ marginBottom: "1rem" }} size="sm" visibleFrom="md" variant="gradient" gradient={{ from: "violet", to: "#2c0d57", deg: 180 }}>Nuevo Ingreso</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: "violet", to: "#2c0d57", deg: 180 }} hiddenFrom="md"
          onClick={() => mostrarIngreso()}>
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableProps: { striped: true },
    localization: MRT_Localization_ES,
  });
//#endregion 

//#region INGRESO DETALLE
  const formIngresoDetalle = useForm({
    mode: "uncontrolled",
    initialValues: {
      id_ingreso_detalle: 0,
      fid_ingreso: 0,
      fid_producto:null,
      cantidad: null,
      precio_compra:0,
    },
  });

  const crudIngresoDetalle = async (data, eliminar) => {
    let newIngresoDetalle = { ...data };
    if (data.id_ingreso_detalle) {
      newIngresoDetalle = { ...data, operacion: "U", usuario_registro: user.usuario };
    } else {
      newIngresoDetalle = { ...data, operacion: "I", usuario_registro: user.usuario };
    }
    if (eliminar) newIngresoDetalle.operacion = "D";
    await consumirAPI("/crudIngresoDetalle", newIngresoDetalle);
    closeID();
    formIngresoDetalle.reset();
    await cargarData("ID");
  };

  const columnsID = useMemo(
    () => [
      { accessorKey: "ingreso", header: "Ingreso" },
      { accessorKey: "producto", header: "Producto" },
      { accessorKey: "cantidad", header: "Cantidad" },
      { accessorKey: "precio_compra", header: "Precio Compra"},
    ],
    []
  );

  const mostrarID = (data) => {
    console.log("Mostrar registro:", data,elIdIngreso);
    openID();
    formIngresoDetalle.reset();
    if (data) formIngresoDetalle.setValues(data);
    formIngresoDetalle.setValues({fid_ingreso:elIdIngreso})
  };

  const confirmarID = (e) => {
    modals.openConfirmModal({
      title: "Confirmar Eliminación",
      centered: true,
      children: (
        <Text size="sm">
          Está seguro de ELIMINAR el ingreso:<br />
          <strong>{`${e.producto.toUpperCase()} - Bs. ${e.precio_compra}`}</strong><br />
        </Text>
      ),
      labels: { confirm: "Eliminar Ingreso del Producto", cancel: "Cancelar" },
      confirmProps: { color: "violet" },
      cancelProps: { style: { backgroundColor: "#240846" } },
      overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => crudIngresoDetalle(e, true),
    });
  };

  const tableIngresoDetalle = useMantineReactTable({
    columns: columnsID,
    data: ingresoDetalles,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: { density: "xs",},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{ gap: "0.8rem", display: "flex" }}>
        <Tooltip label="Editar Detalle" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarID(row.original)} disabled={dayjs(row.original.fecha_registro).isBefore(dayjs().add(-1,'day'))}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar Detalle" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => confirmarID(row.original)} disabled={dayjs(row.original.fecha_registro).isBefore(dayjs().add(-1,'day'))}>
            <IconTrash color="crimson" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Nuevo Ingreso Producto" position="bottom" withArrow>
        <Box>
          <Button onClick={() => mostrarID()} style={{ marginBottom: "1rem" }} size="sm" visibleFrom="md" variant="gradient" gradient={{ from: "violet", to: "#2c0d57", deg: 180 }} disabled={dayjs(ingresos.find(f=>f.id_ingreso == elIdIngreso).fecha_registro).isBefore(dayjs().add(-1,'day'))}>Agregar Producto</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: "violet", to: "#2c0d57", deg: 180 }} hiddenFrom="md" onClick={() => mostrarID()} disabled={dayjs(ingresos.find(f=>f.id_ingreso == elIdIngreso).fecha_registro).isBefore(dayjs().add(-1,'day'))}>
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableProps: { striped: true },
    localization: MRT_Localization_ES,
  });
  //#endregion

//#region COMPONENTE
  const formComponente = useForm({
    mode: "uncontrolled",
    initialValues: {
      id_componente: 0,
      fid_producto_main:0,
      fid_producto: 0,
      cantidad:2000,
      unidad: 'ML',
    },
  });

  const componenetes = (c) => {
    const rows = c.componentes?.map((row) => (
      <Table.Tr key={row.id_componente}>
        <Table.Td>{row.item}</Table.Td>
        <Table.Td>{row.cantidad}</Table.Td>
        <Table.Td>{row.unidad}</Table.Td>
        <Table.Td>
          <Box style={{ gap: "0.8rem", display: "flex" }}>
            <ActionIcon variant="subtle" onClick={() => mostrarComponente(row)}>
              <IconEdit color="orange" />
            </ActionIcon>
            <ActionIcon variant="subtle" onClick={() => confirmarComponente(row)}>
              <IconTrash color="crimson" />
            </ActionIcon>
          </Box>
        </Table.Td>
      </Table.Tr>
    ));
    const ths = (
      <Table.Tr>
        <Table.Th>Item</Table.Th>
        <Table.Th>Cantidad</Table.Th>
        <Table.Th>Unidad</Table.Th>
        <Table.Th>Acción</Table.Th>
      </Table.Tr>
    );
    return (
      <>
      <Button variant="gradient" size="xs" pos={'absolute'} left={'1.5rem'} onClick={()=>mostrarComponente({fid_producto_main:c.id_producto})}>Agregar Componente</Button>
      {c.componentes?.length >0 &&
        <Table captionSide="top" width={50} striped highlightOnHover>
          <Table.Caption style={{ backgroundColor: "transparent",fontSize:'1.5rem',marginLeft:'2rem' }}>
            {c.componentes?.find(f=>f.unidad == 'ML') ? 'Composición del Producto':'Mezcladores'}
          </Table.Caption>
          <Table.Thead style={{lineHeight:'0.6rem',marginTop:'0.7rem'}}>{ths}</Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      }
      </>
    );
  };

  const mostrarComponente = (data) => {
    console.log("Mostrar registro:", data);
    openComponente();
    formComponente.reset();
    if (data) formComponente.setValues(data);
  };

  const confirmarComponente = (e) => {
    modals.openConfirmModal({
      title: "Confirmar Eliminación",
      centered: true,
      children: (
        <Text size="sm">
          Está seguro de ELIMINAR el item:<br />
          <strong>{`${e.item}`}</strong><br />
        </Text>
      ),
      labels: { confirm: "Eliminar Item", cancel: "Cancelar" },
      confirmProps: { color: "violet" },
      cancelProps: { style: { backgroundColor: "#240846" } },
      overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => crudComponente(e, true),
    });
  };

  const crudComponente = async (data, eliminar) => {
    let newComponente = { ...data };
    if (data.id_componente) {
      newComponente = { ...data, operacion: "U", usuario_registro: user.usuario };
    } else {
      newComponente = { ...data, operacion: "I", usuario_registro: user.usuario };
    }
    if (eliminar) newComponente.operacion = "D";
    await consumirAPI("/crudComponente", newComponente);
    closeComponente();
    formComponente.reset();
    // await consumirAPI("/listarProductos", { opcion: "p.id_producto",id:data.fid_producto_main});
    await consumirAPI("/listarProductos", { opcion: "T"});
  };
 //#endregion
  
  return (
    <div>
      <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} py={5} my={10} fw={900} variant="gradient" gradient={{ from: "gainsboro", to: "violet", deg: 90 }}>
        Gestión de Ingresos
      </Text>
      <Box pos="relative">
        <LoadingOverlay visible={loading} zIndex={39} overlayProps={{ radius: "lg", blur: 4 }} loaderProps={{ color: "violet", type: "dots", size: "xl" }}/>
        <Modal opened={openedIngreso} onClose={closeIngreso} title={formIngreso.getValues().id_ingreso ? "Actualizar Ingreso: " + formIngreso.getValues().id_ingreso : "Registrar Ingreso"} size="lg" zIndex={20} overlayProps={{ backgroundOpacity: 0.55, blur: 3 }} yOffset="10dvh">
          <form onSubmit={formIngreso.onSubmit((values) => crudIngreso(values))}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <NativeSelect
              label="Proveedor:"
              data={[{label:"SELECCIONE...",value:null},...proveedores.map((e) => {return{label:e.nombre,value:e.id_proveedor}}),]}
              leftSection={<IconBottle size={16} />}
              key={formIngreso.key("fid_proveedor")}
              {...formIngreso.getInputProps("fid_proveedor")}
            />
            <NativeSelect
              label="Sucursal:"
              data={[...sucursales.filter(f=>f.codigo != 'LT00').map((e) => {return{label:e.nombre,value:e.id_sucursal}}),]}
              required
              leftSection={<IconBuilding size={16} />}
              key={formIngreso.key("fid_sucursal")}
              {...formIngreso.getInputProps("fid_sucursal")}
            />
            <TextInput
              label="Motivo del Ingreso:"
              placeholder="Compra de Productos"
              leftSection={<IconDatabaseImport size={16} />}
              type="text"
              maxLength={100}
              required
              key={formIngreso.key("motivo")}
              {...formIngreso.getInputProps("motivo")}
            />
            <TextInput
              label="Fecha Ingreso:"
              placeholder="Fecha de la compra"
              leftSection={<IconCalendar size={16} />}
              type="date"
              maxLength={10}
              max={dayjs().format('YYYY-MM-DD')}
              required
              key={formIngreso.key("fecha_ingreso")}
              {...formIngreso.getInputProps("fecha_ingreso")}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy />} type="submit">
                {!formIngreso.getValues().id_ingreso ? "Registrar " : "Actualizar "}Ingreso
              </Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={tableIngreso} />
      </Box>
      {elIdIngreso && 
      <><Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} py={5} my={10} fw={900} variant="gradient" gradient={{ from: "#a8daeeff", to: "#40c9ff", deg: 90 }}>
        Productos del Ingreso N° {elIdIngreso}
      </Text>
      <Box pos="relative">
        <LoadingOverlay visible={loading} zIndex={39} overlayProps={{ radius: "lg", blur: 4 }} loaderProps={{ color: "violet", type: "dots", size: "xl" }}/>
        <Modal opened={openedID} onClose={closeID} title={formIngresoDetalle.getValues().id_ingreso_detalle ? "Actualizar Producto Ingreso: " + formIngresoDetalle.getValues().id_ingreso_detalle : "Registrar Producto Ingreso"} size="lg" zIndex={20} overlayProps={{ backgroundOpacity: 0.55, blur: 3 }} yOffset="10dvh">
          <form onSubmit={formIngresoDetalle.onSubmit((values) => crudIngresoDetalle(values))}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Select
              label="Producto:"
              data={productos.filter(f=> f.pedido_minimo >0).map((e) => {return{label:e.descripcion,value:e.id_producto.toString()}})}
              required
              limit={5}
              searchable
              leftSection={<IconBottle size={16} />}
              key={formIngresoDetalle.key('fid_producto')}
              {...formIngresoDetalle.getInputProps('fid_producto')}
            />
            <NumberInput
              label="Cantidad:"
              placeholder="Cantiad del mismo producto"
              allowDecimal={false}
              min={1}
              max={1000}
              required
              leftSection={<IconDatabase size={16} />}
              key={formIngresoDetalle.key("cantidad")}
              {...formIngresoDetalle.getInputProps("cantidad")}
            />
            <NumberInput
              label="Precio Compra:"
              placeholder="100.00"
              allowDecimal={true}
              decimalScale={2}
              min={1}
              max={10000}
              required
              leftSection={<IconCash size={16} />}
              key={formIngresoDetalle.key("precio_compra")}
              {...formIngresoDetalle.getInputProps("precio_compra")}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy />} type="submit">
                {!formIngresoDetalle.getValues().id_ingreso_detalle ? "Registrar " : "Actualizar "}Producto Ingreso
              </Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={tableIngresoDetalle} />
      </Box></>}

      <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} py={5} my={10} fw={900} variant="gradient" gradient={{ from: "gainsboro", to: "violet", deg: 90 }}>
        Gestión de Productos
      </Text>
      <Box pos="relative">
        <LoadingOverlay visible={loading} zIndex={39} overlayProps={{ radius: "lg", blur: 4 }} loaderProps={{ color: "violet", type: "dots", size: "xl" }}/>
        <Modal opened={opened} onClose={close} title={formProducto.getValues().id_producto? "Actualizar Producto: " + formProducto.getValues().id_producto: "Registrar Producto"} size="lg" zIndex={20} overlayProps={{ backgroundOpacity: 0.55, blur: 3 }} yOffset="10dvh">
          <form onSubmit={formProducto.onSubmit((values) => crudProducto(values))} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <TextInput
              label="Código:"
              placeholder="NC001-750"
              type="text"
              maxLength={20}
              leftSection={<IconFileBarcode size={16} />}
              key={formProducto.key("codigo")}
              required
              {...formProducto.getInputProps("codigo")}
            />
            <TextInput
              label="Nombre Producto:"
              placeholder="Cerveza Paceña 750ml"
              type="text"
              maxLength={100}
              leftSection={<IconTicket size={16} />}
              key={formProducto.key("descripcion")}
              required
              {...formProducto.getInputProps("descripcion")}
            />
            <NativeSelect
              label="Unidad de Presentación:"
              data={[
                "SELECCIONE...",
                ...parametricas
                  .filter((f) => f.grupo === "UNIDAD_PRESENTACION")
                  .map((e) => e.nombre),
              ]}
              required
              leftSection={<IconBottle size={16} />}
              key={formProducto.key("unidad")}
              {...formProducto.getInputProps("unidad")}
            />
            <TextInput
              label="Tamaño Presentación:"
              placeholder="750 ml"
              leftSection={<IconMaximize size={16} />}
              type="text"
              maxLength={100}
              required
              key={formProducto.key("capacidad")}
              {...formProducto.getInputProps("capacidad")}
            />
            <NumberInput
              label="Stock Mínimo:"
              placeholder="10"
              allowDecimal={false}
              max={1000}
              min={1}
              required
              leftSection={<IconDatabaseExclamation size={16} />}
              key={formProducto.key("pedido_minimo")}
              {...formProducto.getInputProps("pedido_minimo")}
            />
            <NativeSelect
              label="Grupo Producto:"
              data={[
                "SELECCIONE...",
                ...parametricas
                  .filter((f) => f.grupo === "GRUPO_PRODUCTO")
                  .map((e) => e.nombre),
              ]}
              required
              leftSection={<IconGlassGin size={16} />}
              key={formProducto.key("grupo")}
              {...formProducto.getInputProps("grupo")}
            />
            <NativeSelect
              label="Tipo Producto:"
              data={[
                "SELECCIONE...",
                ...parametricas
                  .filter((f) => f.grupo === "TIPO_PRODUCTO")
                  .map((e) => e.nombre),
              ]}
              required
              leftSection={<IconCategoryPlus size={16} />}
              key={formProducto.key("tipo_producto")}
              {...formProducto.getInputProps("tipo_producto")}
            />
            <Group justify="flex-end" mt="md">
              <Button
                fullWidth
                leftSection={<IconDeviceFloppy />}
                type="submit"
              >
                {!formProducto.getValues().id_producto
                  ? "Registrar"
                  : "Actualizar"}{" "}
                Producto
              </Button>
              {/* {form.getValues().id_producto && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Producto</Button>} */}
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={tableProducto} />
      </Box>
      <Box pos="relative">
        <LoadingOverlay visible={loading} zIndex={39} overlayProps={{ radius: "lg", blur: 4 }} loaderProps={{ color: "violet", type: "dots", size: "xl" }}/>
        <Modal opened={openedComponente} onClose={closeComponente} title={formComponente.getValues().id_componente ? "Actualizar Item: " + formComponente.getValues().id_componente : "Registrar Item"} size="lg" zIndex={20} overlayProps={{ backgroundOpacity: 0.55, blur: 3 }} yOffset="10dvh">
            <form onSubmit={formComponente.onSubmit((values) => crudComponente(values))}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <NativeSelect
                label="Producto:"
                data={["SELECCIONE...",...productos.map((e) => {return{label:e.descripcion,value:e.id_producto}}),]}
                required
                leftSection={<IconBottle size={16} />}
                key={formComponente.key("fid_producto")}
                {...formComponente.getInputProps("fid_producto")}
              />
              <NumberInput
                label="Cantidad:"
                placeholder="Cantidad en mililitros"
                leftSection={<IconDatabase size={16} />}
                min={1}
                max={2000}
                required
                key={formComponente.key("cantidad")}
                {...formComponente.getInputProps("cantidad")}
              />
              <NativeSelect
                label="Unidad Medida:"
                placeholder="ML por receta o UNIDAD por mezclador"
                data={["SELECCIONE...",...parametricas.filter(f=>f.grupo == 'UNIDAD_MEDIDA').map((e) => e.nombre),]}
                required
                leftSection={<IconDatabase size={16} />}
                key={formComponente.key("unidad")}
                {...formComponente.getInputProps("unidad")}
              />
              <Group justify="flex-end" mt="md">
                <Button fullWidth leftSection={<IconDeviceFloppy />} type="submit">
                  {!formComponente.getValues().id_componente ? "Registrar " : "Actualizar "}Item
                </Button>
              </Group>
            </form>
        </Modal>
      </Box>
    </div>
  );
};

export default Inventario;
