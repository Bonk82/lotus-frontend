import { ActionIcon, Box, Button, Group, Kbd, LoadingOverlay, Modal, NativeSelect, NumberInput, Table, Text, TextInput, Tooltip,} from "@mantine/core";
import { UserAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { DataApp } from "../context/DataContext";
import { useForm } from "@mantine/form";
import { useMemo } from "react";
import { modals } from "@mantine/modals";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconBottle, IconBuilding, IconCategoryPlus, IconDatabase, IconDeviceFloppy, IconEdit, IconFileBarcode, IconGlassGin, IconNumber10, IconSquarePlus, IconTicket, IconTrash,} from "@tabler/icons-react";
import { MRT_Localization_ES } from "mantine-react-table/locales/es/index.esm.mjs";

const Inventario = () => {
  const { user } = UserAuth();
  const { loading, consumirAPI, productos, parametricas,ingresos,proveedores,sucursales } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);

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
    if (["T", "ID"].includes(opcion))
      await consumirAPI("/listarIngresoDetalles", { opcion: "T" });
  };

  const formProducto = useForm({
    mode: "uncontrolled",
    initialValues: {
      id_producto: 0,
      codigo: "",
      descripcion: "",
      unidad: "",
      capacidad: "",
      pedido_minimo: 10,
      tipo_pruducto: "",
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
      { accessorKey: "unidad", header: "Unidad Presentación" },
      { accessorKey: "capacidad", header: "Capacidad" },
      { accessorKey: "pedido_minimo", header: "Pedido Mínimo" },
      { accessorKey: "tipo_pruducto", header: "Tipo Producto" },
      { accessorKey: "grupo", header: "Grupo" },
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
        <ActionIcon
          variant="subtle"
          onClick={() => mostrarProducto(row.original)}
        >
          <IconEdit color="orange" />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          onClick={() => confirmarProducto(row.original)}
        >
          <IconTrash color="crimson" />
        </ActionIcon>
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
          >
            Nuevo Producto
          </Button>
          <ActionIcon
            variant="gradient"
            size="xl"
            gradient={{ from: "violet", to: "#2c0d57", deg: 90 }}
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
      <Box style={{ width: "clamp(350px,40%,600px)" }} p="md">
        <Kbd color="orange">Composición del Producto</Kbd>
        {row.original?.componentes && componenetes(row.original?.componentes)}
      </Box>
    ),
  });
