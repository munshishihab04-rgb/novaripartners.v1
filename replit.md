# Workspace

## Overview

pnpm workspace monorepo using TypeScript. A digital software license e-commerce store (NexusKeys, operated by DIGITALSOFT DI MUNSHI SHIHAB) with full product catalog, cart, checkout, and Nexi XPay HPP payment integration.

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
- Product detail page with specs table, features list, sticky order panel
- Shopping cart with line items, order summary, "Proceed to Payment" button
- **Checkout page** — customer name/email form, order summary, pay button
- **Nexi XPay HPP integration** — Hosted Payment Page (server-side, no third-party cookies)
- **Post-payment result page** — polls `/api/checkout/verify/:orderId`, shows success/fail/pending
- **Cancel page** — shown when user abandons Nexi HPP
- **GDPR cookie consent banner** — localStorage-based, appears on first visit
- 8 legal/info pages: Terms, Privacy (GDPR), Cookies, Refunds, Right of Withdrawal, Contact, FAQ, About
- Light-mode design, Inter font, professional footer with company details

## Company Details

- **Name**: DIGITALSOFT DI MUNSHI SHIHAB
- **Address**: Via Aldo Pio Manuzio 24, 40132 Bologna, Italy
- **P.IVA**: IT04358941203 · **REA**: BO-588058

## Database Schema

- `categories` — software categories (Autodesk, Adobe, Microsoft, JetBrains, Corel)
- `products` — software license products with platform enum (windows/macos/cross-platform)
- `cart_items` — session-based cart items
- `orders` — Nexi payment orders (orderId, sessionId, customerName, customerEmail, amountCents, currency, status, nexiSecurityToken)

## API Endpoints

- `GET /api/products` — list with filters (categoryId, platform, search, limit, offset)
- `GET /api/products/featured` — featured products
- `GET /api/products/:id` — product detail
- `GET /api/categories` — all categories with product counts
- `GET /api/cart` — cart (session via x-session-id header)
- `POST /api/cart/items` — add to cart
- `DELETE /api/cart/items/:itemId` — remove from cart
- `POST /api/checkout/create-order` — create Nexi HPP order, returns hostedPage URL
- `GET /api/checkout/verify/:orderId` — verify Nexi payment status
- `POST /api/checkout/notify` — Nexi server-to-server webhook

## Environment Variables / Secrets

- `NEXI_API_KEY` (secret) — Nexi XPay production API key (`X-Api-Key` header)
- `NEXI_ENV` — `production` or `sandbox` (default: sandbox). Currently set to `production`.
- `SESSION_SECRET` (secret) — Express session secret
- `DATABASE_URL` — PostgreSQL connection string (runtime-managed)

## Nexi XPay Integration Notes

- **Mode**: Hosted Payment Page (HPP) — customer is redirected to Nexi's page to enter card details
- **Why HPP**: XPay Build v3 requires third-party cookies (blocked by Chrome/Safari/Firefox)
- **Auth**: `X-Api-Key` header + `Correlation-Id` (UUID) header
- **Request body**: `{ order: {...}, paymentSession: { actionType, amount, language, resultUrl, cancelUrl, notificationUrl } }`
- **resultUrl**: `{siteUrl}/checkout/result/{orderId}` — orderId in path for GET /orders/{orderId} verification
- **cancelUrl**: `{siteUrl}/checkout/cancel`
- **Production endpoint**: `https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1`
- **Sandbox endpoint**: `https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1`
- **Test API keys** (sandbox only): implicit capture `2e570a58-9914-477a-9ede-35baff23a376`, explicit capture `ee6a41f2-fa09-4b8f-bc05-5dc225bdc270`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
