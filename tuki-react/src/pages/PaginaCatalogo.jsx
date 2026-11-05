import CatalogoEventos from "../components/CatalogoEventos";
import { catalogo } from "../data/catalogo";

function PaginaCatalogo({ categoria, busqueda }) {
  return (
    <CatalogoEventos
      eventos={catalogo}
      categoria={categoria}
      busquedaInicial={busqueda}
    />
  );
}

export default PaginaCatalogo;
