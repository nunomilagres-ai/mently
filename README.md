# Mently

Painel de saúde pessoal — [mently.bynuno.com](https://mently.bynuno.com)

## O que é

Mently é uma aplicação mobile-first para acompanhamento de saúde pessoal. Agrega peso, sono, exercício, nutrição e análises laboratoriais num único painel. Inclui horóscopo ocidental + chinês gerado pelo Claude.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Cloudflare Pages Functions (Workers)
- **Base de dados**: Cloudflare D1 (SQLite)
- **Auth**: Delegada ao [byNuno Hub](https://bynuno.com) via cookie `session_id` com `Domain=.bynuno.com`
- **IA**: Claude (Anthropic) para geração de horóscopos

## Funcionalidades

- **Peso** — registo diário com tendência e IMC
- **Sono** — horas dormidas, hora de dormir e acordar
- **Exercício** — passos e atividade diária
- **Nutrição** — registo de refeições
- **Análises** — marcadores laboratoriais com referências e alertas
- **Horóscopo** — combinação ocidental × chinês gerado pelo Claude com cache em D1 (cross-device)
- **Perfil** — dados pessoais, altura, data/hora de nascimento

## Estrutura

```
functions/
  _auth.js                  # Auth delegada ao byNuno Hub
  api/
    auth/
      google.js             # Redireciona para bynuno.com/api/auth/google
      me.js                 # Valida sessão via bynuno.com
      logout.js             # Delega logout ao Hub
    entities/
      [type].js             # CRUD genérico para todas as entidades
      [type]/[id].js        # GET/PUT/DELETE por ID
    horoscope.js            # Proxy server-side para freehoroscopeapi.com
src/
  pages/
    Dashboard.jsx           # Painel principal com resumo do dia
    Profile.jsx             # Perfil + horóscopo
    Nutrition.jsx
    Sleep.jsx
    Exercise.jsx
    Analyses.jsx
  store/
    api.js                  # Stores D1 + cache horóscopo (localStorage + D1)
```

## Auth

O login é gerido pelo [byNuno Hub](https://bynuno.com). O Mently não tem OAuth próprio — valida a sessão fazendo `fetch('https://bynuno.com/api/auth/me')` com o cookie `session_id` partilhado.

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name mently
```

## Changelog

### v1.2 — 2026-03-26
- Corrigido loop de login causado por conflito de cookies `session_id` (cookie local antigo vs. cookie do Hub)
- Horóscopos persistidos em D1 após geração — sem repetir chamadas à API Claude
- Cache por camadas: localStorage → D1 → Claude

### v1.1 — 2026-03-24
- Migração de localStorage para Cloudflare D1
- Autenticação delegada ao byNuno Hub
- Horóscopo combinado (ocidental × chinês) gerado pelo Claude

### v1.0 — 2026-03-24
- Lançamento inicial com peso, sono, exercício, nutrição e análises laboratoriais
