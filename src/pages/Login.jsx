import { Button, PasswordInput, TextInput } from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { UserAuth } from '../context/AuthContext';
import { DataApp } from '../context/DataContext';
import { IconPassword, IconUser } from '@tabler/icons-react';


const Login = () => {
  const { login } = UserAuth();
  const { toast } = DataApp();
  const form = useForm({
    mode: 'controlled',
    initialValues: { user: '', pass: ''},
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
      console.log('Error al iniciar sesión:', error.message);
      toast('Control de Acceso', error.message, 'error');
      // Aquí podrías manejar el error, por ejemplo, mostrar un mensaje al usuario
    }
  }
    
  return (
    <div className='main-login'>
      <h1>Login Lotus Club</h1>
      <form onSubmit={iniciarSesion}>
        <TextInput leftSection={<IconUser size={16} />} autoFocus required {...form.getInputProps('user')} label="Usuario" placeholder="Usuario" />
        {/* <TextInput leftSection={<IconPassword size={16} />} required type="password" {...form.getInputProps('pass')} mt="md" label="Contraseña" placeholder="Contraseña" /> */}
        <PasswordInput
          leftSection={<IconPassword size={16} />}
          required
          label="Contraseña"
          mt="md"
          placeholder="Contraseña"
          {...form.getInputProps('pass')}
        />
        <Button type="submit" mt="md">
          Ingresar
        </Button>
      </form>
    </div>
  )
}

export default Login