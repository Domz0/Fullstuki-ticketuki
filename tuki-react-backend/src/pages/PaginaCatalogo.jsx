import CatalogoEventos from "../components/CatalogoEventos";
import { obtenerCatalogo } from "../utils/eventos";

function PaginaCatalogo({ categoria, busqueda }) {
  return (
    <CatalogoEventos
      eventos={obtenerCatalogo()}
      categoria={categoria}
      busquedaInicial={busqueda}
    />
  );
}

export default PaginaCatalogo;
