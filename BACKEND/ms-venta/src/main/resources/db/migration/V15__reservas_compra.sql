ALTER TABLE compra
    ADD COLUMN reserva_estado VARCHAR(20) NULL,
    ADD COLUMN reserva_hasta DATETIME(6) NULL;
ALTER TABLE pago_tarea
    ADD COLUMN revisada_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD INDEX idx_tarea_revision (estado, revisada_en);
