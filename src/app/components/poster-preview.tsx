'use client';

import type { PosterData } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { OfertasHeader } from './ofertas-header';

function parsePrice(price: string): number {
  return parseFloat(price.replace('.', '').replace(',', '.')) || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Tamanho dinâmico da fonte da descrição baseado no comprimento */
function descFontSize(desc: string): string {
  const len = desc.length;
  if (len <= 15)  return '1.85em';
  if (len <= 25)  return '1.55em';
  if (len <= 40)  return '1.3em';
  if (len <= 60)  return '1.1em';
  return '0.95em';
}

export function PosterPreview({
  description,
  priceFrom,
  priceFor,
  code,
  ean,
  reference,
  paymentOption,
  offerValidityStart,
  offerValidity,
  isImperdiveis,
}: PosterData & { isImperdiveis?: boolean }) {
  const valDe  = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const hasDiscount = valDe > 0 && valPor > 0 && valDe > valPor;
  const discount    = hasDiscount ? Math.round(((valDe - valPor) / valDe) * 100) : 0;

  const [porInteger, porDecimal] = formatCurrency(valPor).split(',');

  const numInstallments  = valPor > 0 ? Math.floor(valPor / 29.99) : 0;
  const maxInstallments  = Math.min(numInstallments, 6);
  const rawInstallment   = maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;
  const installmentValue = Math.ceil(rawInstallment * 100) / 100;
  const installmentText  = paymentOption === 'installment' && maxInstallments > 1 ? (
    <div className="font-headline text-center font-bold text-[1.2em] leading-tight mt-1">
      ou em até {maxInstallments}x de R$ {formatCurrency(installmentValue)}
    </div>
  ) : null;

  let priceFontSize = '4rem';
  if (porInteger.length >= 6) priceFontSize = '2.6rem';
  else if (porInteger.length === 5) priceFontSize = '3.2rem';

  return (
    <Card className="w-full h-full overflow-hidden shadow-none border-none rounded-none bg-white text-black font-body relative">
      {/* Layout: duas colunas, cada uma com grid de 3 linhas fixas */}
      <div className="flex h-full w-full">

        {/* ── Coluna Esquerda ── */}
        <div className="w-1/2 p-[0.35cm] flex flex-col overflow-hidden">

          {/* ZONA 1: Header (tamanho fixo) */}
          <div className="shrink-0">
            <OfertasHeader
              textSize={60}
              title={isImperdiveis ? 'OFERTAS IMPERDÍVEIS' : 'OFERTAS'}
            />
          </div>

          {/* ZONA 2: Descrição (ocupa o espaço disponível, fonte dinâmica) */}
          <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden py-1">
            <h2
              className="font-headline font-black uppercase leading-tight break-words text-center text-black"
              style={{ fontSize: descFontSize(description) }}
            >
              {description}
            </h2>
          </div>

          {/* ZONA 3: Preço DE + rodapé códigos (tamanho fixo) */}
          <div className="shrink-0">
            <div className={`transition-opacity text-center text-[1.5em] font-headline text-black ${hasDiscount ? 'opacity-100' : 'opacity-0'}`}>
              <span className="block">DE:</span>
              <span className="font-bold line-through">R$ {formatCurrency(valDe)}</span>
            </div>
            <div className="text-[0.72em] mt-1 flex flex-wrap gap-x-2 gap-y-0 text-black font-semibold">
              {reference && <span>Ref.: <b className="font-bold">{reference}</b></span>}
              {code      && <span>SAP: <b className="font-bold">{code}</b></span>}
              {ean       && <span>EAN: <b className="font-bold">{ean}</b></span>}
            </div>
          </div>
        </div>

        {/* ── Coluna Direita ── */}
        <div className="w-1/2 flex flex-col overflow-hidden pt-0 pr-0 pb-[0.35cm] pl-[0.35cm]">

          {/* ZONA 1: Caixa preta de desconto (tamanho fixo) */}
          <div className="shrink-0 bg-black text-white text-center font-headline font-black flex flex-col items-center justify-center print:color-adjust-exact px-3 py-1 w-full h-[5.5em]">
            <div className="flex flex-col justify-center items-center h-full">
              <span className="text-[1.3em] leading-none uppercase">DESCONTO DE</span>
              <span className="text-[3em] leading-none">{discount}%</span>
            </div>
          </div>

          {/* ZONA 2: Preço POR (ocupa espaço disponível) */}
          <div className="flex-1 flex flex-col items-center justify-center text-[1.3em] leading-none text-black w-full min-w-0 px-1 min-h-0 overflow-hidden">
            <span className="font-headline text-[0.8em] font-black w-full text-center shrink-0 mb-[-0.2em] z-10">POR</span>
            <div className="flex items-end max-w-full overflow-hidden shrink-0">
              <div className="flex items-baseline shrink-0 tracking-tighter">
                <span className="font-headline text-[1.25em] mr-1">R$</span>
                <span className="font-headline font-black leading-none" style={{ fontSize: priceFontSize }}>
                  {porInteger}
                </span>
                <span className="font-headline text-[1.45em] font-black">,{porDecimal}</span>
              </div>
            </div>
            {valPor > 0 && (
              <div className="font-bold flex items-baseline space-x-1">
                <span className="text-[0.9em]">un. à vista</span>
              </div>
            )}
            {installmentText}
          </div>

          {/* ZONA 3: Validade (tamanho fixo) */}
          <div className="shrink-0 text-[0.52em] w-full leading-tight text-black font-semibold pb-1 flex flex-col items-center text-center">
            {(offerValidityStart || offerValidity) && (
              <>
                <span>
                  Oferta válida{' '}
                  {offerValidityStart && <span>de <b className="font-black">{offerValidityStart}</b>{' '}</span>}
                  {offerValidity      && <span>até <b className="font-black">{offerValidity}</b></span>}
                </span>
                <span>ou enquanto durarem os estoques.</span>
              </>
            )}
          </div>
        </div>

      </div>
    </Card>
  );
}
