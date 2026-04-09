import { parsePrice, formatCurrency, truncateDescription } from '@/app/lib/poster-utils';

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
  // const discount   = isOffer ? Math.round(((valDe - valPor) / valDe) * 100) : 0; // Not used but kept for logic

  const [porInt, porDec] = formatCurrency(valPor).split(',');

  const numInstallments  = valPor > 0 ? Math.floor(valPor / 29.99) : 0;
  const maxInstallments  = Math.min(numInstallments, 6);
  const rawInstallment   = maxInstallments > 1 && valPor > 0 ? valPor / maxInstallments : 0;
  const installmentValue = Math.ceil(rawInstallment * 100) / 100;
  const showInstallment  = paymentOption === 'installment' && maxInstallments > 1;

  // Aplica o limite de caracteres na descrição
  const displayDescription = truncateDescription(description, 25);

  return (
    <div style={{ width: '100%', height: '100%', background: 'white', color: 'black', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'inherit', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* Barra Lateral de Oferta - Afastada da borda para não cortar */}
      {isOffer && (
        <div style={{ 
          position: 'absolute',
          top: '4mm',
          bottom: '4mm',
          right: '8mm', // Recuado da borda
          width: '14mm', // Mais estreita
          backgroundColor: 'black',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          borderRadius: '2mm' // Contorno para estilo premium
        }}>
          <div style={{ 
            fontSize: '24pt', 
            fontWeight: 900, 
            letterSpacing: '1.5mm',
            textTransform: 'uppercase',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: 'inherit'
          }}>
            OFERTA
          </div>
        </div>
      )}

      {/* 1. DESCRIÇÃO NO TOPO CENTRALIZADA - Padding aumentado na direita quando em oferta */}
      <div style={{ 
        padding: isOffer ? '4mm 26mm 1mm 6mm' : '4mm 8mm 1mm 8mm', 
        textAlign: 'center', 
        height: '20mm', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <h2 style={{ fontSize: '24pt', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1, margin: 0, fontFamily: 'inherit', wordBreak: 'break-word', color: 'black' }}>
          {displayDescription}
        </h2>
      </div>

      {/* 2. ÁREA CENTRAL: PREÇOS E CONTEÚDO */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 0, 
        gap: '1mm',
        paddingRight: isOffer ? '24mm' : '0', // Ajusta para não sobrepor a faixa de oferta
        paddingLeft: isOffer ? '4mm' : '0'    // Ajusta margem esquerda
      }}>
        
        {/* BLOCO DE PREÇO PRINCIPAL */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          height: '32mm', 
          position: 'relative' 
        }}>
          
          {/* Preço de Oferta (DE) - Recuado para evitar sobreposição */}
          {isOffer && valDe > valPor && (
            <div style={{ 
              position: 'absolute', 
              top: '0mm', 
              left: '4mm', // Mais à esquerda
              lineHeight: 1,
              display: 'flex',
              flexDirection: 'column',
              opacity: 0.9
            }}>
              <span style={{ fontSize: '11pt', fontWeight: 900, fontFamily: 'inherit' }}>DE:</span>
              <span style={{ fontSize: '20pt', fontWeight: 900, textDecoration: 'line-through', fontFamily: 'inherit' }}>R$ {formatCurrency(valDe)}</span>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            marginLeft: isOffer ? '14mm' : '0' // Afasta o bloco POR do DE para não sobrepor
          }}>
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

        {/* CONTORNO CURVO: Otimizado para aproveitar espaço e não cortar */}
        {showInstallment ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2mm 6mm',
            border: '0.4mm solid black',
            borderRadius: '10mm',
            width: '125mm', // Comprimido de 140mm para 125mm
            boxSizing: 'border-box',
            textAlign: 'center', 
            fontSize: '13pt', // Reduzido levemente
            fontWeight: 900, 
            lineHeight: 1,
            marginTop: '1mm'
          }}>
            ou em até <span style={{ fontSize: '17pt', margin: '0 1.5mm' }}>{maxInstallments}x</span> de <span style={{ fontSize: '26pt', fontWeight: 900, marginLeft: '1.5mm' }}>R$ {formatCurrency(installmentValue)}</span>
          </div>
        ) : (
          <div style={{ height: '10mm' }} />
        )}
      </div>

      {/* 3. BASE: METADADOS (DISCRETOS) */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6mm', paddingBottom: '3mm', paddingTop: '1mm', fontSize: '8.5pt', fontWeight: 700, fontFamily: 'monospace', opacity: 0.8, paddingRight: isOffer ? '24mm' : '0' }}>
        {code      && <span>SAP: {code}</span>}
        {ean       && <span>EAN: {ean}</span>}
        {reference && <span>REF: {reference}</span>}
        {supplier  && <span style={{ textTransform: 'uppercase', maxWidth: '55mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>FORN: {supplier}</span>}
      </div>
    </div>
  );
}
