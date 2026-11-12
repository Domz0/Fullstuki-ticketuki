CREATE TABLE evento (
    id_evento BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_evento VARCHAR(100) NOT NULL,
    aforo_evento INTEGER NOT NULL,
    fecha_evento DATE NOT NULL,
    descripcion VARCHAR(500) NULL,
    participantes VARCHAR(500) NULL,
    estado VARCHAR(25) NULL,
    estado_evento_id_estado BIGINT,
    recinto_id_recinto BIGINT,
    INDEX idx_evento_estado_local (estado),
    INDEX idx_estado (estado_evento_id_estado),
    INDEX idx_recinto (recinto_id_recinto)
);

INSERT INTO evento (id_evento, nombre_evento, aforo_evento, fecha_evento, descripcion, estado_evento_id_estado, recinto_id_recinto, estado) VALUES
(1, 'Gorillaz The Mountain Tour', 100, '2026-06-15',
 'La icónica banda virtual británica Gorillaz llega con su esperado tour mundial. Una experiencia audiovisual única que combina música alternativa, hip-hop y arte digital con sus personajes animados en pantallas gigantes.',
 2, 1, 'DISPONIBLE'),

(2, 'Metallica 72 Seasons World Tour', 70, '2026-07-15',
 'Los reyes del heavy metal regresan con su gira mundial 72 Seasons. Más de cuatro décadas de carrera resumidas en un show de más de tres horas con pirotecnia, efectos especiales y los clásicos que los llevaron a la cima del metal.',
 1, 2, 'AGENDADO'),

(3, 'Daft Punk Alive 2026', 70, '2026-08-20',
 'El dúo de música electrónica más influyente de la historia vuelve a los escenarios con su icónica pirámide de luces LED. Una noche épica de electronic house, disco y funk que promete ser el evento del año.',
 1, 2, 'AGENDADO'),

(4, 'Justice Woman Worldwide Tour', 50, '2026-09-10',
 'El dúo francés de electrónica Justice presenta su gira Woman Worldwide, un espectáculo de sonido e iluminación diseñado para hacer vibrar cada rincón del recinto. Cross, Audio Video Disco y sus mejores hits en una sola noche.',
 1, 3, 'AGENDADO');

CREATE TABLE auditoria_pendiente (
    id VARCHAR(36) PRIMARY KEY,
    payload TEXT NOT NULL,
    creado DATETIME(6) NOT NULL,
    enviado DATETIME(6) NULL,
    INDEX ix_auditoria_envio (enviado, creado)
);
