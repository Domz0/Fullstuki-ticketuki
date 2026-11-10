import { leerCompras } from "../utils/entradas";

function HistorialCompras() {
  let compras;
  try {
    compras = leerCompras().slice().reverse();
  } catch {
    return <p role="alert">No se pudo cargar el historial. Inténtalo nuevamente.</p>;
  }
  return (
    <section>
      <h1>Historial de movimientos</h1>
      {compras.length === 0 ? <p>No hay compras registradas.</p> : (
        <div className="admin_tabla_contenedor">
          <table className="admin_tabla">
            <thead>
              <tr>
                <th scope="col">Orden</th>
                <th scope="col">Evento</th>
                <th scope="col">Fecha del evento</th>
                <th scope="col">Comprador</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => (
                <tr key={compra.orden}>
                  <td>{compra.orden}</td>
                  <td>{compra.evento}</td>
                  <td>{compra.fecha}</td>
                  <td>{compra.comprador.nombre} {compra.comprador.apellido}</td>
                  <td>{compra.cantidad}</td>
                  <td>{"$" + compra.total.toLocaleString("es-CL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default HistorialCompras;
