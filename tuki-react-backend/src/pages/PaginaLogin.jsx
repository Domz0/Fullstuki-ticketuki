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
  const avisoSesion = new URLSearchParams(window.location.hash.split("?")[1] || "").get("sesion");
  return <>{avisoSesion && <p role="status">{avisoSesion === "vencida" ? "Tu sesión venció. Inicia sesión nuevamente." : "La sesión cambió en otra pestaña. Inicia sesión para continuar."}</p>}
    <FormularioLogin onValidado={ingresar} registroExitoso={registroExitoso} contrasenaActualizada={contrasenaActualizada} /></>;
}
export default PaginaLogin;
