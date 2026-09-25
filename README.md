# SmartSchool — Node.js + React

Projet transformé en :
- **Backend : Node.js + Express + Prisma + PostgreSQL + JWT**
- **Frontend : React + Vite + React Router + Tailwind CSS**
- **Mobile : Flutter conservé**
- **Base de données : PostgreSQL**

## 1. Backend

```bash
cd api
npm install
copy .env.example .env
# configure DATABASE_URL dans .env
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

API : http://localhost:3001/api/health

Compte de démonstration :
- Email : `admin@smartschool.local`
- Mot de passe : `Admin@123`

## 2. Frontend

Dans un autre terminal :

```bash
cd web
npm install
npm run dev
```

Frontend : http://localhost:5173

Si l'API est sur une autre adresse, créer `web/.env` :

```env
VITE_API_URL=http://localhost:3001/api/v1
```

## 3. Architecture

```text
SmartSchool/
├── api/                 # Backend Node.js/Express
│   ├── prisma/          # Schéma + seed PostgreSQL
│   └── src/
│       ├── middleware/
│       ├── routes/
│       └── server.js
├── web/                 # Frontend React/Vite
│   └── src/
├── mobile/              # Application Flutter existante
└── docs/
```

## 4. Modules déjà structurés

Authentification, dashboard, élèves, enseignants, classes, matières, notes, absences, devoirs, finances, messagerie et emploi du temps.

> Pour la production, remplacer le secret JWT, ajouter refresh tokens, validation métier détaillée, RBAC par route, upload S3, WebSocket et tests.
"# smartschool"  
