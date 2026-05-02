import React from 'react';
import { cn } from '@/lib/utils';
import { BarcodeSAP } from './barcode-sap';
import { BarcodeEAN } from './barcode-ean';
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
  settings,
}: PosterData & { settings: PosterSettings }) {
  const valDe = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  // Limite de 30 caracteres conforme solicitado pelo usuário
  const displayDescription = truncateDescription(description, 30);

  const isOffer = posterSubType === 'offer';
  const hasDiscount = valDe > 0 && valPor > 0 && valDe > valPor;

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const { maxInstallments, installmentValue } = calculateInstallments(valPor, settings);
  
  const hasInstallments = paymentOption === 'installment' && maxInstallments > 1;

  // Ajuste proporcional das fontes (Reduzido em 20% para caber no novo layout fixo)
  let priceFontSize = hasInstallments ? '34px' : '44.2px';
  let offerPriceFontSize = hasInstallments ? '24px' : '31.2px';
  let labelSize = hasInstallments ? '7.1px' : '9.2px';
  let unSize = hasInstallments ? '7.6px' : '9.9px';
  let decimalFontSize = '18px';
  let currencyFontSize = '10px';
  let installmentFontSize = '10px';

  return (    <div className="w-full h-full bg-white text-black font-montserrat overflow-hidden relative flex flex-col justify-center box-border px-[1mm] py-[1.5mm]">
      {/* Container de compressão (95% para segurança) */}
      <div className="w-full h-full flex relative items-center" style={{ transform: 'scale(0.95)', transformOrigin: 'center' }}>
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
            <h2 className={cn("font-headline font-bold text-[14px] leading-[0.9] uppercase overflow-hidden w-full max-h-[1.9em] shrink-0 pb-1", !isOffer && "text-center text-black")}>
              {displayDescription}
            </h2>

            {/* MEIO: Container de Preços */}
            <div className={cn("flex-1 flex min-h-0 items-center", isOffer ? (hasInstallments ? "flex-row justify-start gap-1" : "flex-row justify-center gap-8") : "flex-col justify-center")}>
              
              {/* SEÇÃO DE (Apenas Oferta) */}
              {isOffer && (
                <div className={cn("transition-opacity flex shrink-0", hasDiscount ? 'opacity-100' : 'opacity-0', !hasInstallments ? "flex-col items-center" : "flex-row items-center gap-1")}>
                  <div className="flex items-center">
                    <span className="font-bold uppercase leading-none mr-1" style={{ fontSize: labelSize }}>DE:</span>
                    <span className="font-bold uppercase leading-none self-start" style={{ fontSize: labelSize }}>R$</span>
                  </div>
                  <div className="relative inline-block">
                    <span className="font-headline font-black leading-[0.75] tracking-normal inline-block origin-left scale-x-90 whitespace-nowrap" style={{ fontSize: offerPriceFontSize }}>
                      {formatCurrency(valDe)}
                    </span>
                    {/* Barra inclinada customizada */}
                    <div className="absolute inset-x-[-1mm] top-[45%] h-[0.3mm] bg-black -rotate-[12deg] pointer-events-none" />
                  </div>
                </div>
              )}

              {/* SEÇÃO POR */}
              <div className={cn("flex min-w-0", isOffer ? (hasInstallments ? "flex-row items-center justify-start" : "flex-col items-center") : "flex-col items-center")}>
                {!isOffer && (
                  <div className="flex items-baseline mb-1">
                    <span className="font-bold uppercase leading-none mr-1" style={{ fontSize: labelSize }}>Preço à Vista:</span>
                    <span className="font-bold uppercase leading-none" style={{ fontSize: labelSize }}>R$</span>
                  </div>
                )}
                {isOffer && (
                  <div className={cn("flex items-center", !hasInstallments ? "mb-0.5" : "mr-1")}>
                    <span className="font-bold uppercase leading-none mr-1" style={{ fontSize: labelSize }}>POR:</span>
                    <span className="font-bold uppercase leading-none self-start" style={{ fontSize: labelSize }}>R$</span>
                  </div>
                )}
                <div className="flex items-end">
                   <span className={cn("font-bold uppercase leading-none mr-1 self-start mt-[1.5mm]", (isOffer || !hasInstallments) && "hidden")} style={{ fontSize: labelSize }}>R$</span>
                   <span className="font-headline font-black leading-[0.75] tracking-normal inline-block origin-left scale-x-90" style={{ fontSize: isOffer ? offerPriceFontSize : priceFontSize }}>
                    {formatCurrency(valPor).split(',')[0]}
                  </span>
                  
                  <div className="flex items-baseline leading-none">
                    <span className="font-headline font-black leading-[0.75] tracking-normal inline-block origin-left scale-x-90" style={{ fontSize: `calc(${isOffer ? offerPriceFontSize : priceFontSize} * 0.7)` }}>,</span>
                    <div className="relative inline-block">
                      <span className="font-headline font-black leading-[0.75] tracking-normal inline-block origin-left scale-x-90" style={{ fontSize: isOffer ? offerPriceFontSize : priceFontSize }}>
                        {formatCurrency(valPor).split(',')[1]}
                      </span>
                      <span className="font-normal uppercase absolute top-full mt-[0.2mm] right-0" style={{ fontSize: unSize }}>UN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ZONA DE PARCELAMENTO (ESPAÇO RESERVADO) */}
            <div className="shrink-0 w-full flex flex-col items-center justify-center min-h-[1mm] mb-1">
               {hasInstallments && (
               <div className="border-[0.3mm] border-black rounded-[1mm] px-2 py-0.5 flex items-center justify-center gap-8 min-h-[6mm] w-full">
                 <div className="flex flex-col items-center leading-none">
                   <span className="text-[7.5px] font-bold tracking-tighter uppercase">{maxInstallments}X</span>
                   <span className="text-[5.25px] font-bold uppercase mt-0.5">Sem Juros</span>
                 </div>
                 <div className="flex items-start gap-0.5">
                   <span className="font-bold leading-none self-start mt-[0.2mm]" style={{ fontSize: '5.25px' }}>R$</span>
                   <span className="font-bold leading-none tracking-tighter" style={{ fontSize: '10.5px' }}>{formatCurrency(installmentValue)}</span>
                 </div>
               </div>
               )}
            </div>

            {/* RODAPÉ: Referência, Fornecedor e SAP */}
            <div className="w-full flex items-center justify-between shrink-0 pt-1 text-[5.25px] font-normal uppercase mt-auto">
               <div className="min-w-0 flex-1 text-left truncate">
                 {reference && `REF: ${reference}`}
               </div>
               <div className="shrink-0 text-right whitespace-nowrap pl-2">
                 {supplier ? `${truncateDescription(supplier, 30)} | ` : ''}CÓD: {code}
               </div>
            </div>
          </div>

          {/* CÓDIGO DE BARRAS VERTICAL (EAN ou SAP) - Posição compactada à direita */}
          {ean && ean.length >= 12 ? (
            <div className="absolute right-[1mm] top-0 bottom-0 w-[18.2mm] flex items-center justify-center">
               <div className="rotate-90 origin-center whitespace-nowrap">
                  <BarcodeEAN 
                    value={ean} 
                    height="12mm" 
                    width="28mm" 
                    showText={false} 
                  />
               </div>
            </div>
          ) : code ? (
            <div className="absolute right-[1mm] top-0 bottom-0 w-[18.2mm] flex items-center justify-center">
               <BarcodeSAP 
                 value={code} 
                 orientation="vertical"
                 height="28mm" 
                 width="12mm" 
               />
            </div>
          ) : null}

          {/* Blocos Verticais de Códigos - Posição compactada à direita extremo */}
          <div className="absolute right-[0.8mm] top-0 bottom-0 flex flex-row-reverse items-center gap-0 text-[5.25px] text-black leading-none font-normal uppercase">
            {/* Coluna: SAP e REF */}
            <div className="flex flex-col justify-center items-center h-full w-[4mm] overflow-hidden">
                <div className="rotate-[-90deg] whitespace-nowrap truncate max-w-[28mm]">
                  {code ? `SAP: ${code}` : ''} {reference ? ` | ${reference}` : ''}
                </div>
            </div>
            {/* Coluna: EAN */}
            <div className="flex flex-col justify-center items-center h-full w-[3.5mm] overflow-hidden">
                <div className="rotate-[-90deg] whitespace-nowrap truncate max-w-[28mm]">
                  {ean ? `EAN: ${ean}` : ''}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
