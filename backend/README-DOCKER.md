# 🐳 Guide de Déploiement Docker - SkillMap Backend

Ce guide explique comment déployer l'application SkillMap Backend avec Docker tout en utilisant une base de données PostgreSQL locale.

## 📋 Prérequis

### 1. Docker
- **Docker Desktop** installé et en cours d'exécution
- Version minimale : Docker 20.10+
- [Télécharger Docker Desktop](https://www.docker.com/products/docker-desktop)

### 2. PostgreSQL Local
L'application se connecte à une base de données PostgreSQL **locale** (hors conteneur).

**Configuration requise :**
- PostgreSQL installé sur votre machine
- Base de données : `skilldb`
- Utilisateur : `postgres`
- Mot de passe : `ycode`
- Port : `5432`

**Créer la base de données :**
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE skilldb;

# Quitter
\q
```

### 3. Java (optionnel pour build local)
- JDK 17 ou supérieur
- Maven 3.9+

---

## 🚀 Démarrage Rapide

### Option 1 : Utiliser Docker Compose (Recommandé)

```bash
# 1. Naviguer vers le répertoire backend
cd c:\Users\youco\IdeaProjects\SkillMap\backend

# 2. Construire et démarrer le conteneur
docker-compose up --build

# 3. L'application sera accessible sur http://localhost:8080
```

**Pour arrêter :**
```bash
docker-compose down
```

**Pour redémarrer en arrière-plan :**
```bash
docker-compose up -d
```

### Option 2 : Utiliser Docker directement

```bash
# 1. Construire l'image Docker
docker build -t skillmap-backend .

# 2. Exécuter le conteneur
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/skilldb \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=ycode \
  --add-host=host.docker.internal:host-gateway \
  skillmap-backend
```

---

## 📚 Documentation API (Swagger)

Une fois l'application démarrée, accédez à la documentation Swagger :

- **Swagger UI** : http://localhost:8080/swagger-ui.html
- **OpenAPI JSON** : http://localhost:8080/api-docs

### Authentification dans Swagger

1. Créer un compte via `/api/auth/register`
2. Se connecter via `/api/auth/authenticate` pour obtenir un token JWT
3. Cliquer sur le bouton **"Authorize"** en haut à droite
4. Entrer le token dans le format : `Bearer <votre_token>`
5. Vous pouvez maintenant tester les endpoints protégés

---

## 🔧 Configuration

### Variables d'Environnement

Le fichier `docker-compose.yml` contient les variables d'environnement suivantes :

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://host.docker.internal:5432/skilldb` | URL de connexion PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Nom d'utilisateur PostgreSQL |
| `SPRING_DATASOURCE_PASSWORD` | `ycode` | Mot de passe PostgreSQL |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | Mode de mise à jour du schéma |
| `SPRING_JPA_SHOW_SQL` | `true` | Afficher les requêtes SQL dans les logs |

**Pour modifier ces valeurs**, éditez le fichier `docker-compose.yml`.

---

## 🧪 Tests de l'API

### 1. Test d'Inscription

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"nom\": \"Doe\",
    \"prenom\": \"John\",
    \"email\": \"john.doe@example.com\",
    \"password\": \"password123\",
    \"role\": \"EMPLOYE\"
  }"
```

**Réponse attendue :**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Test d'Authentification

```bash
curl -X POST http://localhost:8080/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"john.doe@example.com\",
    \"password\": \"password123\"
  }"
```

### 3. Test d'un Endpoint Protégé

```bash
# Remplacer <TOKEN> par votre token JWT
curl -X GET http://localhost:8080/api/employes \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🛠️ Commandes Utiles

### Logs du Conteneur
```bash
# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs du backend uniquement
docker-compose logs -f backend
```

### Gestion des Conteneurs
```bash
# Lister les conteneurs en cours d'exécution
docker ps

# Arrêter tous les conteneurs
docker-compose down

# Supprimer les conteneurs et les volumes
docker-compose down -v

# Reconstruire l'image sans cache
docker-compose build --no-cache
```

### Accéder au Conteneur
```bash
# Ouvrir un shell dans le conteneur
docker exec -it skillmap-backend sh

# Vérifier les variables d'environnement
docker exec skillmap-backend env
```

### Nettoyage
```bash
# Supprimer l'image
docker rmi skillmap-backend

# Nettoyer toutes les images non utilisées
docker image prune -a
```

---

## 🐛 Dépannage

### Problème : Le conteneur ne peut pas se connecter à PostgreSQL

**Solution :**
1. Vérifiez que PostgreSQL est en cours d'exécution sur votre machine
2. Vérifiez que la base de données `skilldb` existe
3. Sur Windows, assurez-vous que `host.docker.internal` fonctionne
4. Vérifiez les logs : `docker-compose logs backend`

### Problème : Port 8080 déjà utilisé

**Solution :**
```bash
# Modifier le port dans docker-compose.yml
ports:
  - "8081:8080"  # Utiliser le port 8081 au lieu de 8080
```

### Problème : Erreur de build Maven

**Solution :**
```bash
# Nettoyer et reconstruire
docker-compose build --no-cache
```

### Problème : Swagger ne s'affiche pas

**Solution :**
1. Vérifiez que l'application est démarrée : http://localhost:8080/actuator/health
2. Accédez à : http://localhost:8080/swagger-ui.html
3. Vérifiez les logs pour des erreurs

---

## 📦 Structure des Fichiers Docker

```
backend/
├── Dockerfile              # Image Docker multi-stage
├── docker-compose.yml      # Configuration Docker Compose
├── .dockerignore          # Fichiers exclus de l'image
└── README-DOCKER.md       # Ce fichier
```

---

## 🔐 Sécurité

> [!WARNING]
> **Ne jamais commiter les secrets en production !**
> - Utilisez des variables d'environnement pour les mots de passe
> - Changez le `jwt.secret-key` en production
> - Utilisez des secrets Docker ou un gestionnaire de secrets

---

## 📝 Notes Importantes

- L'application utilise **JDK 17**
- Le build Maven est effectué dans le conteneur (multi-stage build)
- La base de données PostgreSQL reste **locale** (hors conteneur)
- Les logs SQL sont activés par défaut pour le développement
- Swagger est accessible sans authentification
- Les endpoints API nécessitent un token JWT (sauf `/api/auth/**`)

---

## 🎯 Prochaines Étapes

Pour un déploiement en production :
1. Déplacer PostgreSQL dans un conteneur Docker
2. Utiliser des secrets pour les mots de passe
3. Configurer un reverse proxy (Nginx)
4. Activer HTTPS
5. Configurer des healthchecks
6. Mettre en place des sauvegardes automatiques

---

## 📞 Support

Pour toute question ou problème, consultez :
- Documentation Swagger : http://localhost:8080/swagger-ui.html
- Logs de l'application : `docker-compose logs -f`
