<!--
**Sync Impact Report**

- **Version Change**: None -> 1.0.0
- **Added Principles**:
  - I. Feature-Based Architecture
  - II. Type Safety
  - III. Separation of Concerns
  - IV. Modern React
  - V. Security First
- **Templates Updated**:
  - ✅ .specify/templates/plan-template.md
-->

# VK ORD Frontend Constitution

## Core Principles

### I. Feature-Based Architecture
Code MUST be organized by business features, not by technical roles (e.g., `features/auth`, `features/contracts`). Each feature folder SHOULD be self-contained, including its own components, hooks, and pages.

### II. Type Safety
This project MUST use TypeScript for all new code. Types SHOULD be explicit and comprehensive to ensure safety and maintainability. The `any` type is forbidden except in specific, justified cases.

### III. Separation of Concerns
A clear separation MUST be maintained between UI components, business logic (hooks), and API services. UI components SHOULD be presentational, while business logic and data fetching are handled in custom hooks and dedicated service modules.

### IV. Modern React
The project MUST use modern React practices, including functional components and hooks. Class components are not permitted in new code. State management SHOULD be handled with modern solutions like Zustand or TanStack Query.

### V. Security First
Security is a non-negotiable priority. All authentication and authorization mechanisms MUST be implemented following best practices. Sensitive data like tokens MUST NOT be stored in `localStorage`. Refresh tokens MUST be handled securely, preferably using httpOnly cookies.

## Additional Constraints

[SECTION_2_CONTENT]

## Development Workflow

[SECTION_3_CONTENT]

## Governance

This Constitution is the single source of truth for architectural and development principles. All code contributions and reviews MUST adhere to it. Amendments require a pull request and team approval.

**Version**: 1.0.0 | **Ratified**: 2025-10-14 | **Last Amended**: 2025-10-14
