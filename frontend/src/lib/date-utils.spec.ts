import {calculateDiasAtraso, formatDateShort, isDayEnded, parseDate} from './date-utils';

describe('date-utils', () => {
  it('lê data sem horário (AAAA-MM-DD) como meia-noite local, não UTC', () => {
    const d = parseDate('2026-10-16');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 9, 16, 0]);
    expect(formatDateShort('2026-10-16')).toBe('16/10/2026');
  });

  it('mantém datas ISO completas como estão', () => {
    const iso = new Date(2026, 9, 15, 10, 30).toISOString();
    expect(parseDate(iso).getTime()).toBe(new Date(2026, 9, 15, 10, 30).getTime());
  });

  describe('dias de atraso', () => {
    it('é zero até o fim do dia previsto (23:59:59)', () => {
      expect(calculateDiasAtraso('2026-10-16', new Date(2026, 9, 16, 0, 0))).toBe(0);
      expect(calculateDiasAtraso('2026-10-16', new Date(2026, 9, 16, 23, 59, 59))).toBe(0);
    });

    it('conta 1 dia logo depois da meia-noite e soma um por dia inteiro', () => {
      expect(calculateDiasAtraso('2026-10-16', new Date(2026, 9, 17, 0, 0, 1))).toBe(1);
      expect(calculateDiasAtraso('2026-10-16', new Date(2026, 9, 17, 23, 0))).toBe(1);
      expect(calculateDiasAtraso('2026-10-16', new Date(2026, 9, 18, 0, 30))).toBe(2);
      expect(calculateDiasAtraso('2026-10-16', new Date(2026, 9, 20, 12, 0))).toBe(4);
    });
  });

  it('considera o dia encerrado só depois das 23:59:59.999', () => {
    const aprovadoEm = new Date(2026, 9, 15, 9, 0);
    expect(isDayEnded(aprovadoEm, new Date(2026, 9, 15, 23, 59, 59))).toBe(false);
    expect(isDayEnded(aprovadoEm, new Date(2026, 9, 16, 0, 0))).toBe(true);
  });
});
