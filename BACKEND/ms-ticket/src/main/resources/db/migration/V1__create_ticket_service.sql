CREATE TABLE ticket (
    id_ticket BIGINT AUTO_INCREMENT PRIMARY KEY,
    cod_qr VARCHAR(10) NOT NULL UNIQUE,
    nombre_titular VARCHAR(50) NOT NULL,
    run_titular VARCHAR(12) NOT NULL,
    fecha_emision DATE NOT NULL,
    venta_id_venta BIGINT,
    evento_id_evento BIGINT,
    sector_id_sector BIGINT,
    estado VARCHAR(25) NULL,
    INDEX idx_ticket_estado_local (estado),
    INDEX idx_ticket_evento_sector (evento_id_evento, sector_id_sector)
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

CREATE TABLE reserva_cupo (
    venta_id BIGINT NOT NULL,
    evento_id BIGINT NOT NULL,
    sector_id BIGINT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    PRIMARY KEY (venta_id, evento_id, sector_id),
    CONSTRAINT fk_reserva_operacion FOREIGN KEY (venta_id) REFERENCES operacion_venta(venta_id),
    INDEX idx_reserva_evento_sector (evento_id, sector_id)
);

-- pasadas de nombretest.
INSERT INTO ticket (cod_qr, nombre_titular, run_titular, fecha_emision,
    venta_id_venta, evento_id_evento, sector_id_sector, estado) VALUES
('TEST000001', 'nombretest apedillotest', '99.999.999-9', '2026-11-01', 1001, 101, 104, 'USADO'),
('TEST000002', 'nombretest apedillotest', '99.999.999-9', '2026-11-02', 1002, 106, 117, 'USADO'),
('TEST000003', 'nombretest apedillotest', '99.999.999-9', '2026-11-03', 1003, 110, 104, 'USADO');
