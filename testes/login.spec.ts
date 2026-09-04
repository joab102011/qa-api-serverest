import { test, expect } from '../src/fixtures/autenticacao.fixture';
import { criarMassaUsuario } from '../src/ajudas/massaDados.fabrica';
import { validarRespostaLogin } from '../src/esquemas/usuario.esquema';

test.describe('AUTH — Login', () => {
  test('AUTH-001 | deve realizar login com credenciais validas e retornar JWT', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuario({ administrador: 'true' });
    const cadastro = await cliente.criarUsuario(massa);
    expect(cadastro.status()).toBe(201);
    const { _id: idUsuario } = await cadastro.json();

    const resposta = await cliente.fazerLogin(massa.email, massa.password);
    expect(resposta.status()).toBe(200);
    const corpo = await resposta.json();
    validarRespostaLogin(corpo);

    await cliente.excluirUsuarioPorId(idUsuario);
  });

  test('AUTH-002 | deve falhar login com email invalido', async ({ cliente }) => {
    const resposta = await cliente.fazerLogin(
      'email_inexistente_qa@naoexiste.com',
      'Senha@123',
    );
    expect(resposta.status()).toBe(401);
    const corpo = await resposta.json();
    expect(corpo.message).toBe('Email e/ou senha inválidos');
  });

  test('AUTH-003 | deve falhar login com senha invalida', async ({ cliente }) => {
    const massa = criarMassaUsuario();
    const cadastro = await cliente.criarUsuario(massa);
    expect(cadastro.status()).toBe(201);
    const { _id: idUsuario } = await cadastro.json();

    const resposta = await cliente.fazerLogin(massa.email, 'senha_errada');
    expect(resposta.status()).toBe(401);
    const corpo = await resposta.json();
    expect(corpo.message).toBe('Email e/ou senha inválidos');

    await cliente.excluirUsuarioPorId(idUsuario);
  });

  test('AUTH-004 | deve falhar login com campos vazios', async ({ cliente }) => {
    const resposta = await cliente.fazerLogin('', '');
    expect([400, 401]).toContain(resposta.status());
    const corpo = await resposta.json();
    expect(corpo).toBeTruthy();
  });
});
