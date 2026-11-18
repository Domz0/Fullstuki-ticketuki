CREATE TABLE direccion_recinto (
    id_direccion_recinto BIGINT AUTO_INCREMENT PRIMARY KEY,
    calle VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    comuna VARCHAR(50) NOT NULL,
    num_calle INTEGER NOT NULL,
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

-- Recintos y sectores de demostracion: 100 lugares fisicos por sector.
INSERT INTO recinto(id_recinto,nombre_recinto,capacidad_total) VALUES
(101, 'Estadio Nacional', 500),
(102, 'Santander Arena', 600),
(103, 'Teatro Municipal', 600),
(104, 'Teatro Municipal', 600),
(105, 'Estadio Nacional', 500),
(106, 'Espacio Riesco', 500),
(107, 'Espacio Riesco', 500);
INSERT INTO sector(id_sector,nombre_sector,capacidad_sector,precio_sector,recinto_id_recinto) VALUES
(101, 'Tribuna Andes', 100, 35000, 101),
(102, 'Cancha Preferencial', 100, 85000, 101),
(103, 'Cancha General', 100, 45000, 101),
(104, 'Galería Sur', 100, 22000, 101),
(105, 'Tribuna Pacífico', 100, 35000, 101),
(106, 'Lateral Izq.', 100, 26000, 102),
(107, 'Cancha', 100, 70000, 102),
(108, 'Platea Preferencial', 100, 52000, 102),
(109, 'Tribuna Central', 100, 34000, 102),
(110, 'Lateral Der.', 100, 26000, 102),
(111, 'Tribuna Superior', 100, 18000, 102),
(112, 'Palco Izq.', 100, 45000, 103),
(113, 'Platea Baja', 100, 38000, 103),
(114, 'Platea Alta', 100, 28000, 103),
(115, 'Palco Der.', 100, 45000, 103),
(116, 'Balcón', 100, 20000, 103),
(117, 'Galería', 100, 12000, 103),
(118, 'Palco Izq.', 100, 45000, 104),
(119, 'Platea Baja', 100, 38000, 104),
(120, 'Platea Alta', 100, 28000, 104),
(121, 'Palco Der.', 100, 45000, 104),
(122, 'Balcón', 100, 20000, 104),
(123, 'Galería', 100, 12000, 104),
(124, 'Tribuna Andes', 100, 35000, 105),
(125, 'Cancha Preferencial', 100, 85000, 105),
(126, 'Cancha General', 100, 45000, 105),
(127, 'Galería Sur', 100, 22000, 105),
(128, 'Tribuna Pacífico', 100, 35000, 105),
(129, 'Pabellón A', 100, 8000, 106),
(130, 'Pabellón B', 100, 8000, 106),
(131, 'Zona Exterior · Food', 100, 5000, 106),
(132, 'Acceso VIP · Pase de día', 100, 15000, 106),
(133, 'Entrada General', 100, 10000, 106),
(134, 'Pabellón A', 100, 8000, 107),
(135, 'Pabellón B', 100, 8000, 107),
(136, 'Zona Exterior · Food', 100, 5000, 107),
(137, 'Acceso VIP · Pase de día', 100, 15000, 107),
(138, 'Entrada General', 100, 10000, 107);
