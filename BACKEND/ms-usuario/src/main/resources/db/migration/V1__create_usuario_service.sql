CREATE TABLE direccion_usuario (
    id_direccion_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    calle VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    comuna VARCHAR(50) NOT NULL,
    num_calle INTEGER NOT NULL
);

CREATE TABLE usuario (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    run VARCHAR(12) NOT NULL UNIQUE,
    p_nombre VARCHAR(25) NOT NULL,
    s_nombre VARCHAR(25),
    a_materno VARCHAR(25) NOT NULL,
    a_paterno VARCHAR(25) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    direccion_usuario_id_direccion BIGINT,
    FOREIGN KEY (direccion_usuario_id_direccion) REFERENCES direccion_usuario(id_direccion_usuario)
);

-- DIRECCION
INSERT INTO direccion_usuario (calle, num_calle, comuna, region) VALUES
('Av. Irarrazaval', '3301', 'Ñuñoa','Region Metropolitana'),
('Antonio Varas', '666','Providencia','Region Metropolitana'),
('Av. Cristobal Colon','4330','Las Condes','Region Metropolitana');

-- USUARIOS
INSERT INTO usuario (run, p_nombre, s_nombre, a_paterno, a_materno, email, direccion_usuario_id_direccion) VALUES
('18.356.204-5', 'Marcelo','Andres','Martabit','Donoso','ma.martabit@duocuc.cl',1),
('12.345.678-9', 'Luz', 'Clara', 'Solar','Tesla','luz.solar@gmail.com',2),
('17.579.054-3', 'Paulina', 'Francisca', 'Gonzalez','Castro','pauli.gonzalezc@duocuc.cl',3);

CREATE TABLE registro_usuario (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id BIGINT NULL UNIQUE,
    CONSTRAINT fk_registro_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);

CREATE TABLE auditoria_pendiente (
    id VARCHAR(36) PRIMARY KEY,
    payload TEXT NOT NULL,
    creado DATETIME(6) NOT NULL,
    enviado DATETIME(6) NULL,
    INDEX ix_auditoria_envio (enviado, creado)
);
