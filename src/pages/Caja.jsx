import { UserAuth } from "../context/AuthContext";


const Caja = () => {
  const { user } = UserAuth();

  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <h1>Caja</h1>
    </div>
  )
}

export default Caja