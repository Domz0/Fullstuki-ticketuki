import { leerCompras } from "../utils/entradas";

import { resumirCompras } from "../utils/resumenCompras";

function Dashboard() {
  let resumen;
  try { resumen = resumirCompras(leerCompras()); }
  catch { return <p role="alert">No se pudo cargar el resumen. Inténtalo nuevamente.</p>; }
  const pesos = (valor) => "$" + valor.toLocaleString("es-CL");
  return (
    <section>
      <h1>Dashboard</h1>
      <div className="admin_indicadores">
        <article className="admin_tarjeta"><h2>Compras realizadas</h2><strong>{resumen.cantidad}</strong><p>Órdenes confirmadas</p></article>
        <article className="admin_tarjeta"><h2>Total recaudado</h2><strong>{pesos(resumen.recaudado)}</strong><p>Incluye cargos y descuentos aplicados</p></article>
        <article className="admin_tarjeta"><h2>Cargos por servicio</h2><strong>{pesos(resumen.cargos)}</strong><p>Cargos de la aplicación antes de descuentos</p></article>
      </div>
    </section>
  );
}
export default Dashboard;
