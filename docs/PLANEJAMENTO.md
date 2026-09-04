# Planejamento — qa-api-serverest

## Objetivo

Atender o Case Técnico de **Automação de Testes de API** com cobertura funcional de autenticação JWT e CRUD de usuários na [ServeRest](https://serverest.dev/), CI preparado (GitLab + GitHub Actions, inativos) e relatórios como artefato.

## Decisão de stack

Optei por **Playwright Test + TypeScript** porque:

- já utilizo o framework no dia a dia (ex.: testes E2E);
- o `APIRequestContext` cobre API sem browser;
- reporters HTML/JUnit/Allure encaixam no requisito de pipeline;
- tipagem reduz regressão silenciosa nos asserts.

Em uma entrega anterior usei Postman/Newman; nesta evoluo para código versionado, fixtures e contratos explícitos.

## Mapeamento do enunciado

| Enunciado (PDF) | ServeRest real |
|-----------------|----------------|
| `GET/POST /users` | `GET/POST /usuarios` |
| `GET/PUT/DELETE /users/{id}` | `GET/PUT/DELETE /usuarios/{_id}` |
| JWT | `POST /login` → header `Authorization` |
| Rate limit 100 req/min | workers=1 + retries; API pública pode não aplicar o limite |

## Arquitetura

```
testes/*.spec.ts
        │
        ▼
fixtures (apiAutenticada, cliente)
        │
        ▼
ServidorRestCliente  →  https://serverest.dev
        │
        ▼
esquemas (asserts de contrato)
```

## Organização de pastas

| Pasta | Responsabilidade |
|-------|------------------|
| `testes/` | Casos de teste por domínio |
| `src/clientes/` | Chamadas HTTP encapsuladas |
| `src/fixtures/` | Setup de autenticação e cliente |
| `src/ajudas/` | Fábrica de massa e tipos |
| `src/esquemas/` | Validação de contrato |
| `docs/` | Planejamento e matriz |

## Estratégia de dados

- E-mails únicos por execução (`usuario_{timestamp}_{uuid}@qa.com.br`)
- Cleanup com `DELETE /usuarios/{_id}` ao final dos testes
- `workers: 1` para respeitar o espírito do rate limit e reduzir flakiness na API compartilhada

## Padrao DADO / QUANDO / ENTAO

Cada cenario nas specs usa steps explicitos via `dado()`, `quando()` e `entao()` (`src/ajudas/passos.bdd.ts`), gerando `test.step` no Playwright — mesmo padrao BDD dos desafios anteriores (Postman).

## CI/CD

Dois YAMLs espelhados, **inativos por padrão** (ver README — Estratégia de CI):

| Arquivo | Uso |
|---------|-----|
| `.gitlab-ci.yml` | Alinhamento com o Case Mobile (GitLab CI no enunciado) |
| `.github/workflows/ci.yml` | Mesma estratégia no GitHub (remoto público atual) |

- Stage/job `testar`: `npx playwright test`
- Artifacts **sempre**: HTML, Allure results, JUnit
- Stage/job `relatorio` / `gerar_allure`: HTML Allure quando possível
- Ativação documentada no README (não dispara push/PR enquanto inativo)

## Como o avaliador deve navegar

1. Ler este arquivo e o `README.md`
2. Abrir `docs/casos-de-teste.md` (matriz ID → cenário)
3. Rodar `npm ci && npm run testar`
4. Conferir os YAMLs de CI (inativos) e, se quiser, ativá-los conforme o README
