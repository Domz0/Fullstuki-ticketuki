CREATE TABLE usuario (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    run VARCHAR(12) NOT NULL UNIQUE,
    p_nombre VARCHAR(25) NOT NULL,
    s_nombre VARCHAR(25),
    a_materno VARCHAR(25),
    a_paterno VARCHAR(25) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- USUARIOS
INSERT INTO usuario (run, p_nombre, s_nombre, a_paterno, a_materno, email) VALUES
('18.356.204-5', 'Marcelo','Andres','Martabit','Donoso','ma.martabit@duocuc.cl'),
('12.345.678-9', 'Luz', 'Clara', 'Solar','Tesla','luz.solar@gmail.com'),
('17.579.054-3', 'Paulina', 'Francisca', 'Gonzalez','Castro','pauli.gonzalezc@duocuc.cl');

CREATE TABLE registro_usuario (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id BIGINT NULL UNIQUE,
    CONSTRAINT fk_registro_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);

-- Perfil de prueba
INSERT INTO usuario (id_usuario, run, p_nombre, s_nombre, a_paterno, a_materno, email) VALUES
(4, '99.999.999-9', 'nombretest', NULL, 'apedillotest', NULL, 'test@duoc.cl');

CREATE TABLE auditoria_pendiente (
    id VARCHAR(36) PRIMARY KEY,
    payload TEXT NOT NULL,
    creado DATETIME(6) NOT NULL,
    enviado DATETIME(6) NULL,
    INDEX ix_auditoria_envio (enviado, creado)
);
