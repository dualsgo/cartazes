'use client';

import type { PosterData, PosterSettings } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { OfertasHeader } from './ofertas-header';
import { parsePrice, formatCurrency, calculateInstallments, truncateMultiLine } from '@/app/lib/poster-utils';

/** Tamanho dinâmico da fonte da descrição baseado no número de linhas */
function descFontSize(linesCount: number): string {
  if (linesCount === 1) return '1.85em';
  return '1.55em';
}

export function PosterPreview({
  description,
  priceFrom,
  priceFor,
  code,
  ean,
  reference,
  paymentOption,
  offerValidityStart,
  offerValidity,
  isImperdiveis,
  settings,
}: PosterData & { isImperdiveis?: boolean; settings: PosterSettings }) {
  const valDe  = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const displayDescriptionLines = truncateMultiLine(description, 13, 2);

  const hasDiscount = valDe > 0 && valPor > 0 && valDe > valPor;
  const discount    = hasDiscount ? Math.round(((valDe - valPor) / valDe) * 100) : 0;

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const { maxInstallments, installmentValue } = calculateInstallments(valPor, settings);
  const installmentText  = paymentOption === 'installment' && maxInstallments > 1 ? (
    <div className="font-headline text-center font-bold text-[1.2em] leading-tight mt-1">
      ou em até {maxInstallments}x de R$ {formatCurrency(installmentValue)}
    </div>
  ) : null;

  let priceFontSize = '4rem';
  if (porInteger.length >= 6) priceFontSize = '2.6rem';
  else if (porInteger.length === 5) priceFontSize = '3.2rem';

  return (
    <div className="w-full h-full overflow-hidden bg-white text-black font-body relative">
      {/* Layout: duas colunas, cada uma com grid de 3 linhas fixas */}
      <div className="flex h-full w-full">

        {/* ── Coluna Esquerda ── */}
        <div className="w-1/2 p-[0.35cm] flex flex-col overflow-hidden">

          {/* ZONA 1: Header (tamanho fixo) */}
          <div className="shrink-0">
            <OfertasHeader
              textSize={70}
              title={isImperdiveis ? 'OFERTAS IMPERDÍVEIS' : 'OFERTAS'}
            />
          </div>

          {/* ZONA 2: Descrição (ocupa o espaço disponível, fonte dinâmica) */}
          <div className="flex-[1.5] flex items-center justify-center min-h-0 py-1">
            <h2 className="font-headline font-black uppercase leading-[1.05] tracking-tight text-center text-black line-clamp-3 text-[1.3em]">
              {description}
            </h2>
          </div>

          {/* ZONA 3: Preço DE (centralizado no espaço restante) */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <div className={`transition-opacity text-center text-[2.2em] font-headline text-black ${hasDiscount ? 'opacity-100' : 'opacity-0'}`}>
              <span className="block text-[0.7em] mb-[-0.2em]">DE:</span>
              <span className="font-bold line-through decoration-[0.8mm]">R$ {formatCurrency(valDe)}</span>
            </div>
          </div>

          {/* ZONA 4: Rodapé códigos (tamanho fixo na base) */}
          <div className="shrink-0 pt-2">
            <div className="text-[0.72em] flex flex-wrap gap-x-2 gap-y-0 text-black font-semibold justify-center">
              {reference && <span>Ref.: <b className="font-bold">{reference}</b></span>}
              {code      && <span>SAP: <b className="font-bold">{code}</b></span>}
              {ean       && <span>EAN: <b className="font-bold">{ean}</b></span>}
            </div>
          </div>
        </div>

        {/* ── Coluna Direita ── */}
        <div className="w-1/2 flex flex-col overflow-hidden pt-0 pr-0 pb-[0.35cm] pl-[0.35cm]">

          {/* ZONA 1: Caixa preta de desconto (tamanho fixo) */}
          <div className="shrink-0 bg-black text-white text-center font-headline font-black flex flex-col items-center justify-center print:color-adjust-exact px-3 py-1 w-full h-[5.5em]">
            <div className="flex flex-col justify-center items-center h-full">
              <span className="text-[1.5em] leading-none uppercase">DESCONTO DE</span>
              <span className="text-[3.5em] leading-none">{discount}%</span>
            </div>
          </div>

          {/* ZONA 2: Preço POR (ocupa espaço disponível) */}
          <div className="flex-1 flex flex-col items-center justify-center text-[1.3em] leading-none text-black w-full min-w-0 px-1 min-h-0 overflow-hidden">
            <span className="font-headline text-[0.8em] font-black w-full text-center shrink-0 mb-[-0.2em] z-10">POR:</span>
            <div className="flex items-end max-w-full overflow-hidden shrink-0">
              <div className="flex items-baseline shrink-0 tracking-tighter">
                <span className="font-headline text-[1.25em] mr-1">R$</span>
                <span className="font-headline font-black leading-none" style={{ fontSize: priceFontSize }}>
                  {porInteger},{porDecimal}
                </span>
              </div>
            </div>
            {valPor > 0 && (
              <div className="font-bold flex items-baseline space-x-1">
                <span className="text-[0.9em]">un. à vista</span>
              </div>
            )}
            {installmentText}
          </div>

          {/* ZONA 3: Validade (tamanho fixo) */}
          <div className="shrink-0 text-[0.52em] w-full leading-tight text-black font-semibold pb-1 flex flex-col items-center text-center">
            {(offerValidityStart || offerValidity) && (
              <>
                <span>
                  Oferta válida{' '}
                  {offerValidityStart && <span>de <b className="font-black">{offerValidityStart}</b>{' '}</span>}
                  {offerValidity      && <span>até <b className="font-black">{offerValidity}</b></span>}
                </span>
                <span>ou enquanto durarem os estoques.</span>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
