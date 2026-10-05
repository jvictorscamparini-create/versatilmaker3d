/** Aceita datas dos cadastros antigos e dos formulários atuais. */
export function parseRecordDate(value: string, now = new Date()): Date | null {
  if (/^(Hoje|Ontem)/i.test(value)) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (/^Ontem/i.test(value)) date.setDate(date.getDate() - 1);
    return date;
  }
  const br = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const parts = br ? [+br[3], +br[2], +br[1]] : iso ? [+iso[1], +iso[2], +iso[3]] : null;
  if (!parts) return null;
  const [year, month, day] = parts;
  const date = new Date(year,month-1,day);
  return date.getFullYear() === year && date.getMonth() === month-1 && date.getDate() === day ? date : null;
}

export function sameDay(value: string, date: Date): boolean {
  const parsed = parseRecordDate(value);
  return parsed?.getTime() === new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
}

export function inMonth(value: string, month: number, year: number): boolean {
  const parsed = parseRecordDate(value);
  return parsed !== null && parsed.getMonth() === month && parsed.getFullYear() === year;
}

export const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
