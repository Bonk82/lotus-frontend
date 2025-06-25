import { UserAuth } from "../context/AuthContext";

const Personal = () => {
  const { user } = UserAuth();
  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <h1>Personal</h1>
    </div>
  )
}

export default Personal