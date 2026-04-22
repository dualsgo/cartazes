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

  // Repositório de fontes e proporções baseadas no layout oficial (105x29.7mm)
  return (
    <div className="w-full h-full bg-white text-black font-sans overflow-hidden relative flex flex-col box-border px-[2.5mm] py-[2.5mm]">
      
      {/* Container Principal: Título + Preços + Barcode vertical */}
      <div className="flex flex-1 min-h-0 w-full relative">
        
        {/* Lado Esquerdo: Informação Principal */}
        <div className="flex-1 flex flex-col items-start pr-[12mm]">
          {/* 1. Título do Produto (Reduzido e com tracking) */}
          <h2 className="font-black text-[11.5px] leading-[1.05] uppercase tracking-[-0.01em] overflow-hidden line-clamp-2 text-left mb-0.5">
            {description}
          </h2>

          {/* 2. Bloco de Preços e Parcelas */}
          <div className="flex-1 flex flex-col justify-center gap-1.5">
             {/* PREÇO À VISTA (DOMINANTE ABSOLUTO) */}
             <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-black tracking-tight mb-[-1px]">PREÇO À VISTA: R$</span>
                <div className="flex items-baseline">
                  <span className="text-[44px] font-[950] leading-[0.8] tracking-[-0.05em]">
                    {porInteger}
                  </span>
                  <div className="flex items-baseline ml-0.5">
                     <span className="text-[16px] font-[950] leading-none tracking-tight">,{porDecimal}</span>
                     <span className="text-[7.5px] font-bold leading-none ml-0.5 uppercase">un</span>
                  </div>
                </div>
             </div>

             {/* BOX DE PARCELAMENTO (HIERARQUIZADO E COMPACTO) */}
             {hasInstallments && (
               <div className="border-[0.25mm] border-black rounded-sm px-2 py-0.5 flex items-center gap-2">
                 <span className="text-[13px] font-[950] leading-none tracking-tight">R$ {formatCurrency(installmentValue)}</span>
                 <div className="flex flex-col items-center justify-center border-l-[0.1mm] border-black/30 pl-1.5 ml-0.5">
                    <span className="text-[9.5px] font-[950] leading-none">{maxInstallments}X</span>
                    <span className="text-[4.5px] font-black leading-none uppercase tracking-tighter">Sem Juros</span>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Barcode Vertical (Menos proeminente) */}
        {ean && (
          <div className="absolute right-0 top-0 bottom-1 w-[8mm] flex items-center justify-center opacity-90">
             <div className="rotate-90 origin-center whitespace-nowrap flex flex-col items-center w-[22mm]">
                <BarcodeEAN value={ean} height="6mm" width="20mm" showText={false} />
                <span className="text-[6px] font-mono font-bold mt-0.5 text-black/70">{ean}</span>
             </div>
          </div>
        )}
      </div>

      {/* RODAPÉ (Simplificado e Discreto) */}
      <div className="flex justify-between items-baseline mt-1 pt-1 opacity-50 border-t-[0.1mm] border-black/10">
        <span className="text-[6px] font-bold uppercase tracking-widest">
           REF: {reference || 'N/A'}
        </span>
        <div className="flex gap-2 text-[5px] font-bold">
           {code && <span>SAP: {code}</span>}
           {supplier && <span className="truncate max-w-[40mm]">{supplier}</span>}
        </div>
      </div>
    </div>
  );
}
