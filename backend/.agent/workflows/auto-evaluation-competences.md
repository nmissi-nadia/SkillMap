---
description: Auto-évaluation des compétences
---

# Workflow : Auto-évaluation des compétences

**Acteur** : Employé

## Étapes

1. **Sélection d'une compétence**
   - L'employé accède à son interface d'auto-évaluation
   - Il sélectionne une compétence parmi celles présentes dans son profil
   - Il peut également sélectionner une compétence à partir d'un référentiel de compétences

2. **Auto-évaluation (niveau 1–5)**
   - L'employé évalue son niveau de maîtrise de la compétence sur une échelle de 1 à 5
   - Échelle de notation :
     - 1 : Débutant
     - 2 : Élémentaire
     - 3 : Intermédiaire
     - 4 : Avancé
     - 5 : Expert
   - Le système affiche des descriptions pour chaque niveau pour guider l'évaluation

3. **Ajout commentaire**
   - L'employé peut ajouter un commentaire pour justifier son auto-évaluation
   - Le commentaire peut inclure des exemples concrets, des projets réalisés, ou des formations suivies
   - Ce champ est optionnel mais recommandé

4. **Soumission**
   - L'employé valide et soumet son auto-évaluation
   - Le système enregistre l'évaluation avec la date et l'heure de soumission

## Inclus

### AuditLog
- Chaque auto-évaluation est enregistrée dans l'audit log
- L'audit log contient : employé, compétence, niveau évalué, date/heure, commentaire
- Traçabilité complète de toutes les auto-évaluations

### Notification au manager
- Une notification est automatiquement envoyée au manager de l'employé
- Le manager est informé de la nouvelle auto-évaluation soumise
- La notification contient : nom de l'employé, compétence évaluée, niveau auto-évalué

### Indicateur "en attente de validation"
- L'auto-évaluation est marquée avec le statut "en attente de validation"
- Ce statut est visible par l'employé et le manager
- Le manager peut ensuite valider, ajuster ou commenter l'auto-évaluation
- Le statut change une fois que le manager a traité l'évaluation
