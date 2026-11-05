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
        <section aria-labelledby="titulo-eventos">
          <h2 id="titulo-eventos">Próximos eventos</h2>
          <div className="eventos_contenedor">
            {eventos.map((evento) => (
              <Evento key={evento.id} evento={evento} />
            ))}
          </div>
        </section>
        <FormularioPago />
      </main>
      <Footer />
    </>
  );
}

export default App;
