import { useState } from "react";
import FormularioTransferencia from "../components/FormularioTransferencia";
import { obtenerEntradas, transferirEntrada } from "../utils/entradas";
import "./PaginaTransferir.css";

const volver = <a className="transferir_volver" href="#/cuenta/entradas">Volver a mis entradas</a>;

function PaginaTransferir({ usuario, codigo }) {
  const [destinatario, setDestinatario] = useState(null);

  function transferir(datos) {
    try {
      if (!transferirEntrada(codigo, datos, usuario)) {
        return { error: "Esta entrada ya no se puede transferir." };
      }
      setDestinatario(datos);
      return {};
    } catch {
      return { error: "No se pudo transferir la entrada. Inténtalo nuevamente." };
    }
  }

  if (destinatario) {
    return (
      <section className="transferir">
        <h1>Entrada transferida</h1>
        <p role="status">La entrada ahora pertenece a {destinatario.nombre.trim()} ({destinatario.correo.trim()}).</p>
        {volver}
      </section>
    );
  }

  let entrada;
  try {
    entrada = obtenerEntradas(usuario).find((item) => item.codigo === codigo);
  } catch {
    return <p role="alert">No se pudo cargar la entrada. Inténtalo nuevamente.</p>;
  }
  if (!entrada || entrada.estado !== "proximas") {
    return (
      <section className="transferir">
        <h1>No encontramos esta entrada</h1>
        <p>Solo puedes transferir tus entradas próximas.</p>
        {volver}
      </section>
    );
  }

  return (
    <section className="transferir">
      <h1>Transferir entrada</h1>
      <div className="transferir_resumen">
        <h2>{entrada.nombre}</h2>
        <p>{entrada.recinto} · {entrada.fecha}</p>
        <p>{entrada.sector}</p>
        <p className="transferir_codigo">{entrada.codigo}</p>
      </div>
      <FormularioTransferencia usuario={usuario} onValidado={transferir} />
      <p className="transferir_nota">
        Se transfieren todas las entradas de esta compra y la acción no se puede deshacer.
      </p>
      {volver}
    </section>
  );
}

export default PaginaTransferir;
