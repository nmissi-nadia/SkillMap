# 🎨 Guide de Style - SkillMap

## Palette de Couleurs

### Couleurs Principales

| Couleur | Hex | Usage | Variable CSS |
|---------|-----|-------|--------------|
| **Violet Principal** | `#4B3F72` | Titres, éléments importants, hover states | `--primary` |
| **Violet Clair** | `#8B83BA` | Éléments secondaires, badges | `--secondary` |
| **Accent** | `#6D5BD0` | Boutons CTA, liens importants | `--accent` |
| **Fond** | `#F6F7FB` | Arrière-plan de l'application | `--background` |
| **Blanc** | `#FFFFFF` | Cartes, conteneurs | `--white` |

### Couleurs de Texte

| Couleur | Hex | Usage | Variable CSS |
|---------|-----|-------|--------------|
| **Texte Principal** | `#000000` | Texte principal, labels | `--text-primary` |
| **Texte Secondaire** | `#6B7280` | Texte descriptif | `--text-secondary` |
| **Texte Clair** | `#9CA3AF` | Placeholders, texte désactivé | `--text-light` |

### Couleurs d'État

| État | Hex | Usage | Variable CSS |
|------|-----|-------|--------------|
| **Succès** | `#10B981` | Messages de succès, validations | `--success` |
| **Erreur** | `#EF4444` | Messages d'erreur, validations | `--error` |
| **Avertissement** | `#F59E0B` | Alertes, warnings | `--warning` |
| **Information** | `#3B82F6` | Messages informatifs | `--info` |

---

## Utilisation des Variables CSS

### Dans les fichiers SCSS

```scss
.my-component {
  background-color: var(--primary);
  color: var(--white);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-md);
}
```

### Ombres Prédéfinies

```scss
--shadow-sm: 0 1px 2px 0 rgba(75, 63, 114, 0.05);
--shadow-md: 0 4px 6px -1px rgba(75, 63, 114, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(75, 63, 114, 0.15);
--shadow-xl: 0 20px 25px -5px rgba(75, 63, 114, 0.2);
```

---

## Composants UI

### Boutons

#### Bouton Principal (CTA)
```scss
.btn-primary {
  background: var(--accent);
  color: var(--white);
  
  &:hover {
    background: var(--primary);
  }
}
```

#### Bouton Secondaire
```scss
.btn-secondary {
  background: var(--secondary);
  color: var(--white);
  
  &:hover {
    background: var(--primary);
  }
}
```

#### Bouton Outline
```scss
.btn-outline {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
  
  &:hover {
    background: var(--primary);
    color: var(--white);
  }
}
```

### Cartes

```scss
.card {
  background: var(--white);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}
```

### Formulaires

#### Input
```scss
input {
  border: 2px solid var(--border-color);
  background: var(--white);
  color: var(--text-primary);
  
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(75, 63, 114, 0.1);
  }
  
  &.invalid {
    border-color: var(--error);
  }
}
```

#### Select
```scss
select {
  border: 2px solid var(--border-color);
  background: var(--white);
  color: var(--text-primary);
  
  &:focus {
    border-color: var(--primary);
  }
}
```

### Badges

```scss
.badge {
  padding: 0.375rem 1rem;
  background: var(--secondary);
  color: var(--white);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-primary {
  background: var(--primary);
}

.badge-accent {
  background: var(--accent);
}
```

---

## Règles de Design

### ❌ À Éviter

- **Pas de dégradés** : Utiliser uniquement des couleurs solides
- **Pas de couleurs vives** : Rester dans la palette définie
- **Pas de mélanges** : Ne pas mélanger avec d'autres palettes

### ✅ Bonnes Pratiques

- **Cohérence** : Utiliser toujours les variables CSS
- **Contraste** : Assurer un bon contraste pour l'accessibilité
- **Hiérarchie** : Utiliser les couleurs pour créer une hiérarchie visuelle
  - Titres : `var(--primary)`
  - Texte principal : `var(--text-primary)`
  - Texte secondaire : `var(--text-secondary)`
- **États interactifs** :
  - Normal : `var(--accent)`
  - Hover : `var(--primary)`
  - Active : `var(--primary)` avec opacité réduite

---

## Espacement

### Padding et Margin

```scss
// Petit
padding: 0.5rem;  // 8px

// Moyen
padding: 1rem;    // 16px

// Grand
padding: 1.5rem;  // 24px

// Très grand
padding: 2rem;    // 32px
```

### Border Radius

```scss
// Petit (inputs, badges)
border-radius: 10px;

// Moyen (cartes)
border-radius: 16px;

// Grand (modals)
border-radius: 20px;

// Rond (avatars, badges ronds)
border-radius: 50%;
```

---

## Typographie

### Tailles de Police

```scss
// Petit texte
font-size: 0.875rem;  // 14px

// Texte normal
font-size: 1rem;      // 16px

// Titre de section
font-size: 1.5rem;    // 24px

// Titre principal
font-size: 2rem;      // 32px
```

### Poids de Police

```scss
// Normal
font-weight: 400;

// Semi-bold
font-weight: 600;

// Bold
font-weight: 700;
```

---

## Animations

### Transitions Standards

```scss
transition: all 0.3s ease;
```

### Animations Prédéfinies

#### Slide Up
```scss
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Fade In
```scss
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

#### Shake (pour erreurs)
```scss
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

---

## Responsive Design

### Breakpoints

```scss
// Mobile
@media (max-width: 640px) { }

// Tablet
@media (max-width: 768px) { }

// Desktop
@media (max-width: 1024px) { }

// Large Desktop
@media (max-width: 1280px) { }
```

---

## Exemples d'Utilisation

### Page d'Authentification

```scss
.auth-container {
  background-color: var(--background);
  min-height: 100vh;
}

.auth-card {
  background: var(--white);
  box-shadow: var(--shadow-xl);
  border-radius: 16px;
}

.auth-title {
  color: var(--primary);
  font-size: 2rem;
  font-weight: 700;
}

.auth-button {
  background: var(--accent);
  color: var(--white);
  
  &:hover {
    background: var(--primary);
  }
}
```

### Dashboard

```scss
.dashboard-container {
  background-color: var(--background);
}

.dashboard-card {
  background: var(--white);
  box-shadow: var(--shadow-md);
  border-radius: 16px;
}

.dashboard-title {
  color: var(--primary);
}

.dashboard-badge {
  background: var(--secondary);
  color: var(--white);
}
```

---

## Accessibilité

### Contraste des Couleurs

Tous les textes doivent avoir un ratio de contraste minimum de **4.5:1** pour le texte normal et **3:1** pour le texte large.

| Combinaison | Ratio | Conforme WCAG AA |
|-------------|-------|------------------|
| `--primary` sur `--white` | 8.2:1 | ✅ Oui |
| `--accent` sur `--white` | 6.5:1 | ✅ Oui |
| `--text-primary` sur `--white` | 21:1 | ✅ Oui |
| `--text-secondary` sur `--white` | 4.8:1 | ✅ Oui |

---

## Checklist pour Nouveaux Composants

- [ ] Utiliser uniquement les variables CSS définies
- [ ] Pas de dégradés
- [ ] Respecter les border-radius standards
- [ ] Utiliser les ombres prédéfinies
- [ ] Assurer un bon contraste texte/fond
- [ ] Ajouter des états hover/focus
- [ ] Tester en mode responsive
- [ ] Vérifier l'accessibilité
