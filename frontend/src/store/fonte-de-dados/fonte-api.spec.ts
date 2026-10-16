import {item} from '../regras/estado-de-teste';
import {completarFotos} from './fonte-api';

describe('modo api: fotos do banco', () => {
  it('o item do seed sem foto fica com a foto que está no banco', () => {
    const locais = [item('a', 'cat', {status: 'emprestado'}), item('b', 'cat')];
    const doBanco = [item('a', 'cat', {foto: 'https://exemplo.test/a.jpg'}), item('b', 'cat')];

    const resultado = completarFotos(locais, doBanco);
    // A situação vem do navegador (seed); só a foto vem do banco
    expect(resultado[0]).toEqual({...locais[0], foto: 'https://exemplo.test/a.jpg'});
    expect(resultado[1]).toBe(locais[1]);
  });

  it('não troca a foto que o item já tem no navegador', () => {
    const locais = [item('a', 'cat', {foto: 'data:image/jpeg;base64,local'})];
    const doBanco = [item('a', 'cat', {foto: 'https://exemplo.test/a.jpg'})];
    expect(completarFotos(locais, doBanco)[0].foto).toBe('data:image/jpeg;base64,local');
  });

  it('item que não existe no banco segue igual', () => {
    const locais = [item('novo', 'cat')];
    expect(completarFotos(locais, [])).toEqual(locais);
  });
});
