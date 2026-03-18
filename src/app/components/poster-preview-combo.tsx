'use client';

import React from 'react';
import type { PosterData } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function parsePrice(price: string): number {
  return parseFloat(price.replace('.', '').replace(',', '.')) || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-br', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PosterPreviewCombo({
  description,
  priceFor,
  code,
  ean,
  reference,
  comboDescription,
  comboPrice,
  comboCode,
  comboEan,
  comboReference,
  offerValidityStart,
  offerValidity,
  isA4 = true,
}: PosterData & { isA4?: boolean }) {
  
  const valA = parsePrice(priceFor);
  const valB = parsePrice(comboPrice || '0');
  
  const [priceAInt, priceADec] = formatCurrency(valA).split(',');
  const [priceBInt, priceBDec] = formatCurrency(valB).split(',');

  const baseFontSize = isA4 ? '12px' : '7.5px';
  const headerFontSize = isA4 ? '5.5em' : '4.5em';
  const descFontSize = isA4 ? '3em' : '2.6em';
  const priceFontSize = isA4 ? '10em' : '8.5em';

  return (
    <Card 
      className={cn(
        "w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body relative flex flex-col items-center",
        isA4 ? "p-[0.8cm]" : "p-[0.4cm]"
      )}
      style={{ fontSize: baseFontSize }}
    >
      {/* HEADER */}
      <div className="bg-black text-white w-full py-8 px-2 flex flex-col items-center justify-center shrink-0 print:color-adjust-exact">
        <h1 className="font-headline font-black uppercase text-center leading-[1.1]" style={{ fontSize: headerFontSize }}>
          + ECONOMIA,<br/>+ DIVERSÃO!
        </h1>
      </div>

      {/* ITEM A */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 border-b border-gray-100 pb-4">
        <div className="text-[1.8em] font-black uppercase text-gray-400 mb-1">Compre</div>
        <h2 className="font-headline font-black uppercase leading-tight text-center w-full" style={{ fontSize: descFontSize }}>
          {description}
        </h2>
        <div className="flex gap-3 text-[1.2em] font-bold mt-1 text-gray-500">
          {code && <span>SAP: {code}</span>}
          {ean && <span>EAN: {ean}</span>}
          {reference && <span>REF: {reference}</span>}
        </div>
        
        <div className="flex items-baseline mt-4 scale-90">
          <span className="font-headline text-[4em] mr-1">R$</span>
          <span className="font-headline font-black leading-[0.8] tracking-tighter" style={{ fontSize: priceFontSize }}>
            {priceAInt}
          </span>
          <span className="font-headline text-[4.5em] font-black">
            ,{priceADec}
          </span>
        </div>
      </div>

      {/* ITEM B */}
      <div className="flex-1 flex flex-col items-center justify-center w-full mt-4 px-4">
        <div className="text-[1.8em] font-black uppercase text-gray-400 mb-1">E leve um</div>
        <h2 className="font-headline font-black uppercase leading-tight text-center w-full" style={{ fontSize: descFontSize }}>
          {comboDescription}
        </h2>
        <div className="flex gap-3 text-[1.2em] font-bold mt-1 text-gray-500">
          {comboCode && <span>SAP: {comboCode}</span>}
          {comboEan && <span>EAN: {comboEan}</span>}
          {comboReference && <span>REF: {comboReference}</span>}
        </div>
        
        <div className="text-[1.6em] font-black uppercase text-gray-400 mt-4 mb-1">Por mais</div>
        <div className="flex items-baseline scale-90">
          <span className="font-headline text-[4.5em] mr-1">+ R$</span>
          <span className="font-headline font-black leading-[0.8] tracking-tighter" style={{ fontSize: priceFontSize }}>
            {priceBInt}
          </span>
          <span className="font-headline text-[4.5em] font-black">
            ,{priceBDec}
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="w-full text-center text-[0.8em] text-gray-500 mt-auto pb-2 px-8 leading-tight">
        <p>
          Oferta não cumulativa, válida para um mesmo cupom fiscal 
          {offerValidityStart && <span> de {offerValidityStart}</span>}
          {offerValidity && <span> a {offerValidity}</span>} 
          ou enquanto durarem os estoques dos itens. Desconto concedido diretamente no caixa.
        </p>
      </div>
    </Card>
  );
}
