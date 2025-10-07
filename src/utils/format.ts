export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDateBR(dateISO: string): string {
  const d = new Date(dateISO);
  return d.toLocaleDateString('pt-BR');
}










