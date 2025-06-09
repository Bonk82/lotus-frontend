import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from "jwt-decode";
import { UserAuth } from '../context/AuthContext';


const GoogleLoginButton = () => {
  const { login } = UserAuth()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={credentialResponse => {
          const decoded = jwtDecode(credentialResponse.credential);
          login({
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture,
            token: credentialResponse.credential
          });
        }}
        onError={() => {
          console.log('Fallo en la autenticación con Google');
        }}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;