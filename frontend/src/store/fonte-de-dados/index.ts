import {InjectionToken, inject} from '@angular/core';
import {environment} from '../../environments/environment';
import {FonteApi} from './fonte-api';
import {FonteDeDados} from './fonte-de-dados';
import {FonteLocal} from './fonte-local';

export type {DonoDoEstado, FonteDeDados, ModoDados, StatusConexao} from './fonte-de-dados';
export {FonteApi} from './fonte-api';
export {FonteLocal} from './fonte-local';

/**
 * Fonte de dados em uso, escolhida por environment.fonteDeDados ('local' por padrão).
 * Para trocar sem mexer no environment (em testes, por exemplo):
 * {provide: FONTE_DE_DADOS, useExisting: FonteLocal}.
 */
export const FONTE_DE_DADOS = new InjectionToken<FonteDeDados>('FonteDeDados', {
  providedIn: 'root',
  factory: () => (environment.fonteDeDados === 'api' ? inject(FonteApi) : inject(FonteLocal)),
});
