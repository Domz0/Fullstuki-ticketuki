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
