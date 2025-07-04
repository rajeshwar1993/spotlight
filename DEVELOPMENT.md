# Spotlight Development Guide

A comprehensive guide for setting up and working with the Spotlight portfolio platform.

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajeshwar1993/spotlight.git
   cd spotlight/web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   npm run env:setup
   # Edit .env.local with your Supabase credentials
   ```

4. **Verify setup**
   ```bash
   npm run env:check
   npm run test:supabase
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Development Workflow

### Daily Development
```bash
# Start development with type checking
npm run dev

# In another terminal, watch for type errors
npm run type-check:watch

# Before committing
npm run validate:fix
```

### Code Quality
```bash
# Check everything
npm run validate

# Fix issues automatically
npm run validate:fix

# Individual checks
npm run lint
npm run format:check
npm run type-check
```

## 📁 Project Structure

```
web-app/
├── .vscode/              # VS Code configuration
├── .github/workflows/    # GitHub Actions CI/CD
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React components
│   │   ├── ui/        # shadcn/ui components
│   │   ├── forms/     # Form components
│   │   └── layout/    # Layout components
│   ├── hooks/         # Custom React hooks
│   ├── lib/          # Utilities and configurations
│   │   ├── supabase/ # Supabase client setup
│   │   ├── utils.ts  # General utilities
│   │   ├── env.ts    # Environment variables
│   │   └── constants.ts
│   ├── styles/       # Global styles
│   └── types/        # TypeScript type definitions
├── scripts/          # Development scripts
└── supabase/        # Database migrations
```

## 🎯 VS Code Setup

### Recommended Extensions
The project includes a `.vscode/extensions.json` file with recommended extensions. Install them by:

1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Extensions: Show Recommended Extensions"
4. Click "Install All"

### Key Extensions
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class completion
- **TypeScript Hero** - TypeScript utilities
- **GitLens** - Enhanced Git capabilities

### Debugging
Use the pre-configured debug configurations:

- **Next.js: debug server-side** - Debug API routes and server components
- **Next.js: debug client-side** - Debug React components
- **Next.js: debug full stack** - Debug both client and server
- **Debug Supabase Connection Test** - Debug database connectivity

## 🗄️ Database Development

### Supabase Setup
1. Create a Supabase project
2. Run migrations from `supabase/migrations/` in order:
   - `01_create_initial_database_schema.sql`
   - `02_enable_row_level_security.sql`
   - `03_setup_storage_buckets.sql`

### Testing Database Connection
```bash
npm run test:supabase
```

### Database Scripts
```bash
# Test connection
npm run test:supabase

# Migration commands (manual for now)
npm run db:migrate
npm run db:reset
npm run db:seed
```

## 🧪 Testing

### Running Tests
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format checking
npm run format:check

# All quality checks
npm run validate
```

### Performance Testing
```bash
# Bundle size analysis
npm run size:check

# Lighthouse performance test
npm run perf:lighthouse
```

## 📦 Build and Deployment

### Building for Production
```bash
# Standard build
npm run build

# Build with bundle analysis
npm run build:analyze

# Start production server
npm run start
```

### Environment-Specific Builds
- **Development**: `npm run dev`
- **Staging**: Automatic deployment on `develop` branch
- **Production**: Automatic deployment on `main` branch

## 🔧 Available Scripts

### Development Scripts
- `npm run dev` - Start development server
- `npm run dev:turbo` - Start with Turbo mode (experimental)
- `npm run type-check:watch` - Watch mode for type checking

### Build Scripts
- `npm run build` - Production build
- `npm run build:analyze` - Build with bundle analysis
- `npm run start` - Start production server

### Quality Scripts
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - TypeScript type checking
- `npm run validate` - Run all quality checks
- `npm run validate:fix` - Fix all quality issues

### Database Scripts
- `npm run test:supabase` - Test Supabase connection
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset database
- `npm run db:seed` - Seed database with initial data

### Utility Scripts
- `npm run clean` - Clean build artifacts
- `npm run clean:all` - Clean everything and reinstall
- `npm run env:setup` - Copy environment template
- `npm run env:check` - Verify environment variables
- `npm run deps:check` - Check for outdated dependencies
- `npm run deps:update` - Update dependencies
- `npm run security:audit` - Run security audit
- `npm run security:fix` - Fix security issues

### Performance Scripts
- `npm run size:check` - Analyze bundle size
- `npm run perf:lighthouse` - Run Lighthouse performance test

## 🔄 Git Workflow

### Branch Strategy
- **main** - Production-ready code
- **develop** - Integration branch for features
- **feature/*** - Feature development
- **function/*** - Specific functionality implementation

### Commit Process
1. **Pre-commit hooks** automatically run:
   - ESLint fixing
   - Prettier formatting
   - Type checking

2. **CI Pipeline** runs on push:
   - Code quality checks
   - Build verification
   - Security audit
   - Dependency validation

### Common Commands
```bash
# Feature development
git checkout -b feature/portfolio-creation
git add .
git commit -m "Add portfolio creation form"
git push origin feature/portfolio-creation

# After PR approval
git checkout develop
git pull origin develop
git merge feature/portfolio-creation
git push origin develop
```

## 🚀 Deployment

### Automatic Deployment
- **Staging**: Pushes to `develop` branch
- **Production**: Pushes to `main` branch

### Manual Deployment
```bash
# Deploy to staging
gh workflow run deploy.yml -f environment=staging

# Deploy to production
gh workflow run deploy.yml -f environment=production
```

### Environment Variables
Set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_STORAGE_BUCKET`

## 🐛 Troubleshooting

### Common Issues

#### Environment Variables Not Loading
```bash
# Check if .env.local exists
ls -la .env.local

# Verify environment variables
npm run env:check

# Reset environment file
npm run env:setup
```

#### TypeScript Errors
```bash
# Clean and reinstall
npm run clean:all

# Check for type errors
npm run type-check

# Watch for type errors
npm run type-check:watch
```

#### Build Failures
```bash
# Clean build cache
npm run clean

# Check for linting errors
npm run lint:fix

# Verify all checks pass
npm run validate:fix
```

#### Supabase Connection Issues
```bash
# Test connection
npm run test:supabase

# Check environment variables
npm run env:check

# Verify Supabase project is active
```

### Performance Issues
```bash
# Analyze bundle size
npm run size:check

# Run Lighthouse test
npm run perf:lighthouse

# Check for outdated dependencies
npm run deps:check
```

### Getting Help
1. Check this documentation
2. Review error messages in VS Code
3. Run the test suite: `npm run validate`
4. Check GitHub Actions logs for CI/CD issues
5. Review Supabase dashboard for database issues

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run validate:fix`
5. Commit your changes
6. Push to your fork
7. Create a Pull Request

All Pull Requests must pass the CI pipeline before merging.