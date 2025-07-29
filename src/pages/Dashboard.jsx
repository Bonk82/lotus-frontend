import { Box, Button, Center, Chip, Flex, Grid, LoadingOverlay, Text } from "@mantine/core"
import { UserAuth } from '../context/AuthContext';
import { DataApp } from "../context/DataContext";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useState } from "react";
import { DatePickerInput } from "@mantine/dates";
import { BarChart,LineChart } from '@mantine/charts';

const Dashboard = () => {
  const { user } = UserAuth();
  const { loading, consumirAPI, productos, parametricas,ingresos,pedidos,sucursales} = DataApp();
  const colores = ['violet.6','green.6','red.6'];
  const [f1, setF1] = useState(dayjs().startOf('month'))
  const [f2, setF2] = useState(dayjs().endOf('month'))

  const [listaProductos, setListaProductos] = useState([])
  const [listaPedidos, setListaPedidos] = useState([])
  const [pedidosDia, setPedidosDia] = useState([])

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async (opcion) => {
    if (parametricas.length === 0) consumirAPI("/listarClasificador", { opcion: "T" });
    if (["T", "PR"].includes(opcion)) await consumirAPI("/listarProductos", { opcion: "T" });
    if (["T", "I"].includes(opcion)) await consumirAPI("/listarIngresos", { opcion: "T" });
    if (["T", "P"].includes(opcion)) await consumirAPI("/listarPedidos", { opcion: "T" });
    if (["T", "S"].includes(opcion))  await consumirAPI("/listarSucursales", { opcion: "T" });
    armarData();
  };

  const armarData= async (ped,prod,tran)=>{
    console.log('armar data',productos,ingresos,pedidos,sucursales);
    const data = [
      { month: 'January', Smartphones: 1200, Laptops: 900, Tablets: 200 },
      { month: 'February', Smartphones: 1900, Laptops: 1200, Tablets: 400 },
      { month: 'March', Smartphones: 400, Laptops: 1000, Tablets: 200 },
      { month: 'April', Smartphones: 1000, Laptops: 200, Tablets: 800 },
      { month: 'May', Smartphones: 800, Laptops: 1400, Tablets: 1200 },
      { month: 'June', Smartphones: 750, Laptops: 600, Tablets: 1000 },
    ];
    setListaProductos(data)
    setListaPedidos(data)

    const data2 = [
      {
        date: 'Mar 22',
        Apples: 2890,
        Oranges: 2338,
        Tomatoes: 2452,
      },
      {
        date: 'Mar 23',
        Apples: 2756,
        Oranges: 2103,
        Tomatoes: 2402,
      },
      {
        date: 'Mar 24',
        Apples: 3322,
        Oranges: 986,
        Tomatoes: 1821,
      },
      {
        date: 'Mar 25',
        Apples: 3470,
        Oranges: 2108,
        Tomatoes: 2809,
      },
      {
        date: 'Mar 26',
        Apples: 3129,
        Oranges: 1726,
        Tomatoes: 2290,
      },
    ];
    setPedidosDia(data2)
  }

  const obtenerReporte = async (tipo,data) =>{
    console.log('obteneinedo report',tipo,data);
    // setLoading(true)
    try {
      const templateData = {
        filename: 'report-template.docx', // Cambia el nombre de la plantilla según tu caso
      };
      await data.map(e => {
        e.f1 = f1;
        e.f2 = f2;
        return e;
      });
      const response2 = await consumirAPI('/api/reports', { templateData, data }, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response2.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'report.docx'); // Ajusta el nombre del archivo según tu caso
      document.body.appendChild(link);
      link.click();
      // setMessage(response.data.message);
      console.log('la respuesta API',response2);
    } catch (error) {
      // setError('Error fetching data');
      console.error('Error fetching data:', error);
    } finally {
      // setLoading(false);
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <Center>
        <Text size="2rem" py={5} my={10} fw={900} variant="gradient" gradient={{ from: "gainsboro", to: "violet", deg: 90 }}>
          Datos del {dayjs(f1).format('DD MMM YYYY')} al {dayjs(f2).format('DD MMM YYYY')}
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Flex gap='xs' direction='row' wrap='wrap' mt={8}>
          {parametricas.filter(f=>f.tipo == 'OBJETIVOS').map(p=>(
              <Chip key={p.id_parametrica} checked color="cyan">{p.nombre}: {p.agrupador}</Chip>
            ))}
        </Flex>
        <Grid my={12} display='flex' align='end'>
          <Grid.Col span={{ base: 12, lg: 2 }}>
            <DatePickerInput
              value={f1}
              onChange={setF1}
              label="Fecha Inicio"
              placeholder="Fecha Inicio"
              size='sm'
              valueFormat='DD MMM YYYY'
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 2 }}>
            <DatePickerInput
              value={f2}
              onChange={setF2}
              label="Fecha Fin"
              placeholder="Fecha Fin"
              size='sm'
              valueFormat='DD MMM YYYY'
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 3 }}><Button color='blue.2' variant='light' fullWidth onClick={()=>cargarData()} size='sm'>Cargar Transacciones</Button></Grid.Col>
          <Grid.Col span={{ base: 12, lg: 3 }}><Button color='green.5' variant='light' fullWidth onClick={()=>obtenerReporte('DOS',pedidos)} size='sm'> Histórico Pedidos</Button></Grid.Col>
        </Grid>
        <Box style={{display:'flex', gap:'1rem',gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))'}}>
          {listaProductos.length>0 && <BarChart
            h={300}
            data={listaProductos}
            dataKey="descripcion"
            series={[{name:'existencia',color:'teal.6'}]}
            tickLine="y"
          />}
          {listaPedidos.length>0 && <BarChart
            h={300}
            data={listaPedidos}
            dataKey="cliente"
            series={[{name:'monto_pago',color:'orange.4'}]}
            tickLine="y"
          />}
        </Box>
        {pedidosDia.length>0 && <LineChart
          style={{marginTop:'1rem'}}
          h={400}
          data={pedidosDia}
          dataKey="fecha_entrega"
          series={[{ name: 'cantidad_entregada', color: 'indigo.4' }]}
          curveType="bump"
          connectNulls
        />}
      </Box>
    </div>
  )
}

export default Dashboard