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

export function PosterPreviewLevePague({
  description,
  priceFor,
  code,
  ean,
  reference,
  leveX = 2,
  pagueY = 1,
  offerValidityStart,
  offerValidity,
  isA4 = true,
}: PosterData & { isA4?: boolean }) {
  const unitPrice = parsePrice(priceFor);
  const totalToPay = unitPrice * (pagueY || 1);
  const pricePerUnit = totalToPay / (leveX || 1);
  
  const [totalInteger, totalDecimal] = formatCurrency(totalToPay).split(',');
  
  // Calcula "cada unidade sai por menos de R$ X"
  const unitCeil = Math.ceil(pricePerUnit);

  const baseFontSize = isA4 ? '12px' : '7px';
  const headerFontSize = isA4 ? '5.5em' : '4.5em';
  const descFontSize = isA4 ? '4.2em' : '3.6em';
  const priceFontSize = isA4 ? '12em' : '10em';

  return (
    <Card 
      className={cn(
        "w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body relative flex flex-col items-center",
        isA4 ? "p-[0.8cm]" : "p-[0.4cm]"
      )}
      style={{ fontSize: baseFontSize }}
    >
      {/* HEADER: LEVE X, PAGUE Y! */}
      <div className="bg-black text-white w-full py-8 px-2 flex flex-col items-center justify-center shrink-0 print:color-adjust-exact">
        <h1 className="font-headline font-black uppercase text-center leading-[1.1]" style={{ fontSize: headerFontSize }}>
          LEVE {leveX},<br/>PAGUE {pagueY}!
        </h1>
      </div>

      {/* DESCRIPTION */}
      <div className="flex flex-col items-center w-full mt-6 px-4 flex-none">
        <h2 className="font-headline font-black uppercase leading-[1.1] text-center w-full" style={{ fontSize: descFontSize }}>
          {description}
        </h2>
        <div className="flex gap-4 text-[1.4em] font-bold mt-2 text-gray-700">
          {code && <span>SAP: {code}</span>}
          {ean && <span>EAN: {ean}</span>}
          {reference && <span>REF: {reference}</span>}
        </div>
      </div>

      {/* PRICE SECTION */}
      <div className="flex-1 flex flex-col items-center justify-center w-full mt-4">
        <div className="text-[1.2em] font-bold uppercase text-gray-500 mb-2">
          Preço original da unidade: R$ {priceFor}
        </div>
        
        <div className="font-headline font-black uppercase text-[5em] leading-none mb-2">
          Leve {leveX} por
        </div>
        
        <div className="flex items-baseline">
          <span className="font-headline text-[5em] mr-1">R$</span>
          <span className="font-headline font-black leading-[0.8] tracking-tighter" style={{ fontSize: priceFontSize }}>
            {totalInteger}
          </span>
          <span className="font-headline text-[5.5em] font-black">
            ,{totalDecimal}
          </span>
        </div>

        {/* PILL: Cada unidade sai por menos de... */}
        <div className="bg-black text-white rounded-full px-8 py-3 mt-8 flex items-center justify-center font-headline font-black uppercase text-[1.8em] print:color-adjust-exact">
           Nesta oferta, cada unidade sai por menos de R$ {unitCeil}
        </div>
      </div>

      {/* FOOTER: Disclaimer */}
      <div className="w-full text-center text-[0.9em] text-gray-500 mt-auto pb-2 px-8 leading-tight">
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
