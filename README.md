# OmniFlow | Premium Business Management SaaS Web Application

OmniFlow is a modern, high-fidelity Agency & Operations Management SaaS Dashboard designed to coordinate CRM accounts, campaign projects, Kanban board deliverables, time-series sales line graphs, leads funnels, and files repository catalogues under a single secure console.

---

## 🚀 Instant Startup Guide

OmniFlow has a **Dual-Database Architecture**: it initializes immediately using a **local SQLite database (`saas.db`)** seeded with realistic data out-of-the-box, but is completely pre-configured to swap to a production **PostgreSQL** database by changing a single variable in `.env`.

### 1. Install Dependencies
Open your shell in the workspace directory and execute:
```bash
npm run install-all
```
*This triggers package installations in both the `server/` and `client/` directories automatically.*

### 2. Start the Application
To launch both the backend REST API server and the Vite React frontend server concurrently in development mode:
```bash
npm run dev
```
* **Frontend console:** Mounts on [http://localhost:5173](http://localhost:5173)
* **Backend REST API:** Bootstraps on [http://localhost:5000](http://localhost:5000)

---

## 🔑 Pre-Seeded Evaluation Accounts
To facilitate instant feature testing, the local database automatically populates with three primary staff profiles on first launch (Password for all accounts is **`password123`**):

1. **Sarah Connor (Admin Role)**
   * **Email:** `admin@agency.com`
   * **Capabilities:** Full control over directories, client offboarding, finances ledger sheets, role permissions triggers, and milestones.
2. **Michael Scott (Manager Role)**
   * **Email:** `manager@agency.com`
   * **Capabilities:** Writes projects, moves tasks, records CRM journals, tracks leads, issues invoices. Locked from RBAC permissions configuration.
3. **Jim Halpert (Employee Role)**
   * **Email:** `employee@agency.com`
   * **Capabilities:** Views rosters, updates active Kanban task states, posts comments, and catalogs general files.

---

## 🗄️ Swapping to PostgreSQL
OmniFlow's Sequelize ORM abstracts the database interface. To switch from SQLite to **PostgreSQL**:

1. Open `server/.env` in your editor.
2. Update the dialect token:
   ```env
   DB_DIALECT=postgres
   ```
3. Uncomment and configure the target connection string:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/saas_agency_db
   ```
4. Restart the server (`npm run dev`). Sequelize will connect to PostgreSQL, synchronize all table schemas automatically, and auto-seed the realistic agency datasets on the first launch!

---

## 🌟 Premium Features Highlights

### 1. Custom Vanilla CSS Glassmorphism
The visual interface is built from scratch without generic framework templates:
* Elegant **Light and Dark themes** toggles that persist in localStorage.
* Harmonic premium HSL color ranges (Indigo, Violet, Cyan).
* Frosted glass cards (`backdrop-filter`) with subtle shadows and hover scales.

### 2. Workflow Automations
* **Status Change Automation:** Moving a task to the `Done` column in the Kanban board automatically recalculates the completion percentage of its parent project.
* **Milestone Progress Trigger:** Toggling checklist milestones on active projects dynamically updates the project's overall execution score.
* **RBAC Enforcement:** Fine-grained endpoint protections return `403 Forbidden` if unauthorized staff members attempt writes or deletes.

### 3. High-Fidelity Integrations (Simulated)
* **AI Operations Copilot:** Evaluates your active project types and recommends targeted, realistic deliverables task cards that you can adopt instantly.
* **PDF Exporter Sheet:** Interactive modal invoice sheets that render crisp billing templates and triggers the browser's native `window.print()` layout.
* **Interactive Calendar:** Scans the active tasks list and registers color-coded due date tags inside a calculated monthly grid calendar.
