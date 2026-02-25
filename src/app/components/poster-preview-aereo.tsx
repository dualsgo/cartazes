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

  const numInstallments = Math.floor(valPor / 29.99);
  const maxInstallments = Math.min(numInstallments, 6);
  const installmentValue =
    maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;

  return (
    <Card className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body">
      <div className="flex h-full w-full">
        {/* Left Column */}
        <div className="w-1/2 p-[0.15cm] flex flex-col">
          <div className="w-full">
            {isOffer ? (
              <OfertasHeader textSize={30} />
            ) : (
              <RiHappyHeader textSize={30} />
            )}
          </div>

          <div className="text-center my-1 flex items-center justify-center">
            <h2 className="font-headline font-bold uppercase text-base leading-tight break-words">
              {description}
            </h2>
          </div>

          <div className="flex-shrink-0 flex-grow flex flex-col justify-center">
            {isOffer ? (
              <>
                <div
                  className={cn(
                    'text-black transition-opacity text-center mb-1',
                    'opacity-100'
                  )}
                >
                  <span className="text-[8px] block">DE:</span>
                  <span className="font-bold line-through text-base">
                    R$ {formatCurrency(valDe)}
                  </span>
                </div>

                <div className="flex flex-col justify-center items-center gap-0">
                  <div className="text-black font-bold flex flex-col items-center">
                    <span className="font-headline text-lg font-bold">POR</span>
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
                      {valPor > 0 && (
                        <span className="text-[10px] font-bold ml-1 self-end mb-1">
                          à vista
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center gap-0 pt-4 pb-1">
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
              </div>
            )}
            <div className="mt-1 pt-0.5 text-[8px] flex justify-start">
              <span>
                EAN/SAP: <b className="font-bold">{code}</b>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2 flex flex-col justify-between p-[0.15cm]">
          <div className="flex items-center justify-center">
            <div
              className={cn(
                'bg-black text-white text-center font-headline font-black transition-opacity w-full flex flex-col items-center justify-center print:color-adjust-exact py-2',
                isOffer && discount > 0 ? 'opacity-100' : 'opacity-0'
              )}
            >
              {isOffer && discount > 0 && (
                <div>
                  <span className="text-lg leading-none">DESCONTO DE</span>
                  <br />
                  <span className="text-3xl leading-none">{discount}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-black font-bold text-xs flex items-center justify-center">
            {isOffer && paymentOption === 'installment' && maxInstallments > 1 && (
              <span className="text-sm">
                ou em até {maxInstallments}x de R${' '}
                {formatCurrency(installmentValue)}
              </span>
            )}
          </div>

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
