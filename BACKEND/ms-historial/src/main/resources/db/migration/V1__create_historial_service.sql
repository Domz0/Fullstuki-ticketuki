CREATE TABLE historial (
    id_historial BIGINT AUTO_INCREMENT PRIMARY KEY,
    entidad VARCHAR(50) NOT NULL,
    id_entidad BIGINT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    usuario_id BIGINT,
    timestamp DATETIME,
    cambios_anteriores TEXT,
    cambios_nuevos TEXT,
    evento_id VARCHAR(36) NULL,
    origen VARCHAR(50) NULL,
    auth_id BIGINT NULL,
    CONSTRAINT uq_historial_evento UNIQUE (evento_id)
);
