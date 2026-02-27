'use client';

import type { PosterData } from '@/app/lib/types';

function parsePrice(price: string): number {
  return parseFloat(price.replace('.', '').replace(',', '.')) || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-br', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PosterPreviewAereo({
  description,
  priceFrom,
  priceFor,
  code,
  ean,
  reference,
  paymentOption,
  posterSubType,
}: PosterData) {
  const valDe  = parsePrice(priceFrom);
  const valPor = parsePrice(priceFor);

  const isOffer    = posterSubType === 'offer' && valDe > valPor;
  const discount   = isOffer ? Math.round(((valDe - valPor) / valDe) * 100) : 0;

  const [porInt, porDec] = formatCurrency(valPor).split(',');

  const numInstallments  = valPor > 0 ? Math.floor(valPor / 29.99) : 0;
  const maxInstallments  = Math.min(numInstallments, 6);
  const installmentValue = maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;
  const showInstallment  = paymentOption === 'installment' && maxInstallments > 1;

  return (
    <div style={{ width: '190mm', height: '69mm', background: 'white', color: 'black', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'inherit', boxSizing: 'border-box' }}>

      {/* TOPO: PREÇO */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '11mm', padding: '0 9.5mm', minHeight: 0 }}>

        {isOffer && discount > 0 && (
          <div style={{ flexShrink: 0, textAlign: 'center', border: '1mm solid black', padding: '2mm 4mm', lineHeight: 1 }}>
            <div style={{ fontSize: '8pt', fontWeight: 900, letterSpacing: '0.02em', fontFamily: 'inherit' }}>DESCONTO DE</div>
            <div style={{ fontSize: '33pt', fontWeight: 900, lineHeight: 1, fontFamily: 'inherit' }}>{discount}%</div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 1, gap: '1mm' }}>
          <span style={{ fontSize: '15pt', fontWeight: 900, marginTop: '2.5mm', fontFamily: 'inherit' }}>R$</span>
          <span style={{ fontSize: '61pt', fontWeight: 900, lineHeight: 1, fontFamily: 'inherit' }}>{porInt}</span>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '2.5mm' }}>
            <span style={{ fontSize: '27pt', fontWeight: 900, lineHeight: 1, fontFamily: 'inherit' }}>,{porDec}</span>
            {valPor > 0 && (
              <span style={{ fontSize: '9.5pt', fontWeight: 700, lineHeight: 1, opacity: 0.75, fontFamily: 'inherit' }}>un.</span>
            )}
          </div>
        </div>

        {showInstallment && (
          <div style={{ flexShrink: 0, textAlign: 'center', fontSize: '13.5pt', fontWeight: 700, lineHeight: 1.3, fontFamily: 'inherit' }}>
            ou {maxInstallments}x de<br />
            <span style={{ fontSize: '23pt', fontWeight: 900 }}>R$ {formatCurrency(installmentValue)}</span>
          </div>
        )}

        {valPor > 0 && !showInstallment && !isOffer && (
          <span style={{ fontSize: '11pt', fontWeight: 700, alignSelf: 'flex-end', marginBottom: '2mm', opacity: 0.65, fontFamily: 'inherit' }}>à vista</span>
        )}
      </div>

      {/* MEIO: DESCRIÇÃO */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2.8mm 9.4mm', background: 'rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '15pt', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.2, margin: 0, flex: 1, fontFamily: 'inherit', wordBreak: 'break-word' }}>
          {description}
        </h2>
        {isOffer && valDe > valPor && (
          <div style={{ flexShrink: 0, marginLeft: '7.5mm', textAlign: 'right', opacity: 0.8 }}>
            <div style={{ fontSize: '15pt', fontFamily: 'inherit' }}>DE:</div>
            <div style={{ fontSize: '24pt', fontWeight: 700, textDecoration: 'line-through', fontFamily: 'inherit' }}>R$ {formatCurrency(valDe)}</div>
          </div>
        )}
      </div>

      {/* BASE: METADADOS */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '7.5mm', padding: '2mm 9.4mm', fontSize: '9.5pt', fontFamily: 'monospace', color: 'rgba(0,0,0,0.45)' }}>
        {code      && <span>SAP: <b style={{ color: 'rgba(0,0,0,0.7)' }}>{code}</b></span>}
        {ean       && <span>EAN: <b style={{ color: 'rgba(0,0,0,0.7)' }}>{ean}</b></span>}
        {reference && <span>Ref.: <b style={{ color: 'rgba(0,0,0,0.7)' }}>{reference}</b></span>}
      </div>
    </div>
  );
}