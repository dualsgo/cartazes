'use client';

import { useState, useCallback } from 'react';
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
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

type LookupStatus = 'idle' | 'loading' | 'found' | 'notfound';

type PosterFormProps = {
  data: PosterData;
  setData: Dispatch<SetStateAction<PosterData>>;
  posterType: 'reliquias' | 'aereo';
};

export function PosterForm({ data, setData, posterType }: PosterFormProps) {
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setData(prev => ({ ...prev, [id]: value }));
    // Resetar status ao editar o código manualmente
    if (id === 'code') setLookupStatus('idle');
  };

  const handlePaymentOptionChange = (value: string) => {
    setData(prev => ({
      ...prev,
      paymentOption: value as 'normal' | 'installment',
    }));
  };

  const handleSubTypeChange = (value: string) => {
    setData(prev => ({
      ...prev,
      posterSubType: value as 'offer' | 'normal',
      priceFrom: value === 'normal' ? '' : prev.priceFrom,
    }));
  };

  // Busca produto pelo código digitado (COD_PRODUTO ou EAN)
  const handleCodeLookup = useCallback(async () => {
    const code = data.code.trim();
    if (code.length < 3) return;

    setLookupStatus('loading');
    try {
      const res = await fetch(`/api/produto?q=${encodeURIComponent(code)}`);
      if (!res.ok) {
        setLookupStatus('notfound');
        return;
      }
      const produto = await res.json() as { description: string; reference: string };
      setData(prev => ({
        ...prev,
        description: produto.description,
        reference:   produto.reference,
      }));
      setLookupStatus('found');
    } catch {
      setLookupStatus('notfound');
    }
  }, [data.code, setData]);

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCodeLookup();
    }
  };

  const statusIcon = {
    idle:     null,
    loading:  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    found:    <CheckCircle2 className="h-4 w-4 text-green-500" />,
    notfound: <XCircle className="h-4 w-4 text-destructive" />,
  }[lookupStatus];

  const statusText = {
    idle:     '',
    loading:  'Buscando...',
    found:    'Produto encontrado',
    notfound: 'Código não encontrado',
  }[lookupStatus];

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
          {posterType === 'aereo' && (
            <div className="space-y-2">
              <Label>Tipo de Cartaz</Label>
              <RadioGroup
                value={data.posterSubType}
                onValueChange={handleSubTypeChange}
                className="flex space-x-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="st-normal" />
                  <Label htmlFor="st-normal" className="font-normal">
                    Preço Normal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="offer" id="st-offer" />
                  <Label htmlFor="st-offer" className="font-normal">
                    Oferta
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Campo de código com autocomplete */}
          <div className="space-y-1">
            <Label htmlFor="code">Cód. Produto ou EAN</Label>
            <div className="relative">
              <Input
                id="code"
                value={data.code}
                onChange={handleInputChange}
                onBlur={handleCodeLookup}
                onKeyDown={handleCodeKeyDown}
                placeholder="Digite o código e pressione Enter"
                className={cn(
                  'pr-8',
                  lookupStatus === 'found' && 'border-green-500 focus-visible:ring-green-500',
                  lookupStatus === 'notfound' && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {statusIcon && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  {statusIcon}
                </span>
              )}
            </div>
            {statusText && (
              <p className={cn(
                'text-xs',
                lookupStatus === 'found' && 'text-green-600',
                lookupStatus === 'notfound' && 'text-destructive',
                lookupStatus === 'loading' && 'text-muted-foreground',
              )}>
                {statusText}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Produto</Label>
            <Input
              id="description"
              value={data.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {data.posterSubType === 'offer' && (
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
            )}
            <div
              className={cn(
                'space-y-2',
                data.posterSubType === 'normal' && 'col-span-2'
              )}
            >
              <Label htmlFor="priceFor">
                {data.posterSubType === 'offer' ? 'POR (R$)' : 'Preço (R$)'}
              </Label>
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

          <div className="space-y-2">
            <Label htmlFor="reference">Referência</Label>
            <Input
              id="reference"
              value={data.reference}
              onChange={handleInputChange}
              placeholder="Ref. do produto"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
