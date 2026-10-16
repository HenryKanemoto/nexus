// Gera src/app/icones.ts com o SVG de cada ícone do Material (variante "round") usado no app.
// Assim os ícones vêm dentro do próprio JavaScript, sem fonte de ícones nem CDN.
//
// Rode depois de usar um ícone novo:  npm run icones
// Considera ícone qualquer texto entre aspas no código (.ts/.html) que seja nome de um ícone
// existente em @material-design-icons/svg, como svgIcon="check" ou icone: 'inbox'.
import {readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const pastaSvg = join(raiz, 'node_modules/@material-design-icons/svg/round');
const saida = join(raiz, 'src/app/icones.ts');

const disponiveis = new Set(readdirSync(pastaSvg).map((f) => f.replace(/\.svg$/, '')));

function arquivos(pasta) {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return arquivos(caminho);
    return /\.(ts|html)$/.test(nome) && !nome.endsWith('.spec.ts') && caminho !== saida ? [caminho] : [];
  });
}

const usados = new Set();
for (const arquivo of arquivos(join(raiz, 'src'))) {
  for (const [, nome] of readFileSync(arquivo, 'utf8').matchAll(/['"]([a-z][a-z0-9_]*)['"]/g)) {
    if (disponiveis.has(nome)) usados.add(nome);
  }
}

const linhas = [...usados].sort().map((nome) => {
  const svg = readFileSync(join(pastaSvg, `${nome}.svg`), 'utf8')
    .trim()
    .replace(/ width="24" height="24"/, '');
  return `  ${/^[a-z_][a-z0-9_]*$/.test(nome) ? nome : `'${nome}'`}: '${svg}',`;
});

writeFileSync(
  saida,
  `// Arquivo gerado por scripts/gerar-icones.mjs (npm run icones). Não edite à mão.
// Ícones: Material Design Icons, variante round (Apache-2.0), via @material-design-icons/svg.

export const ICONES: Record<string, string> = {
${linhas.join('\n')}
};
`,
);
console.log(`${usados.size} ícones em ${relative(raiz, saida)}`);
