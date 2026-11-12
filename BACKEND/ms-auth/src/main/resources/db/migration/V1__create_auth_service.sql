CREATE TABLE usuario_auth (
    id_usuario_auth BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    usuario_id BIGINT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    registro_id VARCHAR(36) NULL UNIQUE,
    registro_fingerprint VARCHAR(64) NULL,
    token_version BIGINT NOT NULL DEFAULT 0,
    registro_rechazado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_auth_usuario_id UNIQUE (usuario_id),
    CONSTRAINT ck_auth_rol CHECK (rol IN ('ADMIN', 'CLIENTE')),
    CONSTRAINT ck_auth_usuario_id CHECK (usuario_id IS NULL OR usuario_id > 0)
);

-- Usuario de autenticación inicial.
-- username: hodor
-- password: holdthedoor1234 (almacenada en texto plano)
INSERT INTO usuario_auth (username, password) VALUES
('hodor', 'holdthedoor1234');

CREATE TABLE auditoria_pendiente (
    id VARCHAR(36) PRIMARY KEY,
    payload TEXT NOT NULL,
    creado DATETIME(6) NOT NULL,
    enviado DATETIME(6) NULL,
    INDEX ix_auditoria_envio (enviado, creado)
);
