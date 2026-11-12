CREATE TABLE ticket (
    id_ticket BIGINT AUTO_INCREMENT PRIMARY KEY,
    cod_qr VARCHAR(10) NOT NULL UNIQUE,
    num_asiento INTEGER NOT NULL,
    nombre_titular VARCHAR(50) NOT NULL,
    run_titular VARCHAR(12) NOT NULL,
    fecha_emision DATE NOT NULL,
    venta_id_venta BIGINT,
    estado_ticket_id_estado BIGINT,
    evento_id_evento BIGINT,
    sector_id_sector BIGINT,
    estado VARCHAR(25) NULL,
    asiento_activo INT GENERATED ALWAYS AS
        (CASE WHEN estado = 'CANCELADO' THEN NULL ELSE num_asiento END) STORED,
    INDEX idx_ticket_estado_local (estado),
    UNIQUE INDEX uq_asiento_activo (evento_id_evento, sector_id_sector, asiento_activo)
);

CREATE TABLE cupo_evento (
    evento_id BIGINT PRIMARY KEY
);

CREATE TABLE auditoria_pendiente (
    id VARCHAR(36) PRIMARY KEY,
    payload TEXT NOT NULL,
    creado DATETIME(6) NOT NULL,
    enviado DATETIME(6) NULL,
    INDEX ix_auditoria_envio (enviado, creado)
);

CREATE TABLE operacion_venta (
    venta_id BIGINT PRIMARY KEY,
    estado VARCHAR(20) NOT NULL,
    solicitud LONGTEXT NULL,
    reserva_hasta DATETIME(6) NULL
);

CREATE TABLE reserva_asiento (
    venta_id BIGINT NOT NULL,
    evento_id BIGINT NOT NULL,
    sector_id BIGINT NOT NULL,
    num_asiento INT NOT NULL,
    PRIMARY KEY (venta_id, evento_id, sector_id, num_asiento),
    CONSTRAINT fk_reserva_operacion FOREIGN KEY (venta_id) REFERENCES operacion_venta(venta_id),
    INDEX idx_reserva_evento_sector (evento_id, sector_id, num_asiento)
);
