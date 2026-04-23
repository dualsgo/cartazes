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
  
  
  return lines;
}

/**
 * Analisa um arquivo CSV de relatório diário e retorna uma lista de cartazes.
 * Lógica de Preço:
 * 1. Promoção > 0 -> É OFERTA (vale promoção)
 * 2. Promoção == 0 e Novo Preço existe -> Se Novo < Atual, é OFERTA. Senão, é NORMAL (vale Novo).
 * 3. Apenas Preço Atual -> NORMAL (vale Atual).
 */
export function parseProductCSV(content: string): any[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Detecta separador (prioriza ponto e vírgula comum no Brasil)
  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
  
  // Mapeamento flexível de colunas
  const findIdx = (terms: string[]) => headers.findIndex(h => terms.some(t => h.includes(t)));
  
  const idxSap        = findIdx(['sap', 'interno', 'código', 'codigo']);
  const idxMercadoria = findIdx(['mercadoria', 'descrição', 'descricao', 'produto', 'nome']);
  const idxFornecedor = findIdx(['fornecedor', 'forn']);
  const idxRef        = findIdx(['referencia', 'referência', 'ref', 'cod. fornecedor']);
  const idxPrecoAtual = findIdx(['atual']);
  const idxNovoPreco  = findIdx(['novo']);
  const idxPromocao   = findIdx(['promoção', 'promocao', 'promo']);
  const idxEan        = findIdx(['ean', 'barras']);

  const results: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(separator).map(c => c.trim());
    if (cols.length < 2) continue;

    const mercadoria = cols[idxMercadoria] || '';
    const sap        = cols[idxSap] || '';
    const ean        = idxEan !== -1 ? cols[idxEan] : '';
    const ref        = cols[idxRef] || '';
    const supplier   = cols[idxFornecedor] || '';
    
    const txtAtual = (cols[idxPrecoAtual] || '0').replace('R$', '').trim();
    const txtNovo  = (cols[idxNovoPreco] || '0').replace('R$', '').trim();
    const txtPromo = (cols[idxPromocao] || '0').replace('R$', '').trim();

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

    if (valPromo > 0) {
      // Prioridade 1: Promoção
      poster.posterSubType = 'offer';
      // Se Novo Preço for o "De" e Promo o "Por"
      poster.priceFrom = txtNovo !== '0' && valNovo > valPromo ? txtNovo : txtAtual;
      poster.priceFor = txtPromo;
    } else if (valNovo > 0) {
      // Prioridade 2: Novo Preço
      if (valNovo < valAtual) {
        // Se baixou o preço, tratamos como oferta
        poster.posterSubType = 'offer';
        poster.priceFrom = txtAtual;
        poster.priceFor = txtNovo;
      } else {
        // Se aumentou ou manteve, é normal
        poster.posterSubType = 'normal';
        poster.priceFor = txtNovo;
        poster.priceFrom = '';
      }
    } else {
      // Fallback: Preço Atual
      poster.posterSubType = 'normal';
      poster.priceFor = txtAtual;
      poster.priceFrom = '';
    }

    results.push(poster);
  }

  return results;
}

