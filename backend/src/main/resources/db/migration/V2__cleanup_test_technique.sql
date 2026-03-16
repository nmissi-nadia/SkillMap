-- Migration V2: Suppression des colonnes parasites de test_technique
-- Ces colonnes appartiennent à test_employe et non à test_technique

DO $$
BEGIN
    -- Supprimer la colonne 'score' si elle existe sur test_technique
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'test_technique'
          AND column_name = 'score'
    ) THEN
        ALTER TABLE test_technique DROP COLUMN score;
    END IF;
END $$;
