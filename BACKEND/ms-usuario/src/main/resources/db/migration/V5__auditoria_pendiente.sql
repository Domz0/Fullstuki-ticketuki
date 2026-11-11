CREATE TABLE auditoria_pendiente (
    id VARCHAR(36) PRIMARY KEY,
    payload TEXT NOT NULL,
    creado DATETIME(6) NOT NULL,
    enviado DATETIME(6) NULL,
    INDEX ix_auditoria_envio (enviado, creado)
);
