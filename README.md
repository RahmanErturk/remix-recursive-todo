# Recursive To-Do (React Router + Appwrite)

Recursive to-do list app where any task can have nested sub-tasks.

**Live demo:** https://recursive-todo.onrender.com/

---

## Quickstart

### Requirements
- Node.js 20+
- An Appwrite project (Auth + TablesDB)
- (Optional) Appwrite Function for welcome email

### Install
```bash
npm install
```

### Configure env
Create `.env` in the project root (do not commit):

```bash
APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID="YOUR_PROJECT_ID"
APPWRITE_API_KEY="YOUR_SERVER_API_KEY"

APPWRITE_DATABASE_ID="YOUR_DATABASE_ID"
APPWRITE_TODOS_TABLE_ID="YOUR_TODOS_TABLE_ID"
```

### Run
```bash
npm run dev
```

### Test
```bash
npm run test
```

---

## Features

- Signup/Login/Logout (Appwrite sessions via cookie)
- Recursive todos (add, delete, done)
- Cascade operations:
  - Deleting a parent removes all descendants
  - Marking a parent done marks all descendants done
- Persistence via Appwrite **TablesDB**
- Welcome email via Appwrite **Function** (triggered on `users.*.create`, SMTP via Mailtrap)
- UI tests with **Vitest + Testing Library**

---

## Appwrite Setup (minimal)

### TablesDB schema
Table: `todos`

Columns:
- `userId` (string, required)
- `title` (string, required)
- `completed` (boolean, required, default `false`)
- `parentId` (string, nullable)

Indexes:
- `userId`
- `parentId`

Security:
- Enable row-level security.
- Ensure rows are created with permissions granting the current user read/update/delete.

---

## Welcome Email Function (optional)

Repo path:
```
appwrite-functions/welcome-email
```

Appwrite Function settings:
- Root directory: `appwrite-functions/welcome-email`
- Entrypoint: `src/index.js`
- Trigger: `users.*.create`

Function variables (Mailtrap SMTP example):
```bash
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="587"
SMTP_USER="YOUR_MAILTRAP_USERNAME"
SMTP_PASS="YOUR_MAILTRAP_PASSWORD"
SMTP_FROM="Recursive Todo <no-reply@recursive-todo.local>"
```

---

## CI/CD Plan (thought exercise)

Example pipeline using **GitHub Actions**:

**On Pull Requests**
1. Checkout
2. Install (`npm ci`)
3. Test (`npm run test -- --run`)
4. Build (`npm run build`)

**On Push to `main`**
1. Run the same checks
2. Deploy

Deployment options:
- **Render**: connect the GitHub repo, enable auto-deploys, set environment variables in Render.
- Or Docker-based deploy (this repo includes a `Dockerfile`) to any container platform.

Secrets (Appwrite API key, SMTP credentials) should be stored in:
- GitHub Actions Secrets (if CI performs deploy), and/or
- the cloud provider’s environment variable settings (Render, etc.)