import { UserAuth } from "../context/AuthContext";

const Parametrica = () => {
  const { user } = UserAuth();
  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <h1>Parametrica</h1>
    </div>
  )
}

export default Parametrica