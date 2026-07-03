# Dairy Farm Mono Repo

Monorepo for the CattleCare dairy farm management platform.

## Structure

- `WebApp/` — React + TypeScript + MUI web dashboard
- `APIs/` — Node.js/Express + Sequelize/Postgres backend
- `MobileApp/` — React Native mobile app

## Getting started

Each app is independent (separate `package.json`, own `node_modules`). Install and run per-app:

```bash
cd APIs && npm install
cp .env.example .env.local   # fill in real values
npm run start:local

cd WebApp && npm install
npm run dev

cd MobileApp && npm install
npx react-native run-ios   # or run-android
```
