import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { CorpoUsuario } from '../ajudas/tipos';

/**
 * Cliente HTTP da ServeRest — encapsula paths e headers.
 * O enunciado cita /users; a API sugerida usa /usuarios.
 */
export class ServidorRestCliente {
  constructor(private readonly requisicao: APIRequestContext) {}

  async fazerLogin(email: string, password: string): Promise<APIResponse> {
    return this.requisicao.post('/login', {
      data: { email, password },
    });
  }

  async listarUsuarios(params?: Record<string, string>): Promise<APIResponse> {
    return this.requisicao.get('/usuarios', { params });
  }

  async criarUsuario(corpo: CorpoUsuario): Promise<APIResponse> {
    return this.requisicao.post('/usuarios', { data: corpo });
  }

  async buscarUsuarioPorId(idUsuario: string): Promise<APIResponse> {
    return this.requisicao.get(`/usuarios/${idUsuario}`);
  }

  async atualizarUsuario(
    idUsuario: string,
    corpo: CorpoUsuario,
  ): Promise<APIResponse> {
    return this.requisicao.put(`/usuarios/${idUsuario}`, { data: corpo });
  }

  async excluirUsuarioPorId(idUsuario: string): Promise<APIResponse> {
    return this.requisicao.delete(`/usuarios/${idUsuario}`);
  }

  async criarProduto(
    tokenAutenticacao: string,
    produto: {
      nome: string;
      preco: number;
      descricao: string;
      quantidade: number;
    },
  ): Promise<APIResponse> {
    return this.requisicao.post('/produtos', {
      data: produto,
      headers: { Authorization: tokenAutenticacao },
    });
  }

  async excluirProdutoPorId(
    tokenAutenticacao: string,
    idProduto: string,
  ): Promise<APIResponse> {
    return this.requisicao.delete(`/produtos/${idProduto}`, {
      headers: { Authorization: tokenAutenticacao },
    });
  }
}
