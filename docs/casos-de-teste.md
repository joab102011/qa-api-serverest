# Matriz de casos de teste — ServeRest API

Legenda: **P** = positivo · **N** = negativo · **E2E** = fluxo completo

| ID | Tipo | Endpoint / foco | Cenário | Arquivo |
|----|------|-----------------|---------|---------|
| AUTH-001 | P | `POST /login` | Login com credenciais válidas (JWT) | `testes/login.spec.ts` |
| AUTH-002 | N | `POST /login` | E-mail inválido | `testes/login.spec.ts` |
| AUTH-003 | N | `POST /login` | Senha inválida | `testes/login.spec.ts` |
| AUTH-004 | N | `POST /login` | Campos vazios | `testes/login.spec.ts` |
| USER-001 | P | `GET /usuarios` | Listar usuários | `testes/usuarios.crud.spec.ts` |
| USER-002 | P | `POST /usuarios` | Criar administrador | `testes/usuarios.crud.spec.ts` |
| USER-003 | P | `POST /usuarios` | Criar usuário comum | `testes/usuarios.crud.spec.ts` |
| USER-004 | P | `GET /usuarios/{_id}` | Buscar por id | `testes/usuarios.crud.spec.ts` |
| USER-005 | P | `PUT /usuarios/{_id}` | Atualizar usuário | `testes/usuarios.crud.spec.ts` |
| USER-006 | P | `DELETE /usuarios/{_id}` | Excluir usuário | `testes/usuarios.crud.spec.ts` |
| USER-007 | E2E | fluxo completo | Criar → login → buscar → atualizar → excluir | `testes/usuarios.crud.spec.ts` |
| USER-N01 | N | `POST /usuarios` | E-mail duplicado | `testes/usuarios.negativos.spec.ts` |
| USER-N02 | N | `POST /usuarios` | Campos obrigatórios ausentes | `testes/usuarios.negativos.spec.ts` |
| USER-N03 | N | `GET /usuarios/{_id}` | Id inexistente | `testes/usuarios.negativos.spec.ts` |
| USER-N04 | N | `PUT /usuarios/{_id}` | Id inexistente (cadastro via PUT) | `testes/usuarios.negativos.spec.ts` |
| USER-N05 | N | `DELETE /usuarios/{_id}` | Id inexistente | `testes/usuarios.negativos.spec.ts` |
| USER-N06 | N | `GET` após delete | Busca pós-exclusão | `testes/usuarios.negativos.spec.ts` |
| AUTH-P01 | P | `POST /produtos` | Admin com JWT cadastra produto | `testes/autenticacao.protegidos.spec.ts` |
| AUTH-P02 | N | `POST /produtos` | Token inválido | `testes/autenticacao.protegidos.spec.ts` |
| AUTH-P03 | N | `POST /produtos` | Sem token | `testes/autenticacao.protegidos.spec.ts` |
