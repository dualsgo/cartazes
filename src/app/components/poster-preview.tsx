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

  const numInstallments = Math.floor(valPor / 29);
  const maxInstallments = Math.min(numInstallments, 6);
  const installmentValue =
    maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;

  return (
    <Card className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body">
      <div className="flex h-full w-full">
        {/* Left Column */}
        <div className="w-1/2 p-[0.25cm] flex flex-col">
          <div className="w-full">
            <OfertasHeader />
          </div>

          <div className="text-center my-1 flex-grow flex items-center justify-center">
            <h2 className="font-headline font-bold uppercase text-lg leading-tight break-words">
              {description}
            </h2>
          </div>

          <div className="flex-shrink-0">
            <div
              className={cn(
                'text-black transition-opacity text-center mb-1',
                valDe > valPor ? 'opacity-100' : 'opacity-0'
              )}
            >
              <span className="text-xs block">DE:</span>
              <span className="font-bold line-through text-lg">
                R$ {formatCurrency(valDe)}
              </span>
            </div>

            <div className="flex flex-col justify-center items-center gap-1">
              <div className="text-black font-bold flex flex-col items-center">
                <span className="font-headline text-xl font-bold">POR</span>
                <div className="flex items-baseline">
                  <span className="font-headline text-base mr-1">R$</span>
                  <span className="font-headline text-5xl leading-none">
                    {porInteger}
                  </span>
                  <span className="font-headline text-2xl">,{porDecimal}</span>
                  {valPor > 0 && (
                    <span className="text-lg font-bold self-end mb-1 ml-1">
                      un.
                    </span>
                  )}
                  {valPor > 0 && (
                    <span className="text-sm font-bold ml-2 self-end mb-1">
                      à vista
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-1 pt-0.5 text-xs flex justify-start">
              <span>
                EAN/SAP: <b className="font-bold">{code}</b>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2 flex flex-col p-[0.25cm]">
          <div className="flex-grow flex items-center justify-center">
            <div
              className={cn(
                'bg-black text-white text-center font-headline font-black transition-opacity w-full flex flex-col items-center justify-center print:color-adjust-exact py-1',
                discount > 0 ? 'opacity-100' : 'opacity-0'
              )}
              style={{ height: '50%' }}
            >
              {discount > 0 && (
                <div>
                  <span className="text-2xl leading-none">DESCONTO DE</span>
                  <br />
                  <span className="text-4xl leading-none">{discount}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-black font-bold text-sm h-[2em] flex items-center justify-center">
            {paymentOption === 'installment' && maxInstallments > 1 && (
              <span>
                ou em até {maxInstallments}x de R${' '}
                {formatCurrency(installmentValue)}
              </span>
            )}
          </div>

          <div className="flex-shrink-0 text-xs text-right">
            <span>
              Referencia: <b className="font-bold">{reference}</b>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
