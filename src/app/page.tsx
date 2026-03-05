'use client';

import { useState, useEffect, useRef } from 'react';
import { PosterForm } from '@/app/components/poster-form';
import { PosterPreview } from '@/app/components/poster-preview';
import { PosterPreviewAereo } from '@/app/components/poster-preview-aereo';
import { PosterPreviewDefeito } from '@/app/components/poster-preview-defeito';
import { PosterPreviewEtiqueta } from '@/app/components/poster-preview-etiqueta';
import { PosterPreviewTotem } from '@/app/components/poster-preview-totem';
import type { PosterData } from '@/app/lib/types';
import { Printer, Plus, Trash2, FileStack, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type PosterType = 'reliquias' | 'ofertas-imperdiveis' | 'aereo' | 'avaria' | 'etiqueta' | 'totem';

const PER_PAGE: Record<PosterType, number> = {
  reliquias: 4,
  'ofertas-imperdiveis': 4,
  aereo: 4,
  avaria: 4,
  etiqueta: 16,
  totem: 1,
};

// Dimensões aproximadas de UM cartaz no grid (px a 96dpi), para pré-visualização isolada
const SINGLE_DIMS: Record<PosterType, { w: number; h: number }> = {
  reliquias:            { w: 491, h: 340 },
  'ofertas-imperdiveis':{ w: 491, h: 340 },
  aereo:                { w: 337, h: 505 },
  avaria:               { w: 491, h: 340 },
  etiqueta:             { w: 340, h: 127 },
  totem:                { w: 794, h: 1123 },
};

const initialPosterData = (): PosterData => ({
  description: 'DESCRIÇÃO DO PRODUTO',
  priceFrom: '',
  priceFor: '',
  code: '',
  ean: '',
  reference: '',
  paymentOption: 'installment',
  posterSubType: 'offer',
  defectType: 'embalagem_danificada',
  customDefectReason: '',
  customDefectDiscount: 20,
});

/* ─────────────────────────── SinglePosterPreview ─────────────────────────── */
function SinglePosterPreview({
  data,
  posterType,
  isReady,
}: {
  data: PosterData;
  posterType: PosterType;
  isReady: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { w, h } = SINGLE_DIMS[posterType];

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const apply = () => {
      const scale = Math.min(outer.clientWidth / w, outer.clientHeight / h) * 0.92;
      inner.style.transform = `scale(${scale})`;
      inner.style.left = `${(outer.clientWidth  - w * scale) / 2}px`;
      inner.style.top  = `${(outer.clientHeight - h * scale) / 2}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [posterType, w, h]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-6">
        <PackageOpen className="h-10 w-10 opacity-30" />
        <p className="text-sm font-medium">Busque um produto para ver o cartaz</p>
        <p className="text-xs opacity-60 text-center">Use o campo de busca ao lado para localizar ou cadastrar o produto</p>
      </div>
    );
  }

  return (
    <div ref={outerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${w}px`,
          height: `${h}px`,
          transformOrigin: 'top left',
          backgroundColor: 'white',
          boxShadow: '0 4px 24px -4px rgb(0 0 0 / 0.18)',
        }}
      >
        {posterType === 'reliquias'             && <PosterPreview {...data} isImperdiveis={false} />}
        {posterType === 'ofertas-imperdiveis'   && <PosterPreview {...data} isImperdiveis={true}  />}
        {posterType === 'aereo'                 && <PosterPreviewAereo {...data} />}
        {posterType === 'avaria'                && <PosterPreviewDefeito {...data} />}
        {posterType === 'etiqueta'              && <PosterPreviewEtiqueta {...data} />}
        {posterType === 'totem'                 && <PosterPreviewTotem {...data} />}
      </div>
    </div>
  );
}

