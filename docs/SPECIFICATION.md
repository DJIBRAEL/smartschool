# SmartSchool — Spécification & Architecture

Slogan : **Gérer • Enseigner • Réussir**

## 1. Vue d'ensemble

SmartSchool est une plateforme de gestion scolaire complète, disponible en :
- **Web** : React + Next.js (App Router, TypeScript)
- **Mobile** : Flutter (iOS + Android), pour élèves, parents, enseignants
- **API** : NestJS (Node.js/TypeScript) + PostgreSQL (via Prisma ORM)
- **Auth** : JWT + refresh tokens, rôles multiples (RBAC)
- **Temps réel** : WebSocket (notifications, messagerie)
- **Stockage fichiers** : S3-compatible (bulletins PDF, documents, photos)

## 2. Rôles utilisateurs

| Rôle | Description |
|---|---|
| Super Admin | Gère l'établissement, les licences, la configuration globale |
| Administrateur / Direction | Gère l'école : classes, personnel, finances |
| Enseignant | Notes, absences, emploi du temps, devoirs, messagerie |
| Élève | Consulte notes, emploi du temps, devoirs, messagerie |
| Parent | Suit un ou plusieurs enfants, paiements, communication |
| Comptable / Économat | Facturation, paiements, reçus |
| Bibliothécaire | Gestion des ouvrages et emprunts (module optionnel) |

## 3. Modules fonctionnels

### 3.1 Administration & configuration
- Multi-établissement (multi-tenant), années scolaires, cycles/niveaux
- Gestion des classes, filières, matières, coefficients
- Gestion du personnel (RH basique) : contrats, affectations
- Paramétrage des périodes (trimestres/semestres), barèmes de notation

### 3.2 Gestion des élèves
- Inscription / réinscription, dossier élève complet (état civil, documents)
- Affectation aux classes, transferts, historique de scolarité
- Fiches médicales de base, contacts d'urgence

### 3.3 Gestion des enseignants
- Profils, matières enseignées, charge horaire
- Attribution des classes/matières

### 3.4 Emploi du temps
- Génération et édition du planning par classe / enseignant / salle
- Détection de conflits (salle, enseignant)
- Vue calendrier web + mobile

### 3.5 Notes & évaluations
- Saisie des notes par enseignant (devoirs, examens, contrôle continu)
- Calcul automatique des moyennes (pondérées par coefficient)
- Génération des bulletins (PDF), classement, appréciations
- Historique multi-années

### 3.6 Absences & discipline
- Pointage des présences/absences par cours
- Justificatifs, retards, sanctions disciplinaires
- Notifications automatiques aux parents (absence non justifiée)

### 3.7 Devoirs & ressources pédagogiques
- Dépôt de devoirs/exercices par les enseignants
- Remise en ligne par les élèves, corrections
- Bibliothèque de ressources (documents, supports de cours)

### 3.8 Finances & paiements
- Frais de scolarité, échéanciers, remises/bourses
- Paiement en ligne (Mobile Money, carte) + paiement au comptoir
- Génération de reçus, relances automatiques, tableau de bord recouvrement

### 3.9 Communication
- Messagerie interne (admin ↔ enseignant ↔ parent ↔ élève)
- Annonces / actualités de l'établissement
- Notifications push (mobile) et email/SMS

### 3.10 Bibliothèque (optionnel)
- Catalogue, emprunts, retours, pénalités de retard

### 3.11 Transport scolaire (optionnel)
- Circuits, affectation élèves, suivi

### 3.12 Cantine (optionnel)
- Menus, inscriptions, facturation

### 3.13 Statistiques & reporting
- Tableaux de bord (taux de réussite, présence, recouvrement financier)
- Export Excel/PDF

### 3.14 Sécurité & conformité
- Journjournalisation des actions (audit log)
- Sauvegardes automatiques, gestion des permissions fines par rôle

## 4. Architecture technique

```
smartschool/
├── api/        → NestJS + Prisma + PostgreSQL (API REST/GraphQL + WebSocket)
├── web/        → Next.js 14+ (App Router, TS, Tailwind, shadcn/ui)
├── mobile/     → Flutter (Riverpod/Bloc, Dio, clean architecture)
└── docs/       → Documentation, schémas, cahier des charges
```

- **API** expose des endpoints REST versionnés (`/api/v1/...`), sécurisés par JWT
- **Web** consomme l'API via un client typé (fetch/axios + React Query)
- **Mobile** consomme la même API via Dio + Retrofit-like codegen
- Base de données unique partagée (PostgreSQL), schéma multi-tenant par `school_id`

## 5. Modèle de données (extrait des entités principales)

`School, User, Role, Student, Guardian(Parent), Teacher, SchoolYear, Term,
Class(Classroom), Subject, Enrollment, Timetable, Grade, Evaluation,
Attendance, Homework, HomeworkSubmission, Invoice, Payment, Message,
Announcement, Notification, AuditLog`

(schéma Prisma détaillé fourni séparément dans `api/prisma/schema.prisma`)

## 6. Feuille de route suggérée (MVP → V2)

**Phase 1 — MVP**
1. Auth + rôles + gestion établissement/classes/élèves/enseignants
2. Emploi du temps (lecture + édition simple)
3. Notes + bulletins PDF
4. Absences
5. App mobile : consultation notes/absences/emploi du temps + notifications

**Phase 2**
6. Paiements & finances
7. Messagerie & annonces
8. Devoirs en ligne

**Phase 3**
9. Bibliothèque, transport, cantine
10. Statistiques avancées, exports, multi-établissement complet

## 7. Prochaines étapes immédiates

1. Valider ce document (modules à garder/retirer)
2. Scaffolding du projet API (NestJS + Prisma + schéma DB)
3. Scaffolding du projet Web (Next.js + auth + layout par rôle)
4. Scaffolding du projet Mobile (Flutter + architecture + écrans de base)
