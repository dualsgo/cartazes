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
function processProductRow(row: Record<string, any>, mapping: Record<string, number>, currentSupplier: string): any {
  const getVal = (key: string) => {
    const colKey = mapping[key];
    if (colKey === undefined || colKey === -1) return '';
    return row[colKey] !== undefined ? String(row[colKey]).trim() : '';
  };

  const mercadoria = getVal('mercadoria');
  if (!mercadoria || mercadoria.toLowerCase().includes('mercadoria') || mercadoria.toLowerCase().includes('descrição')) return null;

  const sap        = getVal('sap');
  const ean        = getVal('ean');
  const ref        = getVal('ref');
  const supplier   = currentSupplier || getVal('supplier');
  
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
    supplier: supplier.replace('FORNECEDOR:', '').trim().toUpperCase(),
    quantity: 1,
    paymentOption: 'installment',
  };

  /**
   * Lógica do Usuário:
   * 1. SE TIVERMOS E, F E G VALE G (Promoção)
   * 2. SE TIVERMOS E e F, VALE F (Novo)
   * 3. SENÃO VALE E (Atual)
   */
  if (valPromo > 0) {
    // É Promoção (G)
    poster.posterSubType = 'offer';
    poster.priceFor = formatCurrency(valPromo);
    // O "De" será o Novo (F) se existir e for maior, senão o Atual (E)
    poster.priceFrom = (valNovo > valPromo) ? formatCurrency(valNovo) : formatCurrency(valAtual);
  } else if (valNovo > 0) {
    // É Novo Preço (F)
    if (valNovo < valAtual && valAtual > 0) {
      // Se baixou, é oferta
      poster.posterSubType = 'offer';
      poster.priceFor = formatCurrency(valNovo);
      poster.priceFrom = formatCurrency(valAtual);
    } else {
      // Se manteve ou subiu, é normal
      poster.posterSubType = 'normal';
      poster.priceFor = formatCurrency(valNovo);
      poster.priceFrom = '';
    }
  } else {
    // É Preço Atual (E)
    poster.posterSubType = 'normal';
    poster.priceFor = formatCurrency(valAtual);
    poster.priceFrom = '';
  }

  return poster;
}

/**
 * Cria um mapeamento de colunas baseado nos headers encontrados ou índices fixos
 */
function createMapping(headers: string[]): Record<string, number> {
  const findIdx = (terms: string[], defaultIdx: number) => {
    const idx = headers.findIndex(h => terms.some(t => h.toLowerCase().includes(t)));
    return idx !== -1 ? idx : defaultIdx;
  };
  
  // Mapeamento baseado na descrição do usuário:
  // A=0 (SAP), B=1 (Mercadoria), C=2 (Referência), E=4 (Atual), F=5 (Novo), G=6 (Promo)
  return {
    sap:        findIdx(['sap', 'interno', 'código', 'codigo'], 0),
    mercadoria: findIdx(['mercadoria', 'descrição', 'descricao', 'produto', 'nome'], 1),
    ref:        findIdx(['referencia', 'referência', 'ref', 'fornecedor'], 2),
    precoAtual: findIdx(['atual'], 4),
    novoPreco:  findIdx(['novo'], 5),
    promocao:   findIdx(['promoção', 'promocao', 'promo'], 6),
    ean:        findIdx(['ean', 'barras'], -1),
    supplier:   findIdx(['fornecedor', 'forn'], -1),
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
    
    const rowObj: Record<number, string> = {};
    cols.forEach((val, idx) => { rowObj[idx] = val; });
    
    const poster = processProductRow(rowObj, mapping, '');
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
  
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  if (data.length < 1) return [];

  let currentSupplier = '';
  let mapping = createMapping([]); // Default mapping
  const results: any[] = [];

  for (let i = 0; i < data.length; i++) {
    const cols = data[i];
    if (!cols || cols.length === 0) continue;

    const firstCol = String(cols[0] || '').trim();

    // 1. Detectar linha de Fornecedor (Mesclada A-G)
    // Geralmente contém a palavra "FORNECEDOR" e as outras colunas estão vazias na linha
    if (firstCol.toUpperCase().includes('FORNECEDOR') && (!cols[1] && !cols[2])) {
      currentSupplier = firstCol;
      continue;
    }

    // 2. Detectar se é uma linha de header (para atualizar o mapping se necessário)
    if (firstCol.toLowerCase().includes('sap') || firstCol.toLowerCase().includes('código') || firstCol.toLowerCase().includes('interno')) {
      const headers = cols.map(h => String(h || '').trim());
      mapping = createMapping(headers);
      continue;
    }

    // 3. Processar como produto
    // Se a primeira coluna for um número ou tiver cara de código
    if (firstCol && firstCol.length >= 3) {
      const rowObj: Record<number, any> = {};
      cols.forEach((val, idx) => { rowObj[idx] = val; });

      const poster = processProductRow(rowObj, mapping, currentSupplier);
      if (poster) results.push(poster);
    }
  }

  return results;
}



