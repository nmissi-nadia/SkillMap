---
description: Création et mise à jour du profil employé
---

# Workflow : Création et mise à jour du profil employé

**Acteur** : Employé

## Étapes

1. **Création / modification du profil**
   - L'employé accède à son interface de profil
   - Il peut créer un nouveau profil ou modifier un profil existant

2. **Mise à jour des informations personnelles**
   - L'employé renseigne ou modifie ses informations personnelles (nom, prénom, email, téléphone, etc.)
   - Validation des champs obligatoires

3. **Ajout / modification des compétences**
   - L'employé ajoute de nouvelles compétences à son profil
   - Il peut modifier ou supprimer des compétences existantes
   - Pour chaque compétence, il peut préciser le niveau de maîtrise

4. **Sauvegarde**
   - L'employé valide et sauvegarde les modifications
   - Le système enregistre les changements dans la base de données

## Inclus

### AuditLog : modification données sensibles
- Toute modification de données sensibles (informations personnelles, compétences) est enregistrée dans l'audit log
- L'audit log contient : utilisateur, date/heure, type de modification, anciennes et nouvelles valeurs

### Notification au manager
- Une notification est envoyée au manager de l'employé lors de modifications importantes du profil
- Le manager est informé des nouvelles compétences ajoutées ou des modifications significatives

### Historique des versions
- Le système conserve un historique des versions du profil
- L'employé et le manager peuvent consulter les versions antérieures
- Possibilité de restaurer une version précédente si nécessaire
