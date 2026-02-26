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

  const installmentText =
    paymentOption === 'installment' && maxInstallments > 1 ? (
      <div className="font-headline text-center font-bold text-lg mt-1">
        ou em até {maxInstallments}x de R$ {formatCurrency(installmentValue)}
      </div>
    ) : null;

  return (
    <Card className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body">
      <div className="flex h-full w-full">
        {/* Left Column */}
        <div className="w-1/2 p-[0.25cm] flex flex-col justify-between">
          <div>
            <OfertasHeader textSize={40} />
            <h2 className="font-headline font-black uppercase text-xl leading-tight break-words text-center my-4">
              {description}
            </h2>

            {/* Preço DE — discreto, logo abaixo da descrição */}
            <div
              className={cn(
                'transition-opacity text-center',
                valDe > valPor ? 'opacity-100' : 'opacity-0'
              )}
            >
              <span className="text-lg block font-headline">DE:</span>
              <span className="font-bold line-through text-3xl font-headline">
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

        {/* Right Column */}
        <div className="w-1/2 flex flex-col justify-between p-[0.25cm]">
          <div className="flex justify-center">
            <div
              className={cn(
                'bg-black text-white text-center font-headline font-black transition-opacity flex flex-col items-center justify-center print:color-adjust-exact px-4 py-2',
                discount > 0 ? 'opacity-100' : 'opacity-0'
              )}
            >
              {discount > 0 && (
                <div>
                  <span className="text-xl leading-none">DESCONTO DE</span>
                  <br />
                  <span className="text-5xl leading-none">{discount}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Preço POR — máximo possível */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">

            {/* POR + valor */}
            <div className="flex items-end justify-center gap-1 flex-wrap">
              <span className="font-headline text-2xl font-black self-end mb-1">POR</span>
              <div className="flex items-baseline">
                <span className="font-headline text-xl mr-1">R$</span>
                <span className="font-headline text-7xl leading-none font-black">
                  {porInteger}
                </span>
                <span className="font-headline text-4xl font-black">
                  ,{porDecimal}
                </span>
                {valPor > 0 && (
                  <div className="ml-1 font-bold self-end mb-2 flex items-baseline space-x-1">
                    <span className="text-lg">un.</span>
                    <span className="text-xs">à vista</span>
                  </div>
                )}
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
