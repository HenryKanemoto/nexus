const ICONES: Record<string, string> = {
  'cat-projetores': 'videocam',
  'cat-notebooks': 'laptop_chromebook',
  'cat-eletronica': 'developer_board',
  'cat-ferramentas': 'handyman',
  'cat-laboratorio': 'biotech',
};

/** Ícone do Material para uma categoria (categorias novas usam um ícone genérico). */
export function iconeCategoria(categoriaId: string | null | undefined): string {
  return (categoriaId && ICONES[categoriaId]) || 'inventory_2';
}

/** "1 dia" / "3 dias" */
export function plural(n: number | null | undefined, singular: string, pluralForma = singular + 's'): string {
  const valor = n ?? 0;
  return `${valor} ${valor === 1 ? singular : pluralForma}`;
}
