import Cuenta from "../components/Cuenta";
import { entradas } from "../data/entradas";

function PaginaCuenta({ seccion, usuario, onCerrarSesion, onActualizarUsuario }) {
  return (
    <Cuenta
      usuario={usuario}
      entradas={entradas}
      seccion={seccion}
      onCerrarSesion={onCerrarSesion}
      onActualizarUsuario={onActualizarUsuario}
    />
  );
}
export default PaginaCuenta;
