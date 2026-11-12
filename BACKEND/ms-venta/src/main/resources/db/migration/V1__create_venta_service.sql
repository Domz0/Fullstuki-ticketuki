CREATE TABLE venta (
    id_venta BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_venta DATETIME NOT NULL,
    medio_pago VARCHAR(50) NOT NULL,
    cod_autorizacion VARCHAR(50) NOT NULL,
    estado_venta_id_estado BIGINT,
    estado VARCHAR(25) NULL,
    monto_total INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado_venta_id_estado),
    INDEX idx_venta_fecha (fecha_venta),
    INDEX idx_venta_estado (estado_venta_id_estado),
    INDEX idx_venta_estado_local (estado)
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

CREATE TABLE detalle_venta (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    cantidad_ticket INTEGER NOT NULL,
    precio_neto INTEGER NOT NULL,
    precio_iva INTEGER NOT NULL,
    precio_total INTEGER NOT NULL,
    comision INTEGER NOT NULL,
    usuario_id_usuario BIGINT,
    venta_id_venta BIGINT,
    sector_id_sector BIGINT,
    promocion_id BIGINT NULL,
    descuento_monto INTEGER NULL DEFAULT 0,
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
    usuario_id BIGINT NOT NULL,
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
    usuario_id BIGINT NOT NULL,
    clave VARCHAR(80) NOT NULL,
    solicitud LONGTEXT NOT NULL,
    reserva_estado VARCHAR(20) NULL,
    reserva_hasta DATETIME(6) NULL,
    venta_id BIGINT NULL UNIQUE,
    pago_id BIGINT NULL UNIQUE,
    UNIQUE KEY uk_compra_clave(usuario_id, clave),
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