/* ─────────────────────────── renderPageGrid ──────────────────────────────── */
function PageGrid({ items, posterType, perPage }: { items: PosterData[]; posterType: PosterType; perPage: number }) {
  const empties = Array.from({ length: perPage - items.length });

  if (posterType === 'aereo') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', width: '100%', height: '100%', gap: '12mm', padding: 'calc(1cm - 2mm) 1cm 1cm 1cm' }}>
        {items.map((d, i) => (<div key={i} style={{ width: '100%', height: '100%', overflow: 'hidden' }}><PosterPreviewAereo {...d} /></div>))}
        {empties.map((_, i) => <div key={`e${i}`} />)}
      </div>
    );
  }
  if (posterType === 'etiqueta') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '90mm 90mm', gridTemplateRows: 'repeat(8, 33.5mm)', gap: '0 6mm', paddingTop: '13mm', paddingBottom: '14mm', paddingLeft: '12mm', paddingRight: '12mm', width: '100%', height: '100%', boxSizing: 'border-box', backgroundColor: 'white' }}>
        {items.map((d, i) => (<div key={i} style={{ width: '90mm', height: '33.5mm', overflow: 'hidden' }}><PosterPreviewEtiqueta {...d} /></div>))}
      </div>
    );
  }
  if (posterType === 'totem') {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: 'white' }}>
        <div style={{ width: '100%', height: '100%' }}><PosterPreviewTotem {...items[0]} /></div>
      </div>
    );
  }
  // reliquias, ofertas-imperdiveis, avaria
  return (
    <div style={{ 
      display: 'grid', 
      // Divide a "área util" (após as margens do papel de 1.5cm vert e 1.2cm horiz) 
      // exatamente ao meio, criando 4 containers idênticos.
      gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', 
      gridTemplateRows: 'minmax(0,1fr) minmax(0,1fr)', 
      width: '100%', 
      height: '100%', 
      padding: '1.5cm 1.2cm',  // Margens externas (Padrão A4 limpo)
      boxSizing: 'border-box', 
      backgroundColor: 'white' 
    }}>
      {items.map((d, i) => (
        // Cada slot tem 100% da sua metade do papel (Aprox 13.x cm por 9cm)
        <div key={i} style={{ 
          width: '100%', 
          height: '100%', 
          // O espaço em branco QUE SEPARA um painel do outro fisicamente:
          // Como as margens encostam, o top de um cartaz respira pro limite
          // e o bottom respira pro mesmo limite.
          paddingTop: '0.4cm',
          paddingBottom: '0.4cm',
          paddingLeft: '0.4cm',
          paddingRight: '0.4cm',
          boxSizing: 'border-box',
        }}>
          {/* O Cartaz real, posicionado nos limites do seu padding interno */}
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            {posterType === 'reliquias' || posterType === 'ofertas-imperdiveis'
              ? <PosterPreview {...d} isImperdiveis={posterType === 'ofertas-imperdiveis'} />
              : <PosterPreviewDefeito {...d} />}
          </div>
        </div>
      ))}
      {empties.map((_, i) => <div key={`e${i}`} />)}
    </div>
  );
}

