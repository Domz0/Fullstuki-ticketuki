import FormularioRegistro from "../components/acceso/FormularioRegistro";
import { peticionApi } from "../services/api";
import { navegar } from "../utils/navegacion";

// trduce entre el fomrulario y el backend
function traducirErrores(erroresBackend) {
  const nombresCampos = {
    username: "username",
    password: "password",
    "usuario.run": "rut",
    "usuario.p_nombre": "nombre",
    "usuario.s_nombre": "segundoNombre",
    "usuario.a_paterno": "apellido",
    "usuario.a_materno": "apellidoMaterno",
    "usuario.email": "correo",
  };
  const erroresFormulario = {};

  for (const [campo, mensaje] of Object.entries(erroresBackend || {})) {
    const nombreFormulario = nombresCampos[campo];
    if (nombreFormulario) {
      erroresFormulario[nombreFormulario] = mensaje;
    }
  }

  return erroresFormulario;
}

function PaginaRegistro() {
  async function registrar(datos) {
    // los campos opcionales vacios se omiten al enviar el JSON
    const cuentaNueva = {
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
    };

    try {
      await peticionApi("/auth/registro", {
        method: "POST",
        body: cuentaNueva,
      });

      // crear cuenta pasa al login, no inicia automaticamente
      navegar("/login?registro=ok");
      return {};
    } catch (fallo) {
      return {
        error: fallo.message || "No se pudo crear la cuenta. Inténtalo nuevamente.",
        errores: traducirErrores(fallo.errors),
      };
    }
  }

  return <FormularioRegistro onValidado={registrar} />;
}

export default PaginaRegistro;
