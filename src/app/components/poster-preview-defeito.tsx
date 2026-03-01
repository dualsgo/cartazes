'use client';

import type { PosterData } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AvariaHeader } from './avaria-header';

function parsePrice(price: string): number {
  return parseFloat(price.replace('.', '').replace(',', '.')) || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-br', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const defectOptions = [
    { value: 'embalagem_danificada', label: 'Embalagem Danificada', discount: 20 },
    { value: 'marcas_de_uso', label: 'Marcas de Uso', discount: 30 },
    { value: 'pelucia_suja', label: 'Pelúcia Suja', discount: 40 },
    { value: 'peca_faltando', label: 'Peça Faltando', discount: 50 },
    { value: 'outro', label: 'Outro (descrever)', discount: null },
];

export function PosterPreviewDefeito({
  description,
  priceFrom,
  priceFor,
  code,
  reference,
  paymentOption,
  defectType,
  customDefectReason,
  customDefectDiscount,
  defectNote,
}: PosterData) {
  const valDe = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const selectedDefect = defectOptions.find(opt => opt.value === defectType);
  
  const discount = defectType === 'outro' 
    ? (customDefectDiscount ?? 0)
    : (selectedDefect?.discount ?? 0);

  const reasonText = defectType === 'outro' 
    ? customDefectReason 
    : selectedDefect?.label;

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const numInstallments = valPor > 0 ? Math.floor(valPor / 29.99) : 0;
  const maxInstallments = Math.min(numInstallments, 6);
  const installmentValue = maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;

  const installmentText =
    paymentOption === 'installment' && maxInstallments > 1 ? (
      <div className="font-headline text-center font-bold text-[1.2em] leading-tight mt-1">
        ou em até {maxInstallments}x de R$ {formatCurrency(installmentValue)}
      </div>
    ) : null;
  
  let priceFontSize = description.length > 50 ? '3.5rem' : '4rem';
  if (porInteger.length >= 6) {
    priceFontSize = '2.4rem';
  } else if (porInteger.length === 5) {
    priceFontSize = '3rem';
  }

  return (
    <Card className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body relative">
      <div className="flex h-full w-full">
        {/* Left Column */}
        <div className="w-1/2 p-[0.35cm] flex flex-col justify-between">
          <div className="flex flex-col h-full">
            <AvariaHeader textSize={38} />
            <h2 className="font-headline font-black uppercase text-[1.4em] leading-tight break-words text-center my-2 grow flex items-center justify-center">
              {description}
            </h2>
            <div
              className={cn(
                'transition-opacity text-center text-[1.3em] font-headline',
                valDe > valPor ? 'opacity-100' : 'opacity-0'
              )}
            >
              <span className="block">DE:</span>
              <span className="font-bold line-through">
                R$ {formatCurrency(valDe)}
              </span>
            </div>
          </div>
          <div className="text-[0.65em] shrink-0">
            <span>
              SAP: <b className="font-bold">{code}</b>
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2 flex flex-col justify-between items-center p-[0.35cm]">
          <div
            className={cn(
              'bg-black text-white text-center font-headline font-black transition-opacity flex flex-col items-center justify-center print:color-adjust-exact px-3 py-1 w-full',
              discount > 0 ? 'opacity-100' : 'opacity-0 h-[5.5em]'
            )}
          >
            {discount > 0 && (
              <div className='flex flex-col justify-center items-center h-[5.5em]'>
                <span className="text-[1.1em] leading-none uppercase">{reasonText}</span>
                <span className="text-[2.6em] leading-none">{discount}% OFF</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center text-[1.2em] leading-none">
            <div className="flex items-end">
              <span className="font-headline text-[1.5em] font-black mr-1 self-start mt-2">
                POR
              </span>
              <div className="flex items-baseline">
                <span className="font-headline text-[1.2em] mr-1">R$</span>
                <span className="font-headline font-black" style={{ fontSize: priceFontSize }}>
                  {porInteger}
                </span>
                <span className="font-headline text-[1.8em] font-black">
                  ,{porDecimal}
                </span>
              </div>
            </div>
             {valPor > 0 && (
              <div className="font-bold flex items-baseline space-x-1">
                <span className="text-[0.9em]">un. à vista</span>
              </div>
            )}
            {installmentText}
          </div>

          <div className="text-[0.65em] text-right w-full shrink-0">
            <span>
              Ref.: <b className="font-bold">{reference}</b>
            </span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-1 left-0 right-0 px-2 flex flex-col items-center gap-0.5">
        {defectNote && (
          <p className="text-[0.5em] text-gray-500 italic text-center leading-tight max-w-full">
            {defectNote}
          </p>
        )}
        <p className="text-[0.5em] text-gray-400 text-center leading-tight">
          Item de ponta de estoque, vendido no estado. Não possui direito a troca.
        </p>
      </div>
    </Card>
  );
}
