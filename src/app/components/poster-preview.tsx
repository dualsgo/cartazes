'use client';

import type { PosterData } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
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

export function PosterPreview({
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

  let discount = 0;
  if (valDe > 0 && valPor > 0 && valDe > valPor) {
    discount = Math.round(((valDe - valPor) / valDe) * 100);
  }

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const numInstallments = Math.floor(valPor / 29.99);
  const maxInstallments = Math.min(numInstallments, 6);
  const installmentValue =
    maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;

  const hasInstallment = paymentOption === 'installment' && maxInstallments > 1;

  return (
    <Card className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body">
      <div className="flex h-full w-full">

        {/* ══ COLUNA ESQUERDA ══════════════════════════════ */}
        <div className="w-[45%] flex flex-col p-[0.3cm]">

          {/* OFERTAS */}
          <div className="shrink-0">
            <OfertasHeader textSize={52} />
          </div>

          {/* Descrição + DE agrupados ao centro */}
          <div className="flex-1 flex flex-col items-center justify-center py-1 gap-2">
            <h2 className="font-headline font-black uppercase text-xl leading-tight break-words text-center">
              {description}
            </h2>

            {/* Preço DE — discreto, logo abaixo da descrição */}
            <div
              className={cn(
                'transition-opacity text-center',
                valDe > valPor ? 'opacity-100' : 'opacity-0'
              )}
            >
              <span className="text-[10px] uppercase tracking-wide text-black/50 font-headline">DE:</span>
              <div className="font-headline font-bold line-through text-2xl leading-tight text-black/60">
                R$ {formatCurrency(valDe)}
              </div>
            </div>
          </div>

          {/* EAN / SAP rodapé */}
          <div className="shrink-0 mt-1 text-[8px] text-black/50 space-y-0.5">
            {code && <div>SAP: <b className="text-black">{code}</b></div>}
            {ean  && <div>EAN: <b className="text-black">{ean}</b></div>}
          </div>
        </div>

        {/* ══ COLUNA DIREITA ═══════════════════════════════ */}
        <div className="w-[55%] flex flex-col p-[0.3cm]">

          {/* Bloco de desconto — fundo preto, % dominante */}
          <div
            className={cn(
              'shrink-0 w-full bg-black text-white font-headline font-black text-center flex flex-col items-center justify-center py-3 print:color-adjust-exact transition-opacity',
              discount > 0 ? 'opacity-100' : 'opacity-0'
            )}
          >
            <span className="text-lg leading-none tracking-wide">DESCONTO DE</span>
            <span className="text-[4.5rem] leading-none">{discount}%</span>
          </div>

          {/* Preço POR — máximo possível */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">

            {/* POR + valor */}
            <div className="flex items-end justify-center gap-1 flex-wrap">
              <span className="font-headline text-2xl font-black self-end mb-1">POR</span>
              <div className="flex items-baseline">
                <span className="font-headline font-black text-xl mr-0.5">R$</span>
                <span className="font-headline font-black leading-none" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
                  {porInteger}
                </span>
                <span className="font-headline font-black" style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}>
                  ,{porDecimal}
                </span>
              </div>
            </div>

            {/* un. à vista */}
            {valPor > 0 && (
              <div className="flex items-baseline gap-1 text-black/80">
                <span className="font-bold text-base">un.</span>
                <span className="text-xs">à vista</span>
              </div>
            )}

            {/* Parcelamento */}
            {hasInstallment && (
              <div className="font-headline font-bold text-base text-center mt-1 leading-tight">
                ou em até {maxInstallments}x de R$ {formatCurrency(installmentValue)}
              </div>
            )}
          </div>

          {/* Referência rodapé */}
          <div className="shrink-0 text-[8px] text-right text-black/50">
            {reference && <>Ref.: <b className="text-black">{reference}</b></>}
          </div>
        </div>

      </div>
    </Card>
  );
}
