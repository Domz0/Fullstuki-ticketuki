ALTER TABLE historial
    ADD COLUMN evento_id VARCHAR(36) NULL,
    ADD COLUMN origen VARCHAR(50) NULL,
    ADD COLUMN auth_id BIGINT NULL,
    ADD CONSTRAINT uq_historial_evento UNIQUE (evento_id);
