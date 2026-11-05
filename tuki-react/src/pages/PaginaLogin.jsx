import FormularioLogin from "../components/FormularioLogin";
import { iniciarSesion } from "../utils/sesion";
import { navegar } from "../utils/navegacion";

function PaginaLogin({ onIniciarSesion, registroExitoso = false }) {
  function ingresar(datos) {
    try {
      const usuario = iniciarSesion(datos);
      if (!usuario) return { error: "Correo o contraseña incorrectos." };
      onIniciarSesion(usuario);
      navegar(usuario.rol === "admin" ? "/admin/dashboard" : "/inicio");
      return {};
    } catch {
      return { error: "No se pudo iniciar sesión. Inténtalo nuevamente." };
    }
  }
  return <FormularioLogin onValidado={ingresar} registroExitoso={registroExitoso} />;
}
export default PaginaLogin;
