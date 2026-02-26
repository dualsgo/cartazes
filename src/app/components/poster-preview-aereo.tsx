'use client';

import type { PosterData } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
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

  const installmentText =
    paymentOption === 'installment' && maxInstallments > 1 ? (
      <div className="font-headline text-center font-bold text-xs mt-1">
        ou em até {maxInstallments}x de R$ {formatCurrency(installmentValue)}
      </div>
    ) : null;

  return (
    <Card className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body">
      <div className="flex h-full w-full">
        {/* Left Column */}
        <div className="w-1/2 p-[0.15cm] flex flex-col justify-between">
          <div>
            {isOffer ? (
              <OfertasHeader textSize={30} />
            ) : (
              <RiHappyHeader textSize={30} />
            )}
            <h2 className="font-headline font-bold uppercase text-base leading-tight break-words text-center my-2">
              {description}
            </h2>
            {isOffer && (
              <div
                className={cn(
                  'text-black transition-opacity text-left',
                  valDe > valPor ? 'opacity-100' : 'opacity-0'
                )}
              >
                <span className="text-sm block font-headline">DE:</span>
                <span className="font-bold line-through text-2xl font-headline">
                  R$ {formatCurrency(valDe)}
                </span>
              </div>
            )}
          </div>
          <div className="text-[8px] flex justify-start">
            <span>
              EAN/SAP: <b className="font-bold">{code}</b>
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2 flex flex-col justify-between p-[0.15cm]">
          {isOffer ? (
            <>
              <div className="flex justify-center">
                <div
                  className={cn(
                    'bg-black text-white text-center font-headline font-black transition-opacity flex flex-col items-center justify-center print:color-adjust-exact py-1 w-full',
                    discount > 0 ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {discount > 0 && (
                    <div>
                      <span className="text-base leading-none">
                        DESCONTO DE
                      </span>
                      <br />
                      <span className="text-3xl leading-none">{discount}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-end">
                  <span className="font-headline text-lg font-bold mr-1">
                    POR
                  </span>
                  <div className="flex items-baseline">
                    <span className="font-headline text-base mr-1">R$</span>
                    <span className="font-headline text-4xl leading-none font-black">
                      {porInteger}
                    </span>
                    <span className="font-headline text-xl font-black">
                      ,{porDecimal}
                    </span>
                    {valPor > 0 && (
                      <div className="ml-1 font-bold self-end mb-1 flex items-baseline space-x-1">
                        <span className="text-xs">un.</span>
                        <span className="text-[9px]">à vista</span>
                      </div>
                    )}
                  </div>
                </div>
                {installmentText}
              </div>
            </>
          ) : (
            <>
              <div />
              <div className="flex flex-col justify-center items-center gap-2">
                <div className="text-black font-bold flex flex-col items-center">
                  <div className="flex items-baseline">
                    <span className="font-headline text-sm mr-1">R$</span>
                    <span className="font-headline text-5xl leading-none">
                      {porInteger}
                    </span>
                    <span className="font-headline text-2xl">
                      ,{porDecimal}
                    </span>
                    {valPor > 0 && (
                      <span className="text-sm font-bold self-end mb-1 ml-1">
                        un.
                      </span>
                    )}
                  </div>
                </div>
                {installmentText}
              </div>
            </>
          )}

          <div className="flex-shrink-0 text-[8px] text-right">
            <span>
              Referencia: <b className="font-bold">{reference}</b>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}