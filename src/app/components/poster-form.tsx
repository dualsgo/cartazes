'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PosterData } from '@/app/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle, Search } from 'lucide-react';

function centsToDisplay(cents: number): string {
  if (cents === 0) return '';
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function displayToCents(display: string): number {
  const digits = display.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function useCurrencyInput(initial: string) {
  const [cents, setCents] = useState(() => displayToCents(initial));

  const display = centsToDisplay(cents);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setCents(prev => Math.floor(prev / 10));
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setCents(prev => {
        const next = prev * 10 + parseInt(e.key, 10);
        return next > 9999999 ? prev : next;
      });
    }
  };

  const reset = useCallback(() => setCents(0), []);
  const setValue = useCallback((val: string) => setCents(displayToCents(val)), []);

  return { display, handleKeyDown, reset, setValue, cents };
}

type LookupStatus = 'idle' | 'loading' | 'found' | 'notfound';

type PosterFormProps = {
  data: PosterData;
  setData: Dispatch<SetStateAction<PosterData>>;
  posterType: 'reliquias' | 'aereo' | 'avaria';
};

function detectInputType(value: string): 'ean' | 'code' {
  return value.replace(/\D/g, '').length >= 8 ? 'ean' : 'code';
}

const defectOptions = [
  { value: 'embalagem_danificada', label: 'Embalagem Danificada', discount: 20 },
  { value: 'marcas_de_uso', label: 'Marcas de Uso', discount: 30 },
  { value: 'pelucia_suja', label: 'Pelúcia Suja', discount: 40 },
  { value: 'peca_faltando', label: 'Peça Faltando', discount: 50 },
  { value: 'outro', label: 'Outro (descrever)', discount: null },
];

