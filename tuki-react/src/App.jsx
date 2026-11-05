import Evento from './components/Evento'
import { eventos } from './data/eventos'
import './App.css'

function App() {
  return (
    <main className="inicio-base">
      <h1 className="texto_morado">Ticketuki</h1>
      <p className="texto_secundario">Encuentra tu próximo evento.</p>
      <section aria-labelledby="titulo-eventos">
        <h2 id="titulo-eventos">Próximos eventos</h2>
        <div className="eventos_grilla">
          {eventos.map((evento) => (
            <Evento key={evento.id} evento={evento} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
