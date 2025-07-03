import { Text } from "@mantine/core";
import { UserAuth } from "../context/AuthContext";
import { DataApp } from "../context/DataContext";
import { useEffect } from "react";

const Pedido = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,productos } = DataApp();

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    await consumirAPI('/listarProductos', { opcion: 'PEDIDO',id:user.sucursal });
    await consumirAPI('/listarPedidos', { opcion: 'PEDIDOS',id:user.sucursal });
    //todo: 'PEDIDOS' seria select * from pedido where (control_caja where fid_sucucarsal = id and APERTURA) solo una caja puede estar disponible por sucursal por nocche
  }

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
        Pedidos
      </Text>
      <div className="grid-pedido">

      </div>
    </div>
  )
}

export default Pedido