import FormularioRegistro from "../components/FormularioRegistro";
import { peticionApi } from "../services/api";
import { navegar } from "../utils/navegacion";

function PaginaRegistro() {
  async function registrar(datos) {
    try {
      await peticionApi("/auth/registro", {
        method: "POST",
        body: {
          username: datos.username.trim().toLowerCase(),
          password: datos.password,
          usuario: {
            run: datos.rut.trim(),
            p_nombre: datos.nombre.trim(),
            s_nombre: datos.segundoNombre.trim() || undefined,
            a_paterno: datos.apellido.trim(),
            a_materno: datos.apellidoMaterno.trim() || undefined,
            email: datos.correo.trim().toLowerCase(),
          },
        },
      });
      navegar("/login?registro=ok");
      return {};
    } catch (error) {
      const campos = {
        username: "username", password: "password",
        "usuario.run": "rut", "usuario.p_nombre": "nombre",
        "usuario.a_paterno": "apellido", "usuario.email": "correo",
        "usuario.a_materno": "apellidoMaterno",
        "usuario.s_nombre": "segundoNombre",
      };
      const errores = {};
      for (const [campo, mensaje] of Object.entries(error.errors || {})) {
        if (campos[campo]) errores[campos[campo]] = mensaje;
      }
      return { error: error.message || "No se pudo crear la cuenta. Inténtalo nuevamente.", errores };
    }
  }
  return <FormularioRegistro onValidado={registrar} />;
}
export default PaginaRegistro;
