import { test as base, expect, request, APIRequestContext } from '@playwright/test';
import { ServidorRestCliente } from '../clientes/servidorRest.cliente';
import { criarMassaUsuario } from '../ajudas/massaDados.fabrica';
import type { CorpoUsuario, RespostaLogin } from '../ajudas/tipos';
import { validarRespostaCadastro, validarRespostaLogin } from '../esquemas/usuario.esquema';

type FixturesAutenticacao = {
  cliente: ServidorRestCliente;
  apiAutenticada: {
    cliente: ServidorRestCliente;
    tokenAutenticacao: string;
    usuarioAdmin: CorpoUsuario;
    idUsuario: string;
  };
};

const urlBase =
  process.env.URL_BASE || process.env.BASE_URL || 'https://serverest.dev';

export const test = base.extend<FixturesAutenticacao>({
  cliente: async ({}, usar) => {
    const contexto: APIRequestContext = await request.newContext({
      baseURL: urlBase,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const cliente = new ServidorRestCliente(contexto);
    await usar(cliente);
    await contexto.dispose();
  },

  apiAutenticada: async ({}, usar) => {
    const contexto: APIRequestContext = await request.newContext({
      baseURL: urlBase,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const cliente = new ServidorRestCliente(contexto);
    const usuarioAdmin = criarMassaUsuario({ administrador: 'true' });

    const respostaCadastro = await cliente.criarUsuario(usuarioAdmin);
    expect(respostaCadastro.status()).toBe(201);
    const corpoCadastro = await respostaCadastro.json();
    validarRespostaCadastro(corpoCadastro);
    const idUsuario = corpoCadastro._id as string;

    const respostaLogin = await cliente.fazerLogin(
      usuarioAdmin.email,
      usuarioAdmin.password,
    );
    expect(respostaLogin.status()).toBe(200);
    const corpoLogin = (await respostaLogin.json()) as RespostaLogin;
    validarRespostaLogin(corpoLogin);

    await usar({
      cliente,
      tokenAutenticacao: corpoLogin.authorization,
      usuarioAdmin,
      idUsuario,
    });

    await cliente.excluirUsuarioPorId(idUsuario).catch(() => undefined);
    await contexto.dispose();
  },
});

export { expect };
