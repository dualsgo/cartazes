import React from 'react';
import { cn } from '@/lib/utils';
import type { PosterData } from '@/app/lib/types';
import { BarcodeSAP } from './barcode-sap';

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
  posterSubType,
  supplier,
}: PosterData) {
  const valDe = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const isOffer = posterSubType === 'offer';
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
      <div className="flex w-full h-full relative">
        {/* Esquerda: Black Block with text OFERTAS (Somente se for tipo oferta) */}
        {isOffer && (
          <div className="w-[8%] h-full bg-black text-white flex flex-col justify-center items-center shrink-0">
              <span className="font-headline font-black text-[14px] leading-none text-center uppercase tracking-wider" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                  OFERTAS
              </span>
          </div>
        )}

        {/* Lado Direito Inteiro: Nome em cima, Preços em baixo */}
        <div className={cn("flex-1 px-2 pt-1.5 pb-1 flex flex-col h-full overflow-hidden pr-[20mm]", isOffer ? "pl-1.5" : "pl-3")}>
          
          {/* TOPO: Descrição */}
          <h2 className={cn("font-headline font-bold text-[16px] leading-[1.1] uppercase overflow-hidden w-full max-h-[2.5em] shrink-0", !isOffer && "text-center text-black")}>
            {description}
          </h2>

          {/* MEIO + BASE: DE em cima (compacto), POR em baixo (grande) */}
          <div className={cn("flex flex-col flex-1 min-h-0", !isOffer && "justify-center items-center")}>
            
            {/* Preço DE — Logo abaixo da descrição */}
            {isOffer && (
              <div className={cn("w-full flex pb-0.5 pl-1", hasDiscount ? 'opacity-100' : 'opacity-0')}>
                <div className="text-[12px] font-bold leading-none">
                  DE: <span className="line-through">R$ {formatCurrency(valDe)}</span>
                </div>
              </div>
            )}

            {/* Rótulo POR: — Nivelado abaixo do DE: */}
            {isOffer && (
              <div className="w-full flex pl-1">
                <span className="font-headline font-black uppercase tracking-tighter text-[11px] leading-none text-black">POR:</span>
              </div>
            )}

            {/* Bloco de Preço Principal */}
            <div className={cn("flex w-full items-end justify-center pr-2", isOffer ? "-mt-1" : "")}>
              
              {/* Símbolo R$ */}
              {isOffer && (
                <div className="flex flex-col items-end mr-1 shrink-0 pb-1">
                  <span className="font-headline font-black text-[16px] leading-tight">R$</span>
                </div>
              )}
              
              {!isOffer && <span className="font-headline font-black self-start mt-1 mr-0.5 text-[20px]">R$</span>}

              {/* Centro: Inteiro */}
              <span className="font-headline font-black leading-[0.75] tracking-tighter" style={{ fontSize: isOffer ? '48.6px' : priceFontSize }}>
                {porInteger}
              </span>

              {/* Lado Direito do Preço: Decimal e un. à vista */}
              <div className="flex flex-col items-start ml-0.5 shrink-0 pb-1 text-black">
                <span className="font-headline font-black leading-none" style={{ fontSize: isOffer ? '20px' : decimalFontSize }}>
                  ,{porDecimal}
                </span>
                {isOffer && (
                  <span className="font-bold whitespace-nowrap leading-none mt-1" style={{ fontSize: '8.5px' }}>
                    un. à vista
                  </span>
                )}
              </div>
            </div>

            {/* Rodapé Dinâmico (Parcelamento em modo Oferta) */}
            {isOffer && (
              <div className="flex w-full justify-center mt-auto pb-0.5 min-h-[14px] pr-2">
                {hasInstallments && (
                   <div className="bg-black text-white px-3 py-0.5 rounded-full flex items-center justify-center border border-black">
                      <span className="font-headline font-bold leading-none whitespace-nowrap text-[12px] tracking-tight">
                        ou em até {maxInstallments}x de R$ {formatCurrency(installmentValue)}
                      </span>
                   </div>
                )}
              </div>
            )}

            {/* Rodapé Normal (un. à vista) */}
            {!isOffer && (
              <div className="flex items-center gap-2 mt-1 shrink-0 justify-center">
                 <span className="font-bold whitespace-nowrap text-black text-[13px]">un. à vista</span>
                 {hasInstallments && (
                    <span className="font-headline font-bold leading-tight text-right whitespace-nowrap text-black text-[13px]">
                      ou {maxInstallments}x R$ {formatCurrency(installmentValue)}
                    </span>
                 )}
              </div>
            )}

          </div>

          {/* Rodapé Central (Fornecedor) */}
          {supplier && (
            <div className="text-[7px] text-black font-bold uppercase tracking-widest text-center mt-auto truncate w-full">
              {supplier}
            </div>
          )}
        </div>

        {/* CÓDIGO DE BARRAS VERTICAL (SAP) - Posição compactada à direita */}
        {code && (
          <div className="absolute right-[9.5mm] top-0 bottom-0 w-[10mm] flex items-center justify-center">
             <BarcodeSAP 
               value={code} 
               orientation="vertical"
               height="28mm" 
               width="6.5mm" 
             />
          </div>
        )}

        {/* Blocos Verticais de Códigos - Posição compactada à direita extremo */}
        <div className="absolute right-[0.2mm] top-0 bottom-0 flex flex-row-reverse items-center gap-0 text-[8pt] text-black font-mono leading-none font-bold">
          {/* Coluna: SAP e REF */}
          <div className="flex flex-col justify-center items-center h-full w-[4.4mm]">
              <div className="rotate-90 whitespace-nowrap whitespace-pre">
                {code ? `SAP: ${code}` : ''} {reference ? ` | ${reference}` : ''}
              </div>
          </div>
          {/* Coluna: EAN */}
          <div className="flex flex-col justify-center items-center h-full w-[4mm]">
              <div className="rotate-90 whitespace-nowrap">
                {ean ? `EAN: ${ean}` : ''}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
