import { test, expect } from '../src/fixtures/autenticacao.fixture';
import { criarMassaUsuario } from '../src/ajudas/massaDados.fabrica';

test.describe('USER — Cenarios negativos', () => {
  test('USER-N01 | nao deve criar usuario com email duplicado', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuario();
    const primeiro = await cliente.criarUsuario(massa);
    expect(primeiro.status()).toBe(201);
    const { _id: idUsuario } = await primeiro.json();

    const segundo = await cliente.criarUsuario(massa);
    expect(segundo.status()).toBe(400);
    const corpo = await segundo.json();
    expect(corpo.message).toBe('Este email já está sendo usado');

    await cliente.excluirUsuarioPorId(idUsuario);
  });

  test('USER-N02 | nao deve criar usuario sem campos obrigatorios', async ({
    cliente,
  }) => {
    const resposta = await cliente.criarUsuario({
      nome: '',
      email: '',
      password: '',
      administrador: 'true',
    });
    expect(resposta.status()).toBe(400);
    const corpo = await resposta.json();
    expect(corpo).toBeTruthy();
  });

  test('USER-N03 | deve retornar erro ao buscar id inexistente', async ({
    cliente,
  }) => {
    const resposta = await cliente.buscarUsuarioPorId('idInexistenteQA123');
    expect([400, 404]).toContain(resposta.status());
  });

  test('USER-N04 | atualizar id inexistente pode cadastrar (comportamento ServeRest)', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuario();
    const idFantasma = `fantasma_${Date.now()}`;
    const resposta = await cliente.atualizarUsuario(idFantasma, massa);
    // ServeRest documenta que PUT em id inexistente realiza cadastro
    expect([200, 201]).toContain(resposta.status());
    const corpo = await resposta.json();

    if (corpo._id) {
      await cliente.excluirUsuarioPorId(corpo._id);
    } else {
      const lista = await cliente.listarUsuarios({ email: massa.email });
      const dados = await lista.json();
      if (dados.usuarios?.[0]?._id) {
        await cliente.excluirUsuarioPorId(dados.usuarios[0]._id);
      }
    }
  });

  test('USER-N05 | excluir id inexistente deve informar ausencia', async ({
    cliente,
  }) => {
    const resposta = await cliente.excluirUsuarioPorId('idInexistenteQA999');
    expect(resposta.status()).toBe(200);
    const corpo = await resposta.json();
    expect(corpo.message).toMatch(/nenhum registro|não encontrado|excluído/i);
  });

  test('USER-N06 | buscar usuario apos exclusao deve falhar', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuario();
    const cadastro = await cliente.criarUsuario(massa);
    const { _id: idUsuario } = await cadastro.json();

    await cliente.excluirUsuarioPorId(idUsuario);
    const consulta = await cliente.buscarUsuarioPorId(idUsuario);
    expect([400, 404]).toContain(consulta.status());
  });
});
