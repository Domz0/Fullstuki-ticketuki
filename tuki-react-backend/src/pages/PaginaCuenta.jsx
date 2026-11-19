import { useEffect, useState } from "react";
import Cuenta from "../components/Cuenta";
import { cargarPerfil } from "../utils/sesion";

// consulta al perfil antes de mostrar
function PaginaCuenta({ seccion, usuario, onCerrarSesion, onActualizarUsuario }) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;

    async function consultarPerfil() {
      try {
        const perfil = await cargarPerfil();
        if (!vigente) return;

        // comparte los datos con el resto
        onActualizarUsuario(perfil);
      } catch (fallo) {
        if (vigente) {
          setError(fallo.message);
        }
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    }

    consultarPerfil();
    return () => {
      vigente = false;
    };
  }, [usuario.usuarioId, onActualizarUsuario, recarga]);

  function reintentarCarga() {
    setError("");
    setCargando(true);
    setRecarga(recarga + 1);
  }

  if (cargando) {
    return <p role="status">Cargando tus datos…</p>;
  }

  if (error) {
    return (
      <section className="cuenta">
        <p role="alert">{error}</p>
        <button onClick={reintentarCarga}>Reintentar</button>
        <button onClick={onCerrarSesion}>Cerrar sesión</button>
      </section>
    );
  }

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
