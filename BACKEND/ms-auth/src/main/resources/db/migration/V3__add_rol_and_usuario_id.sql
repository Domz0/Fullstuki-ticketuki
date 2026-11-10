ALTER TABLE usuario_auth
    ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    ADD COLUMN usuario_id BIGINT NULL,
    ADD CONSTRAINT uq_auth_usuario_id UNIQUE (usuario_id),
    ADD CONSTRAINT ck_auth_rol CHECK (rol IN ('ADMIN', 'VENDEDOR', 'CLIENTE')),
    ADD CONSTRAINT ck_auth_usuario_id CHECK (usuario_id IS NULL OR usuario_id > 0);
