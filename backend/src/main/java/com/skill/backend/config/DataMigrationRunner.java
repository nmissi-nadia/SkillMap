package com.skill.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Migration de données exécutée au démarrage de l'application.
 * Nettoie les colonnes parasites laissées par d'anciennes versions de l'entité.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataMigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        removeObsoleteColumns();
    }

    /**
     * Supprime la colonne 'score' de test_technique si elle existe.
     * Cette colonne appartient à test_employe et non à test_technique.
     */
    private void removeObsoleteColumns() {
        try {
            // Vérifier si la colonne 'score' existe dans test_technique
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns " +
                "WHERE table_name = 'test_technique' AND column_name = 'score'",
                Integer.class
            );

            if (count != null && count > 0) {
                jdbcTemplate.execute("ALTER TABLE test_technique DROP COLUMN score");
                log.info("✅ Migration: colonne 'score' supprimée de test_technique");
            } else {
                log.debug("ℹ️ Migration: colonne 'score' absente de test_technique, rien à faire");
            }
        } catch (Exception e) {
            log.warn("⚠️ Migration DataMigrationRunner: impossible de nettoyer test_technique - {}", e.getMessage());
        }
    }
}
