CREATE TABLE cupo_evento (
    evento_id BIGINT PRIMARY KEY
);
ALTER TABLE ticket DROP INDEX uq_asiento_evento_sector;
ALTER TABLE ticket ADD COLUMN asiento_activo INT
    GENERATED ALWAYS AS (CASE WHEN estado = 'CANCELADO' THEN NULL ELSE num_asiento END) STORED;
CREATE UNIQUE INDEX uq_asiento_activo ON ticket(evento_id_evento, sector_id_sector, asiento_activo);
