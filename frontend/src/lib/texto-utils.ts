/** Iniciais para avatar: "Camila Cristina" → "CC", "Enzo" → "EN". */
export function iniciais(nome: string | null | undefined): string {
  const partes = (nome || 'Nexus').trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0].slice(0, 2).toUpperCase();
}

const PERFIS: Record<string, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  responsavel: 'Responsável',
};

export function rotuloPerfil(perfil: string | null | undefined): string {
  return perfil ? (PERFIS[perfil] ?? perfil) : '';
}
