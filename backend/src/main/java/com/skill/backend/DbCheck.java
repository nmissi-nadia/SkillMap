package com.skill.backend;

import java.sql.*;
import java.util.Properties;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/skilldb";
        Properties props = new Properties();
        props.setProperty("user", "postgres");
        props.setProperty("password", "ycode");
        
        try (Connection conn = DriverManager.getConnection(url, props)) {
            System.out.println("--- test_technique columns ---");
            DatabaseMetaData metaData = conn.getMetaData();
            try (ResultSet rs = metaData.getColumns(null, null, "test_technique", null)) {
                while (rs.next()) {
                    System.out.println(rs.getString("COLUMN_NAME") + " : " + rs.getString("TYPE_NAME"));
                }
            }
            
            System.out.println("\n--- question columns ---");
            try (ResultSet rs = metaData.getColumns(null, null, "question", null)) {
                while (rs.next()) {
                    System.out.println(rs.getString("COLUMN_NAME") + " : " + rs.getString("TYPE_NAME"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
