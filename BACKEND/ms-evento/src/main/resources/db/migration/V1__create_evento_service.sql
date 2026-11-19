CREATE TABLE evento (
    id_evento BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_evento VARCHAR(100) NOT NULL,
    aforo_evento INTEGER NOT NULL,
    fecha_evento DATE NOT NULL,
    descripcion VARCHAR(500) NULL,
    participantes VARCHAR(500) NULL,
    estado VARCHAR(25) NULL,
    recinto_id_recinto BIGINT,
    categoria VARCHAR(20) NULL,
    subcategoria VARCHAR(50) NULL,
    ciudad VARCHAR(50) NULL,
    recinto_catalogo VARCHAR(100) NULL,
    precio_desde INTEGER NULL,
    horario VARCHAR(5) NULL,
    fecha_visible VARCHAR(100) NULL,
    disponibilidad VARCHAR(25) NULL,
    plazo INTEGER NULL,
    INDEX idx_evento_estado_local (estado),
    INDEX idx_recinto (recinto_id_recinto)
);

INSERT INTO evento (id_evento, nombre_evento, aforo_evento, fecha_evento, descripcion, recinto_id_recinto, estado) VALUES
(1, 'Gorillaz The Mountain Tour', 100, '2026-06-15',
 'La icónica banda virtual británica Gorillaz llega con su esperado tour mundial. Una experiencia audiovisual única que combina música alternativa, hip-hop y arte digital con sus personajes animados en pantallas gigantes.',
 1, 'DISPONIBLE'),

(2, 'Metallica 72 Seasons World Tour', 70, '2026-07-15',
 'Los reyes del heavy metal regresan con su gira mundial 72 Seasons. Más de cuatro décadas de carrera resumidas en un show de más de tres horas con pirotecnia, efectos especiales y los clásicos que los llevaron a la cima del metal.',
 2, 'AGENDADO'),

(3, 'Daft Punk Alive 2026', 70, '2026-08-20',
 'El dúo de música electrónica más influyente de la historia vuelve a los escenarios con su icónica pirámide de luces LED. Una noche épica de electronic house, disco y funk que promete ser el evento del año.',
 2, 'AGENDADO'),

(4, 'Justice Woman Worldwide Tour', 50, '2026-09-10',
 'El dúo francés de electrónica Justice presenta su gira Woman Worldwide, un espectáculo de sonido e iluminación diseñado para hacer vibrar cada rincón del recinto. Cross, Audio Video Disco y sus mejores hits en una sola noche.',
 3, 'AGENDADO');

CREATE TABLE portada (
    id BIGINT PRIMARY KEY,
    evento_id BIGINT NULL,
    FOREIGN KEY (evento_id) REFERENCES evento(id_evento) ON DELETE SET NULL
);
INSERT INTO portada (id, evento_id) VALUES (1, NULL);

CREATE TABLE auditoria_pendiente (
    id VARCHAR(36) PRIMARY KEY,
    payload TEXT NOT NULL,
    creado DATETIME(6) NOT NULL,
    enviado DATETIME(6) NULL,
    INDEX ix_auditoria_envio (enviado, creado)
);

-- Ejemplos del catalogo del frontend. Precios y disponibilidad de demostracion.
UPDATE evento SET categoria = 'musica', ciudad = 'Santiago',
    recinto_catalogo = CASE recinto_id_recinto
        WHEN 1 THEN 'Estadio Nacional'
        WHEN 2 THEN 'Movistar Arena'
        WHEN 3 THEN 'Nescafe de las Artes'
    END
