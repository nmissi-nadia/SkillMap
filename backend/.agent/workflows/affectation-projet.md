---
description: Affectation à un projet
---

# Workflow : Affectation à un projet

**Acteur** : Chef de Projet

## Étapes

1. **Sélection employé**
   - Le chef de projet sélectionne un employé pour le projet
   - Sélection basée sur :
     - Les recommandations du système de matching
     - Une recherche manuelle
     - Une demande spécifique

2. **Affectation au projet**
   - Le chef de projet affecte officiellement l'employé au projet
   - Définition de la période d'affectation (date début - date fin)
   - Définition du taux d'allocation (% du temps de travail)

3. **Définition rôle**
   - Attribution d'un rôle spécifique dans le projet :
     - Développeur
     - Architecte
     - Testeur
     - Analyste
     - Scrum Master
     - etc.
   - Définition des responsabilités associées

4. **Notification employé**
   - L'employé reçoit une notification de son affectation
   - La notification contient :
     - Nom du projet
     - Rôle assigné
     - Date de début
     - Taux d'allocation
     - Chef de projet
   - L'employé peut accepter ou demander des clarifications

## Inclus

### AuditLog
- Enregistrement de toutes les affectations
- Traçabilité : qui a affecté qui, quand, sur quel projet, avec quel rôle
- Historique des modifications d'affectation

### Mise à jour charge employé
- Calcul automatique de la charge de travail de l'employé
- Mise à jour de la disponibilité (% temps libre)
- Alertes si surcharge (allocation > 100%)
- Visibilité sur la répartition du temps entre projets

### Monitoring projets sous-staffés
- Identification des projets manquant de ressources
- Alertes pour les compétences critiques non pourvues
- Tableau de bord du staffing par projet
- Prévisions de disponibilité des ressources
