package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import java.sql.*;

public class V10__integrar_promociones extends BaseJavaMigration {
    @Override
    public boolean canExecuteInTransaction() { return false; }

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        boolean origen;
        try (var query = connection.prepareStatement(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'promocion_service' AND table_name = 'promocion'");
             var rows = query.executeQuery()) {
            rows.next();
            origen = rows.getInt(1) > 0;
        }
        String huerfanos = origen
                ? "SELECT COUNT(*) FROM detalle_venta d LEFT JOIN promocion_service.promocion p ON p.id_promocion = d.promocion_id WHERE d.promocion_id IS NOT NULL AND p.id_promocion IS NULL"
                : "SELECT COUNT(*) FROM detalle_venta WHERE promocion_id IS NOT NULL";
        try (var query = connection.createStatement(); var rows = query.executeQuery(huerfanos)) {
            rows.next();
            if (rows.getLong(1) > 0)
                throw new SQLException("Hay detalles con promociones sin respaldo. Restaurar promocion_service antes de migrar.");
        }
        try (var query = connection.createStatement()) {
            query.execute("""
                    CREATE TABLE promocion (
                        id_promocion BIGINT AUTO_INCREMENT PRIMARY KEY,
                        empresa VARCHAR(100) NOT NULL,
                        descuento INT NOT NULL,
                        descripcion VARCHAR(255) NOT NULL,
                        restriccion VARCHAR(255) NOT NULL,
                        fecha_expiracion DATE NOT NULL,
                        fecha_inicio DATE NOT NULL,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                    """);
            if (origen) {
                query.executeUpdate("""
                        INSERT INTO promocion (id_promocion, empresa, descuento, descripcion, restriccion,
                            fecha_expiracion, fecha_inicio, created_at, updated_at)
                        SELECT id_promocion, empresa, descuento, descripcion, restriccion,
                            fecha_expiracion, fecha_inicio, created_at, updated_at
                        FROM promocion_service.promocion
                        """);
            }
            query.execute("ALTER TABLE detalle_venta ADD CONSTRAINT fk_detalle_promocion FOREIGN KEY (promocion_id) REFERENCES promocion(id_promocion)");
        }
    }
}
