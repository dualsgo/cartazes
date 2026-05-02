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

  const displayDescriptionLines = truncateMultiLine(description, 20, 2);
  
  const selectedDefect = defectOptions.find(opt => opt.value === defectType);
  const discount = defectType === 'outro' 
    ? (customDefectDiscount ?? 0)
    : (selectedDefect?.discount ?? 0);

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  return (
    <div className="w-full h-full pt-[0.4cm] px-[0.35cm] pb-[0.35cm] flex flex-col items-center relative bg-white text-black font-body" style={{ fontSize: '16px' }}>
      
      {/* 1. HEADER - DUAS COLUNAS (Título Esquerda / Desconto Direita) */}
      <div className="w-full flex items-center shrink-0 mb-2">
        {/* Lado Esquerdo: Título */}
        {/* Lado Esquerdo: Título com Enfeites */}
        <div className="w-1/2 flex items-center justify-center relative h-32">
          {/* Ornaments (from OfertasHeader) */}
          <svg
            viewBox="0 0 320 100"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          >
            <defs>
              <g id="starburst-line-avaria" stroke="black" strokeWidth="1.5">
                <line y1="-7" y2="-5" />
              </g>
              <g id="starburst-avaria">
                <use href="#starburst-line-avaria" />
                <use href="#starburst-line-avaria" transform="rotate(30)" />
                <use href="#starburst-line-avaria" transform="rotate(60)" />
                <use href="#starburst-line-avaria" transform="rotate(90)" />
                <use href="#starburst-line-avaria" transform="rotate(120)" />
                <use href="#starburst-line-avaria" transform="rotate(150)" />
                <use href="#starburst-line-avaria" transform="rotate(180)" />
                <use href="#starburst-line-avaria" transform="rotate(210)" />
                <use href="#starburst-line-avaria" transform="rotate(240)" />
                <use href="#starburst-line-avaria" transform="rotate(270)" />
                <use href="#starburst-line-avaria" transform="rotate(300)" />
                <use href="#starburst-line-avaria" transform="rotate(330)" />
              </g>
            </defs>

            <g fill="none" stroke="black" strokeWidth="2.5">
              {/* Top-left arc */}
              <path d="M 50,32 A 15 15 0 0 1 65,17" />
              <path d="M 45,32 A 20 20 0 0 1 65,12" />
              <path d="M 40,32 A 25 25 0 0 1 65,7" />

              {/* Top-right lines */}
              <path d="M 255,15 L 275,35 M 260,15 L 280,35 M 265,15 L 285,35 M 270,15 L 290,35" />

              {/* Bottom-left wave */}
              <path d="M 40,85 C 50,75 65,95 75,85" />

              {/* Bottom-right zigzag */}
              <path d="M 240,90 L 245,85 L 250,90 L 255,85 L 260,90 L 265,85 L 270,90" />
            </g>
            
            {/* Starbursts */}
            <use href="#starburst-avaria" transform="translate(95, 30)" />
            <use href="#starburst-avaria" transform="translate(140, 88)" />
          </svg>

          <div 
            className="relative z-10 flex flex-col leading-none uppercase select-none items-center scale-[0.79] origin-center text-black"
            style={{ fontFamily: "'Lilita One', cursive" }}
          >
            {/* Bloco BRINQUEDO */}
            <div className="relative flex flex-col items-center">
              <span className="text-[1.1em] font-medium lowercase absolute -top-[0.8em] left-[18%] z-10">todo</span>
              <span className="text-[2.2em] font-black tracking-tighter">BRINQUEDO</span>
            </div>
            {/* Bloco BRINCAR */}
            <div className="relative flex flex-col items-center mt-3">
              <span className="text-[1.2em] font-black lowercase absolute -top-[0.85em] right-[12%] z-10">quer</span>
              <span className="text-[3.0em] font-black tracking-tighter">BRINCAR</span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Desconto */}
        <div className="w-1/2 flex items-center justify-center">
          {discount > 0 && (
            <div className="w-28 h-28 bg-black text-white rounded-full flex flex-col items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <span className="text-[2.4em] font-black leading-none">{discount}%</span>
              <span className="text-[0.6em] font-black leading-none uppercase tracking-widest mt-1">DESCONTO</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. DESCRIÇÃO CENTRALIZADA */}
      <div className="flex-1 flex flex-col items-center justify-center w-full text-center px-4 overflow-hidden">
        <h2 className="font-headline font-black uppercase text-[1.1em] leading-[1.1] mb-2 line-clamp-2 text-black">
          {description}
        </h2>
        
        {/* 4. TECH INFO (SAP / EAN / REF) - Abaixo da descrição */}
        <div className="flex flex-wrap justify-center gap-x-3 text-[0.45em] font-bold text-black uppercase">
           {reference && <span>REF: {reference}</span>}
           {code && <span>SAP: {code}</span>}
           {ean && <span className="truncate max-w-[60mm]">EAN: {ean}</span>}
        </div>
      </div>

      {/* 5. PREÇOS EM LINHA (DE / POR) */}
      <div className="w-full flex items-center justify-center gap-x-12 my-4 shrink-0 px-2">
        {/* Bloco DE */}
        <div className={cn("flex flex-col items-center transition-opacity shrink-0", valDe > 0 ? 'opacity-100' : 'opacity-0')}>
           <span className="text-[0.6em] font-bold text-black uppercase mb-0.5">DE:</span>
           <div className="relative scale-x-90 origin-center">
             <span className="text-[1.4em] font-bold text-black tabular-nums">
               R$ {formatCurrency(valDe)}
             </span>
             {/* Tarja de corte inclinada fina */}
             <div className="absolute inset-x-[-2px] top-[55%] h-[0.4mm] bg-black -rotate-[10deg] pointer-events-none" />
           </div>
        </div>

        {/* Bloco POR */}
        <div className="flex flex-col items-center shrink-0 scale-[1.15] origin-center">
           <span className="text-[0.8em] font-black text-black uppercase leading-none mb-1">POR:</span>
           <div className="flex items-baseline scale-x-90 origin-center">
             <span className="text-[1.2em] font-black mr-1 leading-none">R$</span>
             <span className="text-[2.8em] font-black leading-[0.8] tabular-nums tracking-tighter">
               {porInteger},{porDecimal}
             </span>
             <span className="text-[0.6em] font-bold ml-1 uppercase self-end mb-1">un.</span>
           </div>
        </div>
      </div>

      {/* 6. RODAPÉ - Ponta de estoque + Observação */}
      <div className="w-full flex flex-col items-center pt-3 text-center shrink-0">
        <p className="text-[0.55em] font-black text-black uppercase leading-tight tracking-tight">
          Item de ponta de estoque, vendido no estado. Não possui direito a troca.
        </p>
        {defectNote && (
          <p className="text-[0.45em] font-bold text-black uppercase mt-1">
            OBS: {defectNote.slice(0, 73)}{defectNote.length > 73 ? '...' : ''}
          </p>
        )}
      </div>

    </div>
  );
}
