# Mohamed Khalil BECHEIKH

**DevOps & Infrastructure** — Étudiant en L3 informatique, passionné par les systèmes autant que par les applications.

---

## À propos

Étudiant en informatique à l'UPPA, je m'oriente vers le **DevOps et l'infrastructure** : automatisation, conteneurisation, CI/CD, et tout ce qui fait qu'un code arrive en production sans douleur.

Ce qui m'attire, c'est la partie qu'on ne voit pas : comprendre ce qui se passe vraiment sous le capot plutôt que de recopier une commande. J'ai écrit mon propre interpréteur de commandes pour savoir exactement ce qui se passe quand on tape quelque chose dans un terminal.

Mes trois projets sont construits comme des preuves, pas comme des démos : chacun résout un vrai problème d'infrastructure, et chaque brique est choisie et configurée à la main.

**Langues** : Arabe (langue maternelle) · Français (courant) · Anglais (technique)

---

## Formation

**Université de Pau et des Pays de l'Adour (UPPA)** — Pau, France
Licence Informatique, L3 — Diplôme prévu : été 2027

---

## Compétences

### Maîtrise — utilisées en production sur mes projets
Python · Bash · Linux · Docker · Docker Compose · Flask · MySQL · SQL · Git · Nginx · GitHub Actions

### Pratique — manipulées en contexte réel
Ansible · Traefik · Prometheus · Grafana · pytest · Uptime Kuma · node-exporter · mkcert / TLS

### Académique — coursework universitaire
C · C++
> Étudiés en cours, mais sans mise en pratique dans un projet personnel.

### En cours d'apprentissage
Terraform · AWS · Kubernetes

---

## Projets

### [Homelab](https://github.com/Khalil-bec/Homelab)

Infrastructure auto-hébergée sur une seule machine, provisionnée de manière déclarative.

**Stack** : Traefik · Prometheus · node-exporter · Grafana · Uptime Kuma · Ansible · Docker Compose · mkcert

- **Traefik** en reverse proxy : découverte automatique des services via les labels Docker, dashboard activé, redirection HTTP → HTTPS, et certificats TLS générés par mkcert pour `*.homelab.lab`.
- **Monitoring as code** : datasources et dashboards Grafana provisionnés depuis des fichiers versionnés dans le dépôt — l'infrastructure de monitoring se rejoue à l'identique.
- **Ansible pilote l'ensemble** : le playbook crée d'abord le réseau bridge partagé, puis déploie chaque projet Docker Compose dans l'ordre. Toute la stack est reproductible depuis une seule commande.
- **Installation disciplinée** : `ansible-core` épinglé, collections installées localement dans `./.collections` plutôt que dans `~/.ansible`, et le script s'interdit explicitement le `sudo` comme toute modification des stores de confiance du système.

### [GymTrack](https://github.com/Khalil-bec/gymtrack)

Application de suivi d'entraînement muscular. L'objectif n'était pas de faire tourner une application, mais de construire une stack complète et de la comprendre de bout en bout.

**Stack** : Python 3.11 · Flask · MySQL 8.0 · Docker Compose · Nginx · Adminer · pytest · GitHub Actions

- **Orchestration soignée** : healthcheck MySQL avec `condition: service_healthy`, l'API ne démarre que lorsque la base est réellement prête. Volume nommé pour la persistance, réseau bridge dédié pour l'isolation, secrets externalisés dans `.env`, et schéma SQL initialisé automatiquement au démarrage.
- **API Flask** : 6 endpoints, validation des champs, gestion des erreurs HTTP (400, 409, 500), et jointures multi-tables sur 4 tables relationnelles (`athletes → seances → exercice_logs → series`) avec clés étrangères et contrainte UNIQUE.
- **Tests isolés** : suite pytest avec `unittest.mock`, aucune dépendance à une base vivante — succès, champs manquants, email dupliqué, body vide.
- **CI/CD** : GitHub Actions déclenche sur chaque push — tests pytest et vérification du build Docker. Un Makefile regroupe les opérations courantes.
- **Frontend** : dashboard interactif servi par une image `nginx:alpine` (aucun serveur Python), appels `fetch` vers l'API, formulaires modaux Bootstrap et graphique Chart.js du volume d'entraînement hebdomadaire.

*En cours : déploiement sur Oracle Cloud Free Tier.*

### [Kshell](https://github.com/Khalil-bec/ksh) (`ksh`)

Interpréteur de commandes interactif et modulaire, écrit de zéro en Python.

**Pourquoi** : comprendre ce qui se passe réellement dans un terminal — gestion des processus, appels système, résolution du `$PATH`.

- Exécution de toute commande du `$PATH`, avec pipelines via `|`
- Builtins maison : `cd`, `pwd`, `exit`, `alias`, `unalias`, `aide` (documentation intégrée en français)
- Alias persistants sauvegardés dans `~/.ksh_aliases` et rechargés à chaque session
- Autocomplétion Tab sur les commandes et les chemins, via `readline`
- Prompt dynamique en couleurs ANSI affichant le répertoire courant et la branche Git
- Séparation modulaire nette : parsing, exécution, builtins, complétion, prompt, alias

