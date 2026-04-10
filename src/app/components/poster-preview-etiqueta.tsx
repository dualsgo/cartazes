import React from 'react';
import { cn } from '@/lib/utils';
import { BarcodeSAP } from './barcode-sap';
import type { PosterData } from '@/app/lib/types';
import { parsePrice, formatCurrency, calculateInstallments, truncateDescription } from '@/app/lib/poster-utils';

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

  // Redução proporcional de caracteres para caber na nova largura com margem
  const displayDescription = truncateDescription(description, 22);

  const isOffer = posterSubType === 'offer';
  const hasDiscount = valDe > 0 && valPor > 0 && valDe > valPor;

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const { maxInstallments, installmentValue } = calculateInstallments(valPor, { maxInstallments: 6, minInstallmentAmount: 30 });
  
  const hasInstallments = paymentOption === 'installment' && maxInstallments > 1;

  // Ajuste proporcional das fontes
  let priceFontSize = '44px';
  let decimalFontSize = '18px';
  let currencyFontSize = '12px';
  let installmentFontSize = '12px';
  let offerPriceFontSize = '46px';
  
  if (porInteger.length >= 6) {
    priceFontSize = '30px';
    decimalFontSize = '12px';
    currencyFontSize = '10px';
    installmentFontSize = '10px';
    offerPriceFontSize = '32px';
  } else if (porInteger.length === 5) {
    priceFontSize = '36px';
    decimalFontSize = '14px';
    currencyFontSize = '11px';
    installmentFontSize = '11px';
    offerPriceFontSize = '38px';
  } else if (porInteger.length === 4) {
    offerPriceFontSize = '42px';
  }

  return (    <div className="w-full h-full bg-white text-black font-body overflow-hidden relative flex flex-col justify-center box-border px-[1mm] py-[1.5mm]">
      {/* Etiqueta 91x33.8mm - High Tolerance Center */}
      <div className="flex w-full h-full relative items-center">
        {/* Esquerda: Black Block with text OFERTAS (Somente se for tipo oferta) */}
        {isOffer && (
          <div className="w-[8%] h-[98%] bg-black text-white flex flex-col justify-center items-center shrink-0 rounded-sm">
              <span className="font-headline font-black text-[11px] leading-none text-center uppercase tracking-wider" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                  OFERTAS
              </span>
          </div>
        )}

        {/* Lado Direito Inteiro: Nome em cima, Preços em baixo */}
        <div className={cn("flex-1 px-2 flex flex-col h-full justify-between overflow-hidden pr-[19mm]", isOffer ? "pl-2" : "pl-4")}>
          
          {/* TOPO: Descrição */}
          <h2 className={cn("font-headline font-bold text-[14px] leading-[0.9] uppercase overflow-hidden w-full max-h-[1.9em] shrink-0", !isOffer && "text-center text-black")}>
            {displayDescription}
          </h2>

          {/* MEIO: Container de Preços */}
          <div className={cn("flex-1 flex min-h-0 items-center", isOffer ? "flex-row" : "flex-col justify-center")}>
            
            {/* LADO ESQUERDO (Apenas Oferta): DE e Rótulo POR */}
            {isOffer && (
              <div className="flex flex-col shrink-0 mr-1 min-w-[32mm] justify-center h-full">
                <div className={cn("transition-opacity flex flex-col", hasDiscount ? 'opacity-100' : 'opacity-0')}>
                  <div className="text-[15px] font-bold leading-none whitespace-nowrap">
                    DE: <span className="line-through">R$ {formatCurrency(valDe)}</span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="font-headline font-black uppercase tracking-tighter text-[11px] leading-none">POR:</span>
                  <span className="font-headline font-black text-[14px] leading-none">R$</span>
                </div>
              </div>
            )}

            {/* LADO DIREITO: Preço Principal (POR) e Parcelamento */}
            <div className={cn("flex flex-col min-w-0 pr-1", isOffer ? "flex-1 justify-center items-end" : "items-center")}>
              
              <div className="flex items-end">
                {!isOffer && <span className="font-headline font-black self-start mt-1 mr-0.5 text-[17px]">R$</span>}

                {/* Centro: Inteiro */}
                <span className="font-headline font-black leading-[0.75] tracking-tighter" style={{ fontSize: isOffer ? offerPriceFontSize : priceFontSize }}>
                  {porInteger}
                </span>

                {/* Lado Direito do Preço: Decimal e un. à vista */}
                <div className="flex flex-col items-start ml-0.5 shrink-0 pb-1 text-black">
                  <span className="font-headline font-black leading-none" style={{ fontSize: isOffer ? '17px' : decimalFontSize }}>
                    ,{porDecimal}
                  </span>
                  {isOffer && (
                    <span className="font-bold whitespace-nowrap leading-none mt-0.5" style={{ fontSize: '7.5px' }}>
                      un. à vista
                    </span>
                  )}
                </div>
              </div>

              {/* Parcelamento posicionado abaixo do preço POR */}
              {isOffer && hasInstallments && (
                 <div className="bg-black text-white px-2 py-[2px] rounded-full flex items-center justify-center border border-black mt-1">
                    <span className="font-headline font-bold leading-none whitespace-nowrap text-[10px] tracking-tight">
                      ou {maxInstallments}x de R$ {formatCurrency(installmentValue)}
                    </span>
                 </div>
              )}
            </div>
          </div>

          {/* RODAPÉ: Fornecedor e Info Complementar */}
          <div className="w-full flex flex-col items-center shrink-0">
             {!isOffer && (
               <div className="flex items-center gap-2 mb-0.5 shrink-0">
                  <span className="font-bold whitespace-nowrap text-black text-[11px]">un. à vista</span>
                  {hasInstallments && (
                     <span className="font-headline font-bold leading-tight text-right whitespace-nowrap text-black text-[11px]">
                       ou {maxInstallments}x R$ {formatCurrency(installmentValue)}
                     </span>
                  )}
               </div>
             )}
             {supplier && (
                <div className="text-[7.5px] text-black font-black uppercase tracking-[0.15em] text-center w-full truncate border-t border-black/10 pt-0.5">
                  {supplier}
                </div>
              )}
          </div>
        </div>

        {/* CÓDIGO DE BARRAS VERTICAL (SAP) - Posição compactada à direita */}
        {code && (
          <div className="absolute right-[9.5mm] top-0 bottom-0 w-[9mm] flex items-center justify-center">
             <BarcodeSAP 
               value={code} 
               orientation="vertical"
               height="24mm" 
               width="5.5mm" 
             />
          </div>
        )}

        {/* Blocos Verticais de Códigos - Posição compactada à direita extremo */}
        <div className="absolute right-[0.5mm] top-0 bottom-0 flex flex-row-reverse items-center gap-0 text-[6.5pt] text-black font-mono leading-none font-bold">
          {/* Coluna: SAP e REF */}
          <div className="flex flex-col justify-center items-center h-full w-[4mm]">
              <div className="rotate-90 whitespace-nowrap whitespace-pre">
                {code ? `SAP: ${code}` : ''} {reference ? ` | ${reference}` : ''}
              </div>
          </div>
          {/* Coluna: EAN */}
          <div className="flex flex-col justify-center items-center h-full w-[3.5mm]">
              <div className="rotate-90 whitespace-nowrap">
                {ean ? `EAN: ${ean}` : ''}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
