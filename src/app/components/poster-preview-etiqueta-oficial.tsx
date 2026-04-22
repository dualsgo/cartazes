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
    <div className="w-full h-full bg-white text-black font-sans overflow-hidden relative flex flex-col box-border pt-[1.5mm] pb-[1mm] px-[2.5mm]">
      
      {/* GRID DE DUAS COLUNAS: ESQUERDA (Comercial ≈ 78%) | DIREITA (Técnica ≈ 22%) */}
      <div className="flex flex-1 min-h-0 w-full relative">
        
        {/* COLUNA ESQUERDA: Comunicação Comercial */}
        <div className="w-[78%] flex flex-col items-start pr-[2mm]">
          
          {/* 1. ZONA DE CABEÇALHO: Título do Produto */}
          <h2 className="font-black text-[12px] leading-[1.1] uppercase tracking-[-0.01em] overflow-hidden line-clamp-2 text-left mb-1">
            {description}
          </h2>

          {/* 2. ZONA PRINCIPAL DE PREÇO */}
          <div className="flex flex-col items-start leading-none mb-1.5">
             <span className="text-[8.5px] font-bold tracking-tight mb-0.5">PREÇO À VISTA: R$</span>
             <div className="flex items-baseline">
                <span className="text-[36px] font-[950] leading-[0.8] tracking-[-0.05em]">
                  {porInteger}
                </span>
                <div className="flex items-baseline ml-0.5">
                   <span className="text-[14px] font-[950] leading-none tracking-tight">,{porDecimal}</span>
                   <span className="text-[6.5px] font-bold leading-none ml-0.8 uppercase">un</span>
                </div>
             </div>
          </div>

          {/* 3. ZONA DE CONDICÃO DE PAGAMENTO (PARCELAMENTO) */}
          {hasInstallments && (
            <div className="border-[0.25mm] border-black rounded-[0.5mm] px-2 py-1 flex items-center justify-between gap-3 min-w-[45mm]">
               {/* Valor da parcela (Dominante no box) */}
               <span className="text-[17px] font-[950] leading-none tracking-tighter">R$ {formatCurrency(installmentValue)}</span>
               
               {/* Informações da parcela */}
               <div className="flex flex-col items-center justify-center border-l-[0.1mm] border-black/20 pl-2">
                  <span className="text-[11px] font-[950] leading-none">{maxInstallments}X</span>
                  <span className="text-[5.5px] font-black leading-none uppercase tracking-tighter whitespace-nowrap">Sem Juros</span>
               </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: Zona Técnica (Código de Barras) */}
        <div className="w-[22%] flex flex-col items-end justify-center h-full pt-1 pb-2">
           {ean && (
             <div className="h-full flex flex-col items-center justify-center">
                <div className="rotate-90 origin-center whitespace-nowrap flex flex-col items-center w-[25mm]">
                   <BarcodeEAN value={ean} height="6.5mm" width="24mm" showText={false} />
                   <span className="text-[5.5px] font-mono font-bold mt-1 text-black/80">{ean}</span>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* 5. ZONA DE RODAPÉ: Informação Secundária */}
      <div className="mt-auto pt-0.5 border-t-[0.1mm] border-black/20 flex justify-between items-baseline opacity-60">
        <span className="text-[5px] font-bold uppercase tracking-[0.1em]">
           REF: {reference || 'N/A'}
        </span>
        <div className="flex gap-2 text-[5px] font-bold">
           {code && <span>SAP: {code}</span>}
           {supplier && <span className="truncate max-w-[35mm] uppercase">{supplier}</span>}
        </div>
      </div>
    </div>
  );
}
