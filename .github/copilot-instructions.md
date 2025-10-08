# Copilot Instructions for AdLawyerFront

## Project snapshot
- React 19 + TypeScript via Vite 7; entry is `src/main.tsx` mounting `AppRouter` into `#app`.
- Routing lives in `src/routes.tsx` with `HashRouter` (static hosting), MUI theme, React Query provider, ToastContainer, and devtools.
- Feature folders under `src/features` pair pages with domain-specific hooks; shared UI sits in `src/components`, wizard helpers in `src/context`, and API plumbing under `src/api`.

## Auth & session flow
- Authentication logic resides in `src/auth/hooks.ts`; mutations call `http`, stash access tokens in the in-memory Zustand store, and persist the refresh token cookie `vk_ord_refresh_token`.
- `ProtectedRoute` triggers `useAutoRefresh` exactly once on startup so pages must tolerate an initial "Loading..." render.
- Device IDs persist via `useDeviceStore`; reuse `getDeviceId` when adding auth-related mutations to avoid server-side rejection.

## HTTP & backend integration
- `src/api/http.ts` configures Axios with `withCredentials`, injects the bearer token, and forwards the credential cookie `vkord-credential-id`.
- 401s trigger the built-in refresh queue; never start a parallel refresh—just throw and let the interceptor retry the original request.
- VK "broken rules" responses arrive as 400 + JSON array; the interceptor maps codes to friendly messages—surface those errors instead of overriding them.
- React Query defaults (`src/api/queryClient.ts`) suppress retries on most 4xx and show toast errors globally; avoid double-toasting inside mutations unless a custom message is required.

## Credentials & environment
- `CredentialSelector` (wizard header) filters `/api/Credentials` by selected environment; toggles sync with the persisted `useEnvironmentStore` and writes the credential cookie `vkord-credential-id`.
- Most VK ORD mutations (e.g. `useContractAndCreative`) require the credential cookie; guard new calls with the same check to keep UX consistent.

## Wizard architecture
- Wizard routes render `WizardPage`, which wraps children with `AppProvider` from `src/context/AppContext.tsx`; always use provided actions (e.g. `setCreativeData`) instead of mutating `wizardState` directly.
- State auto-saves to localStorage key `vkord-wizard-state` and reloads cookies for API keys; heed these side effects when resetting state.
- Step components share helpers: `usePartyLookup` for INN search, `useContractAndCreative` for contract/creative mutations, `TagSelector` using `constants/kkty-data.ts`, and `FileUploader` posting to `/api/media/upload`.
- Loading flags live in `loadingState` keyed by strings (e.g. `contract`, `ai-kkty`); reuse the same keys so existing spinners and toasts stay wired.

## UI conventions
- Dashboard pages lean on Material UI components inside `DashboardLayout`; wizard surfaces reuse handcrafted CSS classes prefixed with `vk-` defined in `src/styles/index.css`.
- When extending modal or selector widgets, follow existing accessibility patterns (e.g. `PartyModal` closes on escape, list buttons are keyboard focusable).
- `src/App.tsx` exposes the wizard without routing for embedding; keep it in sync if you introduce breaking wizard changes.

## Build & workflows
- Install deps with npm, then `npm run dev` for Vite dev server, `npm run build` (logs warnings only), and `npm run preview` to inspect the build.
- Keep in mind the dev server (`npm run dev`) is usually running and hot-reloads every change automatically; skip rerunning `npm run build` after edits unless you explicitly need a production build check.
- Backend URL comes from `VITE_API_BASE_URL`; dev defaults to '/', so configure a proxy or co-host the API when testing auth flows.
- No automated tests are defined; validate changes by exercising login, credential selection, wizard steps, and ensure the toast-driven error handling still fires.

## Adding features safely
- Place domain pages in `src/features/<domain>` with companion hooks; update `src/routes.tsx` and drawer links in `DashboardLayout` when exposing new navigation.
- Prefer composing new React Query hooks from the existing Axios client and invalidate specific keys (e.g. `CREDENTIALS_QUERY_KEY`) instead of blasting the cache.
- Respect cookie/token lifecycles—if a feature requires auth, rely on `useAuth` state and let the interceptor orchestrate refreshes rather than storing tokens locally.
