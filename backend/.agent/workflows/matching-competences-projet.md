---
description: Matching automatique compétences ↔ projet
---

# Workflow : Matching automatique compétences ↔ projet

**Acteur** : Système

## Étapes

1. **Analyse besoins projet**
   - Le système récupère les compétences requises pour le projet
   - Identification des niveaux requis pour chaque compétence
   - Prise en compte du nombre de personnes nécessaires

2. **Analyse compétences disponibles**
   - Le système analyse les compétences de tous les employés
   - Filtrage selon :
     - Disponibilité de l'employé
     - Charge de travail actuelle
     - Compétences correspondantes
     - Niveau de compétence

3. **Calcul score de matching**
   - Pour chaque employé, calcul d'un score de matching (0-100%)
   - Critères de calcul :
     - **Adéquation des compétences** (40%) : Correspondance entre compétences requises et possédées
     - **Niveau de compétence** (30%) : Niveau de l'employé vs niveau requis
     - **Disponibilité** (20%) : Charge de travail actuelle de l'employé
     - **Expérience projets similaires** (10%) : Historique de projets comparables

4. **Proposition d'employés**
   - Le système génère une liste d'employés recommandés
   - Classement par score de matching décroissant
   - Affichage des détails pour chaque candidat :
     - Score global
     - Détail des compétences matchées
     - Disponibilité
     - Projets en cours

5. **Validation chef de projet**
   - Le chef de projet examine les recommandations
   - Il peut :
     - Accepter les propositions
     - Affiner les critères de recherche
     - Rechercher manuellement d'autres employés
   - Sélection finale des employés à affecter

## Inclus

### Historique décisions
- Conservation de toutes les recommandations générées
- Suivi des employés sélectionnés vs recommandés
- Analyse des raisons de non-sélection

### Analytics adéquation
- Taux de matching moyen par projet
- Identification des compétences rares ou manquantes
- Prédiction des besoins futurs en compétences
- ROI du matching automatique (gain de temps, qualité des affectations)

## Valeur métier

👉 **Point fort marché** : Le matching intelligent différencie SkillMap des solutions concurrentes en automatisant l'affectation optimale des ressources, réduisant le temps de staffing et améliorant la qualité des équipes projet.
