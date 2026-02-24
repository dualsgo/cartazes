'use client';

import { useState } from 'react';
import { PosterForm } from '@/app/components/poster-form';
import { PosterPreview } from '@/app/components/poster-preview';
import type { PosterData } from '@/app/lib/types';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const initialPosterData: PosterData = {
    description: 'DESCRIÇÃO DO PRODUTO',
    priceFrom: '',
    priceFor: '',
    code: '',
    reference: '',
  };

  const [postersData, setPostersData] = useState<PosterData[]>(() =>
    Array(4)
      .fill(null)
      .map((_, i) => ({
        ...initialPosterData,
        description: `DESCRIÇÃO DO PRODUTO ${i + 1}`,
      }))
  );

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
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="0">Cartaz 1</TabsTrigger>
                <TabsTrigger value="1">Cartaz 2</TabsTrigger>
                <TabsTrigger value="2">Cartaz 3</TabsTrigger>
                <TabsTrigger value="3">Cartaz 4</TabsTrigger>
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
            <div className="print-container sticky top-8 aspect-[297/210] w-full">
              <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                {postersData.map((data, index) => (
                  <PosterPreview key={index} {...data} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
