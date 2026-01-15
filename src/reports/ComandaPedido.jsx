/* eslint-disable react/prop-types */
import {Document,Page,Text,View,StyleSheet,} from '@react-pdf/renderer';

const PAGE_WIDTH = 226.77; // 80mm

const styles = StyleSheet.create({
  page: {
    width: PAGE_WIDTH,
    padding: 8,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bold: {
    fontWeight: 'bold',
  },
});


export const ComandaPedido = ({ pedido }) => (
  <Document>
    <Page
      size={{ width: PAGE_WIDTH }}
      style={styles.page}
      wrap
    >
      <View style={styles.section}>
        <Text style={styles.bold}>{pedido.sucursal}</Text>
        <Text>Usuario: {pedido.cuenta}</Text>
        <Text>Pedido: {pedido.pedido}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>DETALLE:</Text>
      </View>

      {pedido.detalle?.map((item, i) => (
        <View key={i} style={styles.row}>
          <Text>{item.producto}</Text>
          <Text>{item.precio_venta?.toFixed(2)}</Text>
        </View>
      ))}

      <View style={styles.section}>
        <Text>--------------------------</Text>
        <View style={styles.row}>
          <Text style={styles.bold}>TOTAL</Text>
          <Text style={styles.bold}>Bs. {pedido.total}</Text>
        </View>
      </View>

      <Text>{pedido.fecha}</Text>
    </Page>
  </Document>
);
