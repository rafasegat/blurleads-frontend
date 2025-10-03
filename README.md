# BlurLeads Frontend

Next.js frontend application for BlurLeads with type-safe API client powered by [openapi-typescript](https://github.com/openapi-ts/openapi-typescript).

## Setup

```bash
npm install
# or
pnpm install
# or
yarn install
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
cp .env.local.example .env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Types Generation

Generate TypeScript types from the backend OpenAPI spec:

```bash
# Make sure backend is running on http://localhost:3001
npm run generate:api
```

This generates `src/lib/api-types.ts` from the backend's Swagger/OpenAPI spec.

## Type-Safe API Client

The project uses `openapi-fetch` for fully type-safe API calls:

```typescript
import { apiClient } from '@/lib/api-client';

// Type-safe GET request
const { data, error } = await apiClient.GET('/leads');

// Type-safe POST with body validation
const { data, error } = await apiClient.POST('/leads', {
  body: {
    email: 'user@example.com',
    company: 'Acme Inc',
  },
});

// Type-safe params
const { data, error } = await apiClient.GET('/leads/{id}', {
  params: { path: { id: '123' } },
});
```

See `src/hooks/use-leads.ts` for React Query integration examples.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Testing

```bash
npm test
npm run test:watch
```

## Type Checking

```bash
npm run type-check
```
