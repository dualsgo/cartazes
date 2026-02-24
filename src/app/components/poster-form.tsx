'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PosterData } from '@/app/lib/types';

type PosterFormProps = {
  data: PosterData;
  setData: Dispatch<SetStateAction<PosterData>>;
};

export function PosterForm({ data, setData }: PosterFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setData(prev => ({ ...prev, [id]: value }));
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
    </div>
  );
}
