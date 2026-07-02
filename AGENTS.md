# easybuy-mobile Agent Guide

Expo managed workflow (SDK 54) · React Native 0.81.5 · React 19 · JavaScript · New Architecture enabled (`newArchEnabled: true`).

## Core Commands

| Command | Action |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Start dev server + launch on Android |
| `npm run ios` | Start dev server + launch on iOS |
| `npm run web` | Start dev server + launch in browser |

No linter, formatter, test runner, or type checker is configured.

## Project Structure

- **Entry point:** `App.tsx` (root) → re-exports `src/app/index.tsx`
- **All source code** lives under `src/`
- **Config:** `app.json` (Expo), `babel.config.js` (`babel-preset-expo` + `module-resolver` for aliases)
- **No Tailwind**

## Conventions

- **No redundant `<View>` wrappers** — style the element directly
- **TypeScript** — strict mode enabled (`strict: true`)
- **`StyleSheet.create` or inline styles** — no CSS/Tailwind
- **Standard `function` keyword** for component declarations (not arrow functions assigned to `const`)
- **Arrow functions** only for inline callbacks (`.map()`, `.filter()`, event handlers)
- **Boolean state vars** must use `is`/`has`/`should`/`can`/`did` prefix (e.g. `isLoading`, not `loading`)
- **Single-line props** in JSX — never break props into multiple lines unless a prop contains a multiline arrow function

## Getting Started

```bash
npm install
npm run android
```

No `.env` files or environment setup required.

## Folder Structure & Architecture (Expo / React Native)
- Root Directory Isolation: All application code must reside inside the `src/` directory to separate app source files from root-level configuration files (e.g., package.json, expo configs).
- File-Based Routing: All screens, routes, and layout configurations must live strictly within `src/app/` following Expo Router conventions. Do not place non-routing components or arbitrary utilities inside this folder to avoid generating invalid or accidental application routes.
- Component Classification: Shared UI elements must be separated into two specific directories:
  - `src/components/ui/` for core design system elements (e.g., Button, Card, Input).
  - `src/components/common/` for shared generic components used across multiple sections.
- Feature-Driven Modularity: For scalable or medium-to-large projects, code must be organized by feature inside `src/features/[feature-name]/`. Each feature folder must encapsulate its own specific logic, components, local hooks, and API calls. Global definitions are restricted to application-wide shared logic.
- Core Integration Layer: Global configurations, API clients, and third-party integrations (such as Axios clients, Supabase instances, or global state providers) must reside within `src/lib/`.
- Development Standards & Conventions:
  - Path Aliases: Always use absolute path aliases (e.g., `@components`, `@features`, `@lib`) to reference files. Relative import paths going up multiple levels (such as '../../../../') are prohibited.
  - Barrel Exports: Use `index.ts` files inside component and feature directories to expose clean public interfaces and streamline imports.
  - Test Co-location: Keep unit or integration test files located directly next to the implementation file they are testing (e.g., `format-date.test.ts` must sit beside `format-date.ts`).
  - Platform Splitting: Utilize platform-specific extensions (`.ios.tsx`, `.android.tsx`, `.web.tsx`) exclusively when distinct implementation logic is required for specific deployment environments.

## Development philosophy
- **Organization and Predictibility:** Prefer explicit, methodic and structured code over complex and elaborate solutions.
- **No Redundancy:** Do not duplicate logic. Before creating a component or function, check the exsisting directory.
- **Clean code:** Small functions, one responsability by file, strict typing.

## Technical standards (React Native / Expo)
- Flexbox as the Only Engine: All layouts must be built using Flexbox. React Native's layout engine (Yoga) does not support CSS Grid.
- Default Behavior: Elements default to flexDirection: column and display: flex. Explicit display properties are not needed.
- Grid Patterns Simulation: To implement grid-like layouts (e.g., photo galleries, dashboards), you must use specific React Native components or patterns:
  - Use FlatList with the numColumns property for dynamic or long lists.
  - Use Flexbox with flexWrap: 'wrap' and explicit percentage widths (e.g., width: '33.33%') for static layouts.
  - Restriction: Third-party grid libraries are prohibited unless performance constraints in complex dashboards justify their inclusion. Any exception must be documented with code comments.

## Function Declarations
- **Standard Functions Only:** Inside components or utility files, do NOT use arrow functions assigned to constants for standard function declarations. Always use the traditional `function` keyword.
- **Arrow Functions Exception:** Arrow functions are strictly restricted to inline callbacks (e.g., inside `.map()`, `.filter()`, or immediate event handlers like `onClick={() => ...}`).

```Typescript
// ❌ DO NOT DO THIS (Anti-pattern for this repo)
const handleSubmit = (event: EventHandler) => {
  event.preventDefault();
	return 1
};

//  DO THIS (Required standard)
function handleSubmit(event: EventHandler): number {
  event.preventDefault();
	return 1
}
```