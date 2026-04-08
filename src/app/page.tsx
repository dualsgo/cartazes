'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PosterForm } from '@/app/components/poster-form';
import { PosterPreview } from '@/app/components/poster-preview';
import { PosterPreviewAereo } from '@/app/components/poster-preview-aereo';
import { PosterPreviewDefeito } from '@/app/components/poster-preview-defeito';
import { PosterPreviewEtiqueta } from '@/app/components/poster-preview-etiqueta';
import { PosterPreviewTotem } from '@/app/components/poster-preview-totem';
import { DisclaimerModal } from '@/app/components/disclaimer-modal';
import { AboutPanel } from '@/app/components/about-panel';
import { DatabasePanel } from '@/app/components/database-panel';
import { SettingsDialog } from '@/app/components/settings-dialog';
import type { PosterData, PosterSettings, PosterType } from '@/app/lib/types';
import { Printer, Plus, Trash2, FileStack, PackageOpen, Info, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// The PosterType definition was moved to '@/app/lib/types'
// type PosterType = 'reliquias' | 'ofertas-imperdiveis' | 'aereo' | 'avaria' | 'etiqueta' | 'totem' | 'leve-pague-a4' | 'leve-pague-a6' | 'combo-a4' | 'combo-a6';

const PER_PAGE: Record<PosterType, number> = {
  reliquias: 4,
  'ofertas-imperdiveis': 4,
  aereo: 4,           // 4 por página (cada um ocupa 4 espaços de gôndola 2x2)
  avaria: 4,
  etiqueta: 16,
  totem: 1,
};

// Dimensões do cartaz individual para o preview (px)
const SINGLE_DIMS: Record<PosterType, { w: number; h: number }> = {
  reliquias:            { w: 491, h: 340 },
  'ofertas-imperdiveis':{ w: 491, h: 340 },
  aereo:                { w: 760, h: 268 },  // proporcional a 190mm x 67mm (4px/mm)
  avaria:               { w: 491, h: 340 },
  etiqueta:             { w: 340, h: 127 },
  totem:                { w: 794, h: 1123 }, // A4 a 96dpi (210×297mm em pixels de tela)
};

// Orientação de impressão por tipo de cartaz
const POSTER_ORIENTATION: Record<PosterType, 'portrait' | 'landscape'> = {
  reliquias:            'landscape',
  'ofertas-imperdiveis':'landscape',
  aereo:                'portrait',
  avaria:               'landscape',
  etiqueta:             'portrait',
  totem:                'portrait',
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
  supplier: '',
});

