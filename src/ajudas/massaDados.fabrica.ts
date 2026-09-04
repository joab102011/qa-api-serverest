import { randomUUID } from 'crypto';
import type { CorpoUsuario } from './tipos';

/**
 * Gera massa de dados única para evitar colisão na API pública compartilhada.
 */
export function criarMassaUsuario(
  sobrescrever: Partial<CorpoUsuario> = {},
): CorpoUsuario {
  const sufixo = `${Date.now()}_${randomUUID().slice(0, 8)}`;

  return {
    nome: sobrescrever.nome ?? `Usuario QA ${sufixo}`,
    email: sobrescrever.email ?? `usuario_${sufixo}@qa.com.br`,
    password: sobrescrever.password ?? 'Senha@123',
    administrador: sobrescrever.administrador ?? 'true',
  };
}

export function criarMassaUsuarioComum(): CorpoUsuario {
  return criarMassaUsuario({ administrador: 'false' });
}
