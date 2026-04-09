import type { PosterSettings } from './types';

export function calculateInstallments(price: number, settings: PosterSettings) {
  if (price <= 0) return { maxInstallments: 0, installmentValue: 0 };
  
  // O usuário quer "parcela mínima de X". 
  // O sistema atual usa 29.99 (R$ 30,00 na prática).
  const minAmount = settings.minInstallmentAmount;
  
  // Quantas parcelas cabem se cada uma for pelo menos minAmount?
  // Ex: 100 / 30 = 3.33 -> 3 parcelas.
  const possibleInstallments = Math.floor(price / (minAmount - 0.01));
  
  // Mas não podemos passar do limite configurado (ex: 6x ou 10x)
  const maxInstallments = Math.min(possibleInstallments, settings.maxInstallments);
  
  if (maxInstallments <= 1) return { maxInstallments: 0, installmentValue: 0 };
  
  const rawInstallment = price / maxInstallments;
  const installmentValue = Math.ceil(rawInstallment * 100) / 100;
  
  return { maxInstallments, installmentValue };
}

export function parsePrice(price: string): number {
  if (!price) return 0;
  // Converte "1.234,56" ou "34,56" para number
  return parseFloat(price.replace(/\./g, '').replace(',', '.')) || 0;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-br', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Limita o texto em N caracteres sem cortar palavras ao meio.
 */
export function truncateDescription(text: string, limit: number): string {
  if (!text || text.length <= limit) return text;
  
  const words = text.split(' ');
  let result = '';
  
  for (const word of words) {
    const space = result ? ' ' : '';
    if ((result + space + word).length <= limit) {
      result += space + word;
    } else {
      break;
    }
  }
  
  return result || text.slice(0, limit);
}

/**
 * Divide o texto em múltiplas linhas com limite de caracteres por linha,
 * sem cortar palavras e respeitando o número máximo de linhas.
 */
export function truncateMultiLine(text: string, charsPerLine: number, maxLines: number): string[] {
  if (!text) return [];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const space = currentLine ? ' ' : '';
    if ((currentLine + space + word).length <= charsPerLine) {
      currentLine += space + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      
      if (currentLine.length > charsPerLine) {
        currentLine = currentLine.slice(0, charsPerLine);
      }
      
      if (lines.length >= maxLines) {
        currentLine = '';
        break;
      }
    }
  }
  
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  
  return lines;
}
