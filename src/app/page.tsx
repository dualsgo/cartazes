'use client';

import { useState } from 'react';
import { PosterForm } from '@/app/components/poster-form';
import { PosterPreview } from '@/app/components/poster-preview';
import type { PosterData } from '@/app/lib/types';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [posterData, setPosterData] = useState<PosterData>({
    description: 'DESCRIÇÃO DO PRODUTO',
    priceFrom: '0,00',
    priceFor: '0,00',
    code: '---',
    reference: '---',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="no-print p-4 border-b bg-card print:hidden">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P%</span>
            </div>
            <h1 className="font-headline text-2xl font-bold">PromoPrint</h1>
          </div>
          <Button onClick={handlePrint} className="transition-transform active:scale-95">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="no-print lg:col-span-2 flex flex-col gap-8">
            <PosterForm data={posterData} setData={setPosterData} />
          </div>
          <div className="lg:col-span-3">
            <div className="print-container sticky top-8 aspect-[297/210] w-full">
              <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                <PosterPreview {...posterData} />
                <PosterPreview {...posterData} />
                <PosterPreview {...posterData} />
                <PosterPreview {...posterData} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
