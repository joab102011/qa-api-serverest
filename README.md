# qa-api-serverest

Suite de **automação de testes de API** da [ServeRest](https://serverest.dev/) usando **Playwright Test** e **TypeScript**.

Case técnico de QA Automation — foco em autenticação JWT, CRUD de usuários, cenários negativos, CI/CD preparado (GitLab + GitHub Actions) e relatórios.

## Por que Playwright?

Escolhi Playwright pela experiência prévia com o framework, tipagem em TypeScript, `APIRequestContext` nativo para API e reporters prontos para pipeline (HTML, JUnit, Allure).

## Stack

| Item | Tecnologia |
|------|------------|
| Linguagem | TypeScript |
| Framework | Playwright Test |
| Relatórios | HTML Playwright + Allure + JUnit |
| CI/CD | GitLab CI + GitHub Actions (preparados, **inativos**) |
| API | ServeRest (`https://serverest.dev`) |

## Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm

## Setup

```bash
npm ci
```

> Não é necessário instalar browsers para esta suíte (apenas API).

## Como executar

```bash
# Suite completa
npm run testar

# Somente login
npm run testar:login

# Somente usuarios
npm run testar:usuarios

# Relatorio HTML
npm run relatorio
```

Variável opcional de ambiente:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `URL_BASE` ou `BASE_URL` | URL base da API | `https://serverest.dev` |

## O que é coberto

| ID | Cenário |
|----|---------|
| AUTH-001…004 | Login válido e negativos |
| USER-001…007 | CRUD + fluxo E2E |
| USER-N01…N06 | Negativos de usuário |
| AUTH-P01…P03 | JWT em rota protegida (`/produtos`) |

Matriz completa: [`docs/casos-de-teste.md`](docs/casos-de-teste.md).

## Decisão importante sobre o enunciado

O PDF cita endpoints `/users`. A API sugerida (**ServeRest**) expõe `/usuarios`. Os testes usam os paths reais da documentação oficial.

## Estratégia de CI (GitLab + GitHub Actions)

O enunciado do Case API pede **CI com artefatos de relatório** (ferramenta livre). O Case Mobile exige **GitLab CI**. Por isso o planejamento ficou assim:

| Arquivo | Plataforma | Papel |
|---------|------------|--------|
| [`.gitlab-ci.yml`](.gitlab-ci.yml) | GitLab | Pipeline “oficial” alinhada ao desafio Mobile |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | GitHub Actions | Espelho da mesma estratégia (mesmo fluxo e artefatos) |

**Estado atual: CI inativo** nos dois YAMLs — não dispara pipeline automática em push/PR. A validação da suíte foi feita **localmente** (`npm run testar`). Os arquivos existem como evidência de planejamento e prontidão para ativar.

### O que cada pipeline faz (quando ativada)

1. Job `testar_api` — `npm ci` + `npx playwright test`
2. Artefatos **sempre** (`when: always` / `if: always()`): `playwright-report/`, `allure-results/`, `test-results/`
3. Job `gerar_allure` — gera HTML Allure quando possível

### Como ativar

- **GitLab:** em `.gitlab-ci.yml`, troque `workflow.rules` de `when: never` por regras de branch/MR.
- **GitHub:** em `.github/workflows/ci.yml`, descomente `push`/`pull_request` e remova o `if: false` dos jobs.

## Estrutura

```
qa-api-serverest/
├── docs/                 # Planejamento e matriz
├── src/
│   ├── clientes/         # Cliente HTTP ServeRest
│   ├── fixtures/         # Fixture de autenticação
│   ├── ajudas/           # Massa de dados e tipos
│   └── esquemas/         # Asserts de contrato
├── testes/               # Specs Playwright
├── playwright.config.ts
├── .gitlab-ci.yml        # CI GitLab (inativo)
└── .github/workflows/    # CI GitHub Actions (inativo)
```

## Limitações conhecidas

- A ServeRest pública é compartilhada; e-mails únicos e `workers: 1` reduzem flakiness
- O rate limit de 100 req/min do enunciado pode não ser aplicado pela API pública
- `PUT` em id inexistente na ServeRest pode **cadastrar** (comportamento documentado — coberto em USER-N04)

## Documentação

- [`docs/PLANEJAMENTO.md`](docs/PLANEJAMENTO.md) — arquitetura e decisões
- [`docs/casos-de-teste.md`](docs/casos-de-teste.md) — matriz detalhada

---

Feito por [Joab Cruz](https://github.com/joab102011)
