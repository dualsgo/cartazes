'use client';

import { useState, useEffect, useRef } from 'react';
import { PosterForm } from '@/app/components/poster-form';
import { PosterPreview } from '@/app/components/poster-preview';
import { PosterPreviewAereo } from '@/app/components/poster-preview-aereo';
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
        /* Largura sempre 100% do container pai, altura definida pelo aspectRatio */
        width: '100%',
        aspectRatio: '190 / 69',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
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

export default function Home() {
  const [posterType, setPosterType] = useState<'reliquias' | 'aereo'>(
    'reliquias'
  );

  const initialPosterData: PosterData = {
    description: 'DESCRIÇÃO DO PRODUTO',
    priceFrom: '',
    priceFor: '',
    code: '',
    ean: '',
    reference: '',
    paymentOption: 'normal',
    posterSubType: 'offer',
  };


  const posterCounts = {
    reliquias: 4,
    aereo: 4,
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
          posterSubType: posterType === 'reliquias' ? 'offer' : 'normal',
          description: `DESCRIÇÃO DO PRODUTO ${i + 1}`,
        }))
    );
    setActiveFormTab('0');
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
      style.innerHTML = `
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
        }
      `;
    }
  }, [posterType]);

  const handlePosterDataChange =
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
    };

  const handlePrint = () => {
    window.print();
  };

  if (postersData.length === 0) {
    return null;
  }

  const activeData = postersData[activeIndex] ?? postersData[0];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* ── Cabeçalho (oculto na impressão) ── */}
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

      {/* ══════════════════════════════════════════
          CONTAINER DE IMPRESSÃO — oculto na tela,
          visível apenas no @media print.
          Relíquias: grade 2×2 em A4 paisagem.
      {/* ═════════════════════════════════════════════
          CONTAINER DE IMPRESSÃO
          Relíquias: grade 2×2 em A4 paisagem.
          Aéreo: 4 strips empilhados em A4 retrato
                 cada strip ≈ 190×69mm (proporção 2.75:1)
      ════════════════════════════════════════════ */}
      <div className="print-container" style={{ display: 'none' }}>
        {posterType === 'reliquias' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              width: '100%',
              height: '100%',
            }}
          >
            {postersData.map((data, index) => (
              <PosterPreview key={index} {...data} />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
            }}
          >
            {postersData.map((data, index) => (
              <div key={index} style={{ flex: 1 }}>
                <PosterPreviewAereo {...data} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Interface de edição + Pré-visualização individual ── */}
      <main className="no-print flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-5">

          {/* Formulário — rola internamente se necessário */}
          <div className="lg:col-span-2 h-full overflow-y-auto border-r border-border px-4 py-4 flex flex-col gap-4">
            {/* Escolha do tipo */}
            <Tabs
              defaultValue="reliquias"
              onValueChange={value =>
                setPosterType(value as 'reliquias' | 'aereo')
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reliquias">Relíquias de Diversão</TabsTrigger>
                <TabsTrigger value="aereo">Aéreo</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Tabs de cada cartaz */}
            <Tabs
              value={activeFormTab}
              onValueChange={setActiveFormTab}
              className="w-full"
            >
              <TabsList
                className={cn(
                  'grid w-full',
                  posterType === 'reliquias' ? 'grid-cols-4' : 'grid-cols-4'
                )}
              >
                {postersData.map((_, index) => (
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

          {/* ── Pré-visualização — preenche toda a altura disponível ── */}
          <div className="lg:col-span-3 h-full flex flex-col px-4 py-4 gap-2 overflow-hidden">
            <p className="text-xs text-muted-foreground text-center shrink-0">
              Pré-visualização — Cartaz {activeIndex + 1} de {postersData.length}
            </p>

            {/* Área do preview: ocupa todo o espaço disponível */}
            <div className="flex-1 min-h-0 flex items-center justify-center">
              {posterType === 'reliquias' ? (
                /* A4 paisagem — max-height controla para não sair da tela */
                <div
                  className="border border-border shadow-sm overflow-hidden bg-white w-full"
                  style={{
                    aspectRatio: '297 / 210',
                    maxHeight: '100%',
                    maxWidth: '100%',
                    width: 'auto',
                  }}
                >
                  <PosterPreview {...activeData} />
                </div>
              ) : (
                <AereoScaleWrapper>
                  <PosterPreviewAereo {...activeData} />
                </AereoScaleWrapper>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center shrink-0">
              Ao imprimir, todos os {postersData.length} cartazes serão
              {posterType === 'reliquias' ? ' dispostos em grade 2×2 (A4 paisagem)' : ' impressos em 4 strips por folha A4 retrato'}.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
