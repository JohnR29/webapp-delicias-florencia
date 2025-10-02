# Copilot Instructions for Delicias Florencia

These instructions guide GitHub Copilot to maintain consistent,
professional code aligned with the **Delicias Florencia** business.

## Project Context

-   **Type**: Mobile-first wholesale webapp
-   **Framework**: Next.js 14 with TypeScript
-   **UI**: React with TailwindCSS
-   **Domain**: Wholesale artisan cake distribution
-   **Key Features**: Product catalog, dynamic pricing, shopping cart,
    contact forms, coverage map, validations, mobile-first experience.

------------------------------------------------------------------------

## Style Guide and Best Practices

### 1. Language and Naming

-   **Spanish** for business domain (e.g., `sabor`, `ingredientes`,
    `cantidad`).\
-   **English** for technology and stack (e.g., `useCart`, `Product`,
    `ProductCard`).\
-   **Conventions**:
    -   Variables and functions: `camelCase`\
    -   Components and types: `PascalCase`\
    -   Constants: `UPPER_SNAKE_CASE`

### 2. TypeScript

-   Avoid `any`. Prefer `Record`, `Partial`, `Pick`, or explicit types.
-   All props and state must be typed.
-   Use `interface` for component props and `type` for internal
    structures.
-   Handle complex state with derived types (`Record<string, number>` is
    valid).

### 3. React and Next.js

-   Use **functional components** with typed props.
-   Keep state logic separated in hooks (`useCart`, `useXxx`).
-   Memoize calculations with `useMemo` and callbacks with
    `useCallback`.
-   Avoid complex logic directly in JSX; move it to helper functions.
-   Use `"use client"` only in interactive components.

### 4. TailwindCSS

-   Keep classes concise and consistent (`rounded-lg`, `shadow-md`,
    `bg-gray-50`).
-   Use `flex`, `gap`, `grid` for responsive layouts.
-   Avoid repeating classes excessively: consider `clsx`/`cn` for
    complex components.
-   Always optimize for **mobile-first**.

### 5. Accessibility (a11y)

-   Always include `aria-label` on buttons and interactive elements.
-   Use `role` and `tabIndex` on custom elements.
-   Validate inputs with clear messages in Spanish.

### 6. Validations and UX

-   Inputs should accept only valid values (e.g., positive integers).
-   Error messages must be short and clear in Spanish.
-   Interactive controls must have `hover`, `disabled`, and `focus`
    states.

### 7. Business Logic (Delicias Florencia)

-   Prices, quantities, and validations must respect wholesale rules
    (`PRICING_CONFIG`).
-   Always display quantities, thresholds, and tiers clearly.
-   Code should favor scalability: new product formats, new tiers, etc.

------------------------------------------------------------------------

## Rules for Copilot

-   Always prioritize **readability and maintainability** over
    shortcuts.
-   Follow the style demonstrated in `ProductCard.tsx` and `useCart.ts`.
-   Do not invent variable names; follow established conventions.
-   Avoid suggestions with `any`, untyped code, or missing validations.
-   Align all suggestions with the business logic and mobile-first
    approach.

------------------------------------------------------------------------

## Automatic Checklist

-   [ ] Strict TypeScript code, no `any`
-   [ ] Props and hooks with explicit typing
-   [ ] Functional components with modern React hooks
-   [ ] Consistent Tailwind classes and mobile-first
-   [ ] Accessibility: `aria-label`, `role`, `tabIndex`
-   [ ] Clear validations in Spanish
-   [ ] Business logic aligned with wholesale rules
-   [ ] Updated documentation (README and this file)

------------------------------------------------------------------------

*This file is designed to maintain consistency in development and ensure
GitHub Copilot adapts to the style and requirements of **Delicias
Florencia**.*
