import DetalleEvento from './components/DetalleEvento';
import { detalleEvento } from './data/detalleEvento';
import { useState } from 'react';
import CatalogoEventos from './components/CatalogoEventos';
import { catalogo } from './data/catalogo';
import Cuenta from './components/Cuenta';
import { entradas } from './data/entradas';
import { perfil } from './data/perfil';
import ElegirEntradas from "./components/ElegirEntradas";
import { seleccion } from "./data/seleccion";

import FormularioLogin from "./components/FormularioLogin";
import FormularioRegistro from "./components/FormularioRegistro";
import Confirmacion from "./components/Confirmacion";
import { compra } from "./data/compra";
import FormularioPago from "./components/FormularioPago";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Evento from "./components/Evento";
import { eventos } from "./data/eventos";
import "./App.css";

function App() {
  const [categoria, setCategoria] = useState('musica');
  return (
    <>
      <Header categoria={categoria} onCategoria={setCategoria} />
      <main className="inicio-base">
        <section aria-labelledby="titulo-eventos">
          <h2 id="titulo-eventos">Próximos eventos</h2>
          <div className="eventos_contenedor">
            {" "}
            {/*lista del componente evento*/}
            {eventos.map((evento) => (
              <Evento key={evento.id} evento={evento} />
            ))}
          </div>
        </section>
        <CatalogoEventos key={categoria} categoria={categoria} eventos={catalogo} />
        <DetalleEvento evento={detalleEvento} />
        <ElegirEntradas evento={detalleEvento} seleccion={seleccion} />
        {/*seleccion cantidad de entradas*/}
        <FormularioPago />
        {/*paso 2*/}
        <Confirmacion compra={compra} />
        {/*paso 3*/}
        <FormularioRegistro />
        {/*registro*/}
        <FormularioLogin />
        <Cuenta usuario={perfil} entradas={entradas} />
        {/*login*/}
      </main>
      <Footer />
    </>
  );
}

export default App;
