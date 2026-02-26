'use client';

import type { PosterData } from '@/app/lib/types';
import { cn } from '@/lib/utils';
import { OfertasHeader } from './ofertas-header';
import { RiHappyHeader } from './ri-happy-header';

function parsePrice(price: string): number {
  return parseFloat(price.replace('.', '').replace(',', '.')) || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-br', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PosterPreviewAereo({
  description,
  priceFrom,
  priceFor,
  code,
  reference,
  paymentOption,
  posterSubType,
}: PosterData) {
  const valDe = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const isOffer = posterSubType === 'offer' && valDe > valPor;

  let discount = 0;
  if (isOffer) {
    discount = Math.round(((valDe - valPor) / valDe) * 100);
  }

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const numInstallments = valPor > 0 ? Math.floor(valPor / 29.99) : 0;
  const maxInstallments = Math.min(numInstallments, 6);
  const installmentValue =
    maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;

  const showInstallment = paymentOption === 'installment' && maxInstallments > 1;

  return (
    /*
     * Layout horizontal: coluna esquerda (info) + coluna direita (preço gigante)
     * Pensado para ser lido de baixo, à distância — o preço domina.
     */
    <div className="w-full h-full bg-white text-black font-body flex overflow-hidden border-b border-black/10">

      {/* ── Coluna esquerda: cabeçalho + descrição + DE + infos ── */}
      <div className="w-[45%] flex flex-col justify-between p-[0.2cm] border-r border-black/15">

        {/* Cabeçalho OFERTAS ou RI HAPPY */}
        <div>
          {isOffer ? (
            <OfertasHeader textSize={28} />
          ) : (
            <RiHappyHeader textSize={28} />
          )}

          {/* Descrição do produto — bold e legível */}
          <h2 className="font-headline font-black uppercase text-[11pt] leading-tight text-center mt-1 break-words hyphens-auto">
            {description}
          </h2>

          {/* Preço DE (riscado), só quando oferta */}
          {isOffer && valDe > valPor && (
            <div className="mt-2 text-left">
              <span className="text-[8pt] font-headline text-black/70 block">DE:</span>
              <span className="font-headline font-bold line-through text-[14pt] leading-none">
                R$ {formatCurrency(valDe)}
              </span>
            </div>
          )}
        </div>

        {/* Rodapé: EAN + Referência */}
        <div className="text-[6pt] text-black/60 space-y-0.5">
          {code && <div>EAN/SAP: <b>{code}</b></div>}
          {reference && <div>Ref.: <b>{reference}</b></div>}
        </div>
      </div>

      {/* ── Coluna direita: PREÇO — elemento dominante ── */}
      <div
        className={cn(
          'w-[55%] flex flex-col items-center justify-center print:color-adjust-exact',
          isOffer && discount > 0 ? 'bg-black text-white' : 'bg-white text-black'
        )}
      >
        {/* Badge de desconto (só oferta) */}
        {isOffer && discount > 0 && (
          <div className="text-center mb-1">
            <span className="text-[8pt] font-headline leading-none block">DESCONTO DE</span>
            <span className="text-[28pt] font-headline font-black leading-none">{discount}%</span>
          </div>
        )}

        {/* POR */}
        <div className="text-center">
          {isOffer && (
            <span className="text-[10pt] font-headline font-bold block leading-none mb-0.5">
              POR
            </span>
          )}

          {/* Preço — máximo impacto visual */}
          <div className="flex items-start justify-center leading-none">
            <span className="text-[14pt] font-headline font-black mt-1 mr-0.5">R$</span>
            <span className="text-[48pt] font-headline font-black leading-none">
              {porInteger}
            </span>
            <div className="flex flex-col items-start justify-start ml-0.5 mt-1">
              <span className="text-[22pt] font-headline font-black leading-none">
                ,{porDecimal}
              </span>
              {valPor > 0 && (
                <span className="text-[8pt] font-bold leading-none mt-0.5">un.</span>
              )}
            </div>
          </div>

          {/* À vista */}
          {valPor > 0 && !showInstallment && (
            <span className="text-[8pt] font-headline block mt-0.5">à vista</span>
          )}

          {/* Parcelamento */}
          {showInstallment && (
            <div className="text-[8pt] font-headline font-bold text-center mt-1 leading-tight">
              ou {maxInstallments}x de<br />
              <span className="text-[12pt] font-black">R$ {formatCurrency(installmentValue)}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}