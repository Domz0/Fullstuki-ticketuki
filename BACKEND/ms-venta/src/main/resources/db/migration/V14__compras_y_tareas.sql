CREATE TABLE compra (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    clave VARCHAR(80) NOT NULL,
    solicitud LONGTEXT NOT NULL,
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
    FOREIGN KEY (pago_id) REFERENCES pago(id_pago)
);
