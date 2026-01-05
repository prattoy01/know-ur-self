# AntiGravity 🌌
**The Unforgiving Productivity System**

AntiGravity is a strict, metrics-driven personal productivity platform designed to enforce discipline through transparency and weighted scoring.

## Core Philosophy
- **Weighted Effort**: Not all tasks are equal. A 2-hour deep work session is worth 4x a 30-minute chore.
- **Strict Accountability**: 
    - You cannot delete completed tasks. History is permanent.
    - Late task creation (same-day) incurs penalties.
    - Missed targets destroy your Daily Performance Score (DPS).
- **Transparency**: Every action affects your rating, visible instantly on your dashboard.

## Key Features

### 📅 Daily Plan
- **Weighted Tasks**: Define tasks by estimated duration (Minutes). The longer the task, the heavily it weighs on your daily score.
- **Strict Deletion Lock**: Once a task is marked complete, it is locked forever. No cheating.
- **Timezone-Aware**: Smart calendar that respects your local time perfectly.
- **Soft Deletes**: Deleted tasks are hidden but tracked for penalty calculations.

### 📈 Daily Performance Score (DPS)
A ruthless rating system that tracks your daily discipline from **-100 to +100**.
- **Plan Score**: Did you complete what you planned? (Weighted by time).
- **Discipline Score**: Did you create tasks late? Did you delete tasks? (Penalties applied).
- **Study Score**: Did you hit your study target hours?

### 💰 Finance Tracking
- Real-time budget status.
- Visual progress bars for income vs expenses.

### ⏱️ Activity & Study
- Timer-based logging (No manual entry cheating).
- Strict validation against daily goals.

### 📉 Rating History (Codeforces-style)
- **Honest Log**: A permanent record of your daily performance.
- **Detailed Breakdown**: See exactly why your rating went up or down (Study vs Plan vs Penalties).
- **Graph Visualization**: Track your long-term discipline trend.

### 📱 Mobile Optimized
- Fully responsive design with collapsible sidebar and touch-friendly interface.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (Prisma ORM) - *Easy to migrate to Postgres*
- **Styling**: Tailwind CSS
- **Auth**: Custom Auth with Email Verification
- **Graphs**: Recharts

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## License
Private / Proprietary
