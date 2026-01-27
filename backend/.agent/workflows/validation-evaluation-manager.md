---
description: Validation & évaluation manager
---

# Workflow : Validation & évaluation manager

**Acteur** : Manager

## Étapes

1. **Réception notification**
   - Le manager reçoit une notification lorsqu'un employé soumet une auto-évaluation
   - La notification contient le nom de l'employé et la compétence évaluée

2. **Consultation auto-évaluation**
   - Le manager accède à l'interface d'évaluation
   - Il consulte l'auto-évaluation de l'employé (niveau 1-5 et commentaire)
   - Il peut voir l'historique des évaluations précédentes

3. **Validation ou ajustement du niveau**
   - Le manager peut :
     - Valider le niveau auto-évalué
     - Ajuster le niveau (à la hausse ou à la baisse)
   - Si ajustement, le manager doit justifier sa décision

4. **Commentaire**
   - Le manager ajoute un commentaire pour expliquer sa décision
   - Le commentaire peut inclure des recommandations ou des axes d'amélioration

## Inclus

### AuditLog
- Enregistrement de toutes les validations et ajustements
- Traçabilité complète : qui, quand, quelle décision, pourquoi

### Notification employé
- L'employé reçoit une notification une fois l'évaluation validée
- La notification contient le niveau final et le commentaire du manager

### Mise à jour analytics
- Les données d'évaluation sont mises à jour dans les tableaux de bord
- Calcul des indicateurs de performance (skill gaps, évolution, etc.)

## Valeur métier

👉 **Évaluation continue** : Contrairement aux évaluations annuelles traditionnelles, ce workflow permet une évaluation continue et dynamique des compétences, favorisant le développement professionnel en temps réel.
