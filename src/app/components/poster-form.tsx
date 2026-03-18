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
import { Loader2, CheckCircle2, XCircle, Search, RotateCcw, PlusCircle } from 'lucide-react';

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

function useCurrencyInput(initial: string, maxCents?: number) {
  const [cents, setCents] = useState(() => displayToCents(initial));

  useEffect(() => {
    if (maxCents !== undefined && cents > maxCents) {
      setCents(maxCents);
    }
  }, [maxCents, cents]);

  const display = centsToDisplay(cents);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setCents(prev => Math.floor(prev / 10));
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setCents(prev => {
        const next = prev * 10 + parseInt(e.key, 10);
        const capped = maxCents !== undefined && next > maxCents ? maxCents : next;
        return capped > 9999999 ? prev : capped;
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
  posterType: 'reliquias' | 'ofertas-imperdiveis' | 'aereo' | 'avaria' | 'etiqueta' | 'totem' | 'leve-pague-a4' | 'leve-pague-a6' | 'combo-a4' | 'combo-a6';
  onLookupStatusChange?: (found: boolean) => void;
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

export function PosterForm({ data, setData, posterType, onLookupStatusChange }: PosterFormProps) {
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<{ key: string; description: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // true = usuário digitou manualmente no campo POR → não recalcula automaticamente
  const [priceForOverridden, setPriceForOverridden] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [regDescription, setRegDescription] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regEan, setRegEan] = useState('');
  const [regReference, setRegReference] = useState('');
  const [regStatus, setRegStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [regConfirming, setRegConfirming] = useState(false);

  const priceFrom = useCurrencyInput(data.priceFrom);
  const maxForCents = priceFrom.cents > 0 ? priceFrom.cents : undefined;
  const priceFor  = useCurrencyInput(data.priceFor, maxForCents);
  const comboPrice = useCurrencyInput(data.comboPrice || '');

  useEffect(() => {
    setData((prev: PosterData) => ({ ...prev, priceFor: priceFor.display }));
  }, [priceFor.display]);

  useEffect(() => {
    setData((prev: PosterData) => ({ ...prev, priceFrom: priceFrom.display }));
  }, [priceFrom.display]);

  useEffect(() => {
    setData((prev: PosterData) => ({ ...prev, comboPrice: comboPrice.display }));
  }, [comboPrice.display]);
  
  // Recalcula POR automaticamente a partir do DE + desconto do motivo,
  // exceto quando o usuário tiver feito override manual.
  useEffect(() => {
    if (posterType !== 'avaria') return;
    if (priceForOverridden) return;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceFrom.cents, data.defectType, data.customDefectDiscount, posterType, priceForOverridden]);

  // Quando o usuário muda o motivo/DE, volta para auto-calc
  useEffect(() => {
    setPriceForOverridden(false);
  }, [priceFrom.cents, data.defectType, data.customDefectDiscount]);


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
    if (prefix.length < 2) {
      setSuggestions([]);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/produto/suggest?prefix=${encodeURIComponent(prefix)}`);
        const list = await res.json() as { key: string; description: string }[];
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

  const handleLookup = useCallback(async (q: string, target: 'A' | 'B' = 'A') => {
    const query = q.trim();
    if (query.length < 3) return;
    setShowSuggestions(false);
    setSuggestions([]);
    const inputType = detectInputType(query);
    setLookupStatus('loading');
    if (target === 'A') onLookupStatusChange?.(false);

    try {
      const res = await fetch(`/api/produto?q=${encodeURIComponent(query)}`);
      if (!res.ok) { setLookupStatus('notfound'); if (target === 'A') onLookupStatusChange?.(false); return; }

      const produto = await res.json() as {
        description: string; reference: string; ean?: string; code?: string;
      };

      if (target === 'A') {
        setData((prev: PosterData) => ({
          ...prev,
          description: produto.description,
          reference:   produto.reference,
          code:  inputType === 'code' ? query : (produto.code ?? ''),
          ean:   inputType === 'ean'  ? query : (produto.ean  ?? ''),
        }));
        setLookupStatus('found');
        onLookupStatusChange?.(true);
      } else {
        setData((prev: PosterData) => ({
          ...prev,
          comboDescription: produto.description,
          comboReference:   produto.reference,
          comboCode:  inputType === 'code' ? query : (produto.code ?? ''),
          comboEan:   inputType === 'ean'  ? query : (produto.ean  ?? ''),
        }));
        setLookupStatus('found');
      }
    } catch {
      setLookupStatus('notfound');
      if (target === 'A') onLookupStatusChange?.(false);
    }
  }, [setData, onLookupStatusChange]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, target: 'A' | 'B' = 'A') => {
    if (e.key === 'Enter') { e.preventDefault(); handleLookup(searchValue, target); }
    if (e.key === 'Escape') { setShowSuggestions(false); }
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      const el = wrapperRef.current?.querySelector<HTMLButtonElement>('[data-suggestion]');
      el?.focus();
    }
  };

  const handleSuggestionSelect = (key: string) => {
    setSearchValue(key);
    setSuggestions([]);
    setShowSuggestions(false);
    handleLookup(key);
  };

  const handlePaymentOptionChange = (value: string) => {
    setData((prev: PosterData) => ({ ...prev, paymentOption: value as 'normal' | 'installment' }));
  };

  const handleSubTypeChange = (value: string) => {
    setData((prev: PosterData) => ({
      ...prev,
      posterSubType: value as 'offer' | 'normal',
      priceFrom: value === 'normal' ? '' : prev.priceFrom,
    }));
    if (value === 'normal') priceFrom.reset();
  };

  const handleDefectChange = (value: string) => {
    setData((prev: PosterData) => ({
      ...prev,
      defectType: value,
      customDefectReason: value === 'outro' ? prev.customDefectReason : '',
    }));
  };

  const handleCustomDiscountChange = (value: number[]) => {
    setData((prev: PosterData) => ({ ...prev, customDefectDiscount: value[0] }));
  };

  const statusIcon = ({
    idle:     <Search className="h-4 w-4 text-muted-foreground" />,
    loading:  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    found:    <CheckCircle2 className="h-4 w-4 text-green-500" />,
    notfound: <XCircle className="h-4 w-4 text-destructive" />,
  } as Record<string, any>)[lookupStatus];

  const handleRegister = async () => {
    const key = regCode.trim() || regEan.trim();
    if (!key || !regDescription.trim()) return;
    setRegStatus('saving');
    setRegConfirming(false);
    try {
      const res = await fetch('/api/produto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          description: regDescription,
          reference: regReference || undefined,
          ean: regEan || undefined,
          code: regCode || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setRegStatus('saved');
      await handleLookup(key);
      setRegDescription(''); setRegCode(''); setRegEan(''); setRegReference('');
      setTimeout(() => setRegStatus('idle'), 3000);
    } catch {
      setRegStatus('error');
      setTimeout(() => setRegStatus('idle'), 3000);
    }
  };
  
  const isOfferType = [
    'reliquias', 'ofertas-imperdiveis', 'totem', 'etiqueta', 
    'leve-pague-a4', 'leve-pague-a6', 'combo-a4', 'combo-a6'
  ].includes(posterType) || (posterType === 'aereo' && data.posterSubType === 'offer');

  return (
    <div className="space-y-4 pb-8">
      {/* SEÇÃO: ITEM A / PRINCIPAL */}
      <Card className={cn(posterType.startsWith('combo') && "border-2 border-primary/20 bg-primary/5")}>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <Label className="font-extrabold text-base uppercase tracking-tight">
              {posterType.startsWith('combo') ? 'Item A (Compre)' : 'Informações do Produto'}
            </Label>
            {lookupStatus === 'found' && (
              <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full uppercase font-black">Identificado</span>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1" ref={wrapperRef}>
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Buscar ou Digitar SAP/EAN</Label>
              <div className="relative">
                <Input
                  value={searchValue}
                  onChange={handleSearchChange}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={(e) => handleSearchKeyDown(e, 'A')}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Ex: 71838"
                  className="h-10 text-lg pr-9 font-bold"
                  autoComplete="off"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {statusIcon}
                </span>
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
                    {suggestions.map((s: any) => (
                      <button
                        key={s.key}
                        data-suggestion
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent focus:bg-accent focus:outline-none flex justify-between"
                        onMouseDown={() => handleSuggestionSelect(s.key)}
                      >
                        <span className="font-mono text-sm font-bold">{s.key}</span>
                        <span className="text-xs text-muted-foreground truncate ml-4">{s.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Descrição</Label>
              <Input 
                value={data.description}
                onChange={e => setData((prev: PosterData) => ({ ...prev, description: e.target.value.toUpperCase() }))}
                className="uppercase font-bold h-10 border-foreground/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">SAP</Label>
                <Input value={data.code} onChange={e => setData((prev: PosterData) => ({ ...prev, code: e.target.value }))} className="h-8 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">EAN</Label>
                <Input value={data.ean} onChange={e => setData((prev: PosterData) => ({ ...prev, ean: e.target.value }))} className="h-8 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Ref.</Label>
                <Input value={data.reference} onChange={e => setData((prev: PosterData) => ({ ...prev, reference: e.target.value }))} className="h-8 text-xs" />
              </div>
            </div>

            <div className="grid grid-flow-row sm:grid-cols-2 gap-3 pt-2">
              {isOfferType && !posterType.startsWith('leve-pague') && !posterType.startsWith('combo') && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Preço DE</Label>
                  <Input 
                    value={priceFrom.display}
                    onKeyDown={priceFrom.handleKeyDown}
                    className="font-mono text-xl h-12 font-black border-2"
                    onChange={()=>{}}
                  />
                </div>
              )}
              <div className={cn("space-y-1", (!isOfferType || posterType.startsWith('leve-pague') || posterType.startsWith('combo')) && "col-span-full")}>
                <Label className="text-[10px] font-extrabold text-foreground uppercase tracking-widest">
                  {posterType.startsWith('leve-pague') ? 'Preço Unitário' : 
                   posterType.startsWith('combo') ? 'Preço do Item A' : 'Preço POR'}
                </Label>
                <Input 
                  value={priceFor.display}
                  onKeyDown={priceFor.handleKeyDown}
                  className="font-mono text-2xl h-14 font-black border-2 border-foreground shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                  onChange={()=>{}}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO: CONFIGURAÇÕES DA OFERTA (Leve Pague / Avaria) */}
      {(posterType.startsWith('leve-pague') || posterType === 'avaria') && (
        <Card className="bg-muted/40">
          <CardContent className="pt-4 space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest border-b pb-1 flex items-center gap-2">
              <RotateCcw className="h-3 w-3" /> Configuração da Oferta
            </Label>
            
            {posterType.startsWith('leve-pague') && (
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">Leve</Label>
                  <Input 
                    type="number"
                    value={data.leveX}
                    onChange={e => setData((prev: PosterData) => ({ ...prev, leveX: parseInt(e.target.value) || 0 }))}
                    className="text-center text-2xl font-black h-14"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">Pague</Label>
                  <Input 
                    type="number"
                    value={data.pagueY}
                    onChange={e => setData((prev: PosterData) => ({ ...prev, pagueY: parseInt(e.target.value) || 0 }))}
                    className="text-center text-2xl font-black h-14"
                  />
                </div>
              </div>
            )}

            {posterType === 'avaria' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">Motivo</Label>
                  <Select value={data.defectType} onValueChange={handleDefectChange}>
                    <SelectTrigger className="font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {defectOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input 
                  placeholder="Obs de rodapé (max 60 carac.)"
                  value={data.defectNote || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData((prev: PosterData) => ({ ...prev, defectNote: e.target.value.slice(0, 60) }))}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SEÇÃO: ITEM B (Combo) */}
      {posterType.startsWith('combo') && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-4 space-y-4 font-body">
            <div className="flex items-center justify-between border-b pb-2">
              <Label className="font-extrabold text-base uppercase tracking-tight text-primary">Item B (E leve um)</Label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Buscar ou Digitar Item B</Label>
                <div className="relative">
                  <Input
                    onKeyDown={(e) => { if (e.key === 'Enter') handleLookup((e.target as HTMLInputElement).value, 'B'); }}
                    placeholder="SAP/EAN do Item B..."
                    className="h-10 text-lg pr-9 font-bold border-primary/20"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-50" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Descrição Item B</Label>
                <Input 
                  value={data.comboDescription}
                  onChange={e => setData((prev: PosterData) => ({ ...prev, comboDescription: e.target.value.toUpperCase() }))}
                  className="uppercase font-bold h-10 border-primary/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">SAP B</Label>
                  <Input value={data.comboCode} onChange={e => setData((prev: PosterData) => ({ ...prev, comboCode: e.target.value }))} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">EAN B</Label>
                  <Input value={data.comboEan} onChange={e => setData((prev: PosterData) => ({ ...prev, comboEan: e.target.value }))} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase">Ref B</Label>
                  <Input value={data.comboReference} onChange={e => setData((prev: PosterData) => ({ ...prev, comboReference: e.target.value }))} className="h-8 text-xs" />
                </div>
              </div>

              <div className="pt-2">
                <Label className="text-[10px] font-black text-primary uppercase tracking-widest">Leve o Item B por mais:</Label>
                <Input 
                  value={comboPrice.display}
                  onKeyDown={comboPrice.handleKeyDown}
                  className="font-mono text-3xl h-16 font-black border-2 border-primary bg-white shadow-[3px_3px_0_0_#0ea5e9]"
                  onChange={()=>{}}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEÇÃO: PAGAMENTO E RODAPÉ */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          {['reliquias', 'ofertas-imperdiveis', 'etiqueta', 'avaria', 'aereo', 'totem'].includes(posterType) && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Forma de Pagamento</Label>
              <div className="flex bg-muted p-1 rounded-xl">
                <button type="button" onClick={() => handlePaymentOptionChange('normal')} className={cn("flex-1 py-1.5 rounded-lg text-xs font-black uppercase", data.paymentOption === 'normal' ? "bg-white shadow-sm" : "opacity-40")}>À vista</button>
                <button type="button" onClick={() => handlePaymentOptionChange('installment')} className={cn("flex-1 py-1.5 rounded-lg text-xs font-black uppercase", data.paymentOption === 'installment' ? "bg-white shadow-sm" : "opacity-40")}>Parcelado</button>
              </div>
            </div>
          )}

          {(posterType === 'reliquias' || posterType === 'ofertas-imperdiveis' || posterType === 'totem' || posterType.startsWith('leve-pague') || posterType.startsWith('combo')) && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Validade da Oferta</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" className="text-xs h-9" value={data.offerValidityStart?.split('/').reverse().join('-') || ''} onChange={e => {
                  const [y,m,d] = e.target.value.split('-');
                  setData((prev: PosterData) => ({ ...prev, offerValidityStart: e.target.value ? `${d}/${m}/${y}` : undefined }));
                }} />
                <Input type="date" className="text-xs h-9" value={data.offerValidity?.split('/').reverse().join('-') || ''} onChange={e => {
                  const [y,m,d] = e.target.value.split('-');
                  setData((prev: PosterData) => ({ ...prev, offerValidity: e.target.value ? `${d}/${m}/${y}` : undefined }));
                }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
