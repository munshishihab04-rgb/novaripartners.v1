# Workspace

## Overview

pnpm workspace monorepo using TypeScript. A digital software license e-commerce store (NexusKeys) similar to digi-keys.ru.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + framer-motion

## Artifacts

- `artifacts/digi-shop` — Main frontend (React + Vite), served at `/`
- `artifacts/api-server` — Express API server, served at `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Features

- Homepage with hero, trust badges, featured products grid
- Catalog with sidebar filters (platform, category, search)
- Product detail page with specs table, features list, sticky order panel (price, add to cart, buy now)
- Shopping cart with line items, order summary
- Dark theme, electric cyan accent color

## Database Schema

- `categories` — software categories (Autodesk, Adobe, Microsoft, JetBrains, Corel)
- `products` — software license products with platform enum (windows/macos/cross-platform)
- `cart_items` — session-based cart items

## API Endpoints

- `GET /api/products` — list with filters (categoryId, platform, search, limit, offset)
- `GET /api/products/featured` — featured products
- `GET /api/products/:id` — product detail
- `GET /api/categories` — all categories with product counts
- `GET /api/cart` — cart (session via x-session-id header)
- `POST /api/cart/items` — add to cart
- `DELETE /api/cart/items/:itemId` — remove from cart

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
