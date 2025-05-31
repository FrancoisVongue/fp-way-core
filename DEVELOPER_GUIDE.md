# Developer Guide

Welcome to **fp-way-core**! This project provides a lightweight set of functional utilities built with TypeScript and Ramda. The goal is to keep the API minimal yet expressive, so users can work with a consistent functional style.

## Key Principles

- **Functional first** – prefer pure functions, immutability and composition.
- **Currying everywhere** – most utilities are curried using `Curry` from `src/core.ts`.
- **Type safety** – leverage TypeScript generics to ensure predictable, strongly typed APIs.
- **Namespaces per type** – functions are grouped by data type (`arr`, `bool`, `num`, `str`, `obj`, `union`, `form`). Each namespace has its own `index.ts`, `index.types.ts` and test file.
- **Ramda as foundation** – core utilities wrap or re-export Ramda functions. Keep dependencies light.
- **Readable code** – aim for small, self‑explanatory functions with clear naming.

## Project Structure

```
src/
  arr/    # array helpers
  bool/   # boolean helpers
  num/    # number helpers
  str/    # string helpers
  obj/    # object utilities
  union/  # tagged union helpers
  form/   # form validation helpers
  core.ts       # core functional utilities
  core.types.ts # shared TypeScript types
  index.ts      # exports everything
```

Each folder contains:

- `index.ts` – implementation of the namespace functions
- `index.types.ts` – (when needed) types used by the namespace
- `index.test.ts` – bun tests for the namespace

## Contribution Guidelines

1. **Follow existing patterns** – new utilities should be curried and exported from their namespace.
2. **Keep things small** – functions should do one thing. Prefer composition over large imperative blocks.
3. **Write tests** – place tests alongside each namespace using the bun test runner (`npm test`).
4. **Document your additions** – update `README.md` or other relevant docs when you introduce new features.
5. **Type everything** – favor explicit generics so the library remains type‑safe.

### Adding a New Helper

1. Create a folder or use an existing namespace under `src/`.
2. Add your function in `index.ts`, making sure it is curried when it takes more than one argument.
3. Define new types (if required) in `index.types.ts`.
4. Add corresponding tests in `index.test.ts`.
5. Export the helper from `src/index.ts` to expose it to consumers.

### Testing

Run all tests with:

```bash
npm test
```

(Note: tests rely on bun. If dependencies are missing, install them before running.)

## The Vibe

The codebase favors a minimalist, functional style. It aims to be easy to read and easy to extend. Functions are small and predictable, with namespaces giving a clear mental map of available helpers. Keeping a consistent, type‑safe API lets users compose utilities without surprises.

Happy hacking!