export function PosterForm({ data, setData, posterType }: PosterFormProps) {
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const priceFor  = useCurrencyInput(data.priceFor);
  const priceFrom = useCurrencyInput(data.priceFrom);

  useEffect(() => {
    setData(prev => ({ ...prev, priceFor: priceFor.display }));
  }, [priceFor.display, setData]);

  useEffect(() => {
    setData(prev => ({ ...prev, priceFrom: priceFrom.display }));
  }, [priceFrom.display, setData]);
  
  useEffect(() => {
    if (posterType !== 'avaria') return;

    const fromCents = priceFrom.cents;
    if (fromCents === 0) {
      priceFor.setValue('');
      return;
    }

    const selectedDefect = defectOptions.find(opt => opt.value === data.defectType);
    let discount = 0;

    if (selectedDefect) {
      if (selectedDefect.value === 'outro') {
        discount = data.customDefectDiscount ?? 0;
      } else {
        discount = selectedDefect.discount ?? 0;
      }
    }

    if (discount > 0) {
      const discountedCents = Math.round(fromCents * (1 - discount / 100));
      priceFor.setValue(centsToDisplay(discountedCents));
    } else {
      priceFor.setValue('');
    }
  }, [priceFrom.cents, data.defectType, data.customDefectDiscount, posterType, priceFor, data.priceFrom]);


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback((prefix: string) => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (prefix.length < 2 || detectInputType(prefix) === 'ean') {
      setSuggestions([]);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/produto/suggest?prefix=${encodeURIComponent(prefix)}`);
        const list = await res.json() as string[];
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
      } catch { /* silencioso */ }
    }, 200);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchValue(v);
    setLookupStatus('idle');
    fetchSuggestions(v);
  };

  const handleLookup = useCallback(async (q = searchValue) => {
    const query = q.trim();
    if (query.length < 3) return;
    setShowSuggestions(false);
    setSuggestions([]);
    const inputType = detectInputType(query);
    setLookupStatus('loading');

    try {
      const res = await fetch(`/api/produto?q=${encodeURIComponent(query)}`);
      if (!res.ok) { setLookupStatus('notfound'); return; }

      const produto = await res.json() as {
        description: string; reference: string; ean?: string; code?: string;
      };

      setData(prev => ({
        ...prev,
        description: produto.description,
        reference:   produto.reference,
        code:  inputType === 'code' ? query : (produto.code ?? ''),
        ean:   inputType === 'ean'  ? query : (produto.ean  ?? ''),
      }));
      setLookupStatus('found');
    } catch {
      setLookupStatus('notfound');
    }
  }, [searchValue, setData]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleLookup(); }
    if (e.key === 'Escape') { setShowSuggestions(false); }
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      const el = wrapperRef.current?.querySelector<HTMLButtonElement>('[data-suggestion]');
      el?.focus();
    }
  };

  const handleSuggestionSelect = (code: string) => {
    setSearchValue(code);
    setSuggestions([]);
    setShowSuggestions(false);
    handleLookup(code);
  };

  const handlePaymentOptionChange = (value: string) => {
    setData(prev => ({ ...prev, paymentOption: value as 'normal' | 'installment' }));
  };

  const handleSubTypeChange = (value: string) => {
    setData(prev => ({
      ...prev,
      posterSubType: value as 'offer' | 'normal',
      priceFrom: value === 'normal' ? '' : prev.priceFrom,
    }));
    if (value === 'normal') priceFrom.reset();
  };

  const handleDefectChange = (value: string) => {
    setData(prev => ({
      ...prev,
      defectType: value,
      customDefectReason: value === 'outro' ? prev.customDefectReason : '',
    }));
  };

  const handleCustomDiscountChange = (value: number[]) => {
    setData(prev => ({ ...prev, customDefectDiscount: value[0] }));
  };

  const statusIcon = {
    idle:     <Search className="h-4 w-4 text-muted-foreground" />,
    loading:  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    found:    <CheckCircle2 className="h-4 w-4 text-green-500" />,
    notfound: <XCircle className="h-4 w-4 text-destructive" />,
  }[lookupStatus];
  
  const isOfferType = posterType === 'reliquias' || (posterType === 'aereo' && data.posterSubType === 'offer');

  return (
    <div className="space-y-3">
      {posterType === 'aereo' && (
        <Card>
          <CardContent className="pt-4">
            <RadioGroup
              value={data.posterSubType}
              onValueChange={handleSubTypeChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="st-normal" />
                <Label htmlFor="st-normal" className="font-normal">Preço Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offer" id="st-offer" />
                <Label htmlFor="st-offer" className="font-normal">Oferta</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {posterType === 'avaria' && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="defect-reason">Motivo da Avaria</Label>
              <Select onValueChange={handleDefectChange} value={data.defectType}>
                <SelectTrigger id="defect-reason">
                  <SelectValue placeholder="Selecione um motivo..." />
                </SelectTrigger>
                <SelectContent>
                  {defectOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {data.defectType === 'outro' && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="custom-defect-reason">Descreva o Motivo</Label>
                  <Input
                    id="custom-defect-reason"
                    value={data.customDefectReason}
                    onChange={e => setData(prev => ({ ...prev, customDefectReason: e.target.value }))}
                    placeholder="Ex: Pequeno rasgo na caixa"
                  />
                </div>
                <div className="space-y-1 pt-2">
                  <Label htmlFor="custom-discount">Desconto Customizado: {data.customDefectDiscount}%</Label>
                  <Slider
                    id="custom-discount"
                    min={0}
                    max={50}
                    step={5}
                    value={[data.customDefectDiscount ?? 0]}
                    onValueChange={handleCustomDiscountChange}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-1" ref={wrapperRef}>
            <Label htmlFor="search-code" className="font-semibold">
              Busca por Código / EAN
            </Label>
            <div className="relative">
              <Input
                id="search-code"
                value={searchValue}
                onChange={handleSearchChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="SAP (ex: 71838) ou EAN (13 dígitos)…"
                className={cn(
                  'pr-9',
                  lookupStatus === 'found'    && 'border-green-500',
                  lookupStatus === 'notfound' && 'border-destructive',
                )}
                autoComplete="off"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                {statusIcon}
              </span>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={s}
                      data-suggestion
                      tabIndex={0}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent focus:bg-accent focus:outline-none font-mono"
                      onMouseDown={() => handleSuggestionSelect(s)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSuggestionSelect(s);
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          const next = wrapperRef.current?.querySelectorAll<HTMLButtonElement>('[data-suggestion]')[i + 1];
                          next?.focus();
                        }
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          if (i === 0) document.getElementById('search-code')?.focus();
                          else wrapperRef.current?.querySelectorAll<HTMLButtonElement>('[data-suggestion]')[i - 1]?.focus();
                        }
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {lookupStatus === 'notfound' && (
              <p className="text-xs text-destructive">Código não encontrado</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="font-semibold">Preços</Label>
            <div className="grid grid-cols-2 gap-3">
              {(isOfferType || posterType === 'avaria') && (
                <div className="space-y-1">
                  <Label htmlFor="price-from" className="text-xs text-muted-foreground">DE (R$)</Label>
                  <Input
                    id="price-from"
                    value={priceFrom.display}
                    onKeyDown={priceFrom.handleKeyDown}
                    onChange={() => {/* no-op */}}
                    placeholder="0,00"
                    className="font-mono text-right"
                    inputMode="numeric"
                  />
                </div>
              )}
              <div className={cn('space-y-1', !(isOfferType || posterType === 'avaria') && 'col-span-2')}>
                <Label htmlFor="price-for" className="text-xs text-muted-foreground">
                  {(isOfferType || posterType === 'avaria') ? 'POR (R$)' : 'Preço (R$)'}
                </Label>
                <Input
                  id="price-for"
                  value={priceFor.display}
                  onKeyDown={priceFor.handleKeyDown}
                  onChange={() => {/* no-op */}}
                  placeholder="0,00"
                  className="font-mono text-right"
                  inputMode="numeric"
                  readOnly={posterType === 'avaria'}
                />
              </div>
            </div>
          </div>
          
          {(posterType === 'reliquias' || posterType === 'avaria') && (
            <div>
              <RadioGroup
                value={data.paymentOption}
                onValueChange={handlePaymentOptionChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="r1" />
                  <Label htmlFor="r1" className="font-normal text-sm">À vista</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="installment" id="r2" />
                  <Label htmlFor="r2" className="font-normal text-sm">Parcelado</Label>
                </div>
              </RadioGroup>
            </div>
          )}

        </CardContent>
      </Card>

      {lookupStatus === 'found' && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="pt-4 space-y-2">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
              Produto encontrado
            </p>
            <div className="space-y-1">
              <p className="font-semibold text-sm leading-tight">{data.description}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                {data.code && <span>SAP: <b className="text-foreground">{data.code}</b></span>}
                {data.ean  && <span>EAN: <b className="text-foreground">{data.ean}</b></span>}
                {data.reference && <span>Ref.: <b className="text-foreground">{data.reference}</b></span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
