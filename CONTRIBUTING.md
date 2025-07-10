# Contributing to MaxxGPT

Thank you for your interest in contributing to MaxxGPT! This document provides detailed instructions for getting started with development and contributing to the project.

## 🌐 Environment Links

- **Production**: [gpt.maxxpotential.com](https://gpt.maxxpotential.com)
- **Development**: [maxxgpt-2.vercel.app](https://maxxgpt-2.vercel.app)
- **Repository**: [MAXX-Potential/maxxgpt-2](https://github.com/MAXX-Potential/maxxgpt-2)

## 🔄 Git Workflow

We use a **dev-to-main** workflow to ensure code quality and proper review:

1. **All development happens on the `dev` branch**
2. **Contributors commit changes to `dev`**
3. **Pull requests are made from `dev` to `main` for approval**
4. **Another developer must review and approve PRs before merging to `main`**

### Git Commands

```bash
# Clone the repository
git clone https://github.com/MAXX-Potential/maxxgpt-2.git
cd maxxgpt-2

# Switch to dev branch
git checkout dev

# Create a feature branch (optional but recommended)
git checkout -b feature/your-feature-name

# Make your changes, then commit
git add .
git commit -m "feat: descriptive commit message"

# Push to dev branch
git push origin dev
# Or push your feature branch
git push origin feature/your-feature-name

# Create a Pull Request from dev (or your feature branch) to main
```

### Commit Message Format

Use conventional commit format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

Examples:
```bash
git commit -m "feat: add dark mode toggle to user settings"
git commit -m "fix: resolve authentication redirect issue"
git commit -m "docs: update API documentation for chat endpoints"
```

## 🛠 Technology Stack

MaxxGPT is built with:

- **Frontend**: Next.js 14 with TypeScript, React 18
- **Styling**: Tailwind CSS with Radix UI components
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **AI Providers**: OpenAI, Anthropic, Google, Mistral, Azure OpenAI
- **Development**: Docker, ESLint, Prettier, Husky
- **Testing**: Jest, Playwright

## 📋 Prerequisites

Before you begin, ensure you have access to:

1. **Git Repository Access**: Contact the team lead for repository access
2. **Supabase Project Access**: Request access to the Supabase project
3. **Environment Variables**: Request the `.env.local` file from the team lead
4. **Development Tools**: Install required tools listed below

## 🚀 Local Development Setup

### 1. Required Tools Installation

**Install Node.js (v18 or higher)**
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

**Install Docker**
- Download and install [Docker Desktop](https://docs.docker.com/get-docker)
- Ensure Docker is running before proceeding

**Install Supabase CLI**

MacOS/Linux:
```bash
brew install supabase/tap/supabase
```

Windows:
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Install Git (if not already installed)**
```bash
# MacOS
brew install git

# Verify
git --version
```

### 2. Project Setup

**Clone and Setup Repository**
```bash
# Clone the repository
git clone https://github.com/MAXX-Potential/maxxgpt-2.git
cd maxxgpt-2

# Switch to dev branch
git checkout dev

# Install dependencies
npm install
```

### 3. Environment Configuration

**Request Access to Required Resources:**
1. **Repository Access**: Ask team lead to add you as a collaborator
2. **Supabase Project**: Request access to the MaxxGPT Supabase project
3. **Environment File**: Request the complete `.env.local` file

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (optional - for OpenAI models)
- `ANTHROPIC_API_KEY` (optional - for Claude models)
- `GOOGLE_GENERATIVE_AI_API_KEY` (optional - for Gemini models)
- Additional provider keys as needed

**Setup Environment:**
```bash
# Copy the environment file you received
cp .env.local.example .env.local  # If template exists
# Or place the .env.local file you received in the root directory
```

### 4. Database Setup

**Start Local Supabase**
```bash
# Start Supabase (this will download Docker images on first run)
supabase start

# Get local development values
supabase status
```

**Configure Database Connection**
Update your `.env.local` with the local Supabase values from `supabase status`:
- Use the `API URL` for `NEXT_PUBLIC_SUPABASE_URL`
- Use the `anon key` for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Use the `service_role key` for `SUPABASE_SERVICE_ROLE_KEY`

**Run Database Migrations**
```bash
# Generate types and run migrations
npm run db-types
```

### 5. Start Development Server

```bash
# Start the development server (includes Supabase start)
npm run chat

# Alternative: Start Next.js dev server only
npm run dev
```

Your application should now be running at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Supabase Studio**: [http://localhost:54323](http://localhost:54323)

## 🧪 Testing

**Run Tests**
```bash
# Run Jest tests
npm test

# Run Playwright e2e tests (if configured)
cd __tests__/playwright-test
npm install
npm test
```

**Code Quality**
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format:write

# Type check
npm run type-check

# Run all quality checks
npm run clean
```

## 📁 Project Structure

```
maxxgpt-2/
├── app/                    # Next.js app directory (routes)
│   ├── [locale]/          # Internationalization routes
│   └── api/               # API routes
├── components/            # React components
│   ├── chat/             # Chat-related components
│   ├── ui/               # Reusable UI components
│   └── utility/          # Utility components
├── context/              # React context providers
├── db/                   # Database utilities and types
├── lib/                  # Utility libraries and helpers
├── supabase/             # Supabase configuration and migrations
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🔍 Key Development Areas

**Adding New AI Providers**
- Add provider configuration in `lib/models/llm/`
- Create API route in `app/api/chat/[provider]/`
- Update model selection UI

**Chat Features**
- Components: `components/chat/`
- Hooks: `components/chat/chat-hooks/`
- Message handling: `components/messages/`

**UI Components**
- Base components: `components/ui/`
- Styled with Tailwind CSS and Radix UI

**Database Operations**
- Database utilities: `db/`
- Supabase migrations: `supabase/migrations/`

## 📝 Pull Request Process

1. **Create Feature Branch** (optional but recommended)
   ```bash
   git checkout dev
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   ```

3. **Push to Repository**
   ```bash
   git push origin feature/your-feature-name
   # Or directly to dev
   git push origin dev
   ```

4. **Create Pull Request**
   - Go to GitHub repository
   - Create PR from your branch to `main`
   - Add detailed description of changes
   - Request review from team members

5. **Code Review**
   - Address reviewer feedback
   - Ensure all tests pass
   - Maintain clean commit history

6. **Merge**
   - PR must be approved by another developer
   - Merge to `main` after approval

## 🆘 Troubleshooting

**Common Issues:**

1. **Docker not running**
   ```bash
   # Start Docker Desktop first, then:
   supabase start
   ```

2. **Port conflicts**
   ```bash
   # Stop Supabase and restart
   supabase stop
   supabase start
   ```

3. **Database connection issues**
   ```bash
   # Reset local database
   npm run db-reset
   ```

4. **Node modules issues**
   ```bash
   # Clear and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📞 Getting Help

- **Technical Issues**: Create an issue in the GitHub repository
- **Access Requests**: Contact the team lead
- **Questions**: Use the team communication channel

## 🎯 Development Tips

1. **Always work on the `dev` branch**
2. **Test your changes locally before pushing**
3. **Keep commits small and focused**
4. **Write meaningful commit messages**
5. **Update documentation when adding features**
6. **Follow the existing code style and patterns**
7. **Test with multiple AI providers when relevant**

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

Happy coding! 🚀 