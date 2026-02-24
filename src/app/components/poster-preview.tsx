'use client';

import type { PosterData } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OfertasHeader } from './ofertas-header';

function parsePrice(price: string): number {
  return parseFloat(price.replace('.', '').replace(',', '.')) || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-br', { minimumFractionDigits: 2 });
}

export function PosterPreview({
  description,
  priceFrom,
  priceFor,
  code,
  reference,
}: PosterData) {
  const valDe = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  let discount = 0;
  if (valDe > 0 && valPor > 0 && valDe > valPor) {
    discount = Math.round(((valDe - valPor) / valDe) * 100);
  }

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  return (
    <Card className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body">
      <div className="flex h-full w-full">
        {/* Left Column */}
        <div className="w-1/2 p-[0.25cm] flex flex-col border-r-2 border-black">
          <div className="w-full">
            <OfertasHeader />
          </div>

          <div className="text-center my-1 flex-grow flex items-center justify-center">
            <h2 className="font-headline font-bold uppercase text-lg leading-tight break-words">
              {description}
            </h2>
          </div>

          <div className="flex-shrink-0">
            <div className="flex justify-around items-center gap-1 text-sm">
              <div
                className={cn(
                  'text-black transition-opacity',
                  valDe > valPor ? 'opacity-100' : 'opacity-0'
                )}
              >
                <span className="text-xs block">DE:</span>
                <span className="font-bold line-through">
                  R$ {formatCurrency(valDe)}
                </span>
              </div>

              <div className="text-black font-bold flex items-start">
                <span className="font-headline text-sm mt-1 mr-0.5">
                  R$
                </span>
                <span className="font-headline text-4xl leading-none">
                  {porInteger}
                </span>
                <span className="font-headline text-sm mt-1">
                  ,{porDecimal}
                </span>
              </div>
            </div>

            <div className="border-t-2 border-black mt-1 pt-0.5 text-xs">
              <span>
                COD: <b className="font-bold">{code}</b>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-grow flex items-center justify-center p-[0.25cm] py-0">
            <div
              className={cn(
                'bg-black text-white text-center font-headline font-black transition-opacity w-full flex flex-col items-center justify-center print:color-adjust-exact py-2',
                discount > 0 ? 'opacity-100' : 'opacity-0'
              )}
            >
              {discount > 0 && (
                <div>
                  <span className="text-xl">DESCONTO DE</span>
                  <br />
                  <span className="text-6xl leading-none">{discount}%</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 p-[0.25cm] pt-0 text-right">
            <div className="border-t-2 border-black mt-1 pt-0.5 text-xs">
              <span>
                REF: <b className="font-bold">{reference}</b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
