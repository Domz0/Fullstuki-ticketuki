ALTER TABLE usuario_auth ADD COLUMN token_version BIGINT NOT NULL DEFAULT 0;
UPDATE usuario_auth SET rol = 'CLIENTE', activo = FALSE, token_version = token_version + 1 WHERE rol = 'VENDEDOR';
ALTER TABLE usuario_auth DROP CONSTRAINT ck_auth_rol;
ALTER TABLE usuario_auth ADD CONSTRAINT ck_auth_rol CHECK (rol IN ('ADMIN', 'CLIENTE'));
