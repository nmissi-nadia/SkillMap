---
description: Passage d'un test technique
---

# Workflow : Passage d'un test technique

**Acteur** : Employé

## Étapes

1. **Test assigné (par RH ou Manager)**
   - Un test technique est assigné à l'employé par un RH ou son manager
   - Le test est lié à une compétence spécifique
   - Une date limite peut être définie

2. **Notification envoyée**
   - L'employé reçoit une notification l'informant du nouveau test assigné
   - La notification contient : nom du test, compétence évaluée, date limite

3. **Passage du test**
   - L'employé accède à l'interface de test
   - Il répond aux questions dans le temps imparti
   - Le test peut être de type : QCM, code, pratique, etc.

4. **Calcul score automatique**
   - Le système calcule automatiquement le score du test
   - Le score est converti en niveau de compétence (1-5)

5. **Enregistrement résultat**
   - Le résultat est enregistré dans le profil de l'employé
   - Le résultat est lié à la compétence évaluée

## Inclus

### Notification résultat
- L'employé reçoit une notification avec son score
- Le manager et/ou RH sont également notifiés du résultat

### AuditLog
- Enregistrement de tous les tests passés
- Traçabilité : qui, quand, quel test, quel score

### Impact sur niveau compétence
- Le résultat du test peut influencer le niveau de compétence de l'employé
- Mise à jour automatique ou validation par le manager selon la configuration

### Monitoring tests en cours
- Tableau de bord pour suivre les tests en cours
- Alertes pour les tests non complétés avant la date limite
- Statistiques sur les taux de réussite par compétence
