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
      {/* Main content */}
      <div className="relative w-full p-[0.25cm] flex flex-col justify-between">
        <div className="absolute top-[0.25cm] right-[0.25cm] z-10 flex flex-col items-end">
          <div className="w-48">
            <OfertasHeader />
          </div>
          <div
            className={cn(
              'bg-black text-white text-center font-headline p-2 font-black transition-opacity print:color-adjust-exact mt-1',
              discount > 0 ? 'opacity-100' : 'opacity-0'
            )}
          >
            {discount > 0 && (
              <div>
                <span className="text-sm">DESCONTO DE</span>
                <br />
                <span className="text-3xl leading-none">{discount}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center my-1 pt-24">
          <h2 className="font-headline font-bold uppercase text-xl leading-tight break-words">
            {description}
          </h2>
        </div>

        <div className="flex justify-around items-center gap-1">
          <div
            className={cn(
              'text-black transition-opacity',
              valDe > valPor ? 'opacity-100' : 'opacity-0'
            )}
          >
            <span className="text-xs block">DE:</span>
            <span className="text-base font-bold line-through">
              R$ {formatCurrency(valDe)}
            </span>
          </div>

          <div className="text-black font-bold flex items-start">
            <span className="font-headline text-base mt-1 mr-0.5">
              R$
            </span>
            <span className="font-headline text-5xl leading-none">
              {porInteger}
            </span>
            <span className="font-headline text-base mt-1">
              ,{porDecimal}
            </span>
          </div>
        </div>

        <div className="border-t-2 border-black mt-1 pt-0.5 flex justify-between text-xs">
          <span>
            COD: <b className="font-bold">{code}</b>
          </span>
          <span>
            REF: <b className="font-bold">{reference}</b>
          </span>
        </div>
      </div>
    </Card>
  );
}
