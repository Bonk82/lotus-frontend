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
    setChart4(data4);
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
            <div className="metric-value">Bs. {cards[0].compras}</div>
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
            <div className="metric-value">{cards[0].pedidos}</div>
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
            <div className="metric-value">Bs. {cards[0].ventas}</div>
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
            <div className="metric-value">Bs. {cards[0].neto}</div>
            <div className="metric-description">
              <i className="fas fa-info-circle"></i>
              <span>Balance</span>
            </div>
          </div>
        </Box>
        <Box className="grid-dashboard">
          <Box>
            <Text size='lg' weight={500} mb={5}>Ventas por sucursal</Text>
            {listaProductos.length>0 && <BarChart
              h={300}
              data={listaProductos}
              dataKey="sucursal"
              withLegend
              title="Productos más vendidos"
              series={[
                { name: 'Efectivo', color: colores[0] },
                { name: 'QR', color: colores[1] },
              ]}
              tickLine="y"
            />}
          </Box>
          <Box>
            <Text size='lg' weight={500} mb={5}>Pedidos por mes</Text>
            {listaPedidos.length>0 && <BarChart
              h={300}
              data={listaPedidos}
              dataKey="month"
              title="Pedidos por mes"
              series={[
                { name: 'Efectivo', color: colores[0] },
                { name: 'QR', color: colores[1] },
                { name: 'Tarjeta', color: colores[2] },
              ]}
              withLegend
              tickLine="y"
            />}
          </Box>
        </Box>
        <Text size='lg' weight={500} mt={40} mb={5}>Flujo de ventas</Text>
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
      <Box className="grid-dashboard" mt={40}>
        <Box>
          <Text size='lg' weight={500} mt={40} mb={5}>Productos más vendidos</Text>
          <BarChart
            h={300}
            data={prodVendidos}
            dataKey="month"
            orientation="vertical"
            withBarValueLabel
            valueLabelProps={{ position: 'inside', fill: 'white',fontSize:'16px' }}
            series={[{ name: 'Smartphones', color: colores[0] }, { name: 'Laptops', color: colores[1] }, { name: 'Tablets', color: colores[2] }]}
            withLegend
            withYAxis={false}
          />
        </Box>
      </Box>
    </div>
  )
}

export default Dashboard