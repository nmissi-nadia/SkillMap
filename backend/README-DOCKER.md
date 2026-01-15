# SkillMap Backend - Guide de Démarrage Docker Complet

## 🚀 Démarrage Rapide

### Prérequis
- Docker Desktop installé et en cours d'exécution
- Aucune installation PostgreSQL locale requise !

### Commandes

```bash
# 1. Construire et démarrer tous les services (Backend + PostgreSQL + pgAdmin)
docker-compose up --build

# 2. L'application sera accessible sur :
# - Backend API: http://localhost:8085
# - Swagger UI: http://localhost:8085/swagger-ui.html
# - pgAdmin: http://localhost:5050
```

**Pour arrêter :**
```bash
docker-compose down
```

**Pour supprimer aussi les données :**
```bash
docker-compose down -v
```

---

## 📦 Services Inclus

### 1. Backend (Spring Boot)
- **Port** : 8085
- **Container** : skillmap-backend
- Se connecte automatiquement à PostgreSQL

### 2. PostgreSQL
- **Port** : 5433 (sur l'hôte, pour éviter conflit avec PostgreSQL local)
- **Container** : skillmap-db
- **Base de données** : skilldb
- **Utilisateur** : skillmap
- **Mot de passe** : skillmap123
- **Volume** : Les données persistent entre les redémarrages

### 3. pgAdmin
- **Port** : 5050
- **URL** : http://localhost:5050
- **Email** : admin@skillmap.com
- **Mot de passe** : admin123

---

## 🔧 Configuration pgAdmin

### Première connexion à pgAdmin

1. Ouvrez http://localhost:5050
2. Connectez-vous avec :
   - **Email** : admin@skillmap.com
   - **Mot de passe** : admin123

3. Ajoutez le serveur PostgreSQL :
   - Clic droit sur `Servers` → `Register` → `Server...`
   
   **Onglet General** :
   - **Name** : SkillMap DB
   
   **Onglet Connection** :
   - **Host name/address** : `db` (nom du service Docker)
   - **Port** : `5432`
   - **Maintenance database** : `skilldb`
   - **Username** : `skillmap`
   - **Password** : `skillmap123`
   - ☑️ Cochez "Save password"
   
4. Cliquez sur `Save`

---

## 🧪 Tester l'Application

### 1. Vérifier que tout fonctionne

```bash
# Vérifier les logs
docker-compose logs -f backend

# Vérifier que PostgreSQL est prêt
docker-compose logs db
```

### 2. Accéder à Swagger

Ouvrez http://localhost:8085/swagger-ui.html

### 3. Test d'Inscription

```bash
curl -X POST http://localhost:8085/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"nom\": \"Doe\",
    \"prenom\": \"John\",
    \"email\": \"john.doe@example.com\",
    \"password\": \"password123\",
    \"role\": \"EMPLOYE\"
  }"
```

### 4. Test d'Authentification

```bash
curl -X POST http://localhost:8085/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"john.doe@example.com\",
    \"password\": \"password123\"
  }"
```

---

## 🛠️ Commandes Utiles

### Gestion des conteneurs

```bash
# Voir les conteneurs en cours d'exécution
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f db

# Redémarrer un service
docker-compose restart backend

# Reconstruire après modification du code
docker-compose up --build backend
```

### Gestion de la base de données

```bash
# Se connecter à PostgreSQL via ligne de commande
docker exec -it skillmap-db psql -U skillmap -d skilldb

# Voir les tables
docker exec -it skillmap-db psql -U skillmap -d skilldb -c "\dt"

# Backup de la base de données
docker exec skillmap-db pg_dump -U skillmap skilldb > backup.sql

# Restaurer la base de données
docker exec -i skillmap-db psql -U skillmap skilldb < backup.sql
```

### Nettoyage

```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer aussi les volumes (⚠️ perte de données)
docker-compose down -v

# Supprimer les images
docker-compose down --rmi all

# Nettoyage complet
docker-compose down -v --rmi all
```

---

## 🔍 Dépannage

### Problème : Le backend ne démarre pas

**Solution :**
```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier que PostgreSQL est prêt
docker-compose logs db | findstr "ready"
```

### Problème : Port 8085 déjà utilisé

**Solution :**
Modifiez dans `docker-compose.yml` :
```yaml
ports:
  - "8086:8085"  # Utiliser le port 8086 au lieu de 8085
```

### Problème : Port 5433 déjà utilisé

**Solution :**
Modifiez dans `docker-compose.yml` :
```yaml
ports:
  - "5434:5432"  # Utiliser le port 5434
```

### Problème : Erreur de connexion à la base de données

**Solution :**
1. Vérifiez que le conteneur `db` est en cours d'exécution :
   ```bash
   docker-compose ps
   ```

2. Vérifiez les logs de PostgreSQL :
   ```bash
   docker-compose logs db
   ```

3. Redémarrez les services :
   ```bash
   docker-compose restart
   ```

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│          Docker Network                  │
│         (skillmap-network)               │
│                                          │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Backend    │───▶│  PostgreSQL  │  │
│  │  (Port 8085) │    │  (Port 5432) │  │
│  └──────────────┘    └──────────────┘  │
│         │                    ▲          │
│         │                    │          │
│         ▼                    │          │
│  ┌──────────────────────────┴────────┐ │
│  │          pgAdmin                   │ │
│  │        (Port 5050)                 │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
         │              │            │
         ▼              ▼            ▼
    localhost:8085  localhost:5050  localhost:5433
```

---

## 🎯 Avantages de cette Configuration

✅ **Isolation complète** : Tout fonctionne dans Docker
✅ **Pas de conflit** : PostgreSQL sur port 5433 (pas de conflit avec installation locale)
✅ **Données persistantes** : Volume Docker pour PostgreSQL
✅ **pgAdmin inclus** : Interface graphique pour gérer la base de données
✅ **Healthcheck** : Le backend attend que PostgreSQL soit prêt
✅ **Facile à nettoyer** : `docker-compose down -v` supprime tout

---

## 📞 Support

Pour toute question :
- Documentation Swagger : http://localhost:8085/swagger-ui.html
- pgAdmin : http://localhost:5050
- Logs : `docker-compose logs -f`