/* ─────────────────────────── Home ───────────────────────────────────────── */
export default function Home() {
  const [posterType, setPosterType] = useState<PosterType>('reliquias');
  const [queue, setQueue] = useState<PosterData[]>([]);
  const [currentPoster, setCurrentPoster] = useState<PosterData>(initialPosterData());
  const [isProductReady, setIsProductReady] = useState(false);

  const perPage    = PER_PAGE[posterType];
  const totalPages = queue.length > 0 ? Math.ceil(queue.length / perPage) : 0;

  /* Print CSS */
  useEffect(() => {
    const styleId = 'print-page-style';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    if (posterType === 'aereo') {
      style.innerHTML = `@media print { @page { size: A4 portrait; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; } }`;
    } else if (posterType === 'etiqueta') {
      style.innerHTML = `@media print { @page { size: A4 portrait; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; } }`;
    } else if (posterType === 'totem') {
      style.innerHTML = `@media print { @page { size: A4 portrait; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; } }`;
    } else {
      style.innerHTML = `@media print { @page { size: A4 landscape; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; } }`;
    }
  }, [posterType]);

  const handlePosterTypeChange = (newType: PosterType) => {
    setPosterType(newType);
    setQueue([]);
    setCurrentPoster({
      ...initialPosterData(),
      posterSubType: ['reliquias', 'ofertas-imperdiveis', 'avaria'].includes(newType) ? 'offer' : 'normal',
    });
    setIsProductReady(false);
  };

  const handleAddToQueue = () => {
    if (!isProductReady) return;
    setQueue(prev => [...prev, { ...currentPoster }]);
    setCurrentPoster({
      ...initialPosterData(),
      posterSubType: currentPoster.posterSubType,
      paymentOption: currentPoster.paymentOption,
      defectType: currentPoster.defectType,
      customDefectDiscount: currentPoster.customDefectDiscount,
    });
    setIsProductReady(false);
  };

  const handleRemoveFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  /* Print content: one div per page, each with page-break */
  const renderPrintContent = () => {
    if (queue.length === 0) return null;
    const pages: PosterData[][] = [];
    for (let i = 0; i < queue.length; i += perPage) {
      pages.push(queue.slice(i, i + perPage));
    }
    return pages.map((pageItems, pageIdx) => (
      <div
        key={pageIdx}
        style={{
          width: '29.7cm',
          height: '21cm',
          pageBreakAfter: pageIdx < pages.length - 1 ? 'always' : 'auto',
          breakAfter:     pageIdx < pages.length - 1 ? 'page'   : 'auto',
        }}
      >
        <PageGrid items={pageItems} posterType={posterType} perPage={perPage} />
      </div>
    ));
  };

  const orientation: 'portrait' | 'landscape' = ['aereo', 'etiqueta', 'totem'].includes(posterType) ? 'portrait' : 'landscape';

  const typeOptions = [
    { id: 'reliquias',             label: 'Relíquias'          },
    { id: 'ofertas-imperdiveis',   label: 'Imperdíveis'        },
    { id: 'avaria',                label: 'Avarias'            },
    { id: 'aereo',                 label: 'Aéreo'              },
    { id: 'etiqueta',              label: 'Gôndola (com 16)'   },
    { id: 'totem',                 label: 'Totem'              },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground md:h-screen md:overflow-hidden print:w-full print:h-auto print:min-h-0 print:block">

      {/* ── Header ── */}
      <header className="no-print shrink-0 px-4 py-3 border-b bg-card">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P%</span>
            </div>
            <h1 className="font-headline text-2xl font-bold">GERADOR DE CARTAZES</h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-between">
            {/* Mobile select */}
            <div className="flex md:hidden flex-1 overflow-hidden">
              <Select value={posterType} onValueChange={v => handlePosterTypeChange(v as PosterType)}>
                <SelectTrigger className="w-full h-9 font-semibold bg-background shadow-sm border-2">
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Desktop button group */}
            <div className="hidden md:flex bg-muted p-1 rounded-lg flex-wrap gap-1">
              {typeOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handlePosterTypeChange(opt.id as PosterType)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all whitespace-nowrap',
                    posterType === opt.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-black/5'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Button
              onClick={() => window.print()}
              disabled={queue.length === 0}
              className="transition-transform active:scale-95"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir{queue.length > 0 ? ` (${totalPages}p)` : ''}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Print output (hidden on screen) ── */}
      <div className="print-container" style={{ display: 'none' }}>
        {renderPrintContent()}
      </div>

      {/* ── Main ── */}
      <main className="no-print flex-1 flex flex-col min-h-0 md:overflow-hidden">
        <div className="flex-1 flex flex-col md:grid md:grid-cols-12 min-h-0">

          {/* ── Left: Form + Add + Queue ── */}
          <div className="flex-none md:flex-auto md:col-span-5 lg:col-span-4 flex flex-col border-r border-border bg-muted/10 md:min-h-0 order-2 md:order-1 h-auto md:h-full overflow-x-hidden">
            <div className="flex-1 md:overflow-y-auto overflow-y-visible overflow-x-hidden px-4 pt-4 min-h-0 custom-scrollbar">
              <div className="pb-12 space-y-3">

                <PosterForm
                  data={currentPoster}
                  setData={setCurrentPoster}
                  posterType={posterType}
                  onLookupStatusChange={setIsProductReady}
                />

                {/* ── Add to queue button ── */}
                <Button
                  onClick={handleAddToQueue}
                  disabled={!isProductReady}
                  className={cn(
                    'w-full h-12 text-base font-semibold gap-2 transition-all',
                    isProductReady && 'ring-2 ring-primary/40 shadow-md'
                  )}
                >
                  <Plus className="h-5 w-5" />
                  Adicionar ao Lote
                </Button>

                {/* ── Queue list ── */}
                {queue.length > 0 && (
                  <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <FileStack className="h-4 w-4 text-primary" />
                        {queue.length} cartaz{queue.length !== 1 ? 'es' : ''} &middot; {totalPages} página{totalPages !== 1 ? 's' : ''}
                      </p>
                      <button
                        onClick={() => setQueue([])}
                        className="text-xs text-destructive hover:underline font-medium"
                      >
                        Limpar tudo
                      </button>
                    </div>

                    <div className="divide-y divide-border/50">
                      {Array.from({ length: totalPages }).map((_, pageIdx) => {
                        const pageItems = queue.slice(pageIdx * perPage, (pageIdx + 1) * perPage);
                        return (
                          <div key={pageIdx}>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 pt-2 pb-1">
                              Página {pageIdx + 1}
                            </p>
                            {pageItems.map((item, itemIdx) => {
                              const globalIdx = pageIdx * perPage + itemIdx;
                              return (
                                <div key={globalIdx} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/40 transition-colors">
                                  <span className="text-[10px] font-mono text-muted-foreground w-5 shrink-0 text-right">
                                    {globalIdx + 1}.
                                  </span>
                                  <span className="text-xs font-medium flex-1 truncate">{item.description}</span>
                                  {item.priceFor && (
                                    <span className="text-xs text-muted-foreground shrink-0 font-mono">
                                      R$ {item.priceFor}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleRemoveFromQueue(globalIdx)}
                                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors ml-1"
                                    title="Remover"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ── Right: Single poster preview ── */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col p-4 gap-2 md:overflow-hidden bg-muted/20 order-1 md:order-2 border-b border-border md:border-b-0 h-[60vh] md:h-full">
            <p className="text-xs text-muted-foreground text-center shrink-0">
              Pré-visualização — {orientation === 'landscape' ? 'Paisagem' : 'Retrato'}
            </p>

            <div className="flex-1 min-h-0 flex items-center justify-center border rounded border-border bg-black/5">
              <SinglePosterPreview
                data={currentPoster}
                posterType={posterType}
                isReady={isProductReady}
              />
            </div>

            <p className="text-xs text-muted-foreground text-center shrink-0">
              {queue.length === 0
                ? 'Preencha o formulário, confira o cartaz e clique em "Adicionar ao Lote".'
                : `Lote: ${queue.length} cartaz${queue.length !== 1 ? 'es' : ''} → ${totalPages} página${totalPages !== 1 ? 's' : ''} ao imprimir`}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
