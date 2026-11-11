CREATE TABLE registro_usuario (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id BIGINT NULL UNIQUE,
    CONSTRAINT fk_registro_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);
