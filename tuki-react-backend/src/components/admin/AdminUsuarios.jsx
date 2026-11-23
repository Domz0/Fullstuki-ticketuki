import { useState } from "react";
import { useAdminDatos } from "../../hooks/useAdminDatos";
import { apiAdmin } from "../../services/admin";
import { obtenerUsuario } from "../../utils/sesion";
import { EstadoAdmin } from "./AdminVentas";

const cuentasPorPagina = 20;
const nombresRol = { ADMIN: "Administrador", CLIENTE: "Cliente" };

function nombrePerfil(perfil) {
  if (!perfil) return "";
  return [perfil.p_nombre, perfil.s_nombre, perfil.a_paterno, perfil.a_materno]
    .map(parte => parte?.trim())
    .filter(Boolean)
    .join(" ");
}

function PaginaCuentas({ pagina, cambiarPagina }) {
  const cuentas = useAdminDatos(`/auth/cuentas?pagina=${pagina}&cantidad=${cuentasPorPagina}`);
  const perfiles = useAdminDatos("/usuarios");
  const [guardando, setGuardando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const miCuenta = obtenerUsuario()?.authId;
  const listaCuentas = cuentas.datos?.content || [];
  const totalPaginas = cuentas.datos?.totalPages || 1;
  const totalCuentas = cuentas.datos?.totalElements ?? listaCuentas.length;

  // une la cuenta de acceso (ms-auth) con su perfil personal (ms-usuario)
  const filas = listaCuentas.map(cuenta => {
    const perfil = (perfiles.datos || []).find(item => item.id_usuario === cuenta.usuarioId);
    return { ...cuenta, nombre: nombrePerfil(perfil), correo: perfil?.email || "", run: perfil?.run || "" };
  });

  async function cambiarRol(cuenta) {
    const nuevoRol = cuenta.rol === "ADMIN" ? "CLIENTE" : "ADMIN";
    const pregunta = `¿Cambiar el rol de "${cuenta.username}" a ${nombresRol[nuevoRol]}? Su sesión actual se cerrará.`;
    if (!window.confirm(pregunta)) return;

    setGuardando(cuenta.authId);
    setMensaje("");
    setError("");
    try {
      await apiAdmin(`/auth/cuentas/${cuenta.authId}/rol`, {
        method: "PATCH",
        body: { rol: nuevoRol },
      });
      setMensaje(`"${cuenta.username}" ahora es ${nombresRol[nuevoRol]}.`);
      cuentas.recargar();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setGuardando(null);
    }
  }

  return (
    <>
      <div className="admin_acciones">
        <button onClick={cuentas.recargar} disabled={cuentas.cargando}>
          Actualizar lista
        </button>
      </div>
      <EstadoAdmin consulta={cuentas} />
      {perfiles.error && <p role="alert">No se pudieron cargar los perfiles: {perfiles.error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
      {error && <p role="alert">{error}</p>}
      {/* espera los perfiles para no mostrar "Sin perfil" mientras cargan */}
      {cuentas.datos && !perfiles.cargando && (
        <>
          <div className="admin_tabla_contenedor">
            <table className="admin_tabla">
              <thead>
                <tr>
                  {["Usuario", "Nombre", "Correo", "Rol", "Acciones"].map(titulo => (
                    <th key={titulo} scope="col">{titulo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filas.map(cuenta => {
                  const sinPerfil = !cuenta.usuarioId;
                  return (
                    <tr key={cuenta.authId}>
                      <td data-label="Usuario"><strong>{cuenta.username}</strong></td>
                      <td data-label="Nombre">{cuenta.nombre || "Sin perfil"}{cuenta.run && <><br />{cuenta.run}</>}</td>
                      <td data-label="Correo">{cuenta.correo || "—"}</td>
                      <td data-label="Rol">{nombresRol[cuenta.rol] || cuenta.rol}</td>
                      <td data-label="Acciones">
                        {cuenta.authId === miCuenta ? (
                          <span>Tu cuenta</span>
                        ) : (
                          <div className="admin_acciones">
                            <button
                              disabled={guardando === cuenta.authId || sinPerfil}
                              title={sinPerfil ? "La cuenta debe tener un perfil vinculado" : undefined}
                              onClick={() => cambiarRol(cuenta)}
                            >
                              {cuenta.rol === "ADMIN" ? "Hacer cliente" : "Hacer admin"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filas.length === 0 && <p>No hay cuentas registradas.</p>}
          </div>
          <div className="admin_acciones">
            <button disabled={pagina === 0} onClick={() => cambiarPagina(pagina - 1)}>Anterior</button>
            <span>Página {pagina + 1} de {totalPaginas} · {totalCuentas} cuentas</span>
            <button disabled={pagina + 1 >= totalPaginas} onClick={() => cambiarPagina(pagina + 1)}>Siguiente</button>
          </div>
        </>
      )}
    </>
  );
}

export default function AdminUsuarios() {
  const [pagina, setPagina] = useState(0);
  return (
    <section>
      <h1>Usuarios</h1>
      <p>Cambia el rol de una cuenta entre cliente y administrador. Al hacerlo, la sesión abierta de esa persona se cierra de inmediato. No puedes modificar tu propia cuenta.</p>
      {/* cada pagina reinicia su consulta y sus mensajes */}
      <PaginaCuentas key={pagina} pagina={pagina} cambiarPagina={setPagina} />
    </section>
  );
}
