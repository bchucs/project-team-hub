# Project Team Hub

A full-stack web app for managing team recruitment and student applications at Cornell. Students browse teams, submit applications, and track status. Team leads review applications, score candidates, and manage recruiting cycles.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Prisma · PostgreSQL · NextAuth.js

---

## Dev Setup

**Prerequisites:** Node.js 18+, Docker & Docker Compose

```bash
# Start PostgreSQL and MinIO (local object storage)
docker-compose up -d

# Install dependencies
npm install

# Create .env.local at the project root:
#
#   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project_team_hub"
#   NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
#   NEXTAUTH_URL="http://localhost:3000"
#   S3_ENDPOINT="http://localhost:9000"
#   S3_ACCESS_KEY_ID="minioadmin"
#   S3_SECRET_ACCESS_KEY="minioadmin"
#   S3_BUCKET="resumes"
#   S3_REGION="us-east-1"

# Apply schema and seed sample data
npx prisma db push
npm run db:seed

# Run the dev server
npm run dev
```

App runs at `http://localhost:3000`.

### Seed Accounts

| Role | Email | Password |
|---|---|---|
| Platform Admin | admin@cornell.edu | password123 |
| Student | student@cornell.edu | password123 |
| Team Lead | leader@cornell.edu | password123 |

### Useful Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:studio` | Prisma Studio GUI |
| `npm run db:seed` | Re-seed (run `prisma/clear.ts` first) |