---

## Contact

- **GitHub** — https://github.com/Khalil-bec
- **Email** — khalil.becheikh54@gmail.com
- **LinkedIn** — https://www.linkedin.com/in/becheikh-mohamed-khalil/
- **Localisation** — Pau, France

---

# Mohamed Khalil BECHEIKH

**DevOps & Infrastructure** — Computer science student, equally fascinated by systems and applications.

---

## About

A computer science student at UPPA, working my way toward **DevOps and infrastructure**: automation, containerization, CI/CD, and everything that gets code into production without pain.

What draws me in is the part nobody sees — understanding what actually happens underneath rather than copying commands from memory. I wrote my own command interpreter to know exactly what occurs when you type into a terminal.

My three projects are built as evidence, not demos: each one solves a real infrastructure problem, and every piece was chosen and configured by hand.

**Languages**: Arabic (mother tongue) · French (fluent) · English (technical)

---

## Education

**Université de Pau et des Pays de l'Adour (UPPA)** — Pau, France
B.Sc. Computer Science, L3 — Expected graduation: Summer 2027

---

## Skills

### Core — used in production across my projects
Python · Bash · Linux · Docker · Docker Compose · Flask · MySQL · SQL · Git · Nginx · GitHub Actions

### Hands-on — worked with in real setups
Ansible · Traefik · Prometheus · Grafana · pytest · Uptime Kuma · node-exporter · mkcert / TLS

### Academic — university coursework
C · C++
> Studied in coursework, but not applied in a personal project.

### Currently learning
Terraform · AWS · Kubernetes

---

## Projects

### [Homelab](https://github.com/Khalil-bec/Homelab)

Self-hosted infrastructure on a single machine, provisioned declaratively.

**Stack**: Traefik · Prometheus · node-exporter · Grafana · Uptime Kuma · Ansible · Docker Compose · mkcert

- **Traefik as reverse proxy**: automatic service discovery via Docker labels, dashboard enabled, HTTP → HTTPS redirection, and mkcert-issued TLS certificates for `*.homelab.lab`.
- **Monitoring as code**: Grafana datasources and dashboards provisioned from files versioned in the repository, so the monitoring setup replays identically.
- **Ansible drives everything**: the playbook creates the shared bridge network first, then brings up each Docker Compose project in order. The entire stack is reproducible from a single command.
- **Disciplined installation**: pinned `ansible-core`, collections installed locally into `./.collections` instead of `~/.ansible`, and the script explicitly refuses `sudo` and any modification to system trust stores.

### [GymTrack](https://github.com/Khalil-bec/gymtrack)

A muscle-training tracking application. The goal was never to get an app running, but to build a complete stack and understand it end to end.

**Stack**: Python 3.11 · Flask · MySQL 8.0 · Docker Compose · Nginx · Adminer · pytest · GitHub Actions

- **Careful orchestration**: a MySQL healthcheck with `condition: service_healthy`, so the API only starts once the database is genuinely ready. A named volume for persistence, a dedicated bridge network for isolation, credentials externalized to `.env`, and the SQL schema seeded automatically at startup.
- **Flask API**: 6 endpoints, field validation, HTTP error handling (400, 409, 500), and multi-table joins across 4 relational tables (`athletes → seances → exercice_logs → series`) with foreign keys and a UNIQUE constraint.
- **Isolated tests**: a pytest suite using `unittest.mock`, with no dependency on a live database — success, missing fields, duplicate email, empty body.
- **CI/CD**: GitHub Actions on every push — pytest runs plus a Docker build check. A Makefile gathers all routine operations.
- **Frontend**: an interactive dashboard served from an `nginx:alpine` image (no Python server involved), `fetch` calls to the API, Bootstrap modal forms, and a Chart.js chart of weekly training volume.

*In progress: deployment to Oracle Cloud Free Tier.*

### [Kshell](https://github.com/Khalil-bec/ksh) (`ksh`)

An interactive, modular command interpreter written from scratch in Python.

**Why**: to understand what really happens inside a terminal — process management, system calls, `$PATH` resolution.

- Executes any command from `$PATH`, with pipelines via `|`
- Built-in commands: `cd`, `pwd`, `exit`, `alias`, `unalias`, `aide` (built-in French documentation)
- Persistent aliases saved to `~/.ksh_aliases` and reloaded on every session
- Tab completion for commands and file paths, via `readline`
- Dynamic ANSI-colored prompt showing the current directory and Git branch
- Clean modular separation: parsing, execution, built-ins, completion, prompt, aliases

---

## Contact

- **GitHub** — https://github.com/Khalil-bec
- **Email** — khalil.becheikh54@gmail.com
- **LinkedIn** — https://www.linkedin.com/in/becheikh-mohamed-khalil/
- **Location** — Pau, France
