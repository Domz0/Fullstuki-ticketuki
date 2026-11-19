import Cuenta from "../components/Cuenta";
import { useEffect, useState } from "react";
import { cargarPerfil } from "../utils/sesion";

function PaginaCuenta({ seccion, usuario, onCerrarSesion, onActualizarUsuario }) {
  const [estado, setEstado] = useState({ cargando: true, error: "" });
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    let vigente = true;
    cargarPerfil().then(perfil => {
      if (!vigente) return;
      onActualizarUsuario(perfil);
      setEstado({ cargando: false, error: "" });
    }).catch(error => {
      if (vigente) setEstado({ cargando: false, error: error.message });
    });
    return () => { vigente = false; };
  }, [usuario.usuarioId, onActualizarUsuario, intento]);
  if (estado.cargando) return <p role="status">Cargando tus datos…</p>;
  if (estado.error) return <section className="cuenta">
    <p role="alert">{estado.error}</p>
    <button onClick={() => { setEstado({ cargando: true, error: "" }); setIntento(intento + 1); }}>Reintentar</button>
    <button onClick={onCerrarSesion}>Cerrar sesión</button>
  </section>;
  return (
    <Cuenta
      usuario={usuario}
      seccion={seccion}
      onCerrarSesion={onCerrarSesion}
      onActualizarUsuario={onActualizarUsuario}
    />
  );
}
export default PaginaCuenta;
