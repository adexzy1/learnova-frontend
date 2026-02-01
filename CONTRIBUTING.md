# Contributing to School Management System

Thank you for your interest in contributing to the School Management System! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Component Development](#component-development)
- [State Management Guidelines](#state-management-guidelines)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)

## Getting Started

1. **Fork the Repository**

   ```bash
   # Fork via GitHub UI, then clone your fork
   git clone https://github.com/YOUR_USERNAME/school-management-ui.git
   cd school-management-ui
   ```

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Setup

### Required Tools

- **Node.js**: v18.x or higher
- **Package Manager**: npm, yarn, or pnpm
- **Code Editor**: VS Code (recommended)

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript error translator
- GitLens

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/v1
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## Coding Standards

### TypeScript

- **Always use TypeScript** - No `.js` or `.jsx` files
- **Explicit types** - Define types for props, state, and function returns
- **Avoid `any`** - Use `unknown` if type is truly unknown
- **Use interfaces for objects** - Prefer interfaces over type aliases for object shapes

```typescript
// ✅ Good
interface StudentProps {
  id: string;
  name: string;
  age: number;
}

// ❌ Avoid
const props: any = { id: "1", name: "John" };
```

### Naming Conventions

- **Components**: PascalCase - `StudentCard.tsx`
- **Hooks**: camelCase with `use` prefix - `useStudentData.ts`
- **Utils**: camelCase - `formatDate.ts`
- **Constants**: UPPER_SNAKE_CASE - `MAX_STUDENTS`
- **Types/Interfaces**: PascalCase - `Student`, `StudentProps`

### File Organization

```
feature/
├── components/          # Feature-specific components
│   ├── StudentCard.tsx
│   └── StudentList.tsx
├── hooks/               # Feature-specific hooks
│   └── useStudentData.ts
├── types/               # Feature-specific types
│   └── student.types.ts
└── utils/               # Feature-specific utilities
    └── studentHelpers.ts
```

## Component Development

### Component Structure

Follow this structure for all components:

```typescript
'use client' // Only if client component

import React from 'react'
import { cn } from '@/lib/utils'

// Types
interface ComponentNameProps {
  // Props definition
}

// Component
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Hooks
  const [state, setState] = useState()

  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies])

  // Handlers
  const handleClick = () => {
    // Handler logic
  }

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Server vs Client Components

**Use Server Components** (default):

- Static content
- Data fetching without client interaction
- SEO-critical pages

**Use Client Components** (`'use client'`):

- Interactive elements (onClick, onChange)
- Hooks (useState, useEffect)
- Browser APIs
- Third-party libraries requiring DOM

### shadcn/ui Components

When using shadcn/ui components:

```typescript
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Always destructure named imports
```

### Styling Guidelines

1. **Use Tailwind utility classes** - Avoid custom CSS when possible
2. **Use `cn()` for conditional classes**:
   ```typescript
   <div className={cn(
     "base-classes",
     condition && "conditional-classes",
     className // Allow prop-based override
   )} />
   ```
3. **Follow responsive design**: Mobile-first approach
   ```typescript
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
   ```

## State Management Guidelines

### When to Use What

| State Type      | Tool            | Example                      |
| --------------- | --------------- | ---------------------------- |
| Component state | `useState`      | Form inputs, toggles         |
| Derived state   | `useMemo`       | Filtered lists, calculations |
| Server data     | TanStack Query  | API data, lists              |
| Global UI state | Zustand         | Theme, sidebar               |
| Form state      | React Hook Form | Complex forms                |
| URL state       | Next.js router  | Filters, pagination          |

### Zustand Store Pattern

```typescript
// lib/stores/feature-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FeatureStore {
  // State
  data: Data | null;

  // Actions
  setData: (data: Data) => void;
  reset: () => void;
}

export const useFeatureStore = create<FeatureStore>()(
  persist(
    (set) => ({
      data: null,
      setData: (data) => set({ data }),
      reset: () => set({ data: null }),
    }),
    {
      name: "feature-storage",
    },
  ),
);
```

### TanStack Query Pattern

```typescript
// Use queries for GET requests
const { data, isLoading, error } = useQuery({
  queryKey: ["students", filters],
  queryFn: () => fetchStudents(filters),
  staleTime: 5 * 60 * 1000,
});

// Use mutations for POST/PUT/DELETE
const mutation = useMutation({
  mutationFn: createStudent,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
    toast.success("Student created");
  },
});
```

## API Integration

### API Client Structure

```typescript
// lib/api/students.ts
import { apiClient } from "./client";

export interface Student {
  id: string;
  name: string;
  // ... other fields
}

export const studentAPI = {
  getAll: (params?: QueryParams) =>
    apiClient.get<Student[]>("/students", { params }),

  getById: (id: string) => apiClient.get<Student>(`/students/${id}`),

  create: (data: CreateStudentDTO) =>
    apiClient.post<Student>("/students", data),

  update: (id: string, data: UpdateStudentDTO) =>
    apiClient.put<Student>(`/students/${id}`, data),

  delete: (id: string) => apiClient.delete(`/students/${id}`),
};
```

### Error Handling

```typescript
try {
  await studentAPI.create(data);
  toast.success("Student created successfully");
} catch (error) {
  if (error.response?.status === 400) {
    toast.error(error.response.data.message);
  } else {
    toast.error("An error occurred. Please try again.");
  }
}
```

## Testing

### Unit Tests (Coming Soon)

```typescript
// __tests__/utils/format.test.ts
import { formatDate } from "@/lib/format";

describe("formatDate", () => {
  it("formats date correctly", () => {
    const date = new Date("2024-01-15");
    expect(formatDate(date)).toBe("Jan 15, 2024");
  });
});
```

### Component Tests (Coming Soon)

```typescript
// __tests__/components/StudentCard.test.tsx
import { render, screen } from '@testing-library/react'
import { StudentCard } from '@/components/StudentCard'

describe('StudentCard', () => {
  it('renders student name', () => {
    render(<StudentCard student={mockStudent} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

## Pull Request Process

### Before Submitting

1. **Test your changes** - Ensure everything works
2. **Run linter** - `npm run lint`
3. **Check types** - `npm run type-check` (if available)
4. **Update documentation** - If you changed APIs or added features

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made

- Change 1
- Change 2

## Testing

How to test these changes

## Screenshots (if applicable)

Add screenshots for UI changes

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Submit PR** - Create pull request to `main` branch
2. **Automated checks** - Wait for CI/CD to pass
3. **Code review** - Address review comments
4. **Approval** - Get approval from maintainers
5. **Merge** - Maintainer will merge your PR

## Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(students): add student profile page

- Created student profile layout
- Added student information display
- Integrated with student API

Closes #123
```

```bash
fix(auth): resolve token refresh issue

Fixed bug where expired tokens were not being refreshed properly

Fixes #456
```

```bash
docs(readme): update installation instructions
```

## Code Review Checklist

When reviewing PRs, check for:

### Functionality

- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling implemented

### Code Quality

- [ ] TypeScript types defined
- [ ] No linter errors
- [ ] DRY principle followed
- [ ] Functions are small and focused

### Performance

- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Large components lazy-loaded

### Accessibility

- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works

### Security

- [ ] User input validated
- [ ] No sensitive data exposed
- [ ] API calls use proper authentication

## Getting Help

- **Documentation**: Check README.md and ARCHITECTURE.md
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Contact**: Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

**Thank you for contributing to the School Management System! 🎉**
