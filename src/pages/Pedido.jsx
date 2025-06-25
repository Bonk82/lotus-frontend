import { UserAuth } from "../context/AuthContext";

const Pedido = () => {
  const { user } = UserAuth();
  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <h1>Pedido</h1>
    </div>
  )
}

export default Pedido