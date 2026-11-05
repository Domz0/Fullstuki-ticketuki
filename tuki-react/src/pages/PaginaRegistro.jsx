import FormularioRegistro from "../components/FormularioRegistro";
import { registrarUsuario } from "../utils/sesion";
import { navegar } from "../utils/navegacion";

function PaginaRegistro() {
  function registrar(datos) {
    try {
      registrarUsuario(datos);
      navegar("/login?registro=ok");
      return {};
    } catch {
      return { error: "No se pudo crear la cuenta. Inténtalo nuevamente." };
    }
  }
  return <FormularioRegistro onValidado={registrar} />;
}
export default PaginaRegistro;
