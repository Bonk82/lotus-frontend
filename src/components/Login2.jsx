import GoogleLoginButton from "./GoogleLoginButton"
import '../login.css'

const Login2 = () => {

  const toggleForm = (e) => {
    e.preventDefault();
    const container = document.querySelector('.login-container');
    container.classList.toggle('switch');
  }



  return (
    <div className="login-container">
      <div className="container-form">
        <form className="sign-in" action="">
          <h2>Iniciar Sesión</h2>
          <button className="button" onClick={toggleForm}>Iniciar Sesión</button>
        </form>
      </div>
      <div  className="container-form">
        <form className="sign-up" action="">
          <h2>Registrarse</h2>
          <button className="button" onClick={toggleForm}>Registrarse</button>
        </form>
      </div>
      <div className="container-welcome">
        <div className="welcome-sign-up welcome">
          <h2>Bienvenido</h2>
          <p>Regístrate para disfrutar de todas las funcionalidades.</p>
          <button id="btn-sign-up">Regdistrarse</button>
        </div>
        <div className="welcome-sign-in welcome">
          <h2>Ya tienes cuenta?</h2>
          <p>Inicia sesión para continuar.</p>
          <button id="btn-sign-in">Iniciar Sesión</button>
        </div>
      </div>
      <GoogleLoginButton/>
    </div>
  )
}

export default Login2