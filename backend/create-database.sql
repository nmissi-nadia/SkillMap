-- Script pour créer la base de données skilldb si elle n'existe pas
-- Exécutez ce script avec PostgreSQL en tant qu'utilisateur postgres

-- Se connecter à la base de données par défaut
\c postgres

-- Créer la base de données si elle n'existe pas
SELECT 'CREATE DATABASE skilldb'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'skilldb')\gexec

-- Se connecter à skilldb
\c skilldb

-- Vérifier que la connexion est établie
SELECT current_database();
