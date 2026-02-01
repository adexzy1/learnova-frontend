# School Management System - Frontend

A modern, multi-tenant School Management System built with Next.js, featuring comprehensive tools for managing students, staff, academics, finance, and more.

## 🚀 Features

### Multi-Tenant Architecture

- **Super Admin Dashboard** - Manage multiple schools (tenants) from a central dashboard
- **Tenant-Specific Dashboards** - Each school has its own isolated environment
- **Role-Based Access Control** - Granular permissions for different user roles

### Core Modules

#### 📚 Academic Management

- Sessions & Terms configuration
- Class & Subject management
- Grading systems
- Timetable scheduling

#### 👨‍🎓 Student Management

- Student registration & profiles
- Admission tracking
- Entrance examinations
- Student results & transcripts

#### 📝 Assessment & Examinations

- Continuous Assessment (CA)
- Examination management
- Automated result computation
- Report card generation

#### 📊 Attendance Tracking

- Daily attendance marking
- Class-wise attendance reports
- Student attendance history
- Real-time attendance analytics

#### 💰 Finance Management

- Invoice generation
- Payment tracking
- Financial ledger
- Fee collection reports

#### 👥 Staff Management

- Staff profiles & records
- Role assignment
- Bulk import/export

#### 📢 Communication

- Internal messaging
- Notifications system
- Parent-teacher communication

#### 🎯 Discipline & Behavior

- Incident reporting
- Disciplinary records
- Behavior tracking

#### 📈 Reports & Analytics

- Dashboard analytics
- Custom report generation
- Performance metrics
- Financial reports

#### ⚙️ Settings & Configuration

- School profile customization
- Branding & theming
- Roles & permissions management
- System configuration

## 🛠️ Tech Stack

### Core Framework

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### UI & Styling

