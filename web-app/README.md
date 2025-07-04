# Spotlight Web Application

A modern portfolio platform for actors and models built with Next.js 15+, Supabase, TypeScript, and Tailwind CSS.

## 🎯 Project Overview

Spotlight enables actors and models to create professional portfolios in under 5 minutes with:
- 4 stunning template designs
- Drag-and-drop image uploads
- Mobile-first responsive design
- 90+ Lighthouse performance scores
- SEO-optimized portfolio pages

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/rajeshwar1993/spotlight.git
   cd spotlight/web-app
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── forms/         # Form components
│   └── layout/        # Layout components
├── hooks/             # Custom React hooks
├── lib/              # Utilities and configurations
│   ├── supabase/     # Supabase client setup
│   ├── utils.ts      # General utilities
│   ├── env.ts        # Environment variables
│   └── constants.ts  # App constants
├── styles/           # Additional styles
└── types/           # TypeScript definitions
```

## 🗄️ Database Schema

### Core Tables
- **users** - User profiles and authentication data
- **portfolios** - Portfolio information and settings
- **images** - Image metadata and storage references
- **announcements** - System announcements

### Key Features
- Row Level Security (RLS) policies
- Automatic user creation on signup
- Image upload with multiple formats
- Template-based portfolio rendering

## 🎨 Features

### User Experience
- **3-step portfolio creation** process
- **4 professional templates** (T1-T4)
- **Drag-and-drop image uploads**
- **Real-time preview** while editing
- **Mobile-optimized** interface

### Technical Features
- **Server-Side Generation** for portfolio pages
- **Image optimization** with WebP conversion
- **SEO optimization** with meta tags and structured data
- **Performance monitoring** with Lighthouse CI
- **Type-safe** development with TypeScript

## 🚀 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run dev:turbo        # Start with Turbo mode
npm run type-check       # TypeScript type checking
npm run type-check:watch # Watch mode for type checking
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run validate         # Run all quality checks
npm run validate:fix     # Fix all issues
```

### Build & Deploy
```bash
npm run build            # Production build
npm run build:analyze    # Build with bundle analysis
npm run start            # Start production server
```

### Database
```bash
npm run test:supabase    # Test database connection
npm run db:migrate       # Run migrations (manual)
npm run db:reset         # Reset database
```

### Utilities
```bash
npm run clean            # Clean build artifacts
npm run env:setup        # Setup environment file
npm run env:check        # Verify environment variables
npm run deps:check       # Check outdated dependencies
npm run security:audit   # Security audit
npm run perf:lighthouse  # Performance testing
```

## 🔧 Development Setup

### VS Code Configuration
The project includes optimized VS Code settings:
- Automatic formatting on save
- ESLint and Prettier integration
- TypeScript configuration
- Tailwind CSS IntelliSense
- Debugging configurations

### Recommended Extensions
Install the recommended extensions when prompted:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Hero
- GitLens

## 🗄️ Supabase Setup

1. **Create Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Note down project URL and API keys

2. **Run Database Migrations**
   - Go to SQL Editor in Supabase dashboard
   - Run migrations from `../supabase/migrations/` in order:
     - `01_create_initial_database_schema.sql`
     - `02_enable_row_level_security.sql`
     - `03_setup_storage_buckets.sql`

3. **Configure Authentication**
   - Enable Email/Password authentication
   - Configure OAuth providers (Google recommended)
   - Set up email templates

4. **Test Connection**
   ```bash
   npm run test:supabase
   ```

## 🌐 Deployment

### Automatic Deployment
- **Staging**: Automatic deployment on `develop` branch push
- **Production**: Automatic deployment on `main` branch push

### Manual Deployment
```bash
# Deploy to staging
gh workflow run deploy.yml -f environment=staging

# Deploy to production  
gh workflow run deploy.yml -f environment=production
```

### Environment Variables
Configure these in your deployment platform:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_URL=your_app_url
NEXTAUTH_SECRET=your_secret
NEXT_PUBLIC_APP_URL=your_app_url
NEXT_PUBLIC_APP_NAME=Spotlight
NEXT_PUBLIC_STORAGE_BUCKET=portfolios
```

## 📊 Performance

### Target Metrics
- **Lighthouse Performance**: 90+
- **Page Load Time**: <2 seconds
- **First Contentful Paint**: <1 second
- **Cumulative Layout Shift**: <0.1

### Monitoring
- Lighthouse CI in GitHub Actions
- Performance budgets enforced
- Bundle size analysis
- Core Web Vitals tracking

## 🧪 Testing

### Quality Assurance
```bash
# Run all quality checks
npm run validate

# Individual checks
npm run lint
npm run type-check
npm run format:check
npm run security:audit
```

### CI/CD Pipeline
- Code quality checks
- TypeScript compilation
- Build verification
- Security audits
- Performance testing

## 🔒 Security

### Best Practices
- Row Level Security (RLS) enabled
- Input validation with Zod
- Environment variable validation
- Security audits in CI/CD
- HTTPS enforcement

### Authentication
- Supabase Auth integration
- Email verification required
- OAuth provider support
- Session management
- Protected routes

## 📚 Documentation

- **[Development Guide](../DEVELOPMENT.md)** - Comprehensive development setup
- **[Supabase Setup](../SUPABASE_SETUP.md)** - Database configuration guide
- **[Plan.md](../docs/Plan.md)** - Complete development roadmap
- **[PRD.md](../docs/PRD.md)** - Product requirements document

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Workflow
1. Run `npm run validate:fix` before committing
2. All tests must pass in CI/CD pipeline
3. Code review required for all PRs
4. Automatic deployment after merge

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [Development Guide](../DEVELOPMENT.md)
- **Issues**: [GitHub Issues](https://github.com/rajeshwar1993/spotlight/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rajeshwar1993/spotlight/discussions)

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.