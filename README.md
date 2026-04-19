# GS1 Norway — InfoHub

Søkbar kunnskapsbase. GS1-standarder, caser og veiledere samlet på étt sted. Innhold administreres via Publish-appen.

**Live URL:** https://infohub.gs1.threesix1.com

## Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (nordic tokens)
- Supabase (artikkellagring, fulltekstsøk)
- Vercel (auto-deploy ved push til `main`)

## Lokal utvikling
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Del av GS1 × ThreeSixtyOne AI-suite
| App | URL |
|-----|-----|
| Dynamisk Brief | dynamiskbrief.gs1.threesix1.com |
| **InfoHub** | **infohub.gs1.threesix1.com** |
| Publish | publish.gs1.threesix1.com |
| Playbook | playbook.gs1.threesix1.com |
