import { test, expect } from '../src/fixtures/autenticacao.fixture';
import { randomUUID } from 'crypto';
import { dado, quando, entao } from '../src/ajudas/passos.bdd';

test.describe('AUTH — Rotas protegidas com JWT', () => {
  test('AUTH-P01 | admin autenticado deve conseguir cadastrar produto @smoke', async ({
    apiAutenticada,
  }) => {
    const { cliente, tokenAutenticacao } = apiAutenticada;
    const nomeProduto = `Produto QA ${Date.now()}_${randomUUID().slice(0, 6)}`;
    let idProduto = '';
    let resposta!: Awaited<ReturnType<typeof cliente.criarProduto>>;

    try {
      await dado('que possuo um token JWT de administrador valido', async () => {
        expect(tokenAutenticacao.startsWith('Bearer ')).toBeTruthy();
      });

      await quando('cadastro um produto autenticado em POST /produtos', async () => {
        resposta = await cliente.criarProduto(tokenAutenticacao, {
          nome: nomeProduto,
          preco: 100,
          descricao: 'Produto criado no teste de autenticacao',
          quantidade: 10,
        });
      });

      await entao('recebo 201 com _id do produto', async () => {
        expect(resposta.status()).toBe(201);
        const corpo = await resposta.json();
        expect(corpo.message).toBe('Cadastro realizado com sucesso');
        expect(corpo._id).toBeTruthy();
        idProduto = corpo._id;
      });
    } finally {
      if (idProduto) {
        await cliente.excluirProdutoPorId(tokenAutenticacao, idProduto);
      }
    }
  });

  test('AUTH-P02 | token invalido nao deve cadastrar produto', async ({
    cliente,
  }) => {
    let resposta!: Awaited<ReturnType<typeof cliente.criarProduto>>;

    await dado('que utilizo um token JWT invalido', async () => {
      expect('Bearer token_invalido_qa').toContain('Bearer');
    });

    await quando('tento cadastrar produto em POST /produtos', async () => {
      resposta = await cliente.criarProduto('Bearer token_invalido_qa', {
        nome: `Produto Neg ${Date.now()}`,
        preco: 50,
        descricao: 'Nao deve cadastrar',
        quantidade: 1,
      });
    });

    await entao('recebo 401 com mensagem relacionada ao token', async () => {
      expect(resposta.status()).toBe(401);
      const corpo = await resposta.json();
      expect(corpo.message).toMatch(/token|autorização|authorization/i);
    });
  });

  test('AUTH-P03 | sem token nao deve cadastrar produto', async ({ cliente }) => {
    let resposta!: Awaited<ReturnType<typeof cliente.criarProduto>>;

    await dado('que nao envio header Authorization', async () => {
      // token vazio
    });

    await quando('chamo POST /produtos', async () => {
      resposta = await cliente.criarProduto('', {
        nome: `Produto Sem Token ${Date.now()}`,
        preco: 50,
        descricao: 'Nao deve cadastrar',
        quantidade: 1,
      });
    });

    await entao('recebo status 401 ou 403', async () => {
      expect([401, 403]).toContain(resposta.status());
    });
  });
});
