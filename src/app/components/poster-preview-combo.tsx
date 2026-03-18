'use client';

import type { PosterData } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { parsePrice, formatCurrency } from '@/app/lib/poster-utils';

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
  const total = valA + valB;
  
  const [priceAInt, priceADec] = formatCurrency(valA).split(',');
  const [priceBInt, priceBDec] = formatCurrency(valB).split(',');
  const [totalInt, totalDec] = formatCurrency(total).split(',');

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
      <div className="bg-black text-white w-full py-8 px-2 flex flex-col items-center justify-center shrink-0 print:color-adjust-exact mb-2">
        <h1 className="font-headline font-black uppercase text-center leading-[1.1]" style={{ fontSize: headerFontSize }}>
          + ECONOMIA,<br/>+ DIVERSÃO!
        </h1>
      </div>

      {/* ITEM A */}
      <div className="flex-none flex flex-col items-center justify-center w-full px-4 pb-2">
        <div className="text-[1.8em] font-black uppercase text-black/40 mb-1">Compre</div>
        <h2 className="font-headline font-black uppercase leading-[0.9] text-center w-full mb-1" style={{ fontSize: descFontSize }}>
          {description}
        </h2>
        <div className="flex gap-3 text-[1.2em] font-bold text-black opacity-80 mb-2">
          {code && <span>SAP: {code}</span>}
          {ean && <span>EAN: {ean}</span>}
          {reference && <span>REF: {reference}</span>}
        </div>
        
        <div className="flex items-baseline scale-75 mt-[-1em]">
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
      <div className="flex-none flex flex-col items-center justify-center w-full mt-2 px-4 border-t border-black/5 pt-2">
        <div className="text-[1.8em] font-black uppercase text-black/40 mb-1">E leve um</div>
        <h2 className="font-headline font-black uppercase leading-[0.9] text-center w-full mb-1" style={{ fontSize: descFontSize }}>
          {comboDescription}
        </h2>
        <div className="flex gap-3 text-[1.2em] font-bold text-black opacity-80 mb-2">
          {comboCode && <span>SAP: {comboCode}</span>}
          {comboEan && <span>EAN: {comboEan}</span>}
          {comboReference && <span>REF: {comboReference}</span>}
        </div>
        
        <div className="text-[1.8em] font-black uppercase text-black/60 mb-1">Por mais</div>
        <div className="flex items-baseline scale-75 mt-[-1em]">
          <span className="font-headline text-[4.5em] mr-1">+ R$</span>
          <span className="font-headline font-black leading-[0.8] tracking-tighter" style={{ fontSize: priceFontSize }}>
            {priceBInt}
          </span>
          <span className="font-headline text-[4.5em] font-black">
            ,{priceBDec}
          </span>
        </div>
      </div>

      {/* TOTAL BAR (BLACK BAR) */}
      <div className="w-[95%] bg-black text-white mt-4 py-4 px-8 rounded-sm flex items-center justify-between print:color-adjust-exact shrink-0">
        <div className="flex flex-col">
          <span className="font-headline font-black uppercase text-[1.5em] leading-none">TOTAL DO</span>
          <span className="font-headline font-black uppercase text-[2.2em] leading-none">COMBO</span>
        </div>
        <div className="flex items-baseline">
          <span className="font-headline text-[2.5em] mr-1">R$</span>
          <span className="font-headline font-black text-[5.5em] leading-none tracking-tighter">
            {totalInt}
          </span>
          <span className="font-headline font-black text-[3em] self-start mt-[-0.1em]">
            ,{totalDec}
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="w-full text-center text-[0.8em] text-black/60 mt-auto pb-4 px-8 leading-tight">
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