WHERE id_evento BETWEEN 1 AND 4;
INSERT INTO evento (id_evento, nombre_evento, aforo_evento, fecha_evento, descripcion, recinto_id_recinto, estado, categoria, subcategoria, ciudad, recinto_catalogo, precio_desde, horario, fecha_visible, disponibilidad, plazo) VALUES
(101, 'Festival de rock en vivo', 100, '2026-11-14', 'Festival de rock en vivo en Estadio Nacional.', NULL, 'DISPONIBLE', 'musica', 'Rock', 'Santiago', 'Estadio Nacional', 35000, '20:00', 'Sáb 14 nov, 20:00', 'Disponible', 1),
(102, 'Concierto de música electrónica', 100, '2026-11-20', 'Concierto de música electrónica en Santander Arena.', NULL, 'DISPONIBLE', 'musica', 'Electrónica', 'Santiago', 'Santander Arena', 28000, '22:00', 'Vie 20 nov, 22:00', 'Últimas', 2),
(103, 'Tributo sinfónico en vivo', 100, '2026-11-28', 'Tributo sinfónico en vivo en Teatro Municipal.', NULL, 'DISPONIBLE', 'musica', 'Sinfónico', 'Santiago', 'Teatro Municipal', 24000, '19:00', 'Sáb 28 nov, 19:00', 'Disponible', 2),
(104, 'Noche de jazz y blues', 100, '2026-12-03', 'Noche de jazz y blues en Santander Arena.', NULL, 'DISPONIBLE', 'musica', 'Jazz', 'Santiago', 'Santander Arena', 15000, '21:00', 'Jue 3 dic, 21:00', 'Agotado', 3),
(105, 'Festival urbano al aire libre', 100, '2026-12-12', 'Festival urbano al aire libre en Estadio Nacional.', NULL, 'DISPONIBLE', 'musica', 'Urbano', 'Santiago', 'Estadio Nacional', 20000, '18:00', 'Vie 12 dic, 18:00', 'Disponible', 3),
(106, 'Obra de teatro clásica', 100, '2026-11-12', 'Obra de teatro clásica en Teatro Municipal.', NULL, 'DISPONIBLE', 'artes', 'Teatro', 'Santiago', 'Teatro Municipal', 12000, '19:30', 'Jue 12 nov, 19:30', 'Disponible', 1),
(107, 'Ballet contemporáneo', 100, '2026-11-28', 'Ballet contemporáneo en Teatro Municipal.', NULL, 'DISPONIBLE', 'artes', 'Danza', 'Santiago', 'Teatro Municipal', 20000, '19:00', 'Sáb 28 nov, 19:00', 'Últimas', 2),
(108, 'Musical de Broadway', 100, '2026-12-05', 'Musical de Broadway en Santander Arena.', NULL, 'DISPONIBLE', 'artes', 'Musical', 'Santiago', 'Santander Arena', 32000, '20:00', 'Vie 5 dic, 20:00', 'Disponible', 3),
(109, 'Ópera en el puerto', 100, '2026-12-14', 'Ópera en el puerto en Teatro Municipal.', NULL, 'DISPONIBLE', 'artes', 'Ópera', 'Valparaíso', 'Teatro Municipal', 18000, '19:30', 'Dom 14 dic, 19:30', 'Disponible', 3),
(110, 'Clásico de fútbol local', 100, '2026-11-16', 'Clásico de fútbol local en Estadio Nacional.', NULL, 'DISPONIBLE', 'deportes', 'Fútbol', 'Santiago', 'Estadio Nacional', 18000, '16:00', 'Dom 16 nov, 16:00', 'Últimas', 2),
(111, 'Final de básquetbol', 100, '2026-11-22', 'Final de básquetbol en Estadio Nacional.', NULL, 'DISPONIBLE', 'deportes', 'Básquetbol', 'Santiago', 'Estadio Nacional', 14000, '18:00', 'Sáb 22 nov, 18:00', 'Disponible', 2),
(112, 'Torneo de tenis internacional', 100, '2026-12-02', 'Torneo de tenis internacional en Estadio Nacional.', NULL, 'DISPONIBLE', 'deportes', 'Tenis', 'Santiago', 'Estadio Nacional', 22000, '10:00', '2 al 8 dic, 10:00', 'Disponible', 3),
(113, 'Maratón ciudad de Concepción', 100, '2026-12-07', 'Maratón ciudad de Concepción en Estadio Nacional.', NULL, 'DISPONIBLE', 'deportes', 'Atletismo', 'Concepción', 'Estadio Nacional', 9000, '08:00', 'Dom 7 dic, 08:00', 'Disponible', 3),
(114, 'Expo tecnología y videojuegos', 100, '2026-11-21', 'Expo tecnología y videojuegos en Espacio Riesco.', NULL, 'DISPONIBLE', 'ferias', 'Tecnología', 'Santiago', 'Espacio Riesco', 15000, '11:00', '21 al 23 nov, 11:00', 'Últimas', 2),
(115, 'Feria gastronómica de invierno', 100, '2026-11-29', 'Feria gastronómica de invierno en Espacio Riesco.', NULL, 'DISPONIBLE', 'ferias', 'Gastronomía', 'Santiago', 'Espacio Riesco', 8000, '12:00', 'Sáb 29 nov, 12:00', 'Disponible', 2),
(116, 'Feria del libro', 100, '2026-12-05', 'Feria del libro en Espacio Riesco.', NULL, 'DISPONIBLE', 'ferias', 'Libros', 'Santiago', 'Espacio Riesco', 5000, '11:00', '5 al 14 dic, 11:00', 'Disponible', 3),
(117, 'Expo diseño y oficios', 100, '2026-12-06', 'Expo diseño y oficios en Espacio Riesco.', NULL, 'DISPONIBLE', 'ferias', 'Diseño', 'Valparaíso', 'Espacio Riesco', 6000, '10:00', '6 al 8 dic, 10:00', 'Disponible', 3);

