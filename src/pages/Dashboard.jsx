import { Box, Button, Center, Chip, Flex, Grid, LoadingOverlay, NumberFormatter, Text } from "@mantine/core"
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
  const { loading, consumirAPI, parametricas} = DataApp();
  const colores = ['violet.5','blue.5','teal.5','indigo.5','cyan.5','grape.5','pink.5','red.5','orange.5','yellow.5','lime.5','green.5'];
  const [f1, setF1] = useState(dayjs().startOf('month'))
  const [f2, setF2] = useState(dayjs().endOf('month'))

  const [listaProductos, setListaProductos] = useState([])
  const [listaPedidos, setListaPedidos] = useState([])
  const [pedidosDia, setPedidosDia] = useState([])
  const [prodVendidos, setProdVendidos] = useState([])


  const [chart1, setChart1] = useState([])
  const [chart2, setChart2] = useState([])
  const [chart3, setChart3] = useState([])
  const [chart4, setChart4] = useState([])
  const [cards, setCards] = useState([])

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () => {
    if (parametricas.length === 0) consumirAPI("/listarClasificador", { opcion: "T" });
    const data1 = await consumirAPI("/listarDashboard", { opcion: "VXSXG",f1:dayjs(f1).format('YYYY-MM-DD'),f2:dayjs(f2).format('YYYY-MM-DD') });
    const data2 = await consumirAPI("/listarDashboard", { opcion: "PXSXH",f1:dayjs(f1).format('YYYY-MM-DD'),f2:dayjs(f2).format('YYYY-MM-DD') });
    const data3 = await consumirAPI("/listarDashboard", { opcion: "VXSXD",f1:dayjs(f1).format('YYYY-MM-DD'),f2:dayjs(f2).format('YYYY-MM-DD') });
    const data4 = await consumirAPI("/listarDashboard", { opcion: "PMV",f1:dayjs(f1).format('YYYY-MM-DD'),f2:dayjs(f2).format('YYYY-MM-DD') });
    const data5 = await consumirAPI("/listarDashboard", { opcion: "CARDS",f1:dayjs(f1).format('YYYY-MM-DD'),f2:dayjs(f2).format('YYYY-MM-DD') });
    setChart1(data1);
    setChart2(data2);
    setChart3(data3);
    setChart4([data4[0].productos]);
    setCards(data5);
    armarData();
  };

  const armarData= async (ped,prod,tran)=>{
    console.log('armar data',chart1,chart2,chart3,chart4,cards);
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

    const data3 = [
      { month: 'January', Smartphones: 1200, Laptops: 900, Tablets: 200 },
    ];
    setProdVendidos(data3);
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
          <Grid.Col span={{ base: 12, lg: 3 }}><Button color='blue.2' variant='light' fullWidth onClick={()=>cargarData()} size='sm'>Cargar Datos</Button></Grid.Col>
          <Grid.Col span={{ base: 12, lg: 3 }}><Button color='green.5' variant='light' fullWidth onClick={()=>obtenerReporte('DOS',parametricas)} size='sm'> Histórico Pedidos</Button></Grid.Col>
        </Grid>
        <Box className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Compras</div>
              <div className="metric-icon">
                  <i className="fas fa-cart-flatbed"></i>
              </div>
            </div>
            <div className="metric-value"><NumberFormatter prefix="Bs. " value={cards[0]?.compras} thousandSeparator /></div>
            <div className="metric-description">
              <i className="fas fa-info-circle"></i>
              <span>Detalle de compras</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Pedidos</div>
              <div className="metric-icon">
                  <i className="fas fa-cart-plus"></i>
              </div>
            </div>
            <div className="metric-value"><NumberFormatter prefix="Bs. " value={cards[0]?.pedidos} thousandSeparator /></div>
            <div className="metric-description">
              <i className="fas fa-info-circle"></i>
              <span>Detalle de pedidos</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Ventas</div>
              <div className="metric-icon">
                  <i className="fas fa-sack-dollar"></i>
              </div>
            </div>
            <div className="metric-value"><NumberFormatter prefix="Bs. " value={cards[0]?.ventas} thousandSeparator /></div>
            <div className="metric-description">
              <i className="fas fa-info-circle"></i>
              <span>Detalle de ventas</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-title">Ingreso Neto</div>
              <div className="metric-icon">
                  <i className="fas fa-money-bill-trend-up"></i>
              </div>
            </div>
            <div className="metric-value"><NumberFormatter prefix="Bs. " value={cards[0]?.neto} thousandSeparator /></div>
            <div className="metric-description">
              <i className="fas fa-info-circle"></i>
              <span>Balance</span>
            </div>
          </div>
        </Box>
        <Box className="grid-dashboard">
          <Box>
            <Text size='lg' weight={500} mb={5}>Ventas por sucursal</Text>
            {chart1.length>0 && <BarChart
              h={300}
              data={chart1}
              dataKey="nombre"
              withLegend
              title="Productos más vendidos"
              series={[
                { name: 'cigarrillos', color: colores[0] },
                { name: 'cervezas', color: colores[1] },
                { name: 'ginebras', color: colores[2] },
                { name: 'jarras', color: colores[3] },
                { name: 'licores', color: colores[4] },
                { name: 'refrescos', color: colores[5] },
                { name: 'rones', color: colores[6] },
                { name: 'shots', color: colores[7] },
                { name: 'singanis', color: colores[8] },
                { name: 'tequilas', color: colores[9] },
                { name: 'trica', color: colores[0] },
                { name: 'vodkas', color: colores[1] },
                { name: 'whiskies', color: colores[2] },
              ]}
              tickLine="y"
              type="stacked"
            />}
          </Box>
          <Box>
            <Text size='lg' weight={500} mb={5}>Pedidos por Horarios</Text>
            {chart2.length>0 && <BarChart
              h={300}
              data={chart2}
              dataKey="nombre"
              title="Pedidos por Horarios"
              series={[
                { name: '17:00 a 20:00', color: colores[0] },
                { name: '20:01 a 22:00', color: colores[1] },
                { name: '22:01 a 00:00', color: colores[2] },
                { name: '00:01 a 02:00', color: colores[3] },
                { name: '02:01 a 04:00', color: colores[4] },
                { name: '04:01 a 09:00', color: colores[5] },
              ]}
              withLegend
              tickLine="y"
              type="stacked"
            />}
          </Box>
        </Box>
        <Text size='lg' weight={500} mt={40} mb={5}>Flujo de ventas</Text>
        {chart3.length>0 && <LineChart
          style={{marginTop:'1rem'}}
          h={400}
          data={chart3}
          // dataKey="fecha_entrega"
          dataKey="dia"
          // series={[{ name: 'cantidad_entregada', color: 'indigo.4' }]}
          series={[
            { name: Object.keys(chart3[0]).filter(key => key !== 'dia')[0], color: colores[0] },
            { name: Object.keys(chart3[0]).filter(key => key !== 'dia')[1], color: colores[1] },
            { name: Object.keys(chart3[0]).filter(key => key !== 'dia')[2], color: colores[2] },
            { name: Object.keys(chart3[0]).filter(key => key !== 'dia')[3], color: colores[3] },
            { name: Object.keys(chart3[0]).filter(key => key !== 'dia')[4], color: colores[4] },
            { name: Object.keys(chart3[0]).filter(key => key !== 'dia')[5], color: colores[5] },
            { name: Object.keys(chart3[0]).filter(key => key !== 'dia')[6], color: colores[6] },
          ]}
          curveType="bump"
          yAxisProps={{ tickMargin: -35,domain: [500, 10000] }}
          withLegend='true'
          connectNulls
          xAxisLabel="Fecha"
          yAxisLabel="Monto (Bs.)"
        />}
      </Box>
      <Box className="grid-dashboard" mt={40}>
        <Box>
          <Text size='lg' weight={500} mt={40} mb={5}>Productos más vendidos</Text>
          {Object.keys(chart4[0] || {}).length > 1 && <BarChart
            h={300}
            data={chart4}
            dataKey="sucursal"
            orientation="vertical"
            withBarValueLabel
            valueLabelProps={{ position: 'inside', fill: 'white',fontSize:'16px' }}
            series={[
              { name: Object.keys(chart4[0]).filter(key => key !== 'sucursal')[0], color: colores[0] },
              { name: Object.keys(chart4[0]).filter(key => key !== 'sucursal')[1], color: colores[1] },
              { name: Object.keys(chart4[0]).filter(key => key !== 'sucursal')[2], color: colores[2] },
              { name: Object.keys(chart4[0]).filter(key => key !== 'sucursal')[3], color: colores[3] },
              { name: Object.keys(chart4[0]).filter(key => key !== 'sucursal')[4], color: colores[4] },
              { name: Object.keys(chart4[0]).filter(key => key !== 'sucursal')[5], color: colores[5] },
            ]}
            withLegend
            withYAxis={false}
          />}
        </Box>
      </Box>
    </div>
  )
}

export default Dashboard