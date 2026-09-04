import { test, expect } from '../src/fixtures/autenticacao.fixture';
import { randomUUID } from 'crypto';

test.describe('AUTH — Rotas protegidas com JWT', () => {
  test('AUTH-P01 | admin autenticado deve conseguir cadastrar produto', async ({
    apiAutenticada,
  }) => {
    const { cliente, tokenAutenticacao } = apiAutenticada;
    const nomeProduto = `Produto QA ${Date.now()}_${randomUUID().slice(0, 6)}`;

    const resposta = await cliente.criarProduto(tokenAutenticacao, {
      nome: nomeProduto,
      preco: 100,
      descricao: 'Produto criado no teste de autenticacao',
      quantidade: 10,
    });

    expect(resposta.status()).toBe(201);
    const corpo = await resposta.json();
    expect(corpo.message).toBe('Cadastro realizado com sucesso');
    expect(corpo._id).toBeTruthy();

    await cliente.excluirProdutoPorId(tokenAutenticacao, corpo._id);
  });

  test('AUTH-P02 | token invalido nao deve cadastrar produto', async ({
    cliente,
  }) => {
    const resposta = await cliente.criarProduto('Bearer token_invalido_qa', {
      nome: `Produto Neg ${Date.now()}`,
      preco: 50,
      descricao: 'Nao deve cadastrar',
      quantidade: 1,
    });

    expect(resposta.status()).toBe(401);
    const corpo = await resposta.json();
    expect(corpo.message).toMatch(/token|autorização|authorization/i);
  });

  test('AUTH-P03 | sem token nao deve cadastrar produto', async ({ cliente }) => {
    const resposta = await cliente.criarProduto('', {
      nome: `Produto Sem Token ${Date.now()}`,
      preco: 50,
      descricao: 'Nao deve cadastrar',
      quantidade: 1,
    });

    expect([401, 403]).toContain(resposta.status());
  });
});
