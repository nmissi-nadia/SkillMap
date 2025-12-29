# SkillMap

Plateforme de cartographie, communication et suivi des compétences internes.

---

## 🚀 Introduction

**SkillMap** est une application web conçue pour aider les entreprises à gérer efficacement les compétences de leurs employés. Elle permet aux managers et aux départements RH d'identifier les compétences disponibles, de planifier la formation, d'assigner les bonnes personnes aux bons projets et de suivre leur évolution professionnelle.

Ce projet est construit avec une architecture backend robuste basée sur Spring Boot.

## ✨ Fonctionnalités Principales

- **Gestion des Utilisateurs :** Système d'authentification sécurisé par **JWT (JSON Web Token)** avec inscription et connexion. Différents rôles (Employé, Manager, RH, etc.) sont prévus.
- **Gestion des Compétences :** Création et classification des compétences (techniques, linguistiques, etc.).
- **Gestion des Employés :** Association des compétences aux employés avec des niveaux d'auto-évaluation et de validation par un manager.
- **Gestion de Projets :** Création de projets et affectation des employés en fonction des compétences requises.
- **Évaluations :** Mise en place d'évaluations et de tests techniques pour valider les niveaux de compétence.
- **Formations :** Suggestion et suivi des formations pour les employés.

## 🛠️ Stack Technique (Backend)

- **Framework :** [Spring Boot](https://spring.io/projects/spring-boot)
- **Langage :** [Java 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- **Sécurité :** [Spring Security](https://spring.io/projects/spring-security) avec authentification JWT.
- **Base de données :** [PostgreSQL](https://www.postgresql.org/)
- **Accès aux données :** Spring Data JPA (Hibernate)
- **Gestion des dépendances :** [Maven](https://maven.apache.org/)
- **Mapping d'objets :** [MapStruct](https://mapstruct.org/)
- **Utilitaires :** [Lombok](https://projectlombok.org/)

## 🏛️ Architecture

Le backend suit une architecture en couches classique pour garantir la séparation des préoccupations et une bonne maintenabilité :

- **`Controller` :** Expose les points d'entrée de l'API REST. Valide les entrées et délègue la logique métier à la couche de service.
- **`Service` :** Contient toute la logique métier de l'application (ex: processus d'inscription, création d'un projet).
- **`Repository` :** Couche d'abstraction pour l'accès aux données, basée sur Spring Data JPA.
- **`Entity` :** Représente les objets du domaine et les tables de la base de données.
- **`DTO` (Data Transfer Object) :** Objets utilisés pour transférer les données entre les couches, en particulier avec l'API REST, et éviter d'exposer les entités de la base de données.
- **`Config` :** Contient la configuration de l'application, notamment la configuration de Spring Security.

La conception de la base de données et des composants est disponible dans le dossier `Conception/`.

---

## ⚙️ Démarrage Rapide

### Prérequis

- **JDK 17** ou supérieur.
- **Maven 3.6** ou supérieur.
- **PostgreSQL** doit être installé et en cours d'exécution.
- Une IDE comme [IntelliJ IDEA](https://www.jetbrains.com/idea/) ou [VS Code](https://code.visualstudio.com/).

### Installation et Lancement

1.  **Clonez le dépôt :**
    ```bash
    git clone <URL_DU_DEPOT>
    cd SkillMap/backend
    ```

2.  **Configurez la base de données :**
    Ouvrez le fichier `src/main/resources/application.properties` et modifiez les lignes suivantes avec vos informations de connexion à PostgreSQL :
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/skilldb
    spring.datasource.username=VOTRE_UTILISATEUR_POSTGRES
    spring.datasource.password=VOTRE_MOT_DE_PASSE_POSTGRES
    ```
    *Assurez-vous que la base de données `skilldb` existe ou modifiez le nom.*

3.  **Configurez la clé secrète JWT :**
    Dans le même fichier, assurez-vous que la clé secrète JWT est définie. Pour le développement, une valeur par défaut est fournie, mais il est recommandé de la changer pour la production.
    ```properties
    application.security.jwt.secret-key= VOTRE_CLE_SECRETE_TRES_LONGUE_ET_COMPLEXE
    ```
4.  **Lancez l'application :**
    Utilisez la commande Maven suivante à la racine du dossier `backend` :
    ```bash
    mvn spring-boot:run
    ```
    L'application démarrera par défaut sur `http://localhost:8080`.

## Endpoints de l'API

### Authentification

#### Inscription
- **`POST /api/auth/register`**
- **Description :** Crée un nouvel utilisateur.
- **Corps de la requête (`RegisterRequest`) :**
  ```json
  {
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "password": "password123",
    "role": "EMPLOYE"
  }
  ```
- **Réponse (`AuthenticationResponse`) :**
  ```json
  {
    "access_token": "ey...",
    "refresh_token": "ey..."
  }
  ```

#### Connexion
- **`POST /api/auth/authenticate`**
- **Description :** Authentifie un utilisateur et retourne un jeton JWT.
- **Corps de la requête (`AuthenticationRequest`) :**
  ```json
  {
    "email": "jean.dupont@example.com",
    "password": "password123"
  }
  ```
- **Réponse (`AuthenticationResponse`) :**
  ```json
  {
    "access_token": "ey...",
    "refresh_token": "ey..."
  }
  ```

### Accès aux routes protégées
Pour toutes les autres requêtes, vous devez inclure le jeton d'accès dans l'en-tête `Authorization` :
```
Authorization: Bearer <VOTRE_ACCESS_TOKEN>
```