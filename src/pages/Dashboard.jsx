import { Box, Button, Center, Chip, Flex, Grid, LoadingOverlay, Text } from "@mantine/core"
import { UserAuth } from '../context/AuthContext';
import { DataApp } from "../context/DataContext";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useState } from "react";
import { DatePickerInput } from "@mantine/dates";
import { BarChart,LineChart } from '@mantine/charts';
import { IconCalendar } from "@tabler/icons-react";

const Dashboard = () => {
  const { user } = UserAuth();
  const { loading, consumirAPI, productos, parametricas,ingresos,pedidos,sucursales} = DataApp();
  const colores = ['violet.6','blue.6','teal.6','indigo.6'];
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
      { month: 'Enero', Efectivo: 1200, QR: 900, Tarjeta: 200 },
      { month: 'Febrero', Efectivo: 1900, QR: 1200, Tarjeta: 400 },
      { month: 'Marzo', Efectivo: 400, QR: 1000, Tarjeta: 200 },
      { month: 'Abril', Efectivo: 1000, QR: 200, Tarjeta: 800 },
      { month: 'Mayo', Efectivo: 800, QR: 1400, Tarjeta: 1200 },
      { month: 'Junio', Efectivo: 750, QR: 600, Tarjeta: 1000 },
    ];
    setListaProductos(data)
    setListaPedidos(data)

    const data2 = [
      {
        date: 'Agosto 12',
        'Lotus Club Prado': 2890,
        'Lotus Bar': 2338,
        'The Jungle Club': 2452,
      },
      {
        date: 'Agosto 13',
        'Lotus Club Prado': 2756,
        'Lotus Bar': 2103,
        'The Jungle Club': 2402,
      },
      {
        date: 'Agosto 14',
        'Lotus Club Prado': 3322,
        'Lotus Bar': 986,
        'The Jungle Club': 1821,
      },
      {
        date: 'Agosto 15',
        'Lotus Club Prado': 3470,
        'Lotus Bar': 2108,
        'The Jungle Club': 2809,
      },
      {
        date: 'Agosto 16',
        'Lotus Club Prado': 3129,
        'Lotus Bar': 1726,
        'The Jungle Club': 2290,
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
      <Center>
        <Text size='clamp(1.2rem, 2vw, 2rem)' py={5} mb={10} fw={900} variant="gradient" gradient={{ from: "gainsboro", to: "violet", deg: 90 }}>
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
              leftSection={<IconCalendar size={18} stroke={1.5} />}
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
              leftSection={<IconCalendar size={18} stroke={1.5} />}
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
            dataKey="month"
            series={[
              { name: 'Efectivo', color: colores[0] },
              { name: 'QR', color: colores[1] },
              { name: 'Tarjeta', color: colores[2] },
            ]}
            tickLine="y"
          />}
          {listaPedidos.length>0 && <BarChart
            h={300}
            data={listaPedidos}
            dataKey="month"
            series={[
              { name: 'Efectivo', color: colores[0] },
              { name: 'QR', color: colores[1] },
              { name: 'Tarjeta', color: colores[2] },
            ]}
            tickLine="y"
          />}
        </Box>
        {pedidosDia.length>0 && <LineChart
          style={{marginTop:'1rem'}}
          h={400}
          data={pedidosDia}
          // dataKey="fecha_entrega"
          dataKey="date"
          // series={[{ name: 'cantidad_entregada', color: 'indigo.4' }]}
          series={[
            { name: 'Lotus Club Prado', color: colores[0] },
            { name: 'Lotus Bar', color: colores[1] },
            { name: 'The Jungle Club', color: colores[2] },
          ]}
          curveType="bump"
          connectNulls
          withLegend='true'
        />}
      </Box>
    </div>
  )
}

export default Dashboard