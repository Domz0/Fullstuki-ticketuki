import Cuenta from './components/Cuenta';
import { entradas } from './data/entradas';
import { perfil } from './data/perfil';
import SeleccionEntradas from "./components/SeleccionEntradas";
import { seleccion } from "./data/seleccion";
import PasosCompra from "./components/PasosCompra";
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
  return (
    <>
      <Header />
      <main className="inicio-base">
        <PasosCompra etapa="entradas" />{" "}
        {/*esta es la barra al intentar comprar, hya que moverla*/}
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
        <SeleccionEntradas seleccion={seleccion} />
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
