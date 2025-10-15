# 💳 Payment Analytics Dashboard (Nx Monorepo)

## Overview
This is an Nx-powered monorepo for the **Payment Analytics Dashboard**, containing:
- **`api/`** — NestJS backend
- **`web/`** — Next.js frontend
- **`libs/shared-types/`** — shared TypeScript types

## Development

### 1. Install dependencies
```bash
npm install
```

> ℹ️ **Note:** `npm install` is required even if you plan to use Docker. The dockerfiles while building were giving a SIGBUS error during the dependency installation step. So I am using the locally installed node_modules. Not ideal but this was the only workaround I could figure out

After installing dependencies, choose one of the two setup paths below:

---

## Setup Path 1: Docker (Recommended)

### Steps
1. Copy environment files:
```bash
cp api.env.example api.env
cp web.env.example web.env
```

2. Build and start containers:
```bash
sudo docker compose up -d --build
```

3. Access the application:
Open your browser and navigate to `http://localhost:3000/`

---

## Setup Path 2: Non-Docker (Production Environment)

### Steps
1. Copy environment file:
```bash
cp .env.example .env
```

2. Build the applications:
```bash
npx nx build api --configuration=production
npx nx build web --configuration=production
```

3. Start the servers:
```bash
npx nx serve api --configuration=production
npx nx serve web --configuration=production
```

4. Access the application:
Open your browser and navigate to `http://localhost:3000/`