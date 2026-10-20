# StockManager — API

API REST du gestionnaire d'inventaire (Node.js, Express, MongoDB Atlas).

## Installation

```bash
npm install
cp .env.example .env   # puis renseigner MONGO_URI
npm run seed           # données de démonstration
npm run dev            # http://localhost:5000/api
```

## Endpoints

| Méthode | Route | Description |
| --- | --- | --- |
| GET | /api/products | Liste (filtres : search, category, status, minPrice, maxPrice, sort, order) |
| GET | /api/products/:id | Détail d'un produit |
| POST | /api/products | Créer un produit |
| PUT | /api/products/:id | Modifier un produit |
| PATCH | /api/products/:id/stock | Ajuster le stock (`{ "delta": 1 }`) |
| DELETE | /api/products/:id | Supprimer un produit |
| GET | /api/dashboard | Statistiques |
| GET | /api/movements | Historique des mouvements (bonus) |

## Règles de validation

Référence unique, quantité entière positive, prix supérieur à 0, catégorie parmi Électronique, Mobilier, Consommable, Fournitures.
