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

  let priceFontSize = '50px';
  let decimalFontSize = '20px';
  let currencyFontSize = '13px';
  let installmentFontSize = '13px';
  
  if (porInteger.length >= 6) {
    priceFontSize = '32px';
    decimalFontSize = '14px';
    currencyFontSize = '11px';
    installmentFontSize = '11px';
  } else if (porInteger.length === 5) {
    priceFontSize = '40px';
    decimalFontSize = '16px';
    currencyFontSize = '12px';
    installmentFontSize = '12px';
  }

  return (
    <div className="w-full h-full bg-white text-black font-body overflow-hidden relative flex flex-col justify-between box-border">
      {/* Etiqueta 90x34mm - Horizontally Wide */}
      <div className="flex w-full h-full">
        {/* Esquerda: Black Block with text OFERTAS DESCONTO */}
        <div className="w-[18%] h-full bg-black text-white flex flex-col justify-center items-center shrink-0">
            <span className="font-headline font-black text-[18px] leading-tight text-center uppercase" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                OFERTAS<br />DESCONTO
            </span>
        </div>

        {/* Lado Direito Inteiro: Nome em cima, Preços em baixo */}
        <div className="flex-1 px-2 pt-1.5 pb-1 flex flex-col justify-between h-full overflow-hidden">
          
          {/* TOPO: Linha Imaginária Reta para o Nome */}
          <h2 className="font-headline font-bold text-[16px] leading-[1.1] uppercase overflow-hidden w-full max-h-[2.5em] shrink-0">
            {description}
          </h2>
          
          {/* BASE: Detalhes e Preço Final Desenhados em Linha e Ajustados */}
          <div className="flex w-full items-end justify-between mt-auto shrink-0 space-x-1">
            
            {/* Esquerda Inferior: Preço De e Detalhes */}
            <div className="flex flex-col justify-end shrink-0 pb-1">
              <div className={`text-[12px] font-bold ${hasDiscount ? 'opacity-100' : 'opacity-0'}`}>
                DE: <span className="line-through">R$ {formatCurrency(valDe)}</span>
              </div>
              
              <div className="text-[9px] text-gray-700 leading-tight">
                {reference && <div className="truncate">Ref: {reference}</div>}
                {code && <div className="truncate">SAP: {code}</div>}
                {ean && <div className="truncate">EAN: {ean}</div>}
              </div>
            </div>

            {/* Direita Inferior: Preço Por e Parcelamento Expandido Horizontalmente */}
            <div className="flex flex-col items-end justify-end flex-1 shrink-0">
              <div className="flex items-start leading-none shrink-0" style={{ transformOrigin: 'right bottom' }}>
                <span className="font-headline font-black mr-1 mt-1.5" style={{ fontSize: currencyFontSize }}>POR R$</span>
                <div className="flex items-baseline">
                  <span className="font-headline font-black leading-[0.75] tracking-tighter" style={{ fontSize: priceFontSize }}>
                    {porInteger}
                  </span>
                  <span className="font-headline font-black leading-none" style={{ fontSize: decimalFontSize }}>
                    ,{porDecimal}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-end w-full gap-2 mt-1.5 shrink-0">
                <span className="font-bold whitespace-nowrap" style={{ fontSize: currencyFontSize }}>un. à vista</span>
                {hasInstallments && (
                   <span className="font-headline font-bold leading-tight text-right whitespace-nowrap" style={{ fontSize: installmentFontSize }}>
                     ou {maxInstallments}x R$ {formatCurrency(installmentValue)}
                   </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
