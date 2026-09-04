/**
 * Helpers para estruturar cenarios no padrao DADO / QUANDO / ENTAO.
 * Usa test.step do Playwright (aparece no HTML/Allure).
 */
import { test as testeBase } from '@playwright/test';

type Acao = () => Promise<void>;

export async function dado(descricao: string, acao: Acao): Promise<void> {
  await testeBase.step(`DADO ${descricao}`, acao);
}

export async function quando(descricao: string, acao: Acao): Promise<void> {
  await testeBase.step(`QUANDO ${descricao}`, acao);
}

export async function entao(descricao: string, acao: Acao): Promise<void> {
  await testeBase.step(`ENTÃO ${descricao}`, acao);
}
