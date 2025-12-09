# OpenNext Boilerplate

A modern, production-ready Next.js 16 boilerplate with authentication, internationalization, payments, and a beautiful UI out of the box.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748?style=flat-square&logo=prisma)

## ✨ Features

- **🔐 Authentication** - Complete auth system with Better Auth (email/password, OAuth, magic links)
- **🌍 Internationalization** - Multi-language support with next-intl (EN/ES ready)
- **💳 Payments** - Stripe integration for subscriptions and one-time payments
- **📊 Dashboard** - Admin dashboard with analytics, charts, and data tables
- **📋 Task Management** - Kanban board with drag & drop, calendar view, and task lists
- **📧 Email** - Transactional emails with React Email and Resend
- **📝 Documentation** - Built-in docs with Nextra
- **🎨 UI Components** - Beautiful components built with Radix UI and Tailwind CSS
- **🌙 Dark Mode** - Theme switching with next-themes
- **📱 Responsive** - Mobile-first design approach
- **🔍 SEO Ready** - Optimized for search engines
- **📈 Analytics** - Vercel Analytics and Speed Insights

## 🛠️ Tech Stack

| Category         | Technology              |
| ---------------- | ----------------------- |
| Framework        | Next.js 15 (App Router) |
| Language         | TypeScript              |
| Styling          | Tailwind CSS 4          |
| Database         | PostgreSQL + Prisma ORM |
| Authentication   | Better Auth             |
| Payments         | Stripe                  |
| State Management | TanStack Query, Zustand |
| Forms            | React Hook Form + Zod   |
| UI Components    | Radix UI, Lucide Icons  |
| Animations       | Framer Motion, GSAP     |
| Email            | React Email + Resend    |
| File Storage     | Vercel Blob             |
| Documentation    | Nextra                  |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/maticarrera12/opennextjs_boilerplate.git
cd opennextjs_boilerplate
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

4. **Configure your `.env` file**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/opennext"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Resend (email)
RESEND_API_KEY=""

# Vercel Blob (file uploads)
BLOB_READ_WRITE_TOKEN=""
```

5. **Set up the database**

```bash
npx prisma db push
npx prisma db seed  # Optional: seed with sample data
```

6. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── actions/         # Server actions
│   ├── app/
│   │   └── [locale]/    # Internationalized routes
│   │       ├── (admin)/ # Dashboard routes
│   │       ├── (auth)/  # Authentication routes
│   │       ├── (marketing)/ # Landing pages
│   │       └── docs/    # Documentation
│   ├── components/      # Reusable components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   ├── messages/        # Translation files (en.json, es.json)
│   └── types/           # TypeScript types
└── ...
```

## 📜 Available Scripts

| Command            | Description               |
| ------------------ | ------------------------- |
| `npm run dev`      | Start development server  |
| `npm run build`    | Build for production      |
| `npm run start`    | Start production server   |
| `npm run lint`     | Run ESLint                |
| `npm run lint:fix` | Fix ESLint errors         |
| `npm run format`   | Format code with Prettier |
| `npm run email`    | Preview email templates   |

## 🗄️ Database Commands

```bash
npx prisma studio      # Open Prisma Studio (GUI)
npx prisma db push     # Push schema changes
npx prisma migrate dev # Create migration
npx prisma db seed     # Seed database
```

## 🌐 Internationalization

The app supports multiple languages out of the box. Add new languages by:

1. Creating a new translation file in `src/messages/`
2. Adding the locale to `src/i18n/routing.ts`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js
