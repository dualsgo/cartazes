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
    <Card className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body scale-90">
      <div className="flex h-full w-full">
        {/* Left Column */}
        <div className="w-1/2 p-[0.25cm] flex flex-col">
          <div>
            <OfertasHeader textSize={50} />
            <h2 className="font-headline font-black uppercase text-lg leading-tight break-words text-center my-2">
              {description}
            </h2>
          </div>
          <div className="my-auto">
            <div
              className={cn(
                'text-black transition-opacity text-left',
                valDe > valPor ? 'opacity-100' : 'opacity-0'
              )}
            >
              <span className="text-base block font-headline">DE:</span>
              <span className="font-bold line-through text-2xl font-headline">
                R$ {formatCurrency(valDe)}
              </span>
            </div>
          </div>
          <div className="text-[10px]">
            <span>
              EAN/SAP: <b className="font-bold">{code}</b>
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2 flex flex-col p-[0.25cm]">
            <div
              className={cn(
                'w-full bg-black text-white text-center font-headline font-black transition-opacity flex flex-col items-center justify-center print:color-adjust-exact px-4 py-3',
                discount > 0 ? 'opacity-100' : 'opacity-0'
              )}
            >
              {discount > 0 && (
                <div className="leading-tight">
                  <span className="text-2xl leading-none block">DESCONTO DE</span>
                  <span className="text-6xl leading-none">{discount}%</span>
                </div>
              )}
            </div>

          <div className="my-auto flex flex-col items-center">
            <div className="flex items-end justify-center flex-wrap">
              <span className="font-headline text-2xl font-black mr-3">
                POR
              </span>
              <div className="flex items-baseline">
                <span className="font-headline text-xl mr-1">R$</span>
                <span className="font-headline text-7xl leading-none font-black">
                  {porInteger}
                </span>
                <span className="font-headline text-4xl font-black">
                  ,{porDecimal}
                </span>
                {valPor > 0 && (
                  <div className="ml-2 font-bold self-end mb-1 flex items-baseline space-x-1">
                    <span className="text-lg">un.</span>
                    <span className="text-xs">à vista</span>
                  </div>
                )}
              </div>
            </div>
            {installmentText}
          </div>

          <div className="text-[10px] text-right">
            <span>
              Referencia: <b className="font-bold">{reference}</b>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
