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
    <Card className="aspect-[297/210] w-full overflow-hidden transition-all">
      <div className="w-full h-full bg-white text-black p-[1cm] flex flex-col justify-between font-body">
        <div
          className={cn(
            'bg-primary text-primary-foreground text-center font-headline font-black rounded-md transition-all duration-300 ease-in-out',
            'py-1 md:py-2 text-4xl md:text-6xl lg:text-7xl',
            discount > 0
              ? 'opacity-100 visible scale-100'
              : 'opacity-0 invisible scale-90'
          )}
        >
          {discount}% DE DESCONTO
        </div>

        <div className="text-center my-4">
          <h2 className="font-headline font-bold uppercase text-4xl md:text-5xl lg:text-6xl leading-tight break-words">
            {description}
          </h2>
        </div>

        <div className="flex justify-around items-center gap-4">
          <div
            className={cn(
              'text-neutral-500 transition-opacity',
              valDe > valPor ? 'opacity-100' : 'opacity-0'
            )}
          >
            <span className="text-xl md:text-2xl lg:text-3xl block">DE:</span>
            <span className="text-3xl md:text-4xl lg:text-5xl font-bold line-through">
              R$ {formatCurrency(valDe)}
            </span>
          </div>

          <div className="text-black font-bold flex items-start">
            <span className="font-headline text-3xl md:text-4xl lg:text-5xl mt-2 mr-1">
              R$
            </span>
            <span className="font-headline text-8xl md:text-9xl leading-none">
              {porInteger}
            </span>
            <span className="font-headline text-3xl md:text-4xl lg:text-5xl mt-2">
              ,{porDecimal}
            </span>
          </div>
        </div>

        <div className="border-t-4 border-black mt-6 pt-2 flex justify-between text-xl md:text-2xl lg:text-3xl">
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
