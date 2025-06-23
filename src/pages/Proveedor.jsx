import { UserAuth } from '../context/AuthContext';

const Proveedor = () => {
  const { user } = UserAuth();
  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <h1>Proveedor</h1>
    </div>
  )
}

export default Proveedor