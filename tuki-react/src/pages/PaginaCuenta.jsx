import Cuenta from "../components/Cuenta";
import { obtenerEntradas } from "../utils/entradas";

function PaginaCuenta({ seccion, usuario, onCerrarSesion, onActualizarUsuario }) {
  let entradas;
  try {
    entradas = obtenerEntradas(usuario);
  } catch {
    return <p role="alert">No se pudieron cargar tus entradas. Inténtalo nuevamente.</p>;
  }
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