/* ─────────────────────────── SinglePosterPreview ─────────────────────────── */
// Mostra um cartaz individual em fundo cinza (simulação de papel).
function SinglePosterPreview({
  data,
  posterType,
  isReady,
  settings,
}: {
  data: PosterData;
  posterType: PosterType;
  isReady: boolean;
  settings: PosterSettings;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);
  const { w, h } = SINGLE_DIMS[posterType];

  useEffect(() => {
    // Recalcula escala quando o tipo muda
    setReady(false);

    const outer = outerRef.current;
    if (!outer) return;

    const apply = () => {
      const cw = outer.clientWidth;
      const ch = outer.clientHeight;
      if (cw === 0 || ch === 0) return;
      setScale(Math.min(cw / w, ch / h) * 0.88);
      setReady(true);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [posterType, w, h]);

  // O outerRef SEMPRE existe no DOM para que o ResizeObserver funcione.
  // O conteúdo interno muda conforme isReady.
  return (
    <div
      ref={outerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#b0b8c4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!isReady ? (
        <div
          className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-6"
          style={{ backgroundColor: 'transparent' }}
        >
          <PackageOpen className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">Busque um produto para ver o cartaz</p>
          <p className="text-xs opacity-60 text-center">Use o campo de busca ao lado para localizar ou cadastrar o produto</p>
        </div>
      ) : (
        <div
          style={{
            width: `${w}px`,
            height: `${h}px`,
            flexShrink: 0,
            transformOrigin: 'center center',
            transform: `scale(${scale})`,
            visibility: ready ? 'visible' : 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 8px 32px -4px rgb(0 0 0 / 0.35)',
            overflow: 'hidden',
          }}
        >
          {posterType === 'reliquias'           && <PosterPreview {...data} isImperdiveis={false} settings={settings} />}
          {posterType === 'ofertas-imperdiveis' && <PosterPreview {...data} isImperdiveis={true}  settings={settings} />}
          {posterType === 'aereo'               && <PosterPreviewAereo {...data} />}
          {posterType === 'avaria'              && <PosterPreviewDefeito {...data} settings={settings} />}
          {posterType === 'etiqueta'            && <PosterPreviewEtiqueta {...data} />}
          {posterType === 'totem'               && <PosterPreviewTotem {...data} settings={settings} />}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── renderPageGrid ──────────────────────────────── */
function PageGrid({
  items,
  posterType,
  perPage,
  settings
}: {
  items: PosterData[];
  posterType: PosterType;
  perPage: number;
  settings: PosterSettings;
}) {
  const empties = Array.from({ length: perPage - items.length });

  if (posterType === 'aereo') {
    // 4 cartazes por página portrait, cada um ocupando 2 colunas e 2 linhas de gôndola (180mm x 67mm)
    // Segue o gabarito original das etiquetas de gôndola
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '190mm', 
        gridTemplateRows: 'repeat(4, 67mm)', 
        gap: '0', 
        paddingTop: '13.5mm', 
        paddingBottom: '13.5mm', 
        paddingLeft: '11mm', 
        paddingRight: '9mm', 
        width: '100%', 
        height: '100%', 
        boxSizing: 'border-box', 
        backgroundColor: 'white' 
      }}>
        {items.map((d: PosterData, i: number) => (
          <div key={i} style={{ width: '190mm', height: '67mm', overflow: 'hidden' }}>
            <PosterPreviewAereo {...d} />
          </div>
        ))}
        {empties.map((_, i: number) => <div key={`e${i}`} />)}
      </div>
    );
  }
  if (posterType === 'etiqueta') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '90mm 90mm', gridTemplateRows: 'repeat(8, 33.5mm)', gap: '0 6mm', paddingTop: '13.5mm', paddingBottom: '13.5mm', paddingLeft: '12.5mm', paddingRight: '11.5mm', width: '100%', height: '100%', boxSizing: 'border-box', backgroundColor: 'white' }}>
        {items.map((d: PosterData, i: number) => (<div key={i} style={{ width: '90mm', height: '33.5mm', overflow: 'hidden' }}><PosterPreviewEtiqueta {...d} /></div>))}
      </div>
    );
  }
  if (posterType === 'totem') {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
        <PosterPreviewTotem {...items[0]} settings={settings} />
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
      {items.map((d: PosterData, i: number) => (
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
              ? <PosterPreview {...(d as PosterData)} isImperdiveis={posterType === 'ofertas-imperdiveis'} settings={settings} />
              : <PosterPreviewDefeito {...(d as PosterData)} settings={settings} />}
          </div>
        </div>
      ))}
      {empties.map((_, i: number) => <div key={`e${i}`} />)}
    </div>
  );
}

