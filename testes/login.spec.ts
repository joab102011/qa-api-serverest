import { test, expect } from '../src/fixtures/autenticacao.fixture';
import { criarMassaUsuario } from '../src/ajudas/massaDados.fabrica';
import { validarRespostaLogin } from '../src/esquemas/usuario.esquema';
import { dado, quando, entao } from '../src/ajudas/passos.bdd';

test.describe('AUTH — Login', () => {
  test('AUTH-001 | deve realizar login com credenciais validas e retornar JWT', async ({
    cliente,
  }) => {
    let massa = criarMassaUsuario({ administrador: 'true' });
    let idUsuario = '';
    let respostaLogin!: Awaited<ReturnType<typeof cliente.fazerLogin>>;

    try {
      await dado('que existe um usuario administrador cadastrado', async () => {
        const cadastro = await cliente.criarUsuario(massa);
        expect(cadastro.status()).toBe(201);
        ({ _id: idUsuario } = await cadastro.json());
      });

      await quando('realizo login com email e senha validos', async () => {
        respostaLogin = await cliente.fazerLogin(massa.email, massa.password);
      });

      await entao('recebo status 200, mensagem de sucesso e token JWT', async () => {
        expect(respostaLogin.status()).toBe(200);
        const corpo = await respostaLogin.json();
        validarRespostaLogin(corpo);
      });
    } finally {
      if (idUsuario) {
        await cliente.excluirUsuarioPorId(idUsuario);
      }
    }
  });

  test('AUTH-002 | deve falhar login com email invalido', async ({ cliente }) => {
    let resposta!: Awaited<ReturnType<typeof cliente.fazerLogin>>;

    await dado('que informo um email nao cadastrado', async () => {
      // massa invalida deliberada — sem cadastro previo
    });

    await quando('tento autenticar com esse email', async () => {
      resposta = await cliente.fazerLogin(
        'email_inexistente_qa@naoexiste.com',
        'Senha@123',
      );
    });

    await entao('recebo status 401 e mensagem de credenciais invalidas', async () => {
      expect(resposta.status()).toBe(401);
      const corpo = await resposta.json();
      expect(corpo.message).toBe('Email e/ou senha inválidos');
    });
  });

  test('AUTH-003 | deve falhar login com senha invalida', async ({ cliente }) => {
    const massa = criarMassaUsuario();
    let idUsuario = '';
    let resposta!: Awaited<ReturnType<typeof cliente.fazerLogin>>;

    try {
      await dado('que existe um usuario cadastrado', async () => {
        const cadastro = await cliente.criarUsuario(massa);
        expect(cadastro.status()).toBe(201);
        ({ _id: idUsuario } = await cadastro.json());
      });

      await quando('tento login com a senha incorreta', async () => {
        resposta = await cliente.fazerLogin(massa.email, 'senha_errada');
      });

      await entao('recebo status 401 e mensagem de credenciais invalidas', async () => {
        expect(resposta.status()).toBe(401);
        const corpo = await resposta.json();
        expect(corpo.message).toBe('Email e/ou senha inválidos');
      });
    } finally {
      if (idUsuario) {
        await cliente.excluirUsuarioPorId(idUsuario);
      }
    }
  });

  test('AUTH-004 | deve falhar login com campos vazios', async ({ cliente }) => {
    let resposta!: Awaited<ReturnType<typeof cliente.fazerLogin>>;

    await dado('que nao informo email nem senha', async () => {
      // campos vazios intencionais
    });

    await quando('envio a requisicao de login', async () => {
      resposta = await cliente.fazerLogin('', '');
    });

    await entao('recebo 400 com validacao de email e password em branco', async () => {
      expect(resposta.status()).toBe(400);
      const corpo = await resposta.json();
      expect(corpo.email).toMatch(/email.*branco/i);
      expect(corpo.password).toMatch(/password.*branco/i);
    });
  });
});
