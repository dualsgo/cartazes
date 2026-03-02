'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PosterForm } from '@/app/components/poster-form';
import { PosterPreview } from '@/app/components/poster-preview';
import { PosterPreviewAereo } from '@/app/components/poster-preview-aereo';
import { PosterPreviewDefeito } from '@/app/components/poster-preview-defeito';
import type { PosterData } from '@/app/lib/types';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';


/** Escala o strip Aéreo (190mm×69mm = 718×261px) para caber no container pai */
function AereoScaleWrapper({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const applyScale = () => {
      const scale = outer.clientWidth / 718;
      inner.style.transform = `scale(${scale})`;
    };

    applyScale();
    const ro = new ResizeObserver(applyScale);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      style={{
        width: '100%',
        aspectRatio: '190 / 69',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="border border-border shadow-sm"
    >
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '718px',
          height: '261px',
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Escala um cartaz Relíquias/Avaria (148,5mm × 105mm ≈ 561 × 397 px a 96 dpi) para caber no container pai */
function ReliquiasScaleWrapper({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // 148,5mm × 105mm a 96 dpi (1 mm = 3.7795 px)
  const BASE_W = 561; // ≈ 148.5 * 3.7795
  const BASE_H = 397; // ≈ 105 * 3.7795

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const applyScale = () => {
      const scaleX = outer.clientWidth / BASE_W;
      const scaleY = outer.clientHeight / BASE_H;
      const scale = Math.min(scaleX, scaleY);
      inner.style.transform = `scale(${scale})`;
    };

    applyScale();
    const ro = new ResizeObserver(applyScale);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      style={{
        width: '100%',
        maxWidth: `${BASE_W}px`,
        aspectRatio: `${BASE_W} / ${BASE_H}`,
        position: 'relative',
        overflow: 'hidden',
      }}
      className="border border-border shadow-sm"
    >
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${BASE_W}px`,
          height: `${BASE_H}px`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}



export default function Home() {
  const [posterType, setPosterType] = useState<
    'reliquias' | 'aereo' | 'avaria'
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
    aereo: 4,
    avaria: 4,
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
            posterType === 'reliquias' || posterType === 'avaria'
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
    } else {
      // Relíquias e Avaria
      style.innerHTML = `
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
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

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="no-print shrink-0 px-4 py-3 border-b bg-card">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                P%
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold">CARTAZES</h1>
          </div>
          <Button
            onClick={handlePrint}
            className="transition-transform active:scale-95"
          >
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </header>

      <div className="print-container" style={{ display: 'none' }}>
        {posterType === 'aereo' ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              gap: '12mm'
            }}
          >
            {postersData.slice(0, 2).map((data, index) => (
              <div key={index} style={{ flex: 1, maxHeight: 'calc(50% - 6mm)' }}>
                <PosterPreviewAereo {...data} />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)',
              width: '100%',
              height: '100%',
              padding: '2% 0', // Provides the ~10% extra top and bottom margins
              boxSizing: 'border-box',
              transform: 'scale(0.86)', // Scales proportionally to prevent bleeding
              transformOrigin: 'center',
            }}
          >
            {postersData.map((data, index) => (
              <div 
                key={index}
                className="w-full h-full p-1"
                style={{ overflow: 'hidden' }}
              >
                {posterType === 'reliquias' ? (
                  <PosterPreview {...data} />
                ) : (
                  <PosterPreviewDefeito {...data} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <main className="no-print flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 md:grid-cols-5">
          <div className="md:col-span-2 h-full overflow-y-auto border-r border-border px-4 py-4 flex flex-col gap-4">
            <Tabs
              value={posterType}
              onValueChange={value =>
                setPosterType(value as 'reliquias' | 'aereo' | 'avaria')
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reliquias">Relíquias</TabsTrigger>
                <TabsTrigger value="avaria">Avaria</TabsTrigger>
                <TabsTrigger value="aereo">Aéreo</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs
              value={activeFormTab}
              onValueChange={setActiveFormTab}
              className="w-full"
            >
              <TabsList
                className={cn(
                  'grid w-full',
                  posterType === 'aereo' ? 'grid-cols-2' : 'grid-cols-4'
                )}
              >
                {postersData.slice(0, posterType === 'aereo' ? 2 : 4).map((_, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    Cartaz {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              {postersData.map((poster, index) => (
                <TabsContent key={index} value={index.toString()}>
                  <PosterForm
                    data={poster}
                    setData={handlePosterDataChange(index)}
                    posterType={posterType}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="md:col-span-3 h-full flex flex-col px-4 py-4 gap-2 overflow-hidden">
            <p className="text-xs text-muted-foreground text-center shrink-0">
              Pré-visualização — Cartaz {activeIndex + 1} de {posterType === 'aereo' ? 2 : 4}
            </p>

            <div className="flex-1 min-h-0 flex items-center justify-center">
              {posterType === 'aereo' ? (
                <AereoScaleWrapper>
                  <PosterPreviewAereo {...activeData} />
                </AereoScaleWrapper>
              ) : (
                 <ReliquiasScaleWrapper>
                    {posterType === 'reliquias' ? (
                        <PosterPreview {...activeData} />
                    ) : (
                        <PosterPreviewDefeito {...activeData} />
                    )}
                </ReliquiasScaleWrapper>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center shrink-0">
              Ao imprimir, todos os {posterType === 'aereo' ? 2 : 4} cartazes serão
              {posterType === 'aereo'
                ? ' impressos em 2 strips por folha A4 retrato'
                : ' dispostos em grade 2×2 (A4 paisagem)'}.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
