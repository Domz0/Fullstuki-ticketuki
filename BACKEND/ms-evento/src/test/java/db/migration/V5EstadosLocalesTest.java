package db.migration;

import org.flywaydb.core.api.migration.Context;
import org.junit.jupiter.api.Test;
import java.sql.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.assertj.core.api.Assertions.*;

class V5EstadosLocalesTest {
    @Test
    void convierteIdPersonalizadoPorNombre() throws Exception {
        Context context = mock(Context.class);
        Connection connection = mock(Connection.class);
        when(context.getConnection()).thenReturn(connection);
        PreparedStatement existence = mock(PreparedStatement.class);
        ResultSet count = mock(ResultSet.class);
        when(connection.prepareStatement(startsWith("SELECT COUNT"))).thenReturn(existence);
        when(existence.executeQuery()).thenReturn(count);
        when(count.getInt(1)).thenReturn(1);
        Statement statement = mock(Statement.class);
        when(connection.createStatement()).thenReturn(statement);
        ResultSet source = mock(ResultSet.class);
        when(statement.executeQuery(startsWith("SELECT id_estado"))).thenReturn(source);
        when(source.next()).thenReturn(true, false);
        when(source.getLong(1)).thenReturn(37L);
        when(source.getString(2)).thenReturn("agendado");
        ResultSet references = mock(ResultSet.class);
        when(statement.executeQuery(startsWith("SELECT DISTINCT"))).thenReturn(references);
        when(references.next()).thenReturn(true, false);
        when(references.getLong(1)).thenReturn(37L);
        PreparedStatement update = mock(PreparedStatement.class);
        when(connection.prepareStatement(startsWith("UPDATE"))).thenReturn(update);
        new V5__estados_locales().migrate(context);
        verify(update).setString(1, "AGENDADO");
        verify(update).setLong(2, 37L);
        verify(update).executeBatch();
    }

    @Test
    void estadoSinEquivalenciaDetieneMigracionAntesDeAlterarTabla() throws Exception {
        Context context = mock(Context.class);
        Connection connection = mock(Connection.class);
        when(context.getConnection()).thenReturn(connection);
        PreparedStatement existence = mock(PreparedStatement.class);
        ResultSet count = mock(ResultSet.class);
        when(connection.prepareStatement(anyString())).thenReturn(existence);
        when(existence.executeQuery()).thenReturn(count);
        when(count.getInt(1)).thenReturn(0);
        Statement statement = mock(Statement.class);
        when(connection.createStatement()).thenReturn(statement);
        ResultSet references = mock(ResultSet.class);
        when(statement.executeQuery(anyString())).thenReturn(references);
        when(references.next()).thenReturn(true, false);
        when(references.getLong(1)).thenReturn(99L);
        assertThatThrownBy(() -> new V5__estados_locales().migrate(context))
                .isInstanceOf(SQLException.class).hasMessageContaining("sin equivalencia");
        verify(statement, never()).execute(anyString());
    }
}
