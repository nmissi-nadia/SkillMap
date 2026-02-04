-- ============================================
-- Script de création du premier utilisateur RH
-- ============================================

-- 1. Créer l'utilisateur dans la table utilisateurs
INSERT INTO utilisateurs (id, email, password, nom, prenom, role, provider, enabled, date_creation)
VALUES (
    'rh-admin-001',
    'rh@skillmap.com',
    '$2a$10$YourBcryptHashedPasswordHere', -- Remplacer par le hash BCrypt de votre mot de passe
    'Admin',
    'RH',
    'RH',
    'LOCAL',
    true,
    CURRENT_TIMESTAMP
);

-- 2. Créer l'entrée RH correspondante
INSERT INTO rh (id, service)
VALUES (
    'rh-admin-001',
    'Ressources Humaines'
);

-- ============================================
-- Vérification
-- ============================================

-- Vérifier la création
SELECT 
    u.id,
    u.email,
    u.nom,
    u.prenom,
    u.role,
    r.service
FROM utilisateurs u
LEFT JOIN rh r ON u.id = r.id
WHERE u.role = 'RH';

-- ============================================
-- Note: Pour générer un hash BCrypt du mot de passe
-- ============================================
-- Vous pouvez utiliser un outil en ligne ou ce code Java:
-- BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
-- String hashedPassword = encoder.encode("votre_mot_de_passe");
-- 
-- Exemple pour le mot de passe "RH@2024":
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
