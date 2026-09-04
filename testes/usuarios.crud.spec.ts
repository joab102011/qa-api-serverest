import { test, expect } from '../src/fixtures/autenticacao.fixture';
import {
  criarMassaUsuario,
  criarMassaUsuarioComum,
} from '../src/ajudas/massaDados.fabrica';
import {
  validarListaUsuarios,
  validarRespostaCadastro,
  validarUsuarioListado,
} from '../src/esquemas/usuario.esquema';

test.describe('USER — CRUD de usuarios', () => {
  test('USER-001 | deve listar usuarios cadastrados', async ({ cliente }) => {
    const resposta = await cliente.listarUsuarios();
    expect(resposta.status()).toBe(200);
    const corpo = await resposta.json();
    validarListaUsuarios(corpo);
  });

  test('USER-002 | deve criar usuario administrador', async ({ cliente }) => {
    const massa = criarMassaUsuario({ administrador: 'true' });
    const resposta = await cliente.criarUsuario(massa);
    expect(resposta.status()).toBe(201);
    const corpo = await resposta.json();
    validarRespostaCadastro(corpo);

    await cliente.excluirUsuarioPorId(corpo._id);
  });

  test('USER-003 | deve criar usuario comum (nao administrador)', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuarioComum();
    const resposta = await cliente.criarUsuario(massa);
    expect(resposta.status()).toBe(201);
    const corpo = await resposta.json();
    validarRespostaCadastro(corpo);

    const consulta = await cliente.buscarUsuarioPorId(corpo._id);
    expect(consulta.status()).toBe(200);
    const usuario = await consulta.json();
    expect(usuario.administrador).toBe('false');

    await cliente.excluirUsuarioPorId(corpo._id);
  });

  test('USER-004 | deve buscar usuario por id', async ({ cliente }) => {
    const massa = criarMassaUsuario();
    const cadastro = await cliente.criarUsuario(massa);
    const { _id: idUsuario } = await cadastro.json();

    const resposta = await cliente.buscarUsuarioPorId(idUsuario);
    expect(resposta.status()).toBe(200);
    const usuario = await resposta.json();
    validarUsuarioListado(usuario, {
      _id: idUsuario,
      nome: massa.nome,
      email: massa.email,
    });

    await cliente.excluirUsuarioPorId(idUsuario);
  });

  test('USER-005 | deve atualizar usuario existente', async ({ cliente }) => {
    const massa = criarMassaUsuario();
    const cadastro = await cliente.criarUsuario(massa);
    const { _id: idUsuario } = await cadastro.json();

    const massaAtualizada = {
      ...massa,
      nome: `${massa.nome} Atualizado`,
    };
    const resposta = await cliente.atualizarUsuario(idUsuario, massaAtualizada);
    expect(resposta.status()).toBe(200);
    const corpo = await resposta.json();
    expect(corpo.message).toBe('Registro alterado com sucesso');

    const consulta = await cliente.buscarUsuarioPorId(idUsuario);
    const usuario = await consulta.json();
    expect(usuario.nome).toBe(massaAtualizada.nome);

    await cliente.excluirUsuarioPorId(idUsuario);
  });

  test('USER-006 | deve excluir usuario existente', async ({ cliente }) => {
    const massa = criarMassaUsuario();
    const cadastro = await cliente.criarUsuario(massa);
    const { _id: idUsuario } = await cadastro.json();

    const resposta = await cliente.excluirUsuarioPorId(idUsuario);
    expect(resposta.status()).toBe(200);
    const corpo = await resposta.json();
    expect(corpo.message).toBe('Registro excluído com sucesso');

    const consulta = await cliente.buscarUsuarioPorId(idUsuario);
    expect([400, 404]).toContain(consulta.status());
  });

  test('USER-007 | fluxo E2E criar -> login -> buscar -> atualizar -> excluir', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuario({ administrador: 'true' });

    const cadastro = await cliente.criarUsuario(massa);
    expect(cadastro.status()).toBe(201);
    const { _id: idUsuario } = await cadastro.json();

    const login = await cliente.fazerLogin(massa.email, massa.password);
    expect(login.status()).toBe(200);
    const { authorization: tokenAutenticacao } = await login.json();
    expect(tokenAutenticacao).toBeTruthy();

    const busca = await cliente.buscarUsuarioPorId(idUsuario);
    expect(busca.status()).toBe(200);

    const atualizacao = await cliente.atualizarUsuario(idUsuario, {
      ...massa,
      nome: 'Usuario E2E Atualizado',
    });
    expect(atualizacao.status()).toBe(200);

    const exclusao = await cliente.excluirUsuarioPorId(idUsuario);
    expect(exclusao.status()).toBe(200);

    const posExclusao = await cliente.buscarUsuarioPorId(idUsuario);
    expect([400, 404]).toContain(posExclusao.status());
  });
});
