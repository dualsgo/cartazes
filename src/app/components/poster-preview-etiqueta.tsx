import React from 'react';
import type { PosterData } from '@/app/lib/types';

function parsePrice(price: string): number {
  return parseFloat(price.replace('.', '').replace(',', '.')) || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-br', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PosterPreviewEtiqueta({
  description,
  priceFrom,
  priceFor,
  code,
  ean,
  reference,
  paymentOption,
}: PosterData) {
  const valDe = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const hasDiscount = valDe > 0 && valPor > 0 && valDe > valPor;

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const numInstallments = valPor > 0 ? Math.floor(valPor / 29.99) : 0;
  const maxInstallments = Math.min(numInstallments, 6);
  const rawInstallment = maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;
  const installmentValue = Math.ceil(rawInstallment * 100) / 100;
  
  const hasInstallments = paymentOption === 'installment' && maxInstallments > 1;

  return (
    <div className="w-full h-full bg-white text-black font-body overflow-hidden relative flex flex-col justify-between box-border">
      {/* Etiqueta 90x34mm - Horizontally Wide */}
      <div className="flex w-full h-full">
        {/* Esquerda: Black Block with text OFERTAS DESCONTO */}
        <div className="w-[20%] h-full bg-black text-white flex flex-col justify-center items-center">
            <span className="font-headline font-black text-[10px] leading-tight text-center uppercase" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                OFERTAS<br />DESCONTO
            </span>
        </div>

        {/* Meio: Descrição / Preço De */}
        <div className="flex-1 px-1.5 flex flex-col justify-between py-1">
          <h2 className="font-headline font-bold text-[9px] leading-tight line-clamp-2 uppercase">
            {description}
          </h2>
          
          <div className="flex flex-col">
            <div className={`text-[8px] font-bold ${hasDiscount ? 'opacity-100' : 'opacity-0'}`}>
              DE: <span className="line-through">R$ {formatCurrency(valDe)}</span>
            </div>
            
            <div className="text-[6px] text-gray-700 leading-tight">
              {reference && <span>Ref: {reference} </span>}
              {code && <span>SAP: {code} </span>}
              {ean && <span>EAN: {ean}</span>}
            </div>
          </div>
        </div>

        {/* Direita: Preço Por / Parcelamento */}
        <div className="w-[45%] flex flex-col items-end justify-center pl-1 pr-1.5 py-1">
          <div className="flex items-start leading-none">
            <span className="font-headline text-[8px] font-black mr-0.5 mt-0.5">POR R$</span>
            <div className="flex items-baseline">
              <span className="font-headline font-black text-[24px] leading-none tracking-tighter">
                {porInteger}
              </span>
              <span className="font-headline font-black text-[12px] leading-none">
                ,{porDecimal}
              </span>
            </div>
          </div>
          
          <span className="text-[7px] font-bold mt-0.5">un. à vista</span>
          
          {hasInstallments && (
             <div className="font-headline font-bold text-[8px] leading-tight text-right mt-0.5">
               ou {maxInstallments}x de R$ {formatCurrency(installmentValue)}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
