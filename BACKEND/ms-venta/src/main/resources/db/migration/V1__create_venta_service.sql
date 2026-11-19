CREATE TABLE venta (
    id_venta BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_venta DATETIME NOT NULL,
    medio_pago VARCHAR(50) NOT NULL,
    cod_autorizacion VARCHAR(50) NOT NULL,
    estado VARCHAR(25) NULL,
    monto_total BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_venta_fecha (fecha_venta),
    INDEX idx_venta_estado_local (estado)
);

CREATE TABLE reembolso_ticket (
    ticket_id BIGINT PRIMARY KEY,
    venta_id BIGINT NOT NULL,
    monto BIGINT NOT NULL,
    iva BIGINT NOT NULL,
    comision BIGINT NOT NULL,
    creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (venta_id) REFERENCES venta(id_venta)
);

CREATE TABLE promocion (
    id_promocion BIGINT AUTO_INCREMENT PRIMARY KEY,
    empresa VARCHAR(100) NOT NULL,
    descuento INT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    restriccion VARCHAR(255) NOT NULL,
    fecha_expiracion DATE NOT NULL,
    fecha_inicio DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE codigo_descuento (
    codigo VARCHAR(30) PRIMARY KEY,
    evento_id BIGINT NOT NULL,
    promocion_id BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (promocion_id) REFERENCES promocion(id_promocion)
);

CREATE TABLE detalle_venta (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad_ticket INTEGER NOT NULL,
    precio_neto BIGINT NOT NULL,
    precio_iva BIGINT NOT NULL,
    precio_total BIGINT NOT NULL,
    comision BIGINT NOT NULL,
    usuario_id_usuario BIGINT NULL,
    venta_id_venta BIGINT NOT NULL,
    sector_id_sector BIGINT NOT NULL,
    promocion_id BIGINT NULL,
    descuento_monto BIGINT NULL DEFAULT 0,
    evento_id_evento BIGINT NULL,
    FOREIGN KEY (venta_id_venta) REFERENCES venta(id_venta),
    CONSTRAINT fk_detalle_promocion FOREIGN KEY (promocion_id) REFERENCES promocion(id_promocion),
    INDEX idx_detalle_venta_id (venta_id_venta),
    INDEX idx_detalle_evento_sector (evento_id_evento, sector_id_sector)
);

CREATE TABLE pago (
    id_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
    monto BIGINT NOT NULL,
    medio_pago VARCHAR(50) NOT NULL,
    cod_autorizacion VARCHAR(50) NOT NULL,
    timestamp DATETIME(6) NOT NULL,
    estado VARCHAR(25) NOT NULL DEFAULT 'PENDIENTE',
    venta_id BIGINT NOT NULL,
    usuario_id BIGINT NULL,
    CONSTRAINT fk_pago_venta FOREIGN KEY (venta_id) REFERENCES venta(id_venta),
    INDEX idx_pago_usuario (usuario_id),
    INDEX idx_pago_fecha (timestamp)
);

CREATE TABLE auditoria_pendiente (
    id VARCHAR(36) PRIMARY KEY,
    payload TEXT NOT NULL,
    creado DATETIME(6) NOT NULL,
    enviado DATETIME(6) NULL,
    INDEX ix_auditoria_envio (enviado, creado)
);

CREATE TABLE compra (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NULL,
    origen VARCHAR(15) NOT NULL DEFAULT 'DESCONOCIDO',
    nombre_comprador VARCHAR(100) NULL,
    rut_comprador VARCHAR(12) NULL,
    correo_comprador VARCHAR(254) NULL,
    acceso_hash VARCHAR(64) NULL,
    clave VARCHAR(80) NOT NULL,
    solicitud LONGTEXT NOT NULL,
    reserva_estado VARCHAR(20) NULL,
    reserva_hasta DATETIME(6) NULL,
    venta_id BIGINT NULL UNIQUE,
    pago_id BIGINT NULL UNIQUE,
    UNIQUE KEY uk_compra_clave(clave),
    FOREIGN KEY (venta_id) REFERENCES venta(id_venta),
    FOREIGN KEY (pago_id) REFERENCES pago(id_pago)
);
CREATE TABLE pago_tarea (
    pago_id BIGINT PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    intentos INT NOT NULL DEFAULT 0,
    mensaje VARCHAR(255) NULL,
    revisada_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_tarea_revision (estado, revisada_en),
    FOREIGN KEY (pago_id) REFERENCES pago(id_pago)
);

INSERT INTO venta (id_venta, fecha_venta, medio_pago, cod_autorizacion, estado, monto_total) VALUES
(1001, '2026-11-01 12:00:00', 'DEBITO', 'SIM-TEST-1001', 'CONFIRMADA', 45150),
(1002, '2026-11-02 12:00:00', 'DEBITO', 'SIM-TEST-1002', 'CONFIRMADA', 15480),
(1003, '2026-11-03 12:00:00', 'DEBITO', 'SIM-TEST-1003', 'CONFIRMADA', 23220);

INSERT INTO detalle_venta (cantidad_ticket, precio_neto, precio_iva, precio_total, comision,
    usuario_id_usuario, venta_id_venta, sector_id_sector, evento_id_evento) VALUES
(1, 35000, 6650, 45150, 3500, 4, 1001, 104, 101),
(1, 12000, 2280, 15480, 1200, 4, 1002, 117, 106),
(1, 18000, 3420, 23220, 1800, 4, 1003, 104, 110);

INSERT INTO pago (monto, medio_pago, cod_autorizacion, timestamp, estado, venta_id, usuario_id) VALUES
(45150, 'DEBITO', 'SIM-TEST-1001', '2026-11-01 12:00:00', 'COMPLETADO', 1001, 4),
(15480, 'DEBITO', 'SIM-TEST-1002', '2026-11-02 12:00:00', 'COMPLETADO', 1002, 4),
(23220, 'DEBITO', 'SIM-TEST-1003', '2026-11-03 12:00:00', 'COMPLETADO', 1003, 4);
