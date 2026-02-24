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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type PosterFormProps = {
  data: PosterData;
  setData: Dispatch<SetStateAction<PosterData>>;
};

export function PosterForm({ data, setData }: PosterFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setData(prev => ({ ...prev, [id]: value }));
  };

  const handlePaymentOptionChange = (value: string) => {
    setData(prev => ({
      ...prev,
      paymentOption: value as 'normal' | 'installment',
    }));
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
              <Label htmlFor="priceFrom">DE (R$)</Label>
              <Input
                id="priceFrom"
                type="text"
                value={data.priceFrom}
                onChange={handleInputChange}
                placeholder="Ex: 19,99"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceFor">POR (R$)</Label>
              <Input
                id="priceFor"
                type="text"
                value={data.priceFor}
                onChange={handleInputChange}
                placeholder="Ex: 9,99"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <RadioGroup
              value={data.paymentOption}
              onValueChange={handlePaymentOptionChange}
              className="flex space-x-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="r1" />
                <Label htmlFor="r1" className="font-normal">
                  Preço Normal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="installment" id="r2" />
                <Label htmlFor="r2" className="font-normal">
                  Parcelado
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">EAN ou SAP</Label>
              <Input
                id="code"
                value={data.code}
                onChange={handleInputChange}
                placeholder="Código de barras"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Referencia</Label>
              <Input
                id="reference"
                value={data.reference}
                onChange={handleInputChange}
                placeholder="Ref. do produto"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
