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
import { dado, quando, entao } from '../src/ajudas/passos.bdd';

test.describe('USER — CRUD de usuarios', () => {
  test('USER-001 | deve listar usuarios cadastrados', async ({ cliente }) => {
    let resposta!: Awaited<ReturnType<typeof cliente.listarUsuarios>>;

    await dado('que a API ServeRest esta disponivel', async () => {
      expect(cliente).toBeTruthy();
    });

    await quando('solicito a listagem de usuarios', async () => {
      resposta = await cliente.listarUsuarios();
    });

    await entao('recebo status 200 com quantidade e array de usuarios', async () => {
      expect(resposta.status()).toBe(200);
      const corpo = await resposta.json();
      validarListaUsuarios(corpo);
    });
  });

  test('USER-002 | deve criar usuario administrador', async ({ cliente }) => {
    const massa = criarMassaUsuario({ administrador: 'true' });
    let resposta!: Awaited<ReturnType<typeof cliente.criarUsuario>>;
    let idUsuario = '';

    try {
      await dado('que informo dados validos de um administrador', async () => {
        expect(massa.administrador).toBe('true');
        expect(massa.email).toBeTruthy();
      });

      await quando('envio POST /usuarios', async () => {
        resposta = await cliente.criarUsuario(massa);
      });

      await entao('recebo 201 e o _id do usuario criado', async () => {
        expect(resposta.status()).toBe(201);
        const corpo = await resposta.json();
        validarRespostaCadastro(corpo);
        idUsuario = corpo._id;
      });
    } finally {
      if (idUsuario) {
        await cliente.excluirUsuarioPorId(idUsuario);
      }
    }
  });

  test('USER-003 | deve criar usuario comum (nao administrador)', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuarioComum();
    let idUsuario = '';

    try {
      await dado('que informo dados de usuario nao administrador', async () => {
        expect(massa.administrador).toBe('false');
      });

      await quando('cadastro o usuario na API', async () => {
        const resposta = await cliente.criarUsuario(massa);
        expect(resposta.status()).toBe(201);
        const corpo = await resposta.json();
        validarRespostaCadastro(corpo);
        idUsuario = corpo._id;
      });

      await entao('a consulta por id confirma administrador=false', async () => {
        const consulta = await cliente.buscarUsuarioPorId(idUsuario);
        expect(consulta.status()).toBe(200);
        const usuario = await consulta.json();
        expect(usuario.administrador).toBe('false');
      });
    } finally {
      if (idUsuario) {
        await cliente.excluirUsuarioPorId(idUsuario);
      }
    }
  });

  test('USER-004 | deve buscar usuario por id', async ({ cliente }) => {
    const massa = criarMassaUsuario();
    let idUsuario = '';
    let resposta!: Awaited<ReturnType<typeof cliente.buscarUsuarioPorId>>;

    try {
      await dado('que existe um usuario previamente cadastrado', async () => {
        const cadastro = await cliente.criarUsuario(massa);
        ({ _id: idUsuario } = await cadastro.json());
      });

      await quando('busco o usuario pelo _id', async () => {
        resposta = await cliente.buscarUsuarioPorId(idUsuario);
      });

      await entao('recebo os dados correspondentes ao cadastro', async () => {
        expect(resposta.status()).toBe(200);
        const usuario = await resposta.json();
        validarUsuarioListado(usuario, {
          _id: idUsuario,
          nome: massa.nome,
          email: massa.email,
        });
      });
    } finally {
      if (idUsuario) {
        await cliente.excluirUsuarioPorId(idUsuario);
      }
    }
  });

  test('USER-005 | deve atualizar usuario existente', async ({ cliente }) => {
    const massa = criarMassaUsuario();
    let idUsuario = '';
    const massaAtualizada = { ...massa, nome: '' };

    try {
      await dado('que existe um usuario cadastrado', async () => {
        const cadastro = await cliente.criarUsuario(massa);
        ({ _id: idUsuario } = await cadastro.json());
        massaAtualizada.nome = `${massa.nome} Atualizado`;
      });

      await quando('envio PUT com o nome alterado', async () => {
        const resposta = await cliente.atualizarUsuario(idUsuario, massaAtualizada);
        expect(resposta.status()).toBe(200);
        const corpo = await resposta.json();
        expect(corpo.message).toBe('Registro alterado com sucesso');
      });

      await entao('a consulta reflete o novo nome', async () => {
        const consulta = await cliente.buscarUsuarioPorId(idUsuario);
        const usuario = await consulta.json();
        expect(usuario.nome).toBe(massaAtualizada.nome);
      });
    } finally {
      if (idUsuario) {
        await cliente.excluirUsuarioPorId(idUsuario);
      }
    }
  });

  test('USER-006 | deve excluir usuario existente', async ({ cliente }) => {
    const massa = criarMassaUsuario();
    let idUsuario = '';

    await dado('que existe um usuario cadastrado', async () => {
      const cadastro = await cliente.criarUsuario(massa);
      ({ _id: idUsuario } = await cadastro.json());
    });

    await quando('envio DELETE para o _id do usuario', async () => {
      const resposta = await cliente.excluirUsuarioPorId(idUsuario);
      expect(resposta.status()).toBe(200);
      const corpo = await resposta.json();
      expect(corpo.message).toBe('Registro excluído com sucesso');
    });

    await entao('a busca posterior retorna erro (400 ou 404)', async () => {
      const consulta = await cliente.buscarUsuarioPorId(idUsuario);
      expect([400, 404]).toContain(consulta.status());
    });
  });

  test('USER-007 | fluxo E2E criar -> login -> buscar -> atualizar -> excluir', async ({
    cliente,
  }) => {
    const massa = criarMassaUsuario({ administrador: 'true' });
    let idUsuario = '';
    let tokenAutenticacao = '';
    let excluido = false;

    try {
      await dado('que preciso exercitar o ciclo completo de usuario', async () => {
        expect(massa.email).toBeTruthy();
      });

      await quando('crio, autentico, consulto, atualizo e excluo o usuario', async () => {
        const cadastro = await cliente.criarUsuario(massa);
        expect(cadastro.status()).toBe(201);
        ({ _id: idUsuario } = await cadastro.json());

        const login = await cliente.fazerLogin(massa.email, massa.password);
        expect(login.status()).toBe(200);
        ({ authorization: tokenAutenticacao } = await login.json());
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
        excluido = true;
      });

      await entao('o usuario nao e mais recuperavel por id', async () => {
        const posExclusao = await cliente.buscarUsuarioPorId(idUsuario);
        expect([400, 404]).toContain(posExclusao.status());
      });
    } finally {
      if (idUsuario && !excluido) {
        await cliente.excluirUsuarioPorId(idUsuario);
      }
    }
  });
});
