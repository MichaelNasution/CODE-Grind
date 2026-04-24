 package util;

        import java.sql.Connection;
        import java.sql.DriverManager;
        import java.sql.SQLException;

        public class DatabaseUtil {
            private static final String JDBC_URL = "jdbc:mysql://localhost:3306/perpustakaan_db?useSSL=false&serverTimezone=UTC";
            private static final String USER = "root"; // Sesuaikan user DB
            private static final String PASSWORD = "password"; // Sesuaikan password DB

            public static Connection getConnection() throws SQLException {
                return DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
            }

            public static void closeConnection(Connection conn) {
                if (conn != null) {
                    try {
                        conn.close();
                    } catch (SQLException e) {
                        System.err.println("Error closing connection: " + e.getMessage());
                    }
                }
            }
            // Tambahkan method untuk executeUpdate atau executeQuery
        }
        