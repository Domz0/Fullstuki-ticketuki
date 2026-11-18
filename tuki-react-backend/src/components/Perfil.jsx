import { useState } from "react";
import EditarDatosAcceso from "./EditarDatosAcceso";
import "./Perfil.css";

function Perfil({ usuario, onActualizarUsuario }) {
  const [editando, setEditando] = useState(false);
  return (
    <section className="cuenta_contenido" aria-labelledby="perfil_titulo">
      <h3 id="perfil_titulo" className="cuenta_titulo">
        Datos personales
      </h3>
      <div className="flex_V datos_usuario">
        <div className="flex_H cuenta_fila">
          <div className="campo_cuenta">
            <span className="campo_cuenta_rotulo">Nombre</span>
            <p className="campo_cuenta_valor">{usuario.nombre || "No informado"}</p>
          </div>
          <div className="campo_cuenta">
            <span className="campo_cuenta_rotulo">Apellido</span>
            <p className="campo_cuenta_valor">{usuario.apellido || "No informado"}</p>
          </div>
        </div>
        <div className="campo_cuenta">
          <span className="campo_cuenta_rotulo">RUT</span>
          <p className="campo_cuenta_valor">{usuario.rut || "No informado"}</p>
        </div>
        <div className="campo_cuenta">
          <span className="campo_cuenta_rotulo">Correo electrónico</span>
          <p className="campo_cuenta_valor">{usuario.correo || "No informado"}</p>
        </div>
        {editando ? (
          <EditarDatosAcceso usuario={usuario} onActualizarUsuario={onActualizarUsuario} onCancelar={() => setEditando(false)} />
        ) : (
          <button
            type="button"
            className="perfil_editar"
            onClick={() => setEditando(true)}
          >
            Cambiar contraseña
          </button>
        )}
      </div>
    </section>
  );
}

export default Perfil;
