package db.migration;

import org.flywaydb.core.api.migration.Context;
import org.junit.jupiter.api.Test;
import java.sql.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.assertj.core.api.Assertions.*;

class V10PromocionesTest {
    @Test
    void copiaPromocionesConservandoIdsYProtegeReferencias() throws Exception {
        Connection connection = mock(Connection.class);
        Context context = mock(Context.class);
        when(context.getConnection()).thenReturn(connection);
        PreparedStatement catalogo = mock(PreparedStatement.class);
        ResultSet tablas = mock(ResultSet.class);
        when(connection.prepareStatement(anyString())).thenReturn(catalogo);
        when(catalogo.executeQuery()).thenReturn(tablas);
        when(tablas.getInt(1)).thenReturn(1);
        Statement statement = mock(Statement.class);
        ResultSet huerfanos = mock(ResultSet.class);
        when(connection.createStatement()).thenReturn(statement);
        when(statement.executeQuery(anyString())).thenReturn(huerfanos);
        when(huerfanos.getLong(1)).thenReturn(0L);
        new V10__integrar_promociones().migrate(context);
        verify(statement).executeUpdate(argThat(sql -> sql.contains("INSERT INTO promocion (id_promocion")
                && sql.contains("FROM promocion_service.promocion")));
        verify(statement).execute(contains("FOREIGN KEY (promocion_id)"));
        verify(statement, never()).execute(contains("DROP"));
    }

    @Test
    void referenciasSinRespaldoDetienenMigracion() throws Exception {
        Connection connection = mock(Connection.class);
        Context context = mock(Context.class);
        when(context.getConnection()).thenReturn(connection);
        PreparedStatement catalogo = mock(PreparedStatement.class);
        ResultSet tablas = mock(ResultSet.class);
        when(connection.prepareStatement(anyString())).thenReturn(catalogo);
        when(catalogo.executeQuery()).thenReturn(tablas);
        when(tablas.getInt(1)).thenReturn(0);
        Statement statement = mock(Statement.class);
        ResultSet huerfanos = mock(ResultSet.class);
        when(connection.createStatement()).thenReturn(statement);
        when(statement.executeQuery(anyString())).thenReturn(huerfanos);
        when(huerfanos.getLong(1)).thenReturn(1L);
        assertThatThrownBy(() -> new V10__integrar_promociones().migrate(context))
                .isInstanceOf(SQLException.class).hasMessageContaining("sin respaldo");
        verify(statement, never()).execute(anyString());
    }
}
