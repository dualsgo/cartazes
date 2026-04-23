import * as XLSX from 'xlsx';
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

export function parsePrice(price: any): number {
  if (price === undefined || price === null || price === '') return 0;
  if (typeof price === 'number') return price;
  
  const str = String(price).trim();
  if (!str) return 0;
  
  // Converte "1.234,56" ou "34,56" ou "R$ 34,56" para number
  const clean = str.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
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
  
  
  return lines;
}

/**
 * Lógica comum de processamento de uma linha de dados (seja vinda de CSV ou Excel)
 */
function processProductRow(row: Record<string, any>, mapping: Record<string, number | string>): any {
  const getVal = (key: string) => {
    const colKey = mapping[key];
    if (colKey === undefined || colKey === -1) return '';
    return row[colKey] !== undefined ? String(row[colKey]).trim() : '';
  };

  const mercadoria = getVal('mercadoria');
  if (!mercadoria) return null;

  const sap        = getVal('sap');
  const ean        = getVal('ean');
  const ref        = getVal('ref');
  const supplier   = getVal('supplier');
  
  const txtAtual = getVal('precoAtual');
  const txtNovo  = getVal('novoPreco');
  const txtPromo = getVal('promocao');

  const valAtual = parsePrice(txtAtual);
  const valNovo  = parsePrice(txtNovo);
  const valPromo = parsePrice(txtPromo);

  let poster: any = {
    description: mercadoria.toUpperCase(),
    code: sap,
    ean: ean,
    reference: ref,
    supplier: supplier,
    quantity: 1,
    paymentOption: 'installment',
  };

  // Lógica de Preço:
  if (valPromo > 0) {
    poster.posterSubType = 'offer';
    poster.priceFrom = (valNovo > 0 && valNovo > valPromo) ? formatCurrency(valNovo) : formatCurrency(valAtual);
    poster.priceFor = formatCurrency(valPromo);
  } else if (valNovo > 0) {
    if (valNovo < valAtual) {
      poster.posterSubType = 'offer';
      poster.priceFrom = formatCurrency(valAtual);
      poster.priceFor = formatCurrency(valNovo);
    } else {
      poster.posterSubType = 'normal';
      poster.priceFor = formatCurrency(valNovo);
      poster.priceFrom = '';
    }
  } else {
    poster.posterSubType = 'normal';
    poster.priceFor = formatCurrency(valAtual);
    poster.priceFrom = '';
  }

  return poster;
}

/**
 * Cria um mapeamento de colunas baseado nos headers encontrados
 */
function createMapping(headers: string[]): Record<string, number> {
  const findIdx = (terms: string[]) => headers.findIndex(h => terms.some(t => h.toLowerCase().includes(t)));
  
  return {
    sap:        findIdx(['sap', 'interno', 'código', 'codigo']),
    mercadoria: findIdx(['mercadoria', 'descrição', 'descricao', 'produto', 'nome']),
    supplier:   findIdx(['fornecedor', 'forn']),
    ref:        findIdx(['referencia', 'referência', 'ref', 'cod. fornecedor']),
    precoAtual: findIdx(['atual']),
    novoPreco:  findIdx(['novo']),
    promocao:   findIdx(['promoção', 'promocao', 'promo']),
    ean:        findIdx(['ean', 'barras']),
  };
}

/**
 * Analisa um arquivo CSV
 */
export function parseProductCSV(content: string): any[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : ',';
  const headers = firstLine.split(separator).map(h => h.trim());
  const mapping = createMapping(headers);
  
  const results: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(separator).map(c => c.trim());
    if (cols.length < 2) continue;
    
    // Converte array de colunas em objeto usando os headers como chaves
    const rowObj: Record<number, string> = {};
    cols.forEach((val, idx) => { rowObj[idx] = val; });
    
    const poster = processProductRow(rowObj, mapping);
    if (poster) results.push(poster);
  }
  return results;
}

/**
 * Analisa um arquivo Excel (XLS/XLSX)
 */
export function parseProductExcel(buffer: ArrayBuffer): any[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Converte para JSON (array de arrays para facilitar a detecção de headers)
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  if (data.length < 2) return [];

  // Assume que a primeira linha com conteúdo útil são os headers
  const headers = data[0].map(h => String(h || '').trim());
  const mapping = createMapping(headers);
  
  const results: any[] = [];
  for (let i = 1; i < data.length; i++) {
    const cols = data[i];
    if (!cols || cols.length < 1) continue;

    const rowObj: Record<number, any> = {};
    cols.forEach((val, idx) => { rowObj[idx] = val; });

    const poster = processProductRow(rowObj, mapping);
    if (poster) results.push(poster);
  }

  return results;
}