-- Cupos y precios propios de cada evento. Capacidad cero significa sector cerrado.
CREATE TABLE evento_sector (
    evento_id BIGINT NOT NULL,
    sector_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    capacidad INTEGER NOT NULL,
    precio INTEGER NOT NULL,
    plano_id VARCHAR(50),
    PRIMARY KEY (evento_id, sector_id),
    FOREIGN KEY (evento_id) REFERENCES evento(id_evento) ON DELETE CASCADE,
    CHECK (capacidad >= 0),
    CHECK (precio >= 0)
);
UPDATE evento SET recinto_id_recinto=101, disponibilidad=NULL WHERE id_evento=101;
UPDATE evento SET recinto_id_recinto=102, disponibilidad=NULL WHERE id_evento=102;
UPDATE evento SET recinto_id_recinto=103, disponibilidad=NULL WHERE id_evento=103;
UPDATE evento SET recinto_id_recinto=102, disponibilidad=NULL WHERE id_evento=104;
UPDATE evento SET recinto_id_recinto=101, disponibilidad=NULL WHERE id_evento=105;
UPDATE evento SET recinto_id_recinto=103, disponibilidad=NULL WHERE id_evento=106;
UPDATE evento SET recinto_id_recinto=103, disponibilidad=NULL WHERE id_evento=107;
UPDATE evento SET recinto_id_recinto=102, disponibilidad=NULL WHERE id_evento=108;
UPDATE evento SET recinto_id_recinto=104, disponibilidad=NULL WHERE id_evento=109;
UPDATE evento SET recinto_id_recinto=101, disponibilidad=NULL WHERE id_evento=110;
UPDATE evento SET recinto_id_recinto=101, disponibilidad=NULL WHERE id_evento=111;
UPDATE evento SET recinto_id_recinto=101, disponibilidad=NULL WHERE id_evento=112;
UPDATE evento SET recinto_id_recinto=105, disponibilidad=NULL WHERE id_evento=113;
UPDATE evento SET recinto_id_recinto=106, disponibilidad=NULL WHERE id_evento=114;
UPDATE evento SET recinto_id_recinto=106, disponibilidad=NULL WHERE id_evento=115;
UPDATE evento SET recinto_id_recinto=106, disponibilidad=NULL WHERE id_evento=116;
UPDATE evento SET recinto_id_recinto=107, disponibilidad=NULL WHERE id_evento=117;
INSERT INTO evento_sector(evento_id,sector_id,nombre,capacidad,precio,plano_id) VALUES
(1, 1, 'Cancha Estadio Nacional', 70, 50000, NULL),
(1, 2, 'Platea Estadio Nacional', 30, 70000, NULL),
(2, 3, 'Cancha Movistar Arena', 50, 75000, NULL),
(2, 4, 'Platea Movistar Arena', 20, 100000, NULL),
(3, 3, 'Cancha Movistar Arena', 50, 75000, NULL),
(3, 4, 'Platea Movistar Arena', 20, 100000, NULL),
(4, 5, 'Platea Nescafe de las Artes', 30, 30000, NULL),
(4, 6, 'Palco Nescafe de las Artes', 20, 45000, NULL),
(101, 101, 'Tribuna Andes', 100, 55682, 'tribuna-andes'),
(101, 102, 'Cancha Preferencial', 100, 135227, 'cancha-preferencial'),
(101, 103, 'Cancha General', 100, 71591, 'cancha-general'),
(101, 104, 'Galería Sur', 100, 35000, 'galeria-sur'),
(101, 105, 'Tribuna Pacífico', 100, 55682, 'tribuna-pacifico'),
(102, 106, 'Lateral Izq.', 100, 40444, 'lateral-izq'),
(102, 107, 'Cancha', 100, 108889, 'cancha'),
(102, 108, 'Platea Preferencial', 100, 80889, 'platea-preferencial'),
(102, 109, 'Tribuna Central', 100, 52889, 'tribuna-central'),
(102, 110, 'Lateral Der.', 100, 40444, 'lateral-der'),
(102, 111, 'Tribuna Superior', 100, 28000, 'tribuna-superior'),
(103, 112, 'Palco Izq.', 100, 90000, 'palco-izq'),
(103, 113, 'Platea Baja', 100, 76000, 'platea-baja'),
(103, 114, 'Platea Alta', 100, 56000, 'platea-alta'),
(103, 115, 'Palco Der.', 100, 90000, 'palco-der'),
(103, 116, 'Balcón', 100, 40000, 'balcon'),
(103, 117, 'Galería', 100, 24000, 'galeria'),
(104, 106, 'Lateral Izq.', 100, 21667, 'lateral-izq'),
(104, 107, 'Cancha', 100, 58333, 'cancha'),
(104, 108, 'Platea Preferencial', 100, 43333, 'platea-preferencial'),
(104, 109, 'Tribuna Central', 100, 28333, 'tribuna-central'),
(104, 110, 'Lateral Der.', 100, 21667, 'lateral-der'),
(104, 111, 'Tribuna Superior', 100, 15000, 'tribuna-superior'),
(105, 101, 'Tribuna Andes', 100, 31818, 'tribuna-andes'),
(105, 102, 'Cancha Preferencial', 100, 77273, 'cancha-preferencial'),
(105, 103, 'Cancha General', 100, 40909, 'cancha-general'),
(105, 104, 'Galería Sur', 100, 20000, 'galeria-sur'),
(105, 105, 'Tribuna Pacífico', 100, 31818, 'tribuna-pacifico'),
(106, 112, 'Palco Izq.', 100, 45000, 'palco-izq'),
(106, 113, 'Platea Baja', 100, 38000, 'platea-baja'),
(106, 114, 'Platea Alta', 100, 28000, 'platea-alta'),
(106, 115, 'Palco Der.', 100, 45000, 'palco-der'),
(106, 116, 'Balcón', 100, 20000, 'balcon'),
(106, 117, 'Galería', 100, 12000, 'galeria'),
(107, 112, 'Palco Izq.', 100, 75000, 'palco-izq'),
(107, 113, 'Platea Baja', 100, 63333, 'platea-baja'),
(107, 114, 'Platea Alta', 100, 46667, 'platea-alta'),
(107, 115, 'Palco Der.', 100, 75000, 'palco-der'),
(107, 116, 'Balcón', 100, 33333, 'balcon'),
(107, 117, 'Galería', 100, 20000, 'galeria'),
(108, 106, 'Lateral Izq.', 100, 46222, 'lateral-izq'),
(108, 107, 'Cancha', 100, 124444, 'cancha'),
(108, 108, 'Platea Preferencial', 100, 92444, 'platea-preferencial'),
(108, 109, 'Tribuna Central', 100, 60444, 'tribuna-central'),
(108, 110, 'Lateral Der.', 100, 46222, 'lateral-der'),
(108, 111, 'Tribuna Superior', 100, 32000, 'tribuna-superior'),
(109, 118, 'Palco Izq.', 100, 67500, 'palco-izq'),
(109, 119, 'Platea Baja', 100, 57000, 'platea-baja'),
(109, 120, 'Platea Alta', 100, 42000, 'platea-alta'),
(109, 121, 'Palco Der.', 100, 67500, 'palco-der'),
(109, 122, 'Balcón', 100, 30000, 'balcon'),
(109, 123, 'Galería', 100, 18000, 'galeria'),
(110, 101, 'Tribuna Andes', 100, 28636, 'tribuna-andes'),
(110, 102, 'Cancha Preferencial', 100, 69545, 'cancha-preferencial'),
(110, 103, 'Cancha General', 100, 36818, 'cancha-general'),
(110, 104, 'Galería Sur', 100, 18000, 'galeria-sur'),
(110, 105, 'Tribuna Pacífico', 100, 28636, 'tribuna-pacifico'),
(111, 101, 'Tribuna Andes', 100, 22273, 'tribuna-andes'),
(111, 102, 'Cancha Preferencial', 100, 54091, 'cancha-preferencial'),
(111, 103, 'Cancha General', 100, 28636, 'cancha-general'),
(111, 104, 'Galería Sur', 100, 14000, 'galeria-sur'),
(111, 105, 'Tribuna Pacífico', 100, 22273, 'tribuna-pacifico'),
(112, 101, 'Tribuna Andes', 100, 35000, 'tribuna-andes'),
(112, 102, 'Cancha Preferencial', 100, 85000, 'cancha-preferencial'),
(112, 103, 'Cancha General', 100, 45000, 'cancha-general'),
(112, 104, 'Galería Sur', 100, 22000, 'galeria-sur'),
(112, 105, 'Tribuna Pacífico', 100, 35000, 'tribuna-pacifico'),
(113, 124, 'Tribuna Andes', 100, 14318, 'tribuna-andes'),
(113, 125, 'Cancha Preferencial', 100, 34773, 'cancha-preferencial'),
(113, 126, 'Cancha General', 100, 18409, 'cancha-general'),
(113, 127, 'Galería Sur', 100, 9000, 'galeria-sur'),
(113, 128, 'Tribuna Pacífico', 100, 14318, 'tribuna-pacifico'),
(114, 129, 'Pabellón A', 100, 24000, 'pabellon-a'),
(114, 130, 'Pabellón B', 100, 24000, 'pabellon-b'),
(114, 131, 'Zona Exterior · Food', 100, 15000, 'zona-exterior'),
(114, 132, 'Acceso VIP · Pase de día', 100, 45000, 'acceso-vip'),
(114, 133, 'Entrada General', 100, 30000, 'entrada-general'),
(115, 129, 'Pabellón A', 100, 12800, 'pabellon-a'),
(115, 130, 'Pabellón B', 100, 12800, 'pabellon-b'),
(115, 131, 'Zona Exterior · Food', 100, 8000, 'zona-exterior'),
(115, 132, 'Acceso VIP · Pase de día', 100, 24000, 'acceso-vip'),
(115, 133, 'Entrada General', 100, 16000, 'entrada-general'),
(116, 129, 'Pabellón A', 100, 8000, 'pabellon-a'),
(116, 130, 'Pabellón B', 100, 8000, 'pabellon-b'),
(116, 131, 'Zona Exterior · Food', 100, 5000, 'zona-exterior'),
(116, 132, 'Acceso VIP · Pase de día', 100, 15000, 'acceso-vip'),
(116, 133, 'Entrada General', 100, 10000, 'entrada-general'),
(117, 134, 'Pabellón A', 100, 9600, 'pabellon-a'),
(117, 135, 'Pabellón B', 100, 9600, 'pabellon-b'),
(117, 136, 'Zona Exterior · Food', 100, 6000, 'zona-exterior'),
(117, 137, 'Acceso VIP · Pase de día', 100, 18000, 'acceso-vip'),
(117, 138, 'Entrada General', 100, 12000, 'entrada-general');
UPDATE evento e SET aforo_evento=(SELECT SUM(s.capacidad) FROM evento_sector s WHERE s.evento_id=e.id_evento), precio_desde=(SELECT MIN(s.precio) FROM evento_sector s WHERE s.evento_id=e.id_evento AND s.capacidad>0);
