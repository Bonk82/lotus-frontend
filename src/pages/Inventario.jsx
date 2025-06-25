import { UserAuth } from "../context/AuthContext";

const Inventario = () => {
  const { user } = UserAuth();
  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <h1>Inventario</h1>
    </div>
  )
}

export default Inventario