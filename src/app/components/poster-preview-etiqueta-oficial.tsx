'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BarcodeEAN } from './barcode-ean';
import type { PosterData, PosterSettings } from '@/app/lib/types';
import { parsePrice, formatCurrency, calculateInstallments, truncateDescription } from '@/app/lib/poster-utils';

export function PosterPreviewEtiquetaOficial({
  description,
  priceFrom,
  priceFor,
  code,
  ean,
  reference,
  paymentOption,
  posterSubType,
  supplier,
  settings,
}: PosterData & { settings: PosterSettings }) {
  const valDe = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const isOffer = posterSubType === 'offer';
  const hasDiscount = valDe > 0 && valPor > 0 && valDe > valPor;

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const { maxInstallments, installmentValue } = calculateInstallments(valPor, settings);
  const hasInstallments = paymentOption === 'installment' && maxInstallments > 1;

  // REGRAS DE HIERARQUIA E PROPORÇÃO (Baseado em Preço 100% = 36px)
  // Preço: 36px (100%)
  // Parcelamento: 18px (50%)
  // "X vezes": 12px (33%)
  // "Sem juros": 6px (16%)
  // Título: 12px (33%)
  // Rodapé: 5px (14%)

  return (
    <div className="w-full h-full bg-white text-black font-sans overflow-hidden relative flex box-border p-[2.1mm]">
      
      {/* LADO ESQUERDO: Área Comercial */}
      <div className="flex-1 flex flex-col justify-between pr-2 h-full">
        
        {/* 1. DESCRIÇÃO */}
        <div className="flex-none">
          <h2 className="font-bold text-[11px] leading-[1.1] uppercase tracking-tight overflow-hidden line-clamp-2 text-left mb-1">
            {description}
          </h2>
        </div>

        {/* 2. ÁREA DE PREÇO: Condicional entre Normal e Oferta */}
        <div className="flex flex-col justify-center flex-1 py-1">
          <div className="flex items-center w-full">
             {isOffer && valDe > 0 ? (
               <div className="flex items-baseline gap-2 mr-2 whitespace-nowrap">
                  <div className="flex items-baseline gap-1 text-black">
                     <span className="text-[9px] font-bold uppercase">De:</span>
                     <span className="text-[16px] font-bold line-through decoration-[0.5mm]">R$ {formatCurrency(valDe)}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-tighter">Por R$</span>
               </div>
             ) : (
               <span className="text-[10px] font-bold tracking-tighter uppercase mr-2 whitespace-nowrap">
                  Preço à Vista R$
               </span>
             )}
             
             <div className="flex items-baseline leading-none">
                <span className="text-[38px] font-bold leading-[0.7] tracking-[-0.03em]">
                  {porInteger}
                </span>
                <div className="flex flex-col items-start ml-0.5">
                   <span className="text-[14px] font-bold leading-none">,{porDecimal}</span>
                   <span className="text-[7px] font-bold leading-none uppercase mt-0.5">un</span>
                </div>
             </div>
          </div>
        </div>

        {/* 3. PREÇO PARCELADO */}
        <div className="flex-none mb-1">
          {hasInstallments && (
            <div className="border-[0.4mm] border-black rounded-[2mm] px-3 py-1 flex flex-col justify-center min-h-[9mm] w-full">
               <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center">
                     <span className="text-[12px] font-bold leading-none tracking-tighter">{maxInstallments}X</span>
                     <span className="text-[6px] font-bold leading-none uppercase mt-0.5">Sem Juros</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                     <span className="text-[9px] font-bold">R$</span>
                     <span className="text-[16px] font-bold leading-none tracking-tighter">{formatCurrency(installmentValue)}</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* 4. RODAPÉ */}
        <div className="flex-none pt-1 flex flex-wrap gap-x-3 gap-y-0.5 items-baseline">
           <span className="text-[5.5px] font-bold uppercase whitespace-nowrap">REF: {reference || 'N/A'}</span>
           {code && <span className="text-[5.5px] font-bold whitespace-nowrap">SAP: {code}</span>}
           {supplier && <span className="text-[5.5px] font-bold truncate max-w-[40mm] uppercase">FORN: {supplier}</span>}
        </div>
      </div>

      {/* LADO DIREITO: Código de Barras (Coluna Fixa com Padding Interno) */}
      <div className="w-[15mm] flex-none flex flex-col items-center justify-center h-full">
        {ean && (
          <div className="rotate-90 origin-center whitespace-nowrap flex flex-col items-center w-[30mm]">
             {/* NUMERAÇÃO NA BORDA */}
             <div className="w-full flex justify-center mb-1">
                <span className="text-[7.5px] font-mono font-bold text-black tracking-tighter">{ean}</span>
             </div>
             {/* BARRAS ABAIXO DA NUMERAÇÃO */}
             <BarcodeEAN value={ean} height="12mm" width="28mm" showText={false} />
          </div>
        )}
      </div>
    </div>
  );
}
