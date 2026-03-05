'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PosterForm } from '@/app/components/poster-form';
import { PosterPreview } from '@/app/components/poster-preview';
import { PosterPreviewAereo } from '@/app/components/poster-preview-aereo';
import { PosterPreviewDefeito } from '@/app/components/poster-preview-defeito';
import { PosterPreviewEtiqueta } from '@/app/components/poster-preview-etiqueta';
import { PosterPreviewTotem } from '@/app/components/poster-preview-totem';
import type { PosterData } from '@/app/lib/types';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';


function A4PageWrapper({ children, orientation }: { children: React.ReactNode, orientation: 'portrait' | 'landscape' }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // A4 96 dpi: portrait = 794x1123, landscape = 1123x794
    const BASE_W = orientation === 'portrait' ? 794 : 1123;
    const BASE_H = orientation === 'portrait' ? 1123 : 794;

    const applyScale = () => {
      const scaleX = outer.clientWidth / BASE_W;
      const scaleY = outer.clientHeight / BASE_H;
      const scale = Math.min(scaleX, scaleY) * 0.95; 

      inner.style.transform = `scale(${scale})`;
      
      const scaledW = BASE_W * scale;
      const scaledH = BASE_H * scale;
      inner.style.left = `${(outer.clientWidth - scaledW) / 2}px`;
      inner.style.top = `${(outer.clientHeight - scaledH) / 2}px`;
    };

    applyScale();
    const ro = new ResizeObserver(applyScale);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [orientation]);

  return (
    <div
      ref={outerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: orientation === 'portrait' ? '794px' : '1123px',
          height: orientation === 'portrait' ? '1123px' : '794px',
          transformOrigin: 'top left',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [posterType, setPosterType] = useState<
    'reliquias' | 'ofertas-imperdiveis' | 'aereo' | 'avaria' | 'etiqueta' | 'totem'
  >('reliquias');

  const initialPosterData: PosterData = {
    description: 'DESCRIÇÃO DO PRODUTO',
    priceFrom: '',
    priceFor: '',
    code: '',
    ean: '',
    reference: '',
    paymentOption: 'normal',
    posterSubType: 'offer',
    defectType: 'embalagem_danificada',
    customDefectReason: '',
    customDefectDiscount: 20,
  };

  const posterCounts = {
    reliquias: 4,
    'ofertas-imperdiveis': 4,
    aereo: 4,
    avaria: 4,
    etiqueta: 16,
    totem: 1,
  };

  const [postersData, setPostersData] = useState<PosterData[]>([]);
  const [activeFormTab, setActiveFormTab] = useState('0');
  const activeIndex = parseInt(activeFormTab, 10);

  useEffect(() => {
    const numPosters = posterCounts[posterType];
    setPostersData(
      Array(numPosters)
        .fill(null)
        .map((_, i) => ({
          ...initialPosterData,
          posterSubType:
            posterType === 'reliquias' || posterType === 'ofertas-imperdiveis' || posterType === 'avaria'
              ? 'offer'
              : 'normal',
          description: `DESCRIÇÃO DO PRODUTO ${i + 1}`,
        }))
    );
    setActiveFormTab('0');
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posterType]);

  useEffect(() => {
    const styleId = 'print-page-style';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    if (posterType === 'aereo') {
      style.innerHTML = `
        @media print {
          @page { size: A4 portrait; margin: 1cm; }
        }
      `;
    } else if (posterType === 'etiqueta') {
      style.innerHTML = `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
        }
      `;
    } else if (posterType === 'totem') {
      style.innerHTML = `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
        }
      `;
    } else {
      // Relíquias e Avaria
      style.innerHTML = `
        @media print {
          @page { size: A4 landscape; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `;
    }
  }, [posterType]);

  const handlePosterDataChange = useCallback(
    (index: number) => (updater: React.SetStateAction<PosterData>) => {
      setPostersData(prevData => {
        const newPostersData = [...prevData];
        const currentPosterData = newPostersData[index];
        const newPosterDataValue =
          typeof updater === 'function'
            ? updater(currentPosterData)
            : updater;
        newPostersData[index] = newPosterDataValue;
        return newPostersData;
      });
    },
    []
  );

  const handlePrint = () => {
    window.print();
  };

  if (postersData.length === 0) {
    return null;
  }

  const activeData = postersData[activeIndex] ?? postersData[0];

  const renderA4PageContent = () => {
    if (posterType === 'aereo') {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            gap: '12mm',
            padding: '1cm'
          }}
        >
          {postersData.slice(0, 2).map((data, index) => (
            <div key={index} style={{ flex: 1, maxHeight: 'calc(50% - 6mm)' }}>
              <PosterPreviewAereo {...data} />
            </div>
          ))}
        </div>
      );
    } else if (posterType === 'etiqueta') {
      return (
        <div
          className="etiqueta-print-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '90mm 90mm',
            gridTemplateRows: 'repeat(8, 33.5mm)',
            gap: '0 6mm',
            paddingTop: '15mm',
            paddingBottom: '14mm',
            paddingLeft: '12mm',
            paddingRight: '12mm',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            backgroundColor: 'white',
          }}
        >
          {postersData.slice(0, 16).map((data, index) => (
            <div key={index} style={{ width: '90mm', height: '33.5mm', overflow: 'hidden' }}>
              <PosterPreviewEtiqueta {...data} />
            </div>
          ))}
        </div>
      );
    } else if (posterType === 'totem') {
      return (
        <div
          className="totem-print-grid"
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            backgroundColor: 'white',
          }}
        >
          <div style={{ width: '100%', height: '100%' }}>
            <PosterPreviewTotem {...postersData[0]} />
          </div>
        </div>
      );
    } else {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)',
            width: '100%',
            height: '100%',
            padding: '5mm',
            gap: '2mm',
            boxSizing: 'border-box',
            backgroundColor: 'white',
          }}
        >
          {postersData.map((data, index) => (
            <div 
              key={index}
              className="w-full h-full p-1 border border-border border-dashed"
              style={{ overflow: 'hidden' }}
            >
              {posterType === 'reliquias' || posterType === 'ofertas-imperdiveis' ? (
                <PosterPreview {...data} isImperdiveis={posterType === 'ofertas-imperdiveis'} />
              ) : (
                <PosterPreviewDefeito {...data} />
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground md:h-screen md:overflow-hidden">
      <header className="no-print shrink-0 px-4 py-3 border-b bg-card">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                P%
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold">GERADOR DE CARTAZES</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-muted p-1 rounded-lg flex-wrap gap-1">
              {[
                { id: 'reliquias', label: 'Relíquias' },
                { id: 'ofertas-imperdiveis', label: 'Ofertas Imperdíveis' },
                { id: 'avaria', label: 'Avarias' },
                { id: 'aereo', label: 'Aéreo' },
                { id: 'etiqueta', label: 'Gôndola (com 16)' },
                { id: 'totem', label: 'Totem' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPosterType(opt.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all whitespace-nowrap",
                    posterType === opt.id 
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-black/5"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Button
              onClick={handlePrint}
              className="transition-transform active:scale-95"
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
          </div>
        </div>
      </header>

      <div className="print-container" style={{ display: 'none' }}>
        {renderA4PageContent()}
      </div>

      <main className="no-print flex-1 flex flex-col min-h-0 md:overflow-hidden">
        <div className="flex-1 flex flex-col md:grid md:grid-cols-12 min-h-0">
          {/* Menu Lateral reduzido */}
          <div className="flex-none md:flex-auto md:col-span-4 lg:col-span-3 flex flex-col border-r border-border bg-muted/10 md:min-h-0 order-2 md:order-1 h-auto md:h-full">
      {/* Sidebar header removido, pois o Select foi para o menu superior */}

            <Tabs
              value={activeFormTab}
              onValueChange={setActiveFormTab}
              className="flex-1 flex flex-col min-h-0 w-full"
            >
              {/* Abas Fixas */}
              {posterType !== 'totem' && (
                <div className="shrink-0 px-4 pt-4 bg-muted/10">
                  <TabsList
                    className={cn(
                      'grid w-full gap-1',
                      posterType === 'aereo' ? 'grid-cols-2' : posterType === 'etiqueta' ? 'grid-cols-4' : 'grid-cols-4'
                    )}
                    style={posterType === 'etiqueta' ? { height: 'auto', paddingBottom: '0.5rem' } : undefined}
                  >
                    {postersData.slice(0, posterType === 'aereo' ? 2 : posterType === 'etiqueta' ? 16 : 4).map((_, index) => (
                      <TabsTrigger key={index} value={index.toString()} className={posterType === 'etiqueta' ? "text-[10px] px-1 h-7" : ""}>
                        {posterType === 'etiqueta' ? `Gôndola ${index + 1}` : `Cartaz ${index + 1}`}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              )}

              {/* Conteúdo da Sidebar (Rolável) */}
              <div className="flex-1 md:overflow-y-auto overflow-visible px-4 pt-4 min-h-0 custom-scrollbar">
                <div className="pb-12">
                  {postersData.map((poster, index) => (
                    <TabsContent key={index} value={index.toString()} className="m-0 border-none p-0">
                      <PosterForm
                        data={poster}
                        setData={handlePosterDataChange(index)}
                        posterType={posterType}
                      />
                    </TabsContent>
                  ))}
                </div>
              </div>
            </Tabs>
          </div>

          {/* Área de Visualização (cerca de 67% a 75%) */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col p-4 gap-2 md:overflow-hidden bg-muted/20 order-1 md:order-2 border-b border-border md:border-b-0 h-[60vh] md:h-full">
            <p className="text-xs text-muted-foreground text-center shrink-0">
              Pré-visualização — Cartaz {activeIndex + 1} de {posterType === 'aereo' ? 2 : posterType === 'etiqueta' ? 16 : posterType === 'totem' ? 1 : 4}
            </p>

            <div className="flex-1 min-h-0 flex items-center justify-center border rounded border-border bg-black/5">
              <A4PageWrapper orientation={['aereo', 'etiqueta', 'totem'].includes(posterType) ? 'portrait' : 'landscape'}>
                {renderA4PageContent()}
              </A4PageWrapper>
            </div>

            <p className="text-xs text-muted-foreground text-center shrink-0">
              Ao imprimir, todos os {posterType === 'aereo' ? 2 : posterType === 'etiqueta' ? 16 : posterType === 'totem' ? 1 : 4} cartazes serão
              {posterType === 'aereo'
                ? ' impressos em 2 strips por folha A4 retrato.'
                : posterType === 'etiqueta'
                ? ' dispostos na folha serrilhada (A4 Retrato, 16 de Gôndola).'
                : posterType === 'totem'
                ? ' impressos em página A4 inteira formato Retrato.'
                : ' dispostos em grade 2×2 (A4 paisagem).'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
