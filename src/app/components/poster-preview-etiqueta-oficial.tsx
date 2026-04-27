'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BarcodeEAN } from './barcode-ean';
import { BarcodeSAP } from './barcode-sap';
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
      <div className="flex-1 flex flex-col justify-between pr-2 h-full min-w-0 overflow-hidden">
        
        {/* 1. DESCRIÇÃO */}
        <div className="shrink-0">
          <h2 className="font-bold text-[10px] leading-[1.1] uppercase tracking-tight overflow-hidden line-clamp-3 text-left">
            {description}
          </h2>
        </div>

        {/* 2. ÁREA DE PREÇO: Ajustada para ocupar apenas o espaço restante */}
        <div className="flex flex-col justify-center flex-1 py-1 overflow-hidden min-h-0 min-w-0">
          <div className="flex items-center w-full justify-start">
              {isOffer && valDe > 0 ? (
                <div className="flex items-center w-full justify-start gap-1.5">
                   {/* SEÇÃO DE: */}
                   <div className="flex items-center shrink-0">
                      <span className="text-[9px] font-bold uppercase mr-1">De:</span>
                      <span className="text-[21px] font-bold tracking-[-0.04em] line-through decoration-[0.8mm] inline-block origin-left scale-x-90 whitespace-nowrap">
                         R$ {formatCurrency(valDe)}
                      </span>
                   </div>
                   {/* SEÇÃO POR: */}
                   <div className="flex items-center shrink-0">
                      <span className="text-[9px] font-bold uppercase mr-1">Por:</span>
                      <span className="text-[27px] font-bold tracking-[-0.04em] inline-block origin-left scale-x-90 whitespace-nowrap">
                         R$ {formatCurrency(valPor)}
                      </span>
                   </div>
                </div>
             ) : (
                <div className="flex items-center w-full gap-2 justify-start">
                   <span className="text-[11px] font-bold uppercase leading-none tracking-tight shrink-0">Preço à Vista:</span>
                   <span className="text-[36px] font-bold tracking-[-0.04em] inline-block origin-left scale-x-90 whitespace-nowrap">
                      R$ {formatCurrency(valPor)}
                   </span>
                </div>
             )}
          </div>
        </div>

        {/* 3. PREÇO PARCELADO (ESPAÇO RESERVADO) */}
        <div className="shrink-0 mb-1 min-h-[10mm] flex flex-col justify-center">
          {hasInstallments ? (
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
          ) : (
            <div className="w-full h-[9mm]" /> /* Espaço reservado vazio */
          )}
        </div>

        {/* 4. RODAPÉ */}
        <div className="shrink-0 pt-1 flex flex-wrap gap-x-3 gap-y-0.5 items-baseline mt-auto">
           <span className="text-[5.5px] font-bold uppercase whitespace-nowrap">REF: {reference || 'N/A'}</span>
           {code && <span className="text-[5.5px] font-bold whitespace-nowrap">SAP: {code}</span>}
           {supplier && <span className="text-[5.5px] font-bold truncate max-w-[40mm] uppercase">FORN: {supplier}</span>}
        </div>
      </div>

      {/* LADO DIREITO: Código de Barras (Coluna Fixa com Padding Interno) */}
      <div className="w-[15mm] flex-none flex flex-col items-center justify-center h-full">
        {ean && ean.length >= 12 ? (
          <div className="rotate-90 origin-center whitespace-nowrap flex flex-col items-center w-[30mm]">
             {/* NUMERAÇÃO NA BORDA */}
             <div className="w-full flex justify-center mb-1">
                <span className="text-[7.5px] font-mono font-bold text-black tracking-tighter">{ean}</span>
             </div>
             {/* BARRAS ABAIXO DA NUMERAÇÃO */}
             <BarcodeEAN value={ean} height="12mm" width="28mm" showText={false} />
          </div>
        ) : code ? (
          <div className="rotate-90 origin-center whitespace-nowrap flex flex-col items-center w-[30mm]">
             {/* NUMERAÇÃO NA BORDA (SAP) */}
             <div className="w-full flex justify-center mb-1">
                <span className="text-[7.5px] font-mono font-bold text-black tracking-tighter">{code}</span>
             </div>
             {/* BARRAS SAP */}
             <BarcodeSAP value={code} height="12mm" width="28mm" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
