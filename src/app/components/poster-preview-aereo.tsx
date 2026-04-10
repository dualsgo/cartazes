import React from 'react';
import { cn } from '@/lib/utils';
import { parsePrice, formatCurrency, calculateInstallments, truncateDescription } from '@/app/lib/poster-utils';
import type { PosterData } from '@/app/lib/types';

export function PosterPreviewAereo({
  description,
  priceFrom,
  priceFor,
  code,
  ean,
  reference,
  supplier,
  paymentOption,
  posterSubType,
}: PosterData) {
  const valDe  = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const isOffer = posterSubType === 'offer';
  const hasDiscount = valDe > 0 && valPor > 0 && valDe > valPor;

  const [porInt, porDec] = formatCurrency(valPor).split(',');

  const { maxInstallments, installmentValue } = calculateInstallments(valPor, { maxInstallments: 6, minInstallmentAmount: 30 });
  const showInstallment  = paymentOption === 'installment' && maxInstallments > 1;

  // Aplica o limite de caracteres na descrição
  const displayDescription = truncateDescription(description, 35);

  // Lógica de fonte dinâmica para o Aéreo
  let priceFontSize = '82px';
  let deFontSize = '24px';

  if (porInt.length >= 6) {
    priceFontSize = '56px';
    deFontSize = '20px';
  } else if (porInt.length === 5) {
    priceFontSize = '64px';
    deFontSize = '22px';
  } else if (porInt.length === 4) {
    priceFontSize = '74px';
  }

  return (
    <div className="w-full h-full bg-white text-black font-body overflow-hidden relative flex flex-col justify-between box-border px-[6mm] py-[2.5mm]">
      
      {/* Faixa vertical de OFERTA integrada à direita */}
      {isOffer && (
        <div className="absolute right-[4mm] top-[4mm] bottom-[4mm] w-[12mm] bg-black text-white flex flex-col items-center justify-center rounded-md z-10">
          <span className="font-headline font-black text-[22pt] leading-none uppercase tracking-[4px]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            OFERTA
          </span>
        </div>
      )}

      {/* 1. TOPO: DESCRIÇÃO */}
      <div className={cn("w-full h-[18mm] flex items-center justify-center shrink-0", isOffer && "pr-[14mm]")}>
        <h2 className="font-headline font-black text-[24pt] leading-[1] uppercase text-center overflow-hidden max-h-[2.2em]">
          {displayDescription}
        </h2>
      </div>

      {/* 2. MEIO: ÁREA DE PREÇOS */}
      <div className={cn("flex-1 flex flex-col items-center justify-center relative min-h-0", isOffer && "pr-[14mm]")}>
        
        {/* Preço DE flutuando à esquerda */}
        {isOffer && hasDiscount && (
          <div className="absolute left-0 top-1 transition-opacity flex flex-col">
            <span className="font-black text-[9pt] uppercase leading-none opacity-80">DE:</span>
            <span className="font-bold leading-none line-through" style={{ fontSize: deFontSize }}>
              R$ {formatCurrency(valDe)}
            </span>
          </div>
        )}

        {/* Preço POR e Parcelamento Empilhados */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            <span className="font-headline font-black text-[18pt] leading-none mb-[-4mm]">POR:</span>
            <div className="flex items-end">
              <span className="font-headline font-black text-[18pt] mr-1 pb-1">R$</span>
              <span className="font-headline font-black leading-[0.75] tracking-tighter" style={{ fontSize: priceFontSize }}>{porInt}</span>
              <div className="flex flex-col items-start ml-1 pb-1">
                <span className="font-headline font-black text-[30pt] leading-none">,{porDec}</span>
                <span className="font-bold text-[10pt] uppercase leading-none mt-1">un. à vista</span>
              </div>
            </div>
          </div>

          {/* Parcelamento estilo CAPSULA (Pill) */}
          {showInstallment && (
             <div className="mt-2 border-[0.5mm] border-black rounded-full px-5 py-1 flex items-center gap-2">
                <span className="font-headline font-bold text-[13pt] leading-none">ou em até</span>
                <span className="font-headline font-black text-[17pt] leading-none">{maxInstallments}x</span>
                <span className="font-headline font-bold text-[13pt] leading-none">de</span>
                <span className="font-headline font-black text-[22pt] leading-none">R$ {formatCurrency(installmentValue)}</span>
             </div>
          )}
        </div>
      </div>

      {/* 3. BASE: METADADOS E FORNECEDOR EM LINHA ÚNICA */}
      <div className={cn("w-full flex items-center justify-center gap-x-4 flex-wrap text-[7.5pt] font-mono font-bold uppercase opacity-80", isOffer && "pr-[14mm]")}>
          {code && <span>SAP: {code}</span>}
          {ean && <span>EAN: {ean}</span>}
          {reference && <span>REF: {reference}</span>}
          {supplier && <span className="text-black font-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[40%]">| FORN: {supplier}</span>}
      </div>
    </div>
  );
}
