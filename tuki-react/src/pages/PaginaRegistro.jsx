import FormularioRegistro from "../components/FormularioRegistro";
import { navegar } from "../utils/navegacion";

function PaginaRegistro() {
  return <FormularioRegistro onValidado={() => navegar("/login")} />;
}

export default PaginaRegistro;
