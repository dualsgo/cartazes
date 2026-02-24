'use client';

import { useState, useEffect } from 'react';
import { PosterForm } from '@/app/components/poster-form';
import { PosterPreview } from '@/app/components/poster-preview';
import { PosterPreviewAereo } from '@/app/components/poster-preview-aereo';
import type { PosterData } from '@/app/lib/types';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function Home() {
  const [posterType, setPosterType] = useState<'reliquias' | 'aereo'>(
    'reliquias'
  );

  const initialPosterData: PosterData = {
    description: 'DESCRIÇÃO DO PRODUTO',
    priceFrom: '',
    priceFor: '',
    code: '',
    reference: '',
    paymentOption: 'normal',
  };

  const posterCounts = {
    reliquias: 4,
    aereo: 2,
  };

  const [postersData, setPostersData] = useState<PosterData[]>([]);
  const [activeFormTab, setActiveFormTab] = useState('0');

  useEffect(() => {
    const numPosters = posterCounts[posterType];
    setPostersData(
      Array(numPosters)
        .fill(null)
        .map((_, i) => ({
          ...initialPosterData,
          description: `DESCRIÇÃO DO PRODUTO ${i + 1}`,
        }))
    );
    setActiveFormTab('0'); // Reset to first tab
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
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
        }
      `;
    } else {
      style.innerHTML = `
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
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
    return null; // Or a loading state
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="no-print p-4 border-b bg-card print:hidden">
        <div className="container mx-auto flex justify-between items-center">
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

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="no-print lg:col-span-2 flex flex-col gap-8">
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

            <Tabs
              value={activeFormTab}
              onValueChange={setActiveFormTab}
              className="w-full"
            >
              <TabsList
                className={cn(
                  'grid w-full',
                  posterType === 'reliquias' ? 'grid-cols-4' : 'grid-cols-2'
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
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
          <div className="lg:col-span-3">
            {posterType === 'reliquias' ? (
              <div className="print-container sticky top-8 aspect-[297/210] w-full">
                <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                  {postersData.map((data, index) => (
                    <PosterPreview key={index} {...data} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="print-container sticky top-8 aspect-[210/297] w-full">
                <div className="grid grid-rows-4 h-full w-full">
                  <div />
                  {postersData[0] && <PosterPreviewAereo {...postersData[0]} />}
                  <div />
                  {postersData[1] && <PosterPreviewAereo {...postersData[1]} />}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
