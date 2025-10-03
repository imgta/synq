# SynQ
An AI-Powered Matchmaking Engine for U.S. Defense Contracting Joint Ventures

**The Problem:** Government contracting is fiercely competitive. Companies, especially smaller ones, often lack the full range of capabilities required to bid on large, complex contract opportunities. They need to form strategic partnerships (joint ventures) to fill these gaps, but discovering the right partners is a slow, manual, and relationship-driven process.

<img width="951" height="975" alt="image" src="https://github.com/user-attachments/assets/4f3df24a-1976-432f-ad7c-f8a826567422" />

## Core Features
1. AI Chat Interface with conversation entry points for:
- finding most relevant NAICS codes based on business/company descriptions
- finding strategic Joint Venture partners using an algorithm that prioritizes complementary overlaps over similarity
2. Multifactor Scoring Engine: recommendations are powered by scoring models with several key weights:
- Semantic Relevance: How well a partner's description to an opportunities domain
- Capability Gap Coverage: How many of the lead company's NAICS code gaps the partner can cover
- Set-Aside Qualification: Scoring bonuses for partners who meet specific small-business (SBA) set-aside requirements
- Redundancy Penalty: A slight penalty is applied to potential partners sharing the same primary industry NAICS codes
3. Interactive Data Visualization: Dynamic radar charts that allow visual comparisons across multiple companies against multiple opportunities, providing an intuitive at-a-glance understanding of strengths and weaknesses across key metrics

## Tech Stack
- Frontend: Next.js (App Router), Drizzle ORM (PostgreSQL)
  - `babel-react-compiler` enabled for automatic memoization
- Backend: FastAPI, Neon serverless Postgres DB with `pgvector`
- AI Models:
  - Embeddings: `Xenova/bge-small-en-v1.5` (384-dim), `Xenova/bge-base-en-v1.5` (768-dim)
  - Chat: `gpt-4.1-nano`
- UI/UX: shadcn/ui, TailwindCSS
- Package management: `pnpm` (node), `uv` (python)

## How it works
1. Data Ingestion & Enrichment: I started with aggregating NAICS datasets from census.gov and sba.gov, then used SAM.gov oppportunities search API (until subsequent 429s and 403s), then started generating my own mock data
2. Vector Embeddings: All unstructured texts were structured, converted into 384-dimension vector embeddings using the `Xenova/bge-small-en-v1.5` model via Transformers.js, then stored and HNSW indexed on my Neon Postgres DB using the `pgvector` extension
  - Each vector index followed the same process for the most part: data restructuring -> embedding pipeline -> batch seeding
  - Current seed order: naics, programs, companies, opportunities, awards
3. Candidate Pre-selection: Query -> approximate nearest neighbor (ANN) pool via our HNSW index
4. Re-ranking: Candidates are then passed through scoring algorithms with relatively untuned weights to produce the final, intelligently ranked list.

## Roadmap and next steps
- [x] Employ Hypothetical Document Embeddings (HyDE) for expanded relevancy search on business descriptions
- [x] Allow layering of multiple series and axes for comparisons (companys or opportunities)
- [x] Create a pivot view where axes are inverted to compare series against scoring metrics
- [x] Fix rendering bug that causes radar polygons to collapse into a single line when there aren't enough axes
- [ ] Enhance the retrieval pipeline by implementing hybrid retrieval with sparse vectors (most likely BM25?)
- [ ] Integrate fuzzy search by leveraging the PostgreSQL `pg_trgm` trigram extension
- [ ] AI-powered statement of work extraction, summarizations, and aggregations from SAM.gov opportunities and awards search API

## Quick start
1. Clone and navigate into the `frontend/` directory, then install all dependencies
```sh
cd frontend/
pnpm i
```
2. Run the Next.js server on `localhost:3000`
```sh
pnpm run dev
```

## Sample queries
```
We're Pathrender Logistics (UEI PATHRENDER220M). Target CBRN Equipment Rapid Deployment and Logistics. Show 10 candidates, with distance and set-aside status.
```

```
We're Sentinel Microsystems (UEI SENTINEL92M) going after GD-2025-002 (WOSB). Give me 8 raw candidates with distance, NAICS coverage, and set-aside status.
```

```
As Tristimuli (WOSB), pull raw candidates for Virtual Flight Operations Trainer with Multilingual Voice. Limit 8.
```

## Directory Structure
```mysql
backend/
  ├─ .venv/
  ├─ core/
  │   ├─ data/
  │   ├─ __init__.py
  │   ├─ _auth.py
  │   └─ ncais.py          -- core extract/transform data piping logic
  ├─ main.py
  ├─ pyproject.toml
  └─ uv.lock
frontend/
  ├─ .drizzle/             -- migration SQL files
  ├─ app/
  │   ├─ (pages)/          -- (URL-less) route group
  │   │   └─ page.tsx      -- "/" route
  │   ├─ api/              -- server events logic
  │   │   ├─ _actions/     -- directory of chatbot function tools
  │   │   ├─ chat/
  │   │   │   └─ route.ts  -- "/api/chat" API handler
  │   │   ├─ sam/
  │   │   │  └─ route.ts   -- SAM.gov search API handler
  │   │   └─ index.ts      -- cutsom server fetch/validation wrappers
  │   ├─ components/
  │   │   ├─ ui/           -- shadcn/ui UI components
  │   │   └─ chat/         -- chat UI/UX components
  │   ├─ lib/              -- library-dependent functions
  │   │   ├─ db/
  │   │   │  ├─ index.ts
  │   │   │  ├─ mock.ts       -- representative mock data for companies and opportunies
  │   │   │  ├─ schema.ts
  │   │   │  ├─ seed-comp.ts
  │   │   │  ├─ seed-naics.ts -- aggregated NAICS codes data seeding script from our FastAPI backend
  │   │   │  └─ seed-opps.ts
  │   │   ├─ embedding.ts     -- embedding generation pipeline
  │   │   ├─ sam-gov.ts       -- SAM.gov API types and client constructor class
  │   │   └─ utils.ts
  │   ├─ styles/
  │   │   └─ globals.css      -- global CSS styles
  │   ├─ utils/               -- pure Js helper functions
  │   ├─ favicon.ico
  │   └─ layout.tsx           -- global layout
  ├─ public/
  ├─ .gitignore
  ├─ drizzle.config.ts
  ├─ eslint.config.mjs
  ├─ next.config.ts
  ├─ package.json
  ├─ pnpm-lock.yaml
  └─ tsconfig.json
```
