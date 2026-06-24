# GAAW Admin

Tableau de bord d'administration pour l'application **GAAW Delivery** — plateforme de livraison rapide urbaine.

## Fonctionnalités

- **Tableau de bord** — vue d'ensemble : courses du jour, livreurs actifs, clients inscrits, CA, livreurs en attente de validation
- **Courses** — suivi des livraisons avec détail itinéraire, décomposition du prix et preuve de livraison
- **Livreurs** — gestion des comptes, validation des documents (Carte d'identité, KBIS, RIB), historique financier, activation/désactivation
- **Clients** — gestion des comptes, historique des commandes, total dépensé, panier moyen
- **Paramètres** — configuration de la tarification (prix de base, prix par km)

## Stack technique

| Outil | Rôle |
|-------|------|
| React 19 + TypeScript | UI & typage |
| Vite 8 | Build & dev server |
| Tailwind CSS v4 | Styles |
| React Router v7 | Navigation |
| TanStack Query | Fetching & cache |
| Axios | Appels API (JWT auto) |
| Lucide React | Icônes |

## Lancer le projet

```bash
npm install
npm run dev
```

L'app tourne sur `http://localhost:5173` par défaut.

## Build production

```bash
npm run build
npm run preview
```

## Configuration

Crée un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:8080
```

## Structure

```
src/
├── api/
│   └── axios.ts            # Instance axios + intercepteurs JWT
├── components/
│   ├── Layout.tsx           # Shell (sidebar + header)
│   ├── Sidebar.tsx          # Navigation
│   ├── CourseDetailModal.tsx
│   ├── DriverDetailModal.tsx
│   └── ClientDetailModal.tsx
├── context/
│   └── AuthContext.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CoursesPage.tsx
│   ├── LivreursPage.tsx
│   ├── ClientsPage.tsx
│   └── ParametresPage.tsx
└── assets/
    └── gaaw-logo.png
```

---

© 2026 GAAW Delivery Systems
