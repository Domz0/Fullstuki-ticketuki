import FormularioLogin from "../components/acceso/FormularioLogin";
import { iniciarSesion } from "../utils/sesion";
import { navegar } from "../utils/navegacion";

function PaginaLogin({ onIniciarSesion, registroExitoso = false, contrasenaActualizada = false }) {
  async function ingresar(datos) {
    try {
      const usuario = await iniciarSesion(datos);
      onIniciarSesion(usuario);

      if (usuario.rol === "admin") {
        navegar("/admin/dashboard");
      } else {
        navegar("/inicio");
      }

      return {};
    } catch (fallo) {
      // muestra el mensaje sin borrra los datos ingresados
      return {
        error: fallo.message || "No se pudo iniciar sesión. Inténtalo nuevamente.",
      };
    }
  }

  const parametros = window.location.hash.split("?")[1] || "";
  const avisoSesion = new URLSearchParams(parametros).get("sesion");
  let mensajeSesion = "";

  if (avisoSesion === "vencida") {
    mensajeSesion = "Tu sesión venció. Inicia sesión nuevamente.";
  } else if (avisoSesion) {
    mensajeSesion = "La sesión cambió en otra pestaña. Inicia sesión para continuar.";
  }

  return (
    <>
      {mensajeSesion && <p role="status">{mensajeSesion}</p>}
      <FormularioLogin
        onValidado={ingresar}
        registroExitoso={registroExitoso}
        contrasenaActualizada={contrasenaActualizada}
      />
    </>
  );
}

export default PaginaLogin;
