/**
 * Utility functions for date manipulation and Portuguese formatting
 * in the simulated virtual clock environment of Nexus.
 */

export function parseDate(isoOrDate: string | Date): Date {
  return typeof isoOrDate === 'string' ? new Date(isoOrDate) : new Date(isoOrDate.getTime());
}

export function formatDateTime(isoOrDate: string | Date): string {
  const d = parseDate(isoOrDate);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}

export function formatDateShort(isoOrDate: string | Date): string {
  const d = parseDate(isoOrDate);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatTimeShort(isoOrDate: string | Date): string {
  const d = parseDate(isoOrDate);
  if (isNaN(d.getTime())) return '-';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function toDateInputValue(isoOrDate: string | Date): string {
  const d = parseDate(isoOrDate);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date.getTime());
  result.setHours(result.getHours() + hours);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isDayEnded(targetDate: Date, clockNow: Date): boolean {
  // If targetDate is strictly before clockNow's date in calendar days
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
  return clockNow.getTime() > targetMidnight.getTime();
}

/**
 * Calculates overdue days.
 * An item is overdue if clockNow has passed the end of devolucaoPrevista day (23:59:59).
 * Dias de atraso = dias inteiros depois do prazo (mínimo 1).
 */
export function calculateDiasAtraso(devolucaoPrevista: string | Date, clockNow: Date): number {
  const prevDate = parseDate(devolucaoPrevista);
  const endOfPrevDay = new Date(
    prevDate.getFullYear(),
    prevDate.getMonth(),
    prevDate.getDate(),
    23,
    59,
    59,
    999
  );

  if (clockNow.getTime() <= endOfPrevDay.getTime()) {
    return 0;
  }

  const diffMs = clockNow.getTime() - endOfPrevDay.getTime();
  const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, daysDiff);
}

export function differenceInHours(dateLeft: Date, dateRight: Date): number {
  const diffMs = dateLeft.getTime() - dateRight.getTime();
  return diffMs / (1000 * 60 * 60);
}

export function formatRelativeTime(isoOrDate: string | Date, clockNow: string | Date): string {
  const d = parseDate(isoOrDate);
  const now = parseDate(clockNow);
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) {
    return 'em breve';
  }
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) {
    return 'agora mesmo';
  }
  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
}