- **[TailwindCSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[Lucide React](https://lucide.dev/)** - Icon library

### State Management & Data Fetching

- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[TanStack Query (React Query)](https://tanstack.com/query)** - Server state management
- **[SWR](https://swr.vercel.app/)** - Data fetching hooks

### Forms & Validation

- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation

### Data Visualization

- **[Recharts](https://recharts.org/)** - Charting library
- **[TanStack Table](https://tanstack.com/table)** - Headless table library

### UI Enhancements

- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[date-fns](https://date-fns.org/)** - Date utilities
- **[Embla Carousel](https://www.embla-carousel.com/)** - Carousel component

### Analytics

- **[@vercel/analytics](https://vercel.com/analytics)** - Web analytics

## 📁 Project Structure

```
school-management-ui/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication routes (grouped)
│   │   ├── login/
│   │   └── signup/
│   ├── (tenant)/               # Tenant-specific routes (grouped)
│   │   ├── dashboard/          # Main dashboard
│   │   ├── students/           # Student management
│   │   ├── staff/              # Staff management
│   │   ├── academics/          # Academic structure
│   │   ├── assessments/        # Assessments & exams
│   │   ├── attendance/         # Attendance tracking
│   │   ├── finance/            # Finance management
│   │   ├── admissions/         # Admissions & registration
│   │   ├── results/            # Results & transcripts
│   │   ├── communications/     # Messaging & notifications
│   │   ├── discipline/         # Discipline tracking
│   │   ├── reports/            # Reports & analytics
│   │   ├── settings/           # School settings
│   │   ├── parent/             # Parent portal
│   │   ├── student/            # Student portal
│   │   └── profile/            # User profile
│   ├── super-admin/            # Super admin dashboard
│   │   ├── page.tsx            # Dashboard overview
│   │   ├── schools/            # Tenant management
│   │   ├── onboarding/         # New tenant onboarding
│   │   ├── audit/              # Audit logs
│   │   ├── config/             # System configuration
│   │   └── security/           # Security settings
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/                 # React components
│   ├── ui/                     # shadcn/ui components
│   ├── layout/                 # Layout components
│   └── shared/                 # Shared components
├── lib/                        # Utilities & helpers
│   ├── api/                    # API client
│   ├── stores/                 # Zustand stores
│   │   ├── auth-store.ts       # Authentication state
│   │   ├── ui-store.ts         # UI state (sidebar, theme)
│   │   └── draft-store.ts      # Draft/form state
│   ├── utils.ts                # Utility functions
│   ├── format.ts               # Formatting helpers
│   └── navigation.ts           # Navigation configuration
├── hooks/                      # Custom React hooks
│   ├── use-mobile.ts           # Mobile detection
│   ├── use-offline.ts          # Offline detection
│   ├── use-permission.tsx      # Permission checks
│   └── use-toast.ts            # Toast notifications
├── features/                   # Feature modules
│   └── dashboard/              # Dashboard components
├── providers/                  # Context providers
├── schemas/                    # Zod validation schemas
├── types/                      # TypeScript type definitions
├── public/                     # Static assets
├── styles/                     # Additional styles
├── BACKEND_API_SPEC.md         # Backend API documentation
└── package.json                # Dependencies
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** - Version 18.x or higher
- **npm** or **yarn** or **pnpm** - Package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd school-management-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Development

1. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

### Linting

```bash
npm run lint
```

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.schoolsms.com/v1

# Authentication (if using external auth provider)
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_AUTH_CLIENT_ID=your-client-id

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 📖 Key Concepts

### Multi-Tenant Architecture

This application supports multiple schools (tenants), each with isolated data:

- **Super Admin**: Manages all tenants from `/super-admin/*`
- **Tenant Routes**: Each school accesses their data via `/(tenant)/*` routes
- **Tenant Identification**: Backend uses `X-Tenant-ID` header for tenant isolation

### Route Groups

Next.js route groups (folders with parentheses) are used to organize routes without affecting the URL structure:

- `(auth)` - Authentication pages
- `(tenant)` - Main application pages for school tenants
- `super-admin` - Super admin pages (not grouped, appears in URL)

### State Management

- **Zustand** - Client-side state (auth, UI preferences, drafts)
- **TanStack Query** - Server state, caching, and synchronization
- **SWR** - Alternative data fetching with automatic revalidation

### Styling Approach

- **TailwindCSS** - Utility-first styling
- **CSS Variables** - Theme customization via `globals.css`
- **Component Variants** - Using `class-variance-authority` for component variations

## 🎨 Theming

The application supports light and dark themes using `next-themes`. Theme toggle is available in the UI.

Customize theme colors in `app/globals.css`:

```css
:root {
  --background: ...;
  --foreground: ...;
  /* ... other CSS variables */
}
```

## 🔌 API Integration

The backend API specification is documented in [`BACKEND_API_SPEC.md`](./BACKEND_API_SPEC.md).

### API Client Setup

Configure the API client in `lib/api/`:

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add tenant header
apiClient.interceptors.request.use((config) => {
  const tenantId = getTenantId(); // from auth store
  if (tenantId) {
    config.headers["X-Tenant-ID"] = tenantId;
  }
  return config;
});
```

## 📝 Development Guidelines

### Component Creation

When creating new components:

1. Use TypeScript with proper type definitions
2. Follow the shadcn/ui component pattern for consistency
3. Place shared components in `components/shared/`
4. Place module-specific components in respective feature folders

### Adding New Pages

1. Create the page in the appropriate route group
2. Add navigation links in `lib/navigation.ts`
3. Update permissions in `hooks/use-permission.tsx` if needed

### Form Handling

Use React Hook Form with Zod validation:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

## 🧪 Testing

> **Note**: Testing setup is pending. Future updates will include:
>
> - Unit tests with Jest
> - Component tests with React Testing Library
> - E2E tests with Playwright

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project to Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform supporting Next.js:

- **Netlify**
- **AWS Amplify**
- **DigitalOcean App Platform**
- **Docker** (self-hosted)

For Docker deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🐛 Known Issues

- TypeScript build errors are currently ignored (`ignoreBuildErrors: true`)
- Images are unoptimized for development

## 📞 Support

For support and questions, please contact the development team.

---

**Built with ❤️ using Next.js and modern web technologies**
