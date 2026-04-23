'use client';

import type { PosterData, PosterSettings } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AvariaHeader } from './avaria-header';
import { parsePrice, formatCurrency, calculateInstallments, truncateMultiLine } from '@/app/lib/poster-utils';

const defectOptions = [
  { value: 'embalagem_danificada', label: 'Embalagem Danificada', discount: 20 },
  { value: 'marcas_de_uso',        label: 'Marcas de Uso',        discount: 30 },
  { value: 'pelucia_suja',         label: 'Pelúcia Suja',         discount: 40 },
  { value: 'peca_faltando',        label: 'Peça Faltando',        discount: 50 },
  { value: 'outro',                label: 'Outro (descrever)',     discount: null },
];

/** Tamanho dinâmico da fonte da descrição */
function descFontSize(linesCount: number): string {
  if (linesCount === 1) return '1.85em';
  return '1.55em';
}

export function PosterPreviewDefeito({
  description,
  priceFrom,
  priceFor,
  code,
  ean,
  reference,
  paymentOption,
  defectType,
  customDefectReason,
  customDefectDiscount,
  defectNote,
  settings,
}: PosterData & { settings: PosterSettings }) {
  const valDe = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const displayDescriptionLines = truncateMultiLine(description, 13, 2);

  const selectedDefect = defectOptions.find(opt => opt.value === defectType);
  
  const discount = defectType === 'outro' 
    ? (customDefectDiscount ?? 0)
    : (selectedDefect?.discount ?? 0);

  const reasonText = defectType === 'outro' 
    ? customDefectReason 
    : selectedDefect?.label;

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const { maxInstallments, installmentValue } = calculateInstallments(valPor, settings);
  const showInstallment  = paymentOption === 'installment' && maxInstallments > 1;
  const installmentText  = showInstallment ? (
    <div className="font-headline text-center font-bold text-[1.2em] leading-tight h-[1.2em] mt-1 pt-[2px]">
      ou em até {maxInstallments}x de R$ {formatCurrency(installmentValue)}
    </div>
  ) : (
    <div className="h-[1.2em] mt-1 pt-[2px]"></div>
  );
  
  let priceFontSize = '4rem';
  if (porInteger.length >= 6) priceFontSize = '2.6rem';
  else if (porInteger.length === 5) priceFontSize = '3.2rem';

  return (
    <div className="w-full h-full overflow-hidden bg-white text-black font-body relative">
      <div className="flex h-full w-full">
        {/* ── Left Column ── */}
        <div className="w-1/2 p-[0.35cm] flex flex-col overflow-hidden">

          {/* ZONA 1: Header (fixo) */}
          <div className="shrink-0">
            <AvariaHeader />
          </div>

          {/* ZONA 2: Descrição (flexível, fonte dinâmica) */}
          <div className="flex-1 flex items-center justify-center min-h-0 py-1">
            <h2 className="font-headline font-black uppercase leading-[1.05] tracking-tight text-center text-black line-clamp-3 text-[1.3em]">
              {description}
            </h2>
          </div>

          {/* ZONA 3: Preço DE + código + ref + ean (fixo) */}
          <div className="shrink-0">
            <div className={cn('transition-opacity text-center text-[1.5em] font-headline text-black', valDe > 0 ? 'opacity-100' : 'opacity-0')}>
              <span className="block">DE:</span>
              <span className="font-bold line-through">R$ {formatCurrency(valDe)}</span>
            </div>
            <div className="text-[0.65em] mt-1 text-black font-semibold leading-snug">
              <span>SAP: <b className="font-bold">{code}</b></span>
              {reference && <span className="ml-2">Ref.: <b className="font-bold">{reference}</b></span>}
              {ean && <span className="block">EAN: <b className="font-bold">{ean}</b></span>}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2 flex flex-col justify-between items-center pt-0 pr-0 pb-[0.35cm] pl-[0.35cm]">
          <div
            className={cn(
              'bg-black text-white text-center font-headline font-black transition-opacity flex flex-col items-center justify-center print:color-adjust-exact px-2 w-full shrink-0 pt-2',
              discount > 0 ? 'opacity-100' : 'opacity-0'
            )}
            style={{ height: '7.2em' }}
          >
            {discount > 0 && (
              <div className='flex flex-col items-center w-full h-full'>
                {/* MOTIVO DO DEFEITO */}
                <div className="flex items-center justify-center w-full h-[1.2em] mb-0.5 mt-1">
                   <span className="text-[0.95em] leading-tight uppercase text-center line-clamp-1">{reasonText}</span>
                </div>
                
                {/* OBSERVAÇÃO OPCIONAL */}
                <div className="flex items-center justify-center w-full h-[0.9em] mb-1.5 px-2">
                  <span className="text-[0.6em] font-medium tracking-wide leading-tight uppercase text-white text-center line-clamp-2">
                    {defectNote}
                  </span>
                </div>
                
                {/* 20% OFF */}
                <div className="flex items-center justify-center w-full flex-1 pb-1">
                  <span className="text-[2.2em] leading-none whitespace-nowrap">{discount}% OFF</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center text-[1.3em] leading-none text-black w-full min-w-0 px-1 flex-1 pt-1">
            <span className="font-headline text-[0.8em] font-black w-full text-center shrink-0 mb-[-0.2em] z-10">
              POR
            </span>
            <div className="flex items-end max-w-full overflow-hidden shrink-0">
              <div className="flex items-baseline shrink-0 tracking-tighter">
                <span className="font-headline text-[1.25em] mr-1">R$</span>
                <span className="font-headline font-black leading-none" style={{ fontSize: priceFontSize }}>
                  {porInteger}
                </span>
                <span className="font-headline text-[1.45em] font-black">
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


        </div>
      </div>
      <div className="absolute bottom-[2px] left-0 right-0 px-2 flex flex-col items-center gap-0.5 z-10">
        <p className="text-[0.55em] text-black font-bold text-center leading-tight">
          Item de ponta de estoque, vendido no estado. Não possui direito a troca.
        </p>
      </div>
    </div>
  );
}
