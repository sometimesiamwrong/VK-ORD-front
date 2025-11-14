# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based frontend application for VK ORD (Обязательная Регистрация Данных) - a Russian advertising registration system. The application manages the full lifecycle of advertising contracts, creatives, and media files through integration with VK ORD API.

## Development Commands

### Running the Application
- **Development**: `npm run dev` (runs on http://localhost:5173)
  - **IMPORTANT**: Do NOT terminate this process unnecessarily. Ask the user before stopping it.
  - Uses proxy to `http://localhost:5000` for `/api/*` requests
- **Build**: `npm run build` (ALWAYS run this at the end of work to verify everything compiles)
- **Preview**: `npm run preview` (preview production build)

### Additional Commands
- `npm run registry:start` - Start local shadcn/ui component registry server on port 8080
- `npm run mcp:ts-dev` - Run TypeScript development helper via MCP
- `npm run storybook` - Start Storybook dev server on port 6006 for component development
- `npm run build-storybook` - Build static Storybook for deployment

### Testing Credentials
Use these credentials for development and testing:
- **Username**: 123123
- **Password**: 123

## Architecture Overview

### Core Technology Stack
- **React 19** with TypeScript and functional components
- **Vite** as build tool and dev server
- **TanStack Query (React Query)** for server state management
- **Zustand** for client-side state management (tokens, environment)
- **React Router v7** with HashRouter for client-side routing
- **Material UI** for primary UI components
- **shadcn/ui + Tailwind CSS** for modern utility-first styling
- **Axios** with automatic camelCase/snake_case conversion

### Project Structure

```
src/
├── api/                    # HTTP client and React Query setup
│   ├── http.ts             # Axios instance with interceptors (auth, refresh, case conversion)
│   └── queryClient.ts      # React Query configuration
├── auth/                   # Authentication layer
│   ├── hooks.ts            # Auth hooks (login, logout, register, autoRefresh)
│   └── tokenStore.ts       # Zustand stores (token, device, environment)
├── components/
│   ├── layout/             # Layout components (DashboardLayout)
│   ├── steps/              # Wizard step components
│   ├── wizard/             # Main wizard component
│   └── ui/                 # Reusable UI components (shadcn/ui + custom)
├── context/
│   └── AppContext.tsx      # Legacy wizard state context (useReducer-based)
├── features/               # Feature-based modules (each page/domain)
│   ├── auth/               # Login/Register pages
│   ├── dashboard/          # Dashboard page
│   ├── users/              # Profile management
│   ├── credentials/        # VK ORD credential management
│   ├── contracts/          # Contract management
│   ├── creatives/          # Creative management
│   ├── media/              # Media file management
│   ├── parties/            # Counterparty management
│   ├── acts/               # Act creation and management
│   └── wizard/             # Wizard flow for contract creation
├── hooks/                  # Custom React hooks
├── services/               # API service classes (contracts, counterparties, etc.)
├── stores/                 # Zustand stores (wizardStore)
├── types/                  # TypeScript type definitions
│   ├── enums/              # VK ORD enums (vk-ord.ts)
│   └── common/             # Common type definitions
├── constants/              # Application constants (KKTY data)
├── utils/                  # Utility functions (logger, storage, transformers)
├── lib/                    # Third-party library utilities (cn, etc.)
├── stories/                # Storybook stories
└── routes.tsx              # Main routing configuration
```

## Key Architecture Patterns

### Authentication & Token Management

**Token Storage Strategy:**
- Access tokens stored in-memory (Zustand) - never in localStorage
- Refresh tokens stored in httpOnly cookies via backend
- Device ID persisted in localStorage

**Automatic Token Refresh:**
- `http.ts` interceptor handles 401 responses
- Queues failed requests during refresh
- Redirects to login if refresh fails
- NEVER retries auth endpoints (`/api/auth/*`) to prevent infinite loops

**Important Files:**
- `src/auth/tokenStore.ts` - Zustand stores for tokens and environment
- `src/api/http.ts` - Axios interceptors with refresh logic
- `src/auth/hooks.ts` - Auth-related React Query hooks

### API Integration

**HTTP Client Features:**
1. **Base URL Configuration** (vite.config.ts:7-8):
   - Development: Uses proxy to localhost:5000
   - Production: Uses cloud domain from env or default
2. **Request Interceptors**:
   - Adds Authorization Bearer token
   - Adds `x-api-vk-env` header (sandbox/prod)
   - Adds `x-vkord-credential-id` from cookies
   - Converts camelCase → snake_case for request bodies
3. **Response Interceptors**:
   - Converts snake_case → camelCase for responses
   - Handles 401 with automatic token refresh
   - Parses "Broken Rules" errors (400 with JSON array)

**Broken Rules Error Handling:**
Backend returns validation errors as `BrokenRule[]` with code + message. The http client maps error codes to user-friendly Russian messages (http.ts:30-39).

### State Management

**Three State Systems:**

1. **Legacy Wizard Context** (`context/AppContext.tsx`):
   - Uses React useReducer pattern
   - Manages multi-step wizard state
   - Auto-saves to localStorage every 2 seconds
   - Includes party history, consent, INN validation
   - **DEPRECATED**: Being gradually replaced by wizardStore

2. **Modern Zustand Stores**:
   - `auth/tokenStore.ts`:
     - `useTokenStore` - Access/refresh tokens
     - `useDeviceStore` - Device identification
     - `useEnvironmentStore` - Sandbox vs Production toggle
   - `stores/wizardStore.ts`:
     - Modern replacement for AppContext
     - Persisted to localStorage
     - Manages wizard flow (parties, contracts, creatives)
     - Includes loading states, template management, party history

3. **Server State**:
   - All API calls use TanStack Query (React Query)
   - Service classes in `src/services/` provide static methods
   - Hooks in feature folders or `src/hooks/` wrap mutations/queries

### Routing & Guards

**Router Configuration** (routes.tsx):
- Uses HashRouter for client-side routing
- `ProtectedRoute` component checks authentication
- `PublicRoute` redirects authenticated users to dashboard
- Auto-refresh attempted on mount via `useAutoRefresh`

**Route Structure:**
- `/login`, `/register` - Public routes
- `/dashboard` - Main dashboard (no layout wrapper)
- `/` - Default route redirects to wizard page
- All other routes wrapped in `DashboardLayout`:
  - `/profile` - User profile management
  - `/credentials` - VK ORD credentials
  - `/contracts` - Contract list
  - `/creatives` - Creative list
  - `/media` - Media file management
  - `/wizard` - Main wizard for ERID generation
  - `/parties` - Counterparty management
  - `/acts` - Act creation and management
  - `/acts/new` - Create new act
  - `/acts/:actId/edit` - Edit existing act

### Environment Switching

The application supports switching between VK ORD sandbox and production environments:
- Controlled via `useEnvironmentStore` in tokenStore
- Sets `x-api-vk-env` header on API requests
- Default is "sandbox"
- Persisted in localStorage

### Guards & Modals

**CredentialGuard** (`components/guards/CredentialGuard.tsx`):
- Monitors VK ORD credential selection across the app
- Shows modal when credential is required but not selected
- Mounted at app root level in routes.tsx
- Non-blocking component that overlays when needed

### Utility Functions

**Logger** (`utils/logger.ts`):
- Environment-aware logging utility
- `logger.debug()` - Development only
- `logger.info()` - General information
- `logger.warn()` - Warnings
- `logger.error()` - Errors with stack traces
- Can be extended to send logs to external service in production

**Storage Management** (`utils/storage.ts`):
- Centralized storage utilities
- `clearAllCookies()` - Removes all app cookies
- `clearAllStorage()` - Clears localStorage and sessionStorage
- `clearAuthStorage()` - Clears only authentication-related storage
- Defines constants for all storage keys and cookie names

**Transformers** (`utils/transformers.ts`):
- Data transformation utilities
- Case conversion helpers
- Date/time formatting
- String manipulation for Russian locale

**Cookies** (`utils/cookies.ts`):
- Cookie management utilities
- `getCookie(name)` - Retrieve cookie value
- `setCookie(name, value, options)` - Set cookie
- `deleteCookie(name)` - Remove cookie

## Development Guidelines

### Feature-Based Architecture

Each feature in `src/features/` follows a consistent structure:

```
src/features/[feature-name]/
├── [FeatureName]Page.tsx    # Main page component
├── components/              # Feature-specific components
│   ├── [Component1].tsx
│   └── [Component2].tsx
├── hooks/                   # Feature-specific hooks
│   ├── use[Feature]List.ts
│   └── use[Feature]By[Id].ts
├── utils/                   # Feature-specific utilities
│   └── [helper].ts
└── index.ts                 # Public exports
```

**Example: Acts Feature**:
```
src/features/acts/
├── ActsPage.tsx             # List of acts
├── ActFormPage.tsx          # Create/edit act form
├── components/
│   ├── ActCreationFlow.tsx
│   ├── ActEditor.tsx
│   ├── ActHintsSidebar.tsx
│   └── PartyLookup.tsx
├── hooks/
│   └── [act-specific hooks]
├── utils/
│   └── formToBackendMapper.ts
└── index.ts
```

**Key Principles**:
1. Each feature is self-contained with its own components and hooks
2. Shared components go in `src/components/`
3. Feature-specific types can be in the feature folder or `src/types/`
4. Service classes in `src/services/` are shared across features
5. Export only what's needed from `index.ts`

### Component Patterns

**Functional Components with TypeScript:**
```typescript
interface MyComponentProps {
  // Props definition
}

export const MyComponent: React.FC<MyComponentProps> = ({ prop }) => {
  return <div>{prop}</div>
}
```

### Styling Conventions

**CSS Class Naming:**
- Use `vk-` prefix for custom classes
- Follow BEM methodology: `vk-card`, `vk-card--active`, `vk-card__title`
- Avoid inline styles

**Tailwind + Material UI:**
- Material UI for primary components (Button, Paper, Typography, etc.)
- Tailwind utilities for spacing, layout, and quick styling
- shadcn/ui for modern components (uses Radix UI + Tailwind)

### API Service Pattern

Service classes provide static methods for API calls:
```typescript
export class MyService {
  static async getData(id: string): Promise<ResponseType> {
    const response = await http.get<ResponseType>(`/api/endpoint/${id}`)
    return response.data
  }
}
```

Hook wraps service with React Query:
```typescript
export const useMyData = (id: string) => {
  return useQuery({
    queryKey: ['myData', id],
    queryFn: () => MyService.getData(id)
  })
}
```

### TypeScript Type Conventions

- **Interfaces**: Use for complex objects with many properties
- **Types**: Use for unions, primitives, or simple structures
- **Naming**: Descriptive names without generic suffixes (e.g., `Contract` not `ContractInterface`)
- **API Types**: Defined in `src/types/index.ts` and feature-specific files

### VK ORD Specific Types

The application uses VK ORD enums defined as const objects:
- `VkOrdCreativeForm` - Creative formats (TextGraphicBlock, Video, etc.)
- `VkOrdPersonRoles` - Party roles (Advertiser, Publisher, Agency, ORS)
- `VkOrdContractType` - Contract types
- `VkOrdPayType` - Payment types (CPM, CPC, CPA, CPView)

These are defined in `src/types/enums/vk-ord.ts`.

### Constants

**KKTY Data** (`constants/kkty-data.ts`):
- Contains all KKTU (ККТУ) advertising category codes
- Large dataset (~31KB) with Russian advertising categories
- Used for AI-powered KKTU suggestion
- Categories mapped to description and codes

## Testing & Quality

### Testing Infrastructure

**Vitest Configuration**:
- Primary test runner using Vitest
- Browser mode testing with Playwright
- Coverage reporting with v8
- Configuration in `vite.config.ts`
- Shims for Playwright: `vitest.shims.d.ts`

**Test Location**:
- No test files currently exist in the codebase
- Test files should follow pattern: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- Place tests adjacent to source files or in `__tests__` directories

**Running Tests**:
- Not configured in package.json yet
- Add `"test": "vitest"` to scripts when writing tests
- Use `vitest --ui` for interactive test UI

### Storybook

**Configuration** (`.storybook/main.ts`):
- Framework: React + Vite
- Stories location: `src/**/*.stories.@(js|jsx|mjs|ts|tsx)` and `src/**/*.mdx`
- Addons:
  - `@chromatic-com/storybook` - Visual testing
  - `@storybook/addon-docs` - Documentation
  - `@storybook/addon-a11y` - Accessibility testing
  - `@storybook/addon-vitest` - Vitest integration
  - `@storybook/addon-onboarding` - Onboarding guide

**Existing Stories**:
- `src/stories/Button.stories.ts`
- `src/stories/Header.stories.ts`
- `src/stories/Page.stories.ts`
- `src/stories/Configure.mdx`
- `src/components/ui/button.stories.tsx`
- `src/components/ui/skeleton.stories.tsx`

**Writing Stories**:
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { MyComponent } from './MyComponent'

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MyComponent>

export const Default: Story = {
  args: {
    prop: 'value'
  }
}
```

## CI/CD & Deployment

### GitLab CI Pipeline

**Configuration** (`.gitlab-ci.yml`):
- Two stages: `build` and `deploy`
- Uses Alpine Linux as base image

**Build Stage**:
- Runs on Node.js 20 Alpine
- Commands: `npm ci` → `npm run build`
- Produces `dist/` artifact

**Deploy Stage**:
- Uses `lftp` for FTP deployment
- Deploys to `/www/ad-lawyer.ru/` on hosting server
- Mirror mode with `--delete` flag (removes old files)
- Parallel transfers for speed (10 connections)
- Only runs on `main` branch

**Environment Variables** (GitLab CI/CD Settings):
- `FTP_USER` - FTP username
- `FTP_PASSWORD` - FTP password
- `FTP_HOST` - FTP server host

### Environment Variables

**Development** (`.env.development`):
```
VITE_API_BASE_URL=localhost:5000
```

**Production** (`.env.production`):
```
VITE_API_BASE_URL=https://criminally-astute-kangaroo.cloudpub.ru
```

**Usage in Code**:
- Access via `import.meta.env.VITE_API_BASE_URL`
- `import.meta.env.DEV` - true in development
- `import.meta.env.PROD` - true in production
- `import.meta.env.MODE` - current mode (development/production)

**Proxy Behavior**:
- Development: Vite proxies `/api/*` to `localhost:5000`
- Production: Direct requests to `VITE_API_BASE_URL`
- Configured in `vite.config.ts`

## shadcn/ui Integration

### Setup
- Configuration: `components.json`
- Component path: `src/components/ui/`
- Utils path: `src/lib/utils.ts`
- Tailwind config: `tailwind.config.js`
- Uses Tailwind CSS v4 with `@tailwindcss/vite` plugin

### Installed Components

**Base shadcn/ui Components**:
- `button` - Button variants (default, destructive, outline, ghost, link)
- `dialog` - Modal dialogs
- `input` - Text inputs
- `label` - Form labels
- `select` - Dropdown selects
- `textarea` - Multi-line text inputs
- `badge` - Status badges
- `skeleton` - Loading skeletons
- `sonner` - Toast notifications (using Sonner library)

**Custom Components** (in `src/components/ui/`):
- `CredentialRequiredModal` - Modal for credential selection
- `CredentialSelector` - Dropdown for VK ORD credentials
- `CredentialSelectorSimple` - Simplified credential selector
- `FileUploader` - Drag-and-drop file upload
- `PartyContractSelector` - Complex party/contract selection
- `PartyModal` - Modal for party management
- `PartySelector` - Party selection dropdown
- `TagSelector` - Tag selection component

### Adding Components
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add select
```

### Custom Registry
The project includes a custom component registry in `registry/` folder:
- Start registry server: `npm run registry:start`
- Add custom components: `npx shadcn@latest add @vk/component-name`

## API Endpoint Patterns

All endpoints use lowercase paths (recent refactor from PascalCase):

**Authentication**:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh (uses cookies only, empty body)
- `POST /api/auth/logout` - User logout

**User Management**:
- `GET /api/users/me` - Current user profile
- `PUT /api/users/me` - Update user profile

**VK ORD Credentials**:
- `GET /api/credentials` - List all credentials
- `POST /api/credentials` - Create new credential
- `PUT /api/credentials/{id}` - Update credential
- `DELETE /api/credentials/{id}` - Delete credential

**Contracts**:
- `GET /api/v1/contracts` - List contracts
- `GET /api/v1/contracts/{externalId}/details` - Contract details with creatives
- `POST /api/v1/contracts` - Create contract

**Counterparties**:
- `GET /api/v1/counterparties/by-inn/{inn}` - Lookup counterparty by INN
- `GET /api/client/counterparties/{externalId}/contracts` - Counterparty contracts

**Creatives**:
- `GET /api/v1/creatives` - List creatives
- `GET /api/v1/creatives/by-erid/{erid}` - Get creative by ERID
- `POST /api/v1/creatives` - Create creative
- `DELETE /api/v1/creatives/{externalId}` - Delete creative

**Media**:
- `POST /api/media/upload` - Upload media file
- `GET /api/media/{externalId}` - Get media details

**Acts**:
- `GET /api/acts` - List acts
- `GET /api/acts/{id}` - Get act details
- `POST /api/acts` - Create act
- `PUT /api/acts/{id}` - Update act
- `DELETE /api/acts/{id}` - Delete act

**AI & Utilities**:
- `POST /api/ai/suggest-kktu` - AI-powered KKTU suggestion
- `GET /api/dadata/suggest/party` - DaData API proxy for party suggestions

**Templates**:
- `GET /api/flow-templates` - List wizard flow templates
- `POST /api/flow-templates` - Create template
- `PUT /api/flow-templates/{id}` - Update template
- `DELETE /api/flow-templates/{id}` - Delete template

**Statistics**:
- `GET /api/statistics/dashboard` - Dashboard statistics

## Important Implementation Notes

### INN Validation
Russian tax identification numbers (ИНН) must be 10 or 12 digits.

### KKTU Codes
Advertising category codes (ККТУ) are mandatory for creatives. The app includes AI-powered KKTU suggestion based on ad text.

### ERID Generation
ERID (Единый Регистрационный Идентификатор Рекламы) is the final marking ID generated after creative registration. This is the primary goal of the wizard flow.

### Case Conversion
All API request/response data is automatically converted between camelCase (frontend) and snake_case (backend) by the Axios interceptors. Do NOT manually convert cases.

### Proxy Configuration
In development, Vite proxies `/api/*` requests to `http://localhost:5000`. In production, requests go directly to the configured API base URL.

### Loading States
All async operations (especially button clicks) should show loading indicators:
- Material UI Buttons: Use `loading` prop with `CircularProgress`
- Form submissions: Disable buttons during submission
- API calls: Show skeleton loaders for data fetching
- Recent implementation: Credential creation/update buttons have loading indicators

### Storage Management
The application uses multiple storage mechanisms:
- **localStorage**: Zustand persisted stores (tokens, device, environment, wizard state)
- **sessionStorage**: Currently unused
- **Cookies**: Refresh tokens, VK ORD credential ID
- Use utility functions from `utils/storage.ts` for cleanup operations
- Recent implementation: `clearAuthStorage()` for logout operations

## Common Pitfalls to Avoid

1. **Never use class components** - Only functional components with hooks
2. **Don't ignore TypeScript errors** - Fix them, don't use `any`
3. **Don't bypass authentication** - Always check token validity
4. **Don't terminate npm run dev** without asking - It's often already running
5. **Don't create large monolithic components** - Break them down by responsibility
6. **Don't duplicate code** - Extract common logic into hooks or services
7. **Don't manipulate DOM directly** - Use React state and refs
8. **Don't store secrets in code** - Use environment variables
9. **Don't manually convert case** - Axios interceptors handle camelCase/snake_case conversion automatically
10. **Don't retry auth endpoints** - The refresh interceptor already handles token refresh
11. **Don't use AppContext for new features** - Use wizardStore (Zustand) instead
12. **Always use logger utility** - Don't use console.log directly in production code
13. **Don't forget loading states** - Use loading indicators on all async buttons
14. **Don't bypass CredentialGuard** - Respect credential requirements for VK ORD API calls

## Build Verification

After completing work, ALWAYS run `npm run build` to verify:
- TypeScript compilation succeeds
- No type errors or warnings
- Bundle size is acceptable
- All imports resolve correctly

The build configuration suppresses certain warnings (like "use client" directives) to reduce noise.

## Recent Changes & Features

### Latest Updates (November 2024)

**Authentication & Storage**:
- Added loading indicators to credential creation/update buttons
- Enhanced logout functionality with comprehensive storage cleanup
- Implemented `clearAuthStorage()` utility for secure logout
- Fixed production API endpoint configuration in `.env.production`

**State Management**:
- Migrating from AppContext (useReducer) to wizardStore (Zustand)
- wizardStore now includes template management and party history
- Improved persistence strategy with localStorage

**UI/UX Improvements**:
- Added CredentialGuard for better credential management UX
- Implemented loading states across async operations
- Enhanced error handling with Broken Rules error mapping

**API Integration**:
- Updated all endpoints to use lowercase paths
- Added comprehensive endpoint documentation
- Improved enum handling with automatic lowercase normalization

## MCP Server Integration

This project includes MCP (Model Context Protocol) servers for AI integration:

**Available MCP Servers**:
- **Chrome DevTools MCP**: UI automation, screenshots, performance analysis
- **shadcn MCP**: Component browsing and installation
- **Context7 MCP**: Library documentation lookup
- **IDE MCP**: Code diagnostics and execution

**Configuration**:
- MCP configuration in `mcp.json` (root level)
- Also configured in `.cursor/mcp.json` for Cursor IDE
- TypeScript helper available via `npm run mcp:ts-dev`

## Agent System

This project uses a system of **specialized agents** to enhance development quality and consistency. Agents are automatically invoked when tasks fall within their domain of expertise.

### Available Agents

Located in `.claude/agents/`:

- **ui-ux-reviewer** (sonnet) - Reviews UI/UX changes before implementation, ensures Material UI and shadcn/ui best practices, checks accessibility
- **backend-inspector** (haiku) - Investigates backend API structure and implementation details, analyzes ASP.NET Core controllers and models
- **feature-architect** (sonnet) - Designs new features in feature-based architecture, plans component structure and integration points
- **api-integrator** (haiku) - Creates API services and React Query hooks, manages cache invalidation and error handling
- **state-manager** (haiku) - Manages Zustand stores and client state, optimizes re-renders, handles persistence strategies
- **testing-specialist** (haiku) - Writes tests and Storybook stories, creates unit/integration/E2E tests, ensures accessibility compliance

### When to Use Agents

**Proactive Usage**: The base agent should automatically launch specialized agents when planning changes in their domain. For example:
- Planning UI changes → launch ui-ux-reviewer
- Investigating API issues → launch backend-inspector
- Adding new feature → launch feature-architect
- Creating API hooks → launch api-integrator
- Managing state → launch state-manager
- Writing tests → launch testing-specialist

### Agent Documentation

See `agents.md` for comprehensive documentation (in Russian), including:
- Detailed agent responsibilities
- Usage scenarios and examples
- Interaction patterns between agents
- Extension guidelines
