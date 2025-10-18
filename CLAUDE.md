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
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
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

**Two State Systems:**

1. **Legacy Wizard Context** (`context/AppContext.tsx`):
   - Uses React useReducer pattern
   - Manages multi-step wizard state
   - Auto-saves to localStorage every 2 seconds
   - Includes party history, consent, INN validation

2. **Modern Zustand Stores** (`auth/tokenStore.ts`):
   - `useTokenStore` - Access/refresh tokens
   - `useDeviceStore` - Device identification
   - `useEnvironmentStore` - Sandbox vs Production toggle

**Server State:**
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
- All other routes wrapped in `DashboardLayout`

### Environment Switching

The application supports switching between VK ORD sandbox and production environments:
- Controlled via `useEnvironmentStore` in tokenStore
- Sets `x-api-vk-env` header on API requests
- Default is "sandbox"
- Persisted in localStorage

## Development Guidelines

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
- `VkOrdCreativeForm` - Creative formats (Banner, Video, etc.)
- `VkOrdPersonRoles` - Party roles (Advertiser, Publisher, Agency, ORS)
- `VkOrdContractType` - Contract types
- `VkOrdPayType` - Payment types (CPM, CPC, CPA, CPView)

These are defined in `src/types/index.ts` starting at line 57.

## shadcn/ui Integration

### Setup
- Configuration: `components.json`
- Component path: `src/components/ui/`
- Utils path: `src/lib/utils.ts`
- Tailwind config: `tailwind.config.js`

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
- `/api/auth/login` - Authentication
- `/api/auth/register` - Registration
- `/api/auth/refresh` - Token refresh (uses cookies only, empty body)
- `/api/auth/logout` - Logout
- `/api/users/me` - Current user profile
- `/api/credentials` - VK ORD credentials management
- `/api/v1/contracts/{externalId}/details` - Contract details with creatives
- `/api/v1/counterparties/by-inn/{inn}` - Lookup counterparty by INN
- `/api/client/counterparties/{externalId}/contracts` - Counterparty contracts
- `/api/media/upload` - Media file upload

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

## Common Pitfalls to Avoid

1. **Never use class components** - Only functional components with hooks
2. **Don't ignore TypeScript errors** - Fix them, don't use `any`
3. **Don't bypass authentication** - Always check token validity
4. **Don't terminate npm run dev** without asking - It's often already running
5. **Don't create large monolithic components** - Break them down by responsibility
6. **Don't duplicate code** - Extract common logic into hooks or services
7. **Don't manipulate DOM directly** - Use React state and refs
8. **Don't store secrets in code** - Use environment variables

## Build Verification

After completing work, ALWAYS run `npm run build` to verify:
- TypeScript compilation succeeds
- No type errors or warnings
- Bundle size is acceptable
- All imports resolve correctly

The build configuration suppresses certain warnings (like "use client" directives) to reduce noise.

## MCP Server Integration

This project includes MCP (Model Context Protocol) server for AI integration:
- **Chrome DevTools MCP**: For UI automation, screenshots, and performance analysis
- **Component Registry MCP**: For browsing and adding shadcn/ui components

Configuration is in `.cursor/mcp.json`.
