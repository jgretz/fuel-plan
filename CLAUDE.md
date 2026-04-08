# Fuel Plan

Race fuel reminder app — iOS mobile (Expo/React Native) + Apple Watch (native Swift/SwiftUI).

## Commands

```bash
npm install                    # install all workspace deps
npm run dev:mobile             # start Expo dev server
npm run mobile:ios             # run on iOS simulator
npm run test                   # run vitest across all packages
npm run type-check             # typecheck root tsconfig
npm run db:generate            # generate drizzle migrations
npm run db:migrate             # apply drizzle migrations
```

## Structure

- `packages/types/` — shared TypeScript types (`@fuel-plan/types`)
- `packages/schedule-builder/` — pure schedule generation logic (`@fuel-plan/schedule-builder`)
- `apps/mobile/` — Expo 52 iOS app with Expo Router
- `apps/mobile/ios/FuelPlanWatch/` — native Swift watchOS companion app

## Conventions

- See `~/.claude/rules/` for code style, testing, git, TypeScript, and error handling rules
- Local-only storage: SQLite via drizzle-orm + expo-sqlite
- Watch communication: WatchConnectivity (WCSession)
- Phone → Watch: `updateApplicationContext` (latest plan)
- Watch → Phone: `transferUserInfo` (execution log, guaranteed delivery)
