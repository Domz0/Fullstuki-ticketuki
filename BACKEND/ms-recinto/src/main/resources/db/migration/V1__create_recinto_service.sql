CREATE TABLE direccion_recinto (
    id_direccion_recinto BIGINT AUTO_INCREMENT PRIMARY KEY,
    calle VARCHAR(50),
    region VARCHAR(50),
    comuna VARCHAR(50),
    num_calle INTEGER,
    referencia_acceso VARCHAR(100)
);

CREATE TABLE recinto (
    id_recinto BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_recinto VARCHAR(50) NOT NULL,
    capacidad_total INTEGER NOT NULL,
    direccion_recinto_id_direccion BIGINT,
    FOREIGN KEY (direccion_recinto_id_direccion) REFERENCES direccion_recinto(id_direccion_recinto)
);

CREATE TABLE sector (
    id_sector BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_sector VARCHAR(50) NOT NULL,
    capacidad_sector INTEGER NOT NULL,
    precio_sector INTEGER NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    recinto_id_recinto BIGINT NOT NULL,
    FOREIGN KEY (recinto_id_recinto) REFERENCES recinto(id_recinto)
);

-- DIRECCION_RECINTO
INSERT INTO direccion_recinto (id_direccion_recinto, calle, region, comuna, num_calle, referencia_acceso) VALUES
(1,'Av. Grecia','Region Metropolitana','Nunoa',2001,'Sin referencia'),
(2,'Av. Beauchef','Region Metropolitana','Santiago',1204,'Sin referencia'),
(3,'Av. Manuel Montt','Region Metropolitana','Providencia',032,'Sin referencia');

-- RECINTO
INSERT INTO recinto (id_recinto, nombre_recinto, capacidad_total, direccion_recinto_id_direccion) VALUES
(1,'Estadio Nacional',100,1),
(2,'Movistar Arena',70,2),
(3,'Nescafe de las Artes',50,3);

-- SECTOR
INSERT INTO sector (id_sector, nombre_sector, capacidad_sector, precio_sector, recinto_id_recinto) VALUES
(1,'Cancha Estadio Nacional',70,50000,1),
(2,'Platea Estadio Nacional',30,70000,1),
(3,'Cancha Movistar Arena',50,75000,2),
(4,'Platea Movistar Arena',20,100000,2),
(5,'Platea Nescafe de las Artes',30,30000,3),
(6,'Palco Nescafe de las Artes',20,45000,3);

CREATE TABLE auditoria_pendiente (
    id VARCHAR(36) PRIMARY KEY,
    payload TEXT NOT NULL,
    creado DATETIME(6) NOT NULL,
    enviado DATETIME(6) NULL,
    INDEX ix_auditoria_envio (enviado, creado)
);