/* ─────────────────────────── Home ───────────────────────────────────────── */
export default function Home() {
  const [posterType, setPosterType] = useState<PosterType>('reliquias');
  const [queue, setQueue] = useState<PosterData[]>([]);
  const [currentPoster, setCurrentPoster] = useState<PosterData>(initialPosterData());
  const [isProductReady, setIsProductReady] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [settings, setSettings] = useState<PosterSettings>({
    maxInstallments: 6,
    minInstallmentAmount: 30,
  });

  // Load settings
  useEffect(() => {
    const saved = localStorage.getItem('poster-settings');
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const saveSettings = (newSettings: PosterSettings) => {
    setSettings(newSettings);
    localStorage.setItem('poster-settings', JSON.stringify(newSettings));
  };

  const perPage    = PER_PAGE[posterType as PosterType];
  const totalPages = queue.length > 0 ? Math.ceil(queue.length / perPage) : 0;

  // Update print CSS immediately when poster type changes
  useEffect(() => {
    const styleId = 'print-page-style';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    const o = POSTER_ORIENTATION[posterType as PosterType];
    style.innerHTML = `@media print { @page { size: A4 ${o}; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; } }`;
  }, [posterType]);

  const handlePosterTypeChange = (newType: PosterType) => {
    setPosterType(newType);
    setQueue([]);
    setCurrentPoster({
      ...initialPosterData(),
      posterSubType: ['reliquias', 'ofertas-imperdiveis', 'avaria'].includes(newType) ? 'offer' : 'normal',
    });
    setIsProductReady(false);
    setFormKey((k: number) => k + 1);
  };

  const handleAddToQueue = () => {
    if (!isProductReady) return;
    setQueue((prev: PosterData[]) => [...prev, { ...currentPoster }]);
    setCurrentPoster({
      ...initialPosterData(),
      posterSubType: currentPoster.posterSubType,
      paymentOption: currentPoster.paymentOption,
      defectType: currentPoster.defectType,
      customDefectDiscount: currentPoster.customDefectDiscount,
    });
    setIsProductReady(false);
    setFormKey((k: number) => k + 1);
  };

  const handleRemoveFromQueue = (index: number) => {
    setQueue((prev: PosterData[]) => prev.filter((_: PosterData, i: number) => i !== index));
  };

  /* Print content: one div per page, each with page-break */
  const renderPrintContent = () => {
    if (queue.length === 0) return null;
    const pages: PosterData[][] = [];
    for (let i = 0; i < queue.length; i += perPage) {
      pages.push(queue.slice(i, i + perPage));
    }
    const orientation = POSTER_ORIENTATION[posterType as PosterType];
    return Array.from({ length: totalPages }).map((_, pageIdx: number) => {
      const pageItems = queue.slice(pageIdx * perPage, (pageIdx + 1) * perPage);
      return (
        <div
          key={pageIdx}
          className="print-page bg-white"
          style={{
            width:          orientation === 'landscape' ? '297mm'  : '210mm',
            height:         orientation === 'landscape' ? '210mm'  : '297mm',
            pageBreakAfter: pageIdx < totalPages - 1    ? 'always' : 'auto',
            breakAfter:     pageIdx < totalPages - 1    ? 'page'   : 'auto',
          }}
        >
          <PageGrid items={pageItems} posterType={posterType as PosterType} perPage={perPage} settings={settings} />
        </div>
      );
    });
  };

  const orientation = POSTER_ORIENTATION[posterType as PosterType];

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

      {/* Modais */}
      <DisclaimerModal />
      <AboutPanel open={showAbout} onClose={() => setShowAbout(false)} />
      <DatabasePanel open={showDatabase} onClose={() => setShowDatabase(false)} />

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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDatabase(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-border/50 hover:border-border"
                title="Gerenciar banco de dados"
              >
                <Database className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Banco de Dados</span>
              </button>
              <button
                onClick={() => setShowAbout(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-border/50 hover:border-border"
                title="Sobre esta ferramenta"
              >
                <Info className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sobre</span>
              </button>
              <SettingsDialog settings={settings} onSave={saveSettings} />
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
                  key={`form-${formKey}`}
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
                            {pageItems.map((item: PosterData, itemIdx: number) => {
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

            <div className="flex-1 min-h-0 relative border rounded border-border overflow-hidden">
            {/* Wrapper absoluto garante dimensões confiáveis para o ResizeObserver */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <SinglePosterPreview
                  data={currentPoster}
                  posterType={posterType}
                  isReady={isProductReady}
                  settings={settings}
                />
              </div>
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
