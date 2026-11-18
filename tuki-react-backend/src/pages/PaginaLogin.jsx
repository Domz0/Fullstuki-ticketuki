import FormularioLogin from "../components/FormularioLogin";
import { iniciarSesion } from "../utils/sesion";
import { navegar } from "../utils/navegacion";

function PaginaLogin({ onIniciarSesion, registroExitoso = false, contrasenaActualizada = false }) {
  async function ingresar(datos) {
    try {
      const usuario = await iniciarSesion(datos);
      onIniciarSesion(usuario);
      navegar(usuario.rol === "admin" ? "/admin/dashboard" : "/inicio");
      return {};
    } catch (error) {
      return { error: error.message || "No se pudo iniciar sesión. Inténtalo nuevamente." };
    }
  }
  return <FormularioLogin onValidado={ingresar} registroExitoso={registroExitoso} contrasenaActualizada={contrasenaActualizada} />;
}
export default PaginaLogin;
