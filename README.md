# Cornell Project Teams Hub

A comprehensive full-stack platform for managing team recruitment and student applications at Cornell University. Students discover and apply to project teams, while team leads efficiently review applications, score candidates, and manage recruiting cycles—all in one streamlined application.

**Tech Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS · Prisma · PostgreSQL · NextAuth.js · Resend · React Email

---

## Features

### For Students
- **Team Discovery** — Browse and search project teams by category, filter by interests
- **Rich Profiles** — Showcase skills, resume links, social profiles, and academic information
- **Smart Applications** — Answer team-specific questions, save drafts, and submit when ready
- **Application Tracking** — Monitor submission status in real-time across all teams
- **Email Notifications** — Receive confirmation, status updates, and interview invitations automatically

### For Team Leads & Admins
- **Powerful Dashboard** — View, filter, and sort all applications with advanced search
- **Comprehensive Review Tools** — Score candidates (1–5) with custom criteria, add public/private notes
- **Status Management** — Update application status through the complete lifecycle (Draft → Submitted → Under Review → Interview → Offer → Accepted/Rejected)
- **Recruiting Setup** — Create cycles, set timelines, configure custom questions per team
- **Interview Scheduling** — Create slots and assign interviewers for organized coordination
- **Analytics Dashboard** — Track key metrics: submissions, reviews, interviews, offers, and acceptances
- **Email Notifications** — Automatic alerts for new applications with candidate details

### Platform Features
- **Secure Authentication** — Email/password signup and login with NextAuth.js JWT strategy
- **Role-Based Access Control** — Four roles (Student, Team Member, Team Lead, Platform Admin) with route-level protection
- **Dark Mode** — System-wide theme support with next-themes
- **Responsive Design** — Full mobile and desktop support with Tailwind CSS
- **Email System** — Branded email templates with React Email, powered by Resend
- **File Storage** — Resume upload support with S3-compatible storage

---

## Architecture

Built on modern web technologies with performance and developer experience in mind:

- **Next.js App Router** — Server Components by default, client components only where needed
- **Type-Safe** — End-to-end TypeScript with strict mode enabled
- **Data Layer** — Prisma ORM with PostgreSQL, clean separation between queries and mutations
- **Validation** — Zod schemas for all form inputs and API boundaries
- **Caching** — React cache() for optimized read queries
- **Server Actions** — No REST API routes; mutations handled via Server Actions
- **View Models** — Clean abstraction layer between database and UI components

### Project Structure

```
app/                    # Next.js App Router pages
├── (auth)/            # Authentication routes (signup, login)
├── (student)/         # Student-facing pages (browse, apply, track)
└── admin/             # Team lead/admin dashboard

components/            # React components
├── ui/               # shadcn/ui primitives
└── [features]        # Feature-specific components

lib/
├── actions.ts        # Server Actions for mutations
├── queries.ts        # Cached read queries
├── schema.ts         # Zod validation schemas
├── view-models.ts    # Data transformation layer
├── auth.ts           # NextAuth configuration
├── db.ts             # Prisma client singleton
└── email/            # Email infrastructure
    ├── templates/    # React Email templates
    └── notifications.ts

prisma/
├── schema.prisma     # Database schema
└── seed.ts          # Seed data generator
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Docker & Docker Compose (for local development)
- PostgreSQL (managed instance for production)
- Resend account (for email notifications)

### Local Development

1. **Start local services**

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432 and MinIO (S3-compatible storage) on ports 9000 and 9001.

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/project_team_hub"

# Authentication
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"

# Local object storage (MinIO)
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_BUCKET="resumes"
S3_REGION="us-east-1"

# Email (get API key from resend.com)
RESEND_API_KEY="re_..."
ENABLE_EMAIL_NOTIFICATIONS="true"
```

4. **Set up the database**

```bash
# Apply schema
npx prisma db push

# Seed sample data
npm run db:seed
```

5. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Seed Accounts

The seed script creates sample accounts for testing:

| Role | Email | Password | Description |
|---|---|---|---|
| Platform Admin | admin@cornell.edu | password123 | Full platform access |
| Student | student@cornell.edu | password123 | Student portal access |
| Team Lead | leader@cornell.edu | password123 | Admin dashboard access |

Sample data includes 9 project teams (iGEM, Steel Bridge, AppDev, Rocketry, etc.) and 8 applications in various stages.

---

## Production Deployment

The application is optimized for deployment on Vercel with managed PostgreSQL and AWS S3.

### Environment Variables

Configure these in your hosting provider:

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | JWT signing secret (32+ random bytes) | Yes |
| `NEXTAUTH_URL` | Public URL (e.g., https://yourdomain.com) | Yes |
| `S3_ACCESS_KEY_ID` | AWS IAM access key | Yes |
| `S3_SECRET_ACCESS_KEY` | AWS IAM secret key | Yes |
| `S3_BUCKET` | S3 bucket name for resumes | Yes |
| `S3_REGION` | AWS region (e.g., us-east-1) | Yes |
| `RESEND_API_KEY` | Resend API key for emails | Yes |
| `ENABLE_EMAIL_NOTIFICATIONS` | Set to "true" to enable emails | No (default: false) |

**Note:** Omit `S3_ENDPOINT` in production to use AWS S3. It's only needed locally for MinIO.

### Code Style Conventions

- **Components:** PascalCase (`TeamCard.tsx`, `AdminDashboard.tsx`)
- **Functions/variables:** camelCase (`getUserProfile`, `applicationData`)
- **Types:** PascalCase, defined with Prisma or in `lib/types.ts`
- **UI Components:** Located in `components/ui/` (shadcn/ui primitives)
- **Feature Components:** Located directly in `components/`
- **Server-first:** Server Components by default, `"use client"` only when necessary

### Adding New Features

1. **Define schema** — Add Zod validation in `lib/schema.ts`
2. **Update database** — Modify `prisma/schema.prisma` and run `npx prisma db push`
3. **Create query/action** — Add to `lib/queries.ts` or `lib/actions.ts`
4. **Build view model** — Transform data in `lib/view-models.ts`
5. **Create UI** — Build components and pages in `app/` and `components/`

---

## Database Schema

The application uses a relational PostgreSQL database with the following core entities:

- **User** — Authentication and role management
- **StudentProfile** — Extended student information
- **Team** — Project team details and settings
- **Subteam** — Optional team subdivisions
- **RecruitingCycle** — Recruiting periods with custom questions
- **Application** — Student submissions with status tracking
- **ApplicationResponse** — Answers to custom questions
- **ApplicationScore** — Reviewer scoring with criteria
- **ReviewNote** — Public and private notes from reviewers
- **Event** — Recruiting events (info sessions, coffee chats)
- **InterviewSlot** — Scheduled interview time slots

### Application Lifecycle

Applications flow through these states:

```
DRAFT → SUBMITTED → UNDER_REVIEW → INTERVIEW → OFFER → ACCEPTED
                                                       ↘ REJECTED
                                                       ↘ WITHDRAWN
```

---

## Security

- **Authentication** — Secure JWT-based session management with NextAuth.js
- **Authorization** — Middleware-enforced role-based access control
- **Validation** — Server-side Zod schema validation on all inputs
- **SQL Injection** — Protected via Prisma's parameterized queries
- **XSS Protection** — React's built-in escaping and sanitization
- **CSRF Protection** — Server Actions provide built-in CSRF tokens
- **Environment Variables** — Sensitive data never exposed to client

---

### Local Database Management

**MinIO Console:** Access local object storage at `http://localhost:9001` (credentials: `minioadmin` / `minioadmin`)

**Prisma Studio:** Visual database editor available via `npm run db:studio`