import { Button, TextInput } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { UserAuth } from '../context/AuthContext';


const Login = () => {
  const { login,logout } = UserAuth();
  const form = useForm({
    mode: 'controlled',
    initialValues: { user: '', pass: '' },
    validate: {
      user: hasLength({ min: 6 }, 'Debe tener al menos 6 caracteres'),
      pass: hasLength({ min: 6 }, 'Debe tener al menos 6 caracteres')
    },
  });

  const iniciarSesion = async (e) => {
    e.preventDefault();
    console.log('Iniciar sesión con:', form.values);
    try {
      const res = await login(form.values)
      console.log('Respuesta del login:', res);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // Aquí podrías manejar el error, por ejemplo, mostrar un mensaje al usuario
    }
  }
    
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={iniciarSesion}>
      <TextInput {...form.getInputProps('user')} label="Usuario" placeholder="Usuario" />
      <TextInput {...form.getInputProps('pass')} mt="md" label="Contraseña" placeholder="Contraseña" />
      <Button type="submit" mt="md">
        Ingresar
      </Button>
    </form>
    </div>
  )
}

export default Login