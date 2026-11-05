import FormularioLogin from "../components/FormularioLogin";
import { navegar } from "../utils/navegacion";

function PaginaLogin() {
  return <FormularioLogin onValidado={() => navegar("/cuenta/datos")} />;
}

export default PaginaLogin;
