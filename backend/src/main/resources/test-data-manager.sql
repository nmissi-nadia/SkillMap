-- ========================================
-- Script de Test - Données Manager
-- ========================================
-- Ce script crée un manager avec son équipe et des auto-évaluations en attente

-- ========================================
-- 1. NETTOYAGE (optionnel)
-- ========================================
-- Décommenter si vous voulez repartir de zéro

-- DELETE FROM competence_employe;
-- DELETE FROM employe WHERE id IN (SELECT id FROM utilisateurs WHERE email LIKE '%@test.com');
-- DELETE FROM manager WHERE id IN (SELECT id FROM utilisateurs WHERE email = 'manager@test.com');
-- DELETE FROM utilisateurs WHERE email LIKE '%@test.com';

-- ========================================
-- 2. CRÉER LE MANAGER
-- ========================================

-- Créer l'utilisateur Manager
INSERT INTO utilisateurs (id, email, nom, prenom, password, role, provider, enabled, date_creation)
VALUES (
    gen_random_uuid()::text,
    'manager@test.com',
    'Dupont',
    'Marie',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- password: "password123"
    'MANAGER',
    'LOCAL',
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Créer l'entrée Manager
INSERT INTO manager (id, departement_responsable)
SELECT id, 'Développement'
FROM utilisateurs
WHERE email = 'manager@test.com'
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 3. CRÉER L'ÉQUIPE (3 employés)
-- ========================================

-- Employé 1: Jean Martin (Senior, Disponible)
INSERT INTO utilisateurs (id, email, nom, prenom, password, role, provider, enabled, date_creation)
VALUES (
    gen_random_uuid()::text,
    'jean.martin@test.com',
    'Martin',
    'Jean',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'EMPLOYE',
    'LOCAL',
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO employe (id, matricule, poste, departement, date_embauche, niveau_experience, disponibilite, manager_id)
SELECT 
    u.id,
    'EMP001',
    'Développeur Full Stack',
    'Développement',
    NOW() - INTERVAL '2 years',
    'Senior',
    true,
    m.id
FROM utilisateurs u
CROSS JOIN manager m
WHERE u.email = 'jean.martin@test.com'
  AND m.id IN (SELECT id FROM utilisateurs WHERE email = 'manager@test.com')
ON CONFLICT (id) DO NOTHING;

-- Employé 2: Sophie Dubois (Confirmé, Disponible)
INSERT INTO utilisateurs (id, email, nom, prenom, password, role, provider, enabled, date_creation)
VALUES (
    gen_random_uuid()::text,
    'sophie.dubois@test.com',
    'Dubois',
    'Sophie',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'EMPLOYE',
    'LOCAL',
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO employe (id, matricule, poste, departement, date_embauche, niveau_experience, disponibilite, manager_id)
SELECT 
    u.id,
    'EMP002',
    'Développeur Frontend',
    'Développement',
    NOW() - INTERVAL '1 year',
    'Confirmé',
    true,
    m.id
FROM utilisateurs u
CROSS JOIN manager m
WHERE u.email = 'sophie.dubois@test.com'
  AND m.id IN (SELECT id FROM utilisateurs WHERE email = 'manager@test.com')
ON CONFLICT (id) DO NOTHING;

-- Employé 3: Pierre Leroy (Junior, Non disponible)
INSERT INTO utilisateurs (id, email, nom, prenom, password, role, provider, enabled, date_creation)
VALUES (
    gen_random_uuid()::text,
    'pierre.leroy@test.com',
    'Leroy',
    'Pierre',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'EMPLOYE',
    'LOCAL',
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO employe (id, matricule, poste, departement, date_embauche, niveau_experience, disponibilite, manager_id)
SELECT 
    u.id,
    'EMP003',
    'Développeur Backend',
    'Développement',
    NOW() - INTERVAL '6 months',
    'Junior',
    false,
    m.id
FROM utilisateurs u
CROSS JOIN manager m
WHERE u.email = 'pierre.leroy@test.com'
  AND m.id IN (SELECT id FROM utilisateurs WHERE email = 'manager@test.com')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 4. CRÉER DES COMPÉTENCES
-- ========================================

INSERT INTO competence (id, nom, categorie, description)
VALUES 
    (gen_random_uuid()::text, 'Angular', 'Frontend', 'Framework JavaScript moderne'),
    (gen_random_uuid()::text, 'Spring Boot', 'Backend', 'Framework Java pour microservices'),
    (gen_random_uuid()::text, 'Docker', 'DevOps', 'Conteneurisation d''applications'),
    (gen_random_uuid()::text, 'PostgreSQL', 'Database', 'Base de données relationnelle'),
    (gen_random_uuid()::text, 'TypeScript', 'Frontend', 'Superset typé de JavaScript')
ON CONFLICT (nom) DO NOTHING;

-- ========================================
-- 5. CRÉER DES AUTO-ÉVALUATIONS EN ATTENTE
-- ========================================

-- Auto-évaluation 1: Jean Martin - Angular (Niveau 4 - Maîtrise)
INSERT INTO competence_employe (id, niveau_auto, niveau_manager, date_evaluation, commentaire, employe_id, competence_id)
SELECT 
    gen_random_uuid()::text,
    4,  -- Auto-évaluation: Maîtrise
    0,  -- Manager: Non évalué (EN ATTENTE)
    NOW(),
    'J''ai 2 ans d''expérience sur Angular. Je maîtrise les concepts avancés comme RxJS, les Signals, et l''architecture modulaire.',
    e.id,
    c.id
FROM employe e
CROSS JOIN competence c
WHERE e.id IN (SELECT id FROM utilisateurs WHERE email = 'jean.martin@test.com')
  AND c.nom = 'Angular'
  AND NOT EXISTS (
      SELECT 1 FROM competence_employe ce 
      WHERE ce.employe_id = e.id AND ce.competence_id = c.id
  );

-- Auto-évaluation 2: Sophie Dubois - TypeScript (Niveau 5 - Expert)
INSERT INTO competence_employe (id, niveau_auto, niveau_manager, date_evaluation, commentaire, employe_id, competence_id)
SELECT 
    gen_random_uuid()::text,
    5,  -- Auto-évaluation: Expert
    0,  -- Manager: Non évalué
    NOW(),
    'Utilisation quotidienne de TypeScript depuis 3 ans. Je forme les nouveaux développeurs et contribue aux bonnes pratiques de l''équipe.',
    e.id,
    c.id
FROM employe e
CROSS JOIN competence c
WHERE e.id IN (SELECT id FROM utilisateurs WHERE email = 'sophie.dubois@test.com')
  AND c.nom = 'TypeScript'
  AND NOT EXISTS (
      SELECT 1 FROM competence_employe ce 
      WHERE ce.employe_id = e.id AND ce.competence_id = c.id
  );

-- Auto-évaluation 3: Pierre Leroy - Spring Boot (Niveau 2 - Notions)
INSERT INTO competence_employe (id, niveau_auto, niveau_manager, date_evaluation, commentaire, employe_id, competence_id)
SELECT 
    gen_random_uuid()::text,
    2,  -- Auto-évaluation: Notions
    0,  -- Manager: Non évalué
    NOW(),
    'Je débute avec Spring Boot. J''ai suivi une formation et réalisé un petit projet personnel. J''ai besoin d''accompagnement.',
    e.id,
    c.id
FROM employe e
CROSS JOIN competence c
WHERE e.id IN (SELECT id FROM utilisateurs WHERE email = 'pierre.leroy@test.com')
  AND c.nom = 'Spring Boot'
  AND NOT EXISTS (
      SELECT 1 FROM competence_employe ce 
      WHERE ce.employe_id = e.id AND ce.competence_id = c.id
  );

-- Auto-évaluation 4: Jean Martin - Docker (Niveau 3 - Autonome)
INSERT INTO competence_employe (id, niveau_auto, niveau_manager, date_evaluation, commentaire, employe_id, competence_id)
SELECT 
    gen_random_uuid()::text,
    3,  -- Auto-évaluation: Autonome
    0,  -- Manager: Non évalué
    NOW(),
    'Je sais créer des Dockerfiles et utiliser docker-compose pour mes projets.',
    e.id,
    c.id
FROM employe e
CROSS JOIN competence c
WHERE e.id IN (SELECT id FROM utilisateurs WHERE email = 'jean.martin@test.com')
  AND c.nom = 'Docker'
  AND NOT EXISTS (
      SELECT 1 FROM competence_employe ce 
      WHERE ce.employe_id = e.id AND ce.competence_id = c.id
  );

-- ========================================
-- 6. VÉRIFICATIONS
-- ========================================

-- Vérifier le manager créé
SELECT 'MANAGER:' as type, u.email, u.nom, u.prenom, u.role, m.departement_responsable
FROM utilisateurs u
JOIN manager m ON u.id = m.id
WHERE u.email = 'manager@test.com';

-- Vérifier l'équipe
SELECT 'ÉQUIPE:' as type, u.email, u.nom, u.prenom, e.poste, e.niveau_experience, e.disponibilite
FROM utilisateurs u
JOIN employe e ON u.id = e.id
WHERE e.manager_id IN (SELECT id FROM utilisateurs WHERE email = 'manager@test.com')
ORDER BY u.nom;

-- Vérifier les auto-évaluations en attente
SELECT 
    'ÉVALUATIONS EN ATTENTE:' as type,
    u.nom || ' ' || u.prenom as employe,
    c.nom as competence,
    ce.niveau_auto,
    ce.niveau_manager,
    ce.commentaire
FROM competence_employe ce
JOIN employe e ON ce.employe_id = e.id
JOIN utilisateurs u ON e.id = u.id
JOIN competence c ON ce.competence_id = c.id
WHERE e.manager_id IN (SELECT id FROM utilisateurs WHERE email = 'manager@test.com')
  AND ce.niveau_manager = 0
ORDER BY u.nom, c.nom;

-- ========================================
-- RÉSUMÉ
-- ========================================
-- ✅ Manager créé: manager@test.com (password: password123)
-- ✅ 3 employés créés dans l'équipe
-- ✅ 5 compétences créées
-- ✅ 4 auto-évaluations en attente de validation
--
-- PROCHAINES ÉTAPES:
-- 1. Démarrer le backend: mvn spring-boot:run
-- 2. Démarrer le frontend: npm start
-- 3. Se connecter avec manager@test.com / password123
-- 4. Tester les fonctionnalités manager!
-- ========================================
