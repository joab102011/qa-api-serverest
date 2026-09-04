/**
 * Tipos alinhados ao contrato da ServeRest para usuários.
 */
export type CorpoUsuario = {
  nome: string;
  email: string;
  password: string;
  administrador: 'true' | 'false';
};

export type RespostaCadastro = {
  message: string;
  _id: string;
};

export type RespostaLogin = {
  message: string;
  authorization: string;
};

export type UsuarioListado = CorpoUsuario & {
  _id: string;
};

export type RespostaListaUsuarios = {
  quantidade: number;
  usuarios: UsuarioListado[];
};

export type RespostaMensagem = {
  message: string;
};
