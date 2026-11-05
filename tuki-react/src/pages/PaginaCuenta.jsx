import Cuenta from "../components/Cuenta";
import { perfil } from "../data/perfil";
import { entradas } from "../data/entradas";

function PaginaCuenta({ seccion }) {
  return <Cuenta usuario={perfil} entradas={entradas} seccion={seccion} />;
}

export default PaginaCuenta;
