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
  supplier,
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
  const rawInstallment   = maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;
  const installmentValue = Math.ceil(rawInstallment * 100) / 100;
  const showInstallment  = paymentOption === 'installment' && maxInstallments > 1;

  return (
    <div style={{ width: '100%', height: '100%', background: 'white', color: 'black', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'inherit', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* Barra Lateral de Oferta (Lado Direito) */}
      {isOffer && (
        <div style={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          width: '18mm',
          height: '100%',
          backgroundColor: 'black',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingRight: '1mm',
          zIndex: 20
        }}>
          <div style={{ 
            fontSize: '28pt', 
            fontWeight: 900, 
            letterSpacing: '2mm',
            textTransform: 'uppercase',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: 'inherit'
          }}>
            OFERTA
          </div>
        </div>
      )}

      {/* 1. DESCRIÇÃO NO TOPO CENTRALIZADA */}
      <div style={{ padding: isOffer ? '3mm 22mm 1mm 4mm' : '3mm 8mm 1mm 8mm', textAlign: 'center', height: '18mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '24pt', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1, margin: 0, fontFamily: 'inherit', wordBreak: 'break-word', color: 'black' }}>
          {description}
        </h2>
      </div>

      {/* 2. ÁREA CENTRAL: PREÇOS E CONTEÚDO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0, gap: '1mm' }}>
        
        {/* BLOCO DE PREÇO PRINCIPAL */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5mm', width: '100%', height: '32mm', position: 'relative' }}>
          
          {/* Preço de Oferta (DE) */}
          {isOffer && valDe > valPor && (
            <div style={{ 
              position: 'absolute', 
              top: '0mm', 
              left: '8mm', 
              lineHeight: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <span style={{ fontSize: '12pt', fontWeight: 900, fontFamily: 'inherit' }}>DE:</span>
              <span style={{ fontSize: '22pt', fontWeight: 900, textDecoration: 'line-through', fontFamily: 'inherit' }}>R$ {formatCurrency(valDe)}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Preço Principal (POR / FINAL) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4mm' }}>
              {(isOffer || valDe > 0) && <span style={{ fontSize: '20pt', fontWeight: 900, fontFamily: 'inherit' }}>POR:</span>}
              <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 1, gap: '4mm' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1mm' }}>
                  <span style={{ fontSize: '20pt', fontWeight: 900, marginTop: '2.5mm', fontFamily: 'inherit' }}>R$</span>
                  <span style={{ fontSize: '82pt', fontWeight: 900, lineHeight: 0.75, fontFamily: 'inherit' }}>{porInt}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1.5mm', alignItems: 'center' }}>
                  <span style={{ fontSize: '36pt', fontWeight: 900, lineHeight: 1, fontFamily: 'inherit' }}>,{porDec}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.5mm' }}>
                    <span style={{ fontSize: '11pt', fontWeight: 900, lineHeight: 1, fontFamily: 'inherit' }}>un.</span>
                    <span style={{ fontSize: '12pt', fontWeight: 900, textTransform: 'uppercase', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>à vista</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTORNO CURVO APENAS NO PARCELAMENTO */}
        {showInstallment ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2mm 10mm',
            border: '0.4mm solid black',
            borderRadius: '10mm',
            width: '140mm',
            boxSizing: 'border-box',
            textAlign: 'center', 
            fontSize: '14pt', 
            fontWeight: 900, 
            lineHeight: 1,
            marginTop: '1mm'
          }}>
            ou em até <span style={{ fontSize: '18pt', margin: '0 2mm' }}>{maxInstallments}x</span> de <span style={{ fontSize: '28pt', fontWeight: 900, marginLeft: '2mm' }}>R$ {formatCurrency(installmentValue)}</span>
          </div>
        ) : (
          <div style={{ height: '10mm' }} />
        )}
      </div>

      {/* 3. BASE: METADADOS (DISCRETOS) */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6mm', paddingBottom: '3mm', paddingTop: '1mm', fontSize: '8.5pt', fontWeight: 700, fontFamily: 'monospace', opacity: 0.8 }}>
        {code      && <span>SAP: {code}</span>}
        {ean       && <span>EAN: {ean}</span>}
        {reference && <span>REF: {reference}</span>}
        {supplier  && <span style={{ textTransform: 'uppercase', maxWidth: '65mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>FORN: {supplier}</span>}
      </div>
    </div>
  );
}