//id_ingreso,fid_proveedor,fid_sucursal,motivo,fecha_ingreso
  const formIngreso = useForm({
    mode: "uncontrolled",
    initialValues: {
      id_ingreso: 0,
      fid_proveedor: 0,
      fid_sucursal: 0,
      motivo: "",
      fecha_ingreso: "",
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
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
    close();
    formProducto.reset();
    await cargarData("I");
  };

  const columnsIngreso = useMemo(
    () => [
      { accessorKey: "fid_proveedor", header: "fid_proveedor" },
      { accessorKey: "fid_sucursal", header: "fid_sucursal" },
      { accessorKey: "motivo", header: "motivo" },
      { accessorKey: "fecha_ingreso", header: "fecha_ingreso" },
    ],
    []
  );

  const mostrarIngreso = (data) => {
    console.log("Mostrar registro:", data);
    open();
    formIngreso.reset();
    if (data) formIngreso.setValues(data);
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

  const tableIngreso = useMantineReactTable({
    columns: columnsIngreso,
    data: ingresos,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: { density: "xs", columnPinning: {left: ["mrt-row-expand"],},},
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{ gap: "0.8rem", display: "flex" }}>
        <ActionIcon variant="subtle" onClick={() => mostrarIngreso(row.original)}>
          <IconEdit color="orange" />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => confirmarIngreso(row.original)}>
          <IconTrash color="crimson" />
        </ActionIcon>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nuevo Producto" position="bottom" withArrow>
        <Box>
          <Button onClick={() => mostrarIngreso()} style={{ marginBottom: "1rem" }} size="sm" visibleFrom="md">Nuevo Ingreso</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: "violet", to: "#2c0d57", deg: 90 }} hiddenFrom="md"
          onClick={() => mostrarIngreso()}>
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableProps: { striped: true },
    localization: MRT_Localization_ES,
    renderDetailPanel: ({ row }) => (
      <Box style={{ width: "clamp(350px,40%,600px)" }} p="md">
        <Kbd color="orange">Productos Ingresados</Kbd>
        TODO: definir como se muestre el detalle de ingreso
        {row.original?.componentes && componenetes(row.original?.componentes)}
      </Box>
    ),
  });

  const componenetes = (c) => {
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
        <Table.Caption style={{ backgroundColor: "transparent" }}>
          Composición del Producto
        </Table.Caption>
        <Table.Thead>{ths}</Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    );
  };

  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <Text size="2rem" mb={"lg"} fw={900} variant="gradient" gradient={{ from: "gainsboro", to: "violet", deg: 90 }}>
        Gestión de Ingresos
      </Text>
      <Box pos="relative">
        <LoadingOverlay visible={loading} zIndex={39} overlayProps={{ radius: "lg", blur: 4 }} loaderProps={{ color: "violet", type: "dots", size: "xl" }}/>
        <Modal opened={opened} onClose={close} title={formIngreso.getValues().id_ingreso ? "Actualizar Ingreso: " + formIngreso.getValues().id_ingreso : "Registrar Ingreso"} size="lg" zIndex={20} overlayProps={{ backgroundOpacity: 0.55, blur: 3 }} yOffset="10dvh">
          <form onSubmit={formIngreso.onSubmit((values) => crudIngreso(values))}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <NativeSelect
              label="Proveedor:"
              data={["SELECCIONE...",...proveedores.map((e) => e.nombre),]}
              required
              leftSection={<IconBottle size={16} />}
              key={formIngreso.key("fid_proveedor")}
              {...formIngreso.getInputProps("fid_proveedor")}
            />
            <NativeSelect
              label="Sucursal:"
              data={["SELECCIONE...",...sucursales.map((e) => e.nombre),]}
              required
              leftSection={<IconBuilding size={16} />}
              key={formIngreso.key("fid_sucursal")}
              {...formIngreso.getInputProps("fid_sucursal")}
            />
            <TextInput
              label="Motivo del Ingreso:"
              placeholder="Compra de Productos"
              leftSection={<IconDatabase size={16} />}
              type="text"
              maxLength={100}
              required
              key={formIngreso.key("motivo")}
              {...formIngreso.getInputProps("motivo")}
            />
            <TextInput
              label="Fecha Ingreso:"
              placeholder="Fecha de la compra"
              leftSection={<IconDatabase size={16} />}
              type="date"
              maxLength={10}
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

      <Text
        size="2rem"
        mb={"lg"}
        fw={900}
        variant="gradient"
        gradient={{ from: "gainsboro", to: "violet", deg: 90 }}
      >
        Gestión de Productos
      </Text>
      <Box pos="relative">
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: "lg", blur: 4 }}
          loaderProps={{ color: "violet", type: "dots", size: "xl" }}
        />
        <Modal
          opened={opened}
          onClose={close}
          title={
            formProducto.getValues().id_producto
              ? "Actualizar Producto: " + formProducto.getValues().id_producto
              : "Registrar Producto"
          }
          size="lg"
          zIndex={20}
          overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
          yOffset="10dvh"
        >
          <form
            onSubmit={formProducto.onSubmit((values) => crudProducto(values))}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
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
              label="Tipo de Presentación:"
              data={[
                "SELECCIONE...",
                ...parametricas
                  .filter((f) => f.grupo === "UNIDAD_MEDIDA")
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
              leftSection={<IconDatabase size={16} />}
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
              leftSection={<IconNumber10 size={16} />}
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
    </div>
  );
};

export default Inventario;
