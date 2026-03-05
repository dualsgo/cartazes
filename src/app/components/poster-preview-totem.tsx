import React from 'react';
import type { PosterData } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { OfertasHeader } from './ofertas-header';

function parsePrice(price: string): number {
  return parseFloat(price.replace('.', '').replace(',', '.')) || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-br', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PosterPreviewTotem({
  description,
  priceFrom,
  priceFor,
  code,
  ean,
  reference,
  paymentOption,
  offerValidityStart,
  offerValidity,
}: PosterData) {
  const valDe = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const hasDiscount = valDe > 0 && valPor > 0 && valDe > valPor;
  const discount = hasDiscount ? Math.round(((valDe - valPor) / valDe) * 100) : 0;

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const numInstallments = valPor > 0 ? Math.floor(valPor / 29.99) : 0;
  const maxInstallments = Math.min(numInstallments, 6);
  const rawInstallment = maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;
  const installmentValue = Math.ceil(rawInstallment * 100) / 100;
  
  const hasInstallments = paymentOption === 'installment' && maxInstallments > 1;

  let priceFontSize = description.length > 50 ? '8em' : '10em';
  if (porInteger.length >= 6) {
    priceFontSize = '6em';
  } else if (porInteger.length === 5) {
    priceFontSize = '7.5em';
  }

  return (
    <Card 
      className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body relative flex flex-col items-center justify-between p-[0.8cm] box-border"
      style={{ fontSize: '12px' }} // Reduz o tamanho de todos os itens 'em' para 75%  do tamanho original (12/16px)
    >
      
      {/* TOPO: Cabeçalho OFERTAS + Nome do Produto + SAP/EAN */}
      <div className="flex flex-col items-center w-full shrink-0 px-8">
        <OfertasHeader textSize={60} />
        
        <h2 className="font-headline font-black uppercase text-[4em] leading-tight break-words text-center mt-6 mb-2 w-full">
          {description}
        </h2>

        <div className="text-[1.2em] flex flex-wrap justify-center gap-x-4 gap-y-1 text-black font-semibold text-center w-full">
          {reference && <span>Ref.: <b className="font-bold">{reference}</b></span>}
          {code && <span>SAP: <b className="font-bold">{code}</b></span>}
          {ean && <span>EAN: <b className="font-bold">{ean}</b></span>}
        </div>
      </div>

      {/* MEIO: DE / DESCONTO */}
      <div className="flex flex-col items-center w-full shrink-0 my-4">
        <div className={`transition-opacity text-center text-[3.5em] font-headline text-black mb-4 ${valDe > 0 ? 'opacity-100' : 'opacity-0'}`}>
          <span className="block leading-none">DE:</span>
          <span className="font-bold line-through leading-none">
            R$ {formatCurrency(valDe)}
          </span>
        </div>

        <div className={`bg-black text-white text-center font-headline font-black transition-opacity flex flex-col items-center justify-center print:color-adjust-exact px-4 py-2 w-[85%] rounded-sm ${discount > 0 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col justify-center items-center w-full">
             <span className="text-[2.2em] leading-tight uppercase tracking-wide">DESCONTO DE</span>
             <span className="text-[6.5em] leading-[0.9]">{discount}%</span>
          </div>
        </div>
      </div>

      {/* BASE: POR + Parcelamento + Validade */}
      <div className="flex flex-col items-center justify-end w-full flex-1">
        <div className="flex items-end justify-center w-full">
          <span className="font-headline text-[2.5em] font-black mr-4 self-start mt-6 shrink-0">
            POR
          </span>
          <div className="flex items-baseline">
            <span className="font-headline text-[3.5em] mr-1">R$</span>
            <span className="font-headline font-black leading-[0.8] tracking-tighter" style={{ fontSize: priceFontSize }}>
              {porInteger}
            </span>
            <span className="font-headline text-[4em] font-black">
              ,{porDecimal}
            </span>
          </div>
        </div>

        <div className="font-bold flex items-baseline space-x-1 mt-2">
          <span className="text-[2em]">un. à vista</span>
        </div>

        {hasInstallments ? (
          <div className="font-headline text-center font-bold text-[3em] leading-tight mt-3">
            ou {maxInstallments}x de R$ {formatCurrency(installmentValue)}
          </div>
        ) : (
          <div className="mt-3" style={{ height: '3em' }}></div> // Espaçador para segurar o layout
        )}

        <div className="text-[1.2em] text-center w-full shrink-0 leading-tight text-gray-800 font-semibold mt-6 pt-4 border-t border-gray-300">
          {(offerValidityStart || offerValidity) ? (
            <span>
              Oferta válida{' '}
              {offerValidityStart && <span>de <b className="font-black text-black">{offerValidityStart}</b>{' '}</span>}
              {offerValidity && <span>até <b className="font-black text-black">{offerValidity}</b>{' '}</span>}
              ou enquanto durarem os estoques.
            </span>
          ) : (
             <span className="opacity-0">Validade</span>
          )}
        </div>
      </div>

    </Card>
  );
}
