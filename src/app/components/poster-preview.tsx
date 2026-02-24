'use client';

import type { PosterData } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    discount = Math.round(((valDe - valPor) / valPor) * 100);
  }

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  return (
    <Card className="w-full h-full overflow-hidden transition-all shadow-none border-none rounded-none bg-white text-black">
      <div className="w-full h-full p-[0.5cm] flex flex-col justify-between font-body">
        <div
          className={cn(
            'bg-primary text-primary-foreground text-center font-headline font-black rounded-md transition-all duration-300 ease-in-out',
            'py-0.5 text-2xl',
            discount > 0
              ? 'opacity-100 visible scale-100'
              : 'opacity-0 invisible scale-90'
          )}
        >
          {discount > 0 ? `${discount}% DE DESCONTO` : ''}
        </div>

        <div className="text-center my-2">
          <h2 className="font-headline font-bold uppercase text-2xl leading-tight break-words">
            {description}
          </h2>
        </div>

        <div className="flex justify-around items-center gap-2">
          <div
            className={cn(
              'text-neutral-500 transition-opacity',
              valDe > valPor ? 'opacity-100' : 'opacity-0'
            )}
          >
            <span className="text-base block">DE:</span>
            <span className="text-xl font-bold line-through">
              R$ {formatCurrency(valDe)}
            </span>
          </div>

          <div className="text-black font-bold flex items-start">
            <span className="font-headline text-xl mt-1 mr-0.5">
              R$
            </span>
            <span className="font-headline text-6xl leading-none">
              {porInteger}
            </span>
            <span className="font-headline text-xl mt-1">
              ,{porDecimal}
            </span>
          </div>
        </div>

        <div className="border-t-2 border-black mt-2 pt-1 flex justify-between text-base">
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
