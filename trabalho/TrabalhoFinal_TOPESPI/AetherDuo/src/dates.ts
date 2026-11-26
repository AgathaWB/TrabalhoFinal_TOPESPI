import { useEffect, useState } from 'react';

/*Data local no formato YYYY-MM-DD */
export function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/*Atualiza sozinho quando vira o dia */
export function useToday(): string {
  const [today, setToday] = useState(todayKey());
  useEffect(() => {
    const id = setInterval(() => setToday(todayKey()), 30_000);
    return () => clearInterval(id);
  }, []);
  return today;
}

export function prettyToday(): string {
  const text = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
