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
        {/* Esquerda: Black Block with text OFERTAS */}
        <div className="w-[18%] h-full bg-black text-white flex flex-col justify-center items-center shrink-0">
            <span className="font-headline font-black text-[20px] leading-none text-center uppercase tracking-wider" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                OFERTAS
            </span>
        </div>

        {/* Lado Direito Inteiro: Nome em cima, Preços em baixo */}
        <div className="flex-1 px-2 pt-1.5 pb-1 flex flex-col h-full overflow-hidden">
          
          {/* TOPO: Descrição */}
          <h2 className="font-headline font-bold text-[16px] leading-[1.1] uppercase overflow-hidden w-full max-h-[2.5em] shrink-0">
            {description}
          </h2>

          {/* MEIO + BASE: DE e Preço POR lado a lado, centralizados verticalmente */}
          <div className="flex w-full items-center justify-between flex-1 min-h-0 space-x-1">
            
            {/* Esquerda: DE (centro) + Códigos (rodapé) */}
            <div className="flex flex-col justify-between h-full shrink-0 pb-1">
              {/* Preço DE — centralizado no espaço disponível */}
              <div className="flex-1 flex items-center">
                <div className={`text-[14px] font-bold ${hasDiscount ? 'opacity-100' : 'opacity-0'}`}>
                  DE: <span className="line-through">R$ {formatCurrency(valDe)}</span>
                </div>
              </div>
              
              {/* Códigos — rodapé */}
              <div className="text-[9px] text-gray-700 leading-tight shrink-0">
                {reference && <div className="truncate">Ref: {reference}</div>}
                {code && <div className="truncate">SAP: {code}</div>}
                {ean && <div className="truncate">EAN: {ean}</div>}
              </div>
            </div>

            {/* Direita: Preço Por e Parcelamento */}
            <div className="flex flex-col items-end justify-center flex-1 shrink-0 h-full">
              <div className="flex flex-col items-end leading-none shrink-0">
                {/* Label POR — pequeno, acima */}
                <span className="font-headline font-black uppercase tracking-widest" style={{ fontSize: currencyFontSize }}>POR</span>
                {/* Bloco: R$ + inteiro + decimal */}
                <div className="flex items-start leading-none">
                  <span className="font-headline font-black self-start mt-1" style={{ fontSize: decimalFontSize }}>R$</span>
                  <div className="flex items-baseline">
                    <span className="font-headline font-black leading-[0.75] tracking-tighter" style={{ fontSize: priceFontSize }}>
                      {porInteger}
                    </span>
                    <span className="font-headline font-black leading-none" style={{ fontSize: decimalFontSize }}>
                      ,{porDecimal}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end w-full gap-2 mt-1 shrink-0">
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
