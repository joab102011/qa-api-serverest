import { expect } from '@playwright/test';
import type {
  RespostaCadastro,
  RespostaListaUsuarios,
  RespostaLogin,
  UsuarioListado,
} from '../ajudas/tipos';

export function validarRespostaCadastro(corpo: RespostaCadastro): void {
  expect(corpo, 'corpo de cadastro deve existir').toBeTruthy();
  expect(corpo.message).toBe('Cadastro realizado com sucesso');
  expect(corpo._id, 'cadastro deve retornar _id').toBeTruthy();
  expect(typeof corpo._id).toBe('string');
}

export function validarRespostaLogin(corpo: RespostaLogin): void {
  expect(corpo.message).toBe('Login realizado com sucesso');
  expect(corpo.authorization, 'login deve retornar token JWT').toBeTruthy();
  expect(corpo.authorization.startsWith('Bearer ')).toBeTruthy();
}

export function validarUsuarioListado(
  usuario: UsuarioListado,
  esperado: Partial<UsuarioListado>,
): void {
  if (esperado._id) expect(usuario._id).toBe(esperado._id);
  if (esperado.nome) expect(usuario.nome).toBe(esperado.nome);
  if (esperado.email) expect(usuario.email).toBe(esperado.email);
  if (esperado.administrador) {
    expect(usuario.administrador).toBe(esperado.administrador);
  }
}

export function validarListaUsuarios(corpo: RespostaListaUsuarios): void {
  expect(typeof corpo.quantidade).toBe('number');
  expect(Array.isArray(corpo.usuarios)).toBeTruthy();
  expect(corpo.usuarios.length).toBe(corpo.quantidade);
}
