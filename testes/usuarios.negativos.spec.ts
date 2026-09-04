import { test, expect } from '../src/fixtures/autenticacao.fixture';
import { criarMassaUsuario } from '../src/ajudas/massaDados.fabrica';
import { dado, quando, entao } from '../src/ajudas/passos.bdd';

test.describe('USER — Cenarios negativos', () => {
  test('USER-N01 | nao deve criar usuario com email duplicado', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuario();
    let idUsuario = '';
    let segundaResposta!: Awaited<ReturnType<typeof cliente.criarUsuario>>;

    await dado('que ja existe um usuario com determinado email', async () => {
      const primeiro = await cliente.criarUsuario(massa);
      expect(primeiro.status()).toBe(201);
      ({ _id: idUsuario } = await primeiro.json());
    });

    await quando('tento cadastrar novamente com o mesmo email', async () => {
      segundaResposta = await cliente.criarUsuario(massa);
    });

    await entao('recebo 400 informando que o email ja esta em uso', async () => {
      expect(segundaResposta.status()).toBe(400);
      const corpo = await segundaResposta.json();
      expect(corpo.message).toBe('Este email já está sendo usado');
    });

    await cliente.excluirUsuarioPorId(idUsuario);
  });

  test('USER-N02 | nao deve criar usuario sem campos obrigatorios', async ({
    cliente,
  }) => {
    let resposta!: Awaited<ReturnType<typeof cliente.criarUsuario>>;

    await dado('que envio nome, email e senha vazios', async () => {
      // payload invalido preparado na acao
    });

    await quando('chamo POST /usuarios', async () => {
      resposta = await cliente.criarUsuario({
        nome: '',
        email: '',
        password: '',
        administrador: 'true',
      });
    });

    await entao('recebo status 400 de validacao', async () => {
      expect(resposta.status()).toBe(400);
      const corpo = await resposta.json();
      expect(corpo).toBeTruthy();
    });
  });

  test('USER-N03 | deve retornar erro ao buscar id inexistente', async ({
    cliente,
  }) => {
    let resposta!: Awaited<ReturnType<typeof cliente.buscarUsuarioPorId>>;

    await dado('que informo um _id que nao existe', async () => {
      expect('idInexistenteQA123').toBeTruthy();
    });

    await quando('busco GET /usuarios/{_id}', async () => {
      resposta = await cliente.buscarUsuarioPorId('idInexistenteQA123');
    });

    await entao('recebo status 400 ou 404', async () => {
      expect([400, 404]).toContain(resposta.status());
    });
  });

  test('USER-N04 | atualizar id inexistente pode cadastrar (comportamento ServeRest)', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuario();
    const idFantasma = `fantasma_${Date.now()}`;
    let corpo: { _id?: string; message?: string } = {};

    await dado('que o _id informado nao existe na base', async () => {
      expect(idFantasma).toContain('fantasma_');
    });

    await quando('envio PUT /usuarios/{_id} com dados validos', async () => {
      const resposta = await cliente.atualizarUsuario(idFantasma, massa);
      expect([200, 201]).toContain(resposta.status());
      corpo = await resposta.json();
    });

    await entao('a API realiza cadastro ou altera e eu limpo o registro gerado', async () => {
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
  });

  test('USER-N05 | excluir id inexistente deve informar ausencia', async ({
    cliente,
  }) => {
    let resposta!: Awaited<ReturnType<typeof cliente.excluirUsuarioPorId>>;

    await dado('que o _id nao corresponde a nenhum usuario', async () => {
      expect('idInexistenteQA999').toBeTruthy();
    });

    await quando('envio DELETE /usuarios/{_id}', async () => {
      resposta = await cliente.excluirUsuarioPorId('idInexistenteQA999');
    });

    await entao('recebo 200 com mensagem indicando que nao havia registro', async () => {
      expect(resposta.status()).toBe(200);
      const corpo = await resposta.json();
      expect(corpo.message).toMatch(/nenhum registro|não encontrado|excluído/i);
    });
  });

  test('USER-N06 | buscar usuario apos exclusao deve falhar', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuario();
    let idUsuario = '';

    await dado('que cadastrei e em seguida exclui um usuario', async () => {
      const cadastro = await cliente.criarUsuario(massa);
      ({ _id: idUsuario } = await cadastro.json());
      await cliente.excluirUsuarioPorId(idUsuario);
    });

    let consulta!: Awaited<ReturnType<typeof cliente.buscarUsuarioPorId>>;
    await quando('consulto GET /usuarios/{_id} apos a exclusao', async () => {
      consulta = await cliente.buscarUsuarioPorId(idUsuario);
    });

    await entao('recebo status 400 ou 404', async () => {
      expect([400, 404]).toContain(consulta.status());
    });
  });
});
