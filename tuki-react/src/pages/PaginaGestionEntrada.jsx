function PaginaGestionEntrada({ accion, codigo }) {
  return (
    <section>
      <h1>
        {accion === "transferir" ? "Transferir entrada" : "Revender entrada"}
      </h1>
      <p>{codigo}</p>
      <p>falta agregar</p>
      <a href="#/cuenta/entradas">Volver a mis entradas</a>
    </section>
  );
}

export default PaginaGestionEntrada;
