import { UserAuth } from "../context/AuthContext";

const Control = () => {
  const { user } = UserAuth();
  return (
    <div>
      <p>{JSON.stringify(user)}</p>
      <h1>Control</h1>
    </div>
  )
}

export default Control