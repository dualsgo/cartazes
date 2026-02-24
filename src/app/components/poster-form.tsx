'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { generateDescriptionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { PosterData } from '@/app/lib/types';
import { Separator } from '@/components/ui/separator';

type PosterFormProps = {
  data: PosterData;
  setData: Dispatch<SetStateAction<PosterData>>;
};

export function PosterForm({ data, setData }: PosterFormProps) {
  const [isPending, startTransition] = useTransition();
  const [keywords, setKeywords] = useState('');
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setData(prev => ({ ...prev, [id]: value }));
  };

  const handleGenerateDescription = () => {
    startTransition(async () => {
      const result = await generateDescriptionAction(keywords);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Erro de Geração',
          description: result.error,
        });
      } else {
        setData(prev => ({ ...prev, description: result.description }));
        toast({
          title: 'Descrição Gerada!',
          description: 'A nova descrição foi inserida no campo correspondente.',
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo do Cartaz</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para atualizar o cartaz em tempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Produto</Label>
            <Input
              id="description"
              value={data.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceFrom">Preço DE (R$)</Label>
              <Input
                id="priceFrom"
                type="text"
                value={data.priceFrom}
                onChange={handleInputChange}
                placeholder="Ex: 19,99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceFor">Preço POR (R$)</Label>
              <Input
                id="priceFor"
                type="text"
                value={data.priceFor}
                onChange={handleInputChange}
                placeholder="Ex: 9,99"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Cód.</Label>
              <Input id="code" value={data.code} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Ref.</Label>
              <Input
                id="reference"
                value={data.reference}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-accent" />
            Gerador de Descrição IA
          </CardTitle>
          <CardDescription>
            Sem criatividade? Deixe a IA criar uma descrição para você com base
            em palavras-chave.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keywords">Palavras-chave</Label>
            <Input
              id="keywords"
              placeholder="Ex: chocolate, oferta, cremoso"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              disabled={isPending}
            />
          </div>
          <Button
            onClick={handleGenerateDescription}
            disabled={isPending}
            className="w-full transition-all active:scale-95"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Gerar Descrição
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
