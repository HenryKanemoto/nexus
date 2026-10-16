/**
 * Configuração padrão: tudo roda no navegador, sem back-end e sem Docker.
 * Para usar a API (NestJS + MySQL), rode com a configuração "api"
 * (npm run dev:api), que troca este arquivo por environment.api.ts.
 */
export const environment = {
  fonteDeDados: 'local' as 'local' | 'api',
};
