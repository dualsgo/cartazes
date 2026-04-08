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
    <div className="w-full h-full bg-white text-black font-body overflow-hidden relative flex flex-col justify-between box-border p-[0.5mm]">
      {/* Etiqueta 90x34mm - Horizontally Wide */}
      <div className="flex w-full h-full relative">
        {/* Esquerda: Black Block with text OFERTAS (Somente se for tipo oferta) */}
        {isOffer && (
          <div className="w-[18%] h-full bg-black text-white flex flex-col justify-center items-center shrink-0">
              <span className="font-headline font-black text-[20px] leading-none text-center uppercase tracking-wider" style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                  OFERTAS
              </span>
          </div>
        )}

        {/* Lado Direito Inteiro: Nome em cima, Preços em baixo */}
        <div className={cn("flex-1 px-2 pt-1.5 pb-1 flex flex-col h-full overflow-hidden", !isOffer && "pl-3 pr-[25mm]")}>
          
          {/* TOPO: Descrição */}
          <h2 className={cn("font-headline font-bold text-[16px] leading-[1.1] uppercase overflow-hidden w-full max-h-[2.5em] shrink-0", !isOffer && "text-center text-black")}>
            {description}
          </h2>

          {/* MEIO + BASE: DE e Preço POR lado a lado, centralizados verticalmente */}
          <div className={cn("flex w-full items-center justify-between flex-1 min-h-0 space-x-1", !isOffer && "justify-center")}>
            
            {/* Esquerda: DE (centro) + Códigos (rodapé) */}
            {isOffer && (
              <div className="flex flex-col justify-between h-full shrink-0 pb-1">
                {/* Preço DE — centralizado no espaço disponível */}
                <div className="flex-1 flex items-center">
                  <div className={`text-[14px] font-bold ${hasDiscount ? 'opacity-100' : 'opacity-0'}`}>
                    DE: <span className="line-through">R$ {formatCurrency(valDe)}</span>
                  </div>
                </div>
                
                {/* Códigos — rodapé */}
                <div className="text-[8.5px] text-black leading-tight shrink-0 font-bold">
                  {reference && <div>Ref: {reference}</div>}
                  {code && <div>SAP: {code}</div>}
                  {ean && <div>EAN: {ean}</div>}
                </div>
              </div>
            )}

            {/* Direita: Preço Por e Parcelamento */}
            <div className={cn("flex flex-col shrink-0 h-full", isOffer ? "flex-1 items-end justify-center" : "items-center justify-center")}>
              <div className={cn("flex leading-none text-black", isOffer ? "items-center" : "items-start")}>
                {/* Lado Esquerdo do Preço: POR e R$ */}
                {isOffer ? (
                  <div className="flex flex-col items-end mr-1.5 shrink-0">
                    <span className="font-headline font-black uppercase tracking-tighter" style={{ fontSize: currencyFontSize }}>POR</span>
                    <span className="font-headline font-black" style={{ fontSize: decimalFontSize }}>R$</span>
                  </div>
                ) : (
                  <span className="font-headline font-black self-start mt-1 mr-0.5" style={{ fontSize: decimalFontSize }}>R$</span>
                )}
                
                {/* Centro: Inteiro */}
                <span className="font-headline font-black leading-[0.75] tracking-tighter" style={{ fontSize: priceFontSize }}>
                  {porInteger}
                </span>

                {/* Lado Direito do Preço: Decimal e un. à vista */}
                <div className="flex flex-col items-start ml-0.5 shrink-0">
                  <span className="font-headline font-black leading-none" style={{ fontSize: decimalFontSize }}>
                    ,{porDecimal}
                  </span>
                  {isOffer && (
                    <span className="font-bold whitespace-nowrap leading-none mt-1" style={{ fontSize: '7.5px' }}>
                      un. à vista
                    </span>
                  )}
                </div>
              </div>
              
              {/* Rodapé do bloco de preço: Parcelamento ou un. à vista (Normal) */}
              <div className={cn("flex items-center gap-2 mt-1 shrink-0", isOffer ? "justify-end w-full" : "justify-center")}>
                {!isOffer && (
                   <span className="font-bold whitespace-nowrap text-black" style={{ fontSize: currencyFontSize }}>un. à vista</span>
                )}
                {hasInstallments && (
                   <span className="font-headline font-bold leading-tight text-right whitespace-nowrap text-black" style={{ fontSize: installmentFontSize }}>
                     {isOffer ? '' : 'ou '}{maxInstallments}x R$ {formatCurrency(installmentValue)}
                   </span>
                )}
              </div>
            </div>

          </div>

          {/* Rodapé Central (Fornecedor) - Apenas em modo Normal */}
          {!isOffer && supplier && (
            <div className="text-[7px] text-black font-bold uppercase tracking-widest text-center mt-auto truncate w-full">
              {supplier}
            </div>
          )}
        </div>

        {/* Código de Barras Vertical (SAP) - Apenas em modo Normal */}
        {!isOffer && code && (
          <div className="absolute right-[11.5mm] top-0 bottom-0 w-[11mm] flex items-center justify-center">
             <BarcodeSAP 
               value={code} 
               orientation="vertical"
               height="28mm" 
               width="8mm" 
             />
          </div>
        )}

        {/* Blocos Verticais de Códigos no Canto Direito - Apenas em modo Normal */}
        {!isOffer && (
          <div className="absolute right-[0.5mm] top-0 bottom-0 flex flex-row-reverse items-center gap-0.5 text-[8.5px] text-black font-mono leading-none font-bold">
            {/* Coluna: SAP e REF */}
            <div className="flex flex-col justify-center items-center h-full w-[4.5mm]">
               <div className="rotate-90 whitespace-nowrap whitespace-pre">
                 {code ? `SAP: ${code}` : ''} {reference ? `  REF: ${reference}` : ''}
               </div>
            </div>
            {/* Coluna: EAN */}
            <div className="flex flex-col justify-center items-center h-full w-[4mm]">
               <div className="rotate-90 whitespace-nowrap">
                 {ean ? `EAN: ${ean}` : ''}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
