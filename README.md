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

## Pré-requisitos (só no PC)

| Ferramenta | Como |
|------------|------|
| **Node.js 20 LTS** | [nodejs.org](https://nodejs.org) → instalador → reinicie o terminal |

```bash
node -v
npm -v
```

> Só isso. A suíte é de **API** (HTTP). O Playwright e o restante vêm com `npm ci`.  
> Nos YAMLs de CI, a **imagem/container** já traz Node + Playwright — a pipeline não depende do que está instalado na sua máquina.

## Setup (primeira vez)

Abra o terminal **dentro da pasta** `qa-api-serverest` e rode:

```bash
npm ci
```

> Esta suíte testa **API** (HTTP). Não abre o Chrome do site — o Playwright só envia requisições.  
> O modo **UI** abaixo é a *tela do Playwright* para acompanhar os testes, não a interface da ServeRest.

---

## Como executar (guia rápido)

### A) Ver **todas** as specs na interface (modo UI)

Ideal para quem quer **acompanhar** passo a passo na tela do Playwright:

```bash
npm run testar:ui
```

1. Uma janela do Playwright abre.  
2. Clique em ▶ para rodar tudo (ou escolha um arquivo à esquerda).  
3. Feche a janela quando terminar.

### B) Rodar **tudo** em modo headless (só no terminal, sem janela)

Padrão para validação rápida / CI:

```bash
npm run testar
```

### C) Rodar **somente uma** spec em modo headless

Troque o arquivo pelo que quiser:

| O que testar | Comando |
|--------------|---------|
| Login | `npm run testar:login` |
| CRUD de usuários | `npm run testar:crud` |
| Negativos de usuários | `npm run testar:negativos` |
| Rotas protegidas (JWT) | `npm run testar:protegidos` |
| CRUD + negativos juntos | `npm run testar:usuarios` |

Ou, na mão (mesmo efeito):

```bash
npx playwright test testes/login.spec.ts
npx playwright test testes/usuarios.crud.spec.ts
npx playwright test testes/usuarios.negativos.spec.ts
npx playwright test testes/autenticacao.protegidos.spec.ts
```

### D) Uma spec específica **dentro do modo UI**

```bash
npx playwright test testes/login.spec.ts --ui
```

### E) Ver o relatório HTML depois

```bash
npm run relatorio
```

---

### Resumo visual

| Objetivo | Comando |
|----------|---------|
| Todas as specs **com tela** (UI) | `npm run testar:ui` |
| Todas as specs **sem tela** (headless) | `npm run testar` |
| **Uma** spec sem tela | `npm run testar:login` (ou outro da tabela) |
| Uma spec **com tela** | `npx playwright test testes/NOME.spec.ts --ui` |

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

**Estado atual: CI inativo** nos dois YAMLs — não dispara pipeline automática em push/PR. A validação da suíte foi feita **localmente** (`npm ci` + `npm run testar`). Os YAMLs são **auto-suficientes**: usam a imagem oficial do Playwright (já traz Node e dependências de runtime); no job só entram `npm ci` e os testes.

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
