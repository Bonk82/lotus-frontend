import { Button } from "@mantine/core"
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = UserAuth();
  const navigate = useNavigate();
  return (
    <div>
      <h1>Dashboard</h1>
      <Button variant="filled" radius="md" onClick={() => navigate('/pedido')}>Button</Button>
    </div>
  )
}

export default Dashboard