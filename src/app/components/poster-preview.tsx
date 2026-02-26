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
      <div className="font-headline text-center font-bold text-xs mt-1">
        ou em até {maxInstallments}x de R$ {formatCurrency(installmentValue)}
      </div>
    ) : null;

  return (
    <Card className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body">
      <div className="flex h-full w-full">
        {/* Left Column */}
        <div className="w-1/2 p-[0.25cm] flex flex-col justify-between">
          <div>
            <OfertasHeader textSize={38} />
            <h2 className="font-headline font-black uppercase text-base leading-tight break-words text-center my-2 h-14">
              {description}
            </h2>

            {/* Preço DE — discreto, logo abaixo da descrição */}
            <div
              className={cn(
                'transition-opacity text-center',
                valDe > valPor ? 'opacity-100' : 'opacity-0'
              )}
            >
              <span className="text-sm block font-headline">DE:</span>
              <span className="font-bold line-through text-lg font-headline">
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
        <div className="w-1/2 flex flex-col justify-between items-center p-[0.25cm]">
          <div
            className={cn(
              'bg-black text-white text-center font-headline font-black transition-opacity flex flex-col items-center justify-center print:color-adjust-exact px-3 py-1',
              discount > 0 ? 'opacity-100' : 'opacity-0'
            )}
          >
            {discount > 0 && (
              <div>
                <span className="text-base leading-none">DESCONTO DE</span>
                <br />
                <span className="text-3xl leading-none">{discount}%</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-end">
              <span className="font-headline text-lg font-black mr-1">
                POR
              </span>
              <div className="flex items-baseline">
                <span className="font-headline text-sm mr-1">R$</span>
                <span className="font-headline text-4xl leading-none font-black">
                  {porInteger}
                </span>
                <span className="font-headline text-xl font-black">
                  ,{porDecimal}
                </span>
              </div>
            </div>
             {valPor > 0 && (
              <div className="font-bold flex items-baseline space-x-1">
                <span className="text-xs">un. à vista</span>
              </div>
            )}
            {installmentText}
          </div>

          <div className="text-[10px] text-right w-full">
            <span>
              Referencia: <b className="font-bold">{reference}</b>
            </span>
          </div>
        </div>

      </div>
    </Card>
  );
}
