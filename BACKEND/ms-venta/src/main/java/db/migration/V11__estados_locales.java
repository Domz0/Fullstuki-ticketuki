package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import java.sql.*;
import java.text.Normalizer;
import java.util.*;

public class V11__estados_locales extends BaseJavaMigration {
    private static final List<String> NOMBRES = List.of("PENDIENTE", "CONFIRMADA", "CANCELADA", "REEMBOLSADA", "ANULADA");

    @Override
    public boolean canExecuteInTransaction() { return false; }

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        Map<Long, String> estados = new LinkedHashMap<>();
        boolean catalogo;
        try (var query = connection.prepareStatement(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'estado_service' AND table_name = 'estado_venta'");
             var rows = query.executeQuery()) {
            rows.next();
            catalogo = rows.getInt(1) > 0;
        }
        if (catalogo) {
            try (var query = connection.createStatement();
                 var rows = query.executeQuery("SELECT id_estado_venta, nombre_estado_venta FROM estado_service.estado_venta")) {
                while (rows.next()) estados.put(rows.getLong(1), normalizar(rows.getString(2)));
            }
        } else {
            for (int i = 0; i < NOMBRES.size(); i++) estados.put((long) i + 1, NOMBRES.get(i));
        }
        try (var query = connection.createStatement();
             var rows = query.executeQuery("SELECT DISTINCT estado_venta_id_estado FROM venta WHERE estado_venta_id_estado IS NOT NULL")) {
            while (rows.next()) {
                Long id = rows.getLong(1);
                if (estados.get(id) == null || !NOMBRES.contains(estados.get(id)))
                    throw new SQLException("Estado de venta sin equivalencia: " + id + ". Revisar estado_service antes de migrar.");
            }
        }
        try (var query = connection.createStatement()) {
            query.execute("ALTER TABLE venta ADD COLUMN IF NOT EXISTS estado VARCHAR(25) NULL");
        }
        try (var update = connection.prepareStatement(
                "UPDATE venta SET estado = ? WHERE estado_venta_id_estado = ? AND estado IS NULL")) {
            for (var entry : estados.entrySet()) {
                if (!NOMBRES.contains(entry.getValue())) continue;
                update.setString(1, entry.getValue());
                update.setLong(2, entry.getKey());
                update.addBatch();
            }
            update.executeBatch();
        }
        try (var query = connection.createStatement()) {
            query.execute("CREATE INDEX IF NOT EXISTS idx_venta_estado_local ON venta (estado)");
        }
    }

    static String normalizar(String nombre) {
        if (nombre == null) return "";
        String valor = Normalizer.normalize(nombre, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").trim().toUpperCase(Locale.ROOT);
        return valor.equals("EN VENTA") ? "DISPONIBLE" : valor;
    }
}
