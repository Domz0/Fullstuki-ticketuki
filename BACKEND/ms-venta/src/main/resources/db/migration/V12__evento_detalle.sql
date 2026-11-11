ALTER TABLE detalle_venta ADD COLUMN evento_id_evento BIGINT NULL;
CREATE INDEX idx_detalle_evento_sector ON detalle_venta(evento_id_evento, sector_id_sector);
