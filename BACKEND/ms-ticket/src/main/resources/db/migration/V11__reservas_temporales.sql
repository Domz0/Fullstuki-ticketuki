ALTER TABLE operacion_venta ADD COLUMN reserva_hasta DATETIME(6) NULL;
CREATE TABLE reserva_asiento (
    venta_id BIGINT NOT NULL,
    evento_id BIGINT NOT NULL,
    sector_id BIGINT NOT NULL,
    num_asiento INT NOT NULL,
    PRIMARY KEY (venta_id, evento_id, sector_id, num_asiento),
    CONSTRAINT fk_reserva_operacion FOREIGN KEY (venta_id) REFERENCES operacion_venta(venta_id),
    INDEX idx_reserva_evento_sector (evento_id, sector_id, num_asiento)
);
