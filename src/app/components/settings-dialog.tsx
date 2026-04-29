'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Database, Info } from 'lucide-react';
import type { PosterSettings } from '@/app/lib/types';

interface SettingsDialogProps {
  settings: PosterSettings;
  onSave: (settings: PosterSettings) => void;
  onOpenDatabase: () => void;
}

export function SettingsDialog({ settings, onSave, onOpenDatabase }: SettingsDialogProps) {
  const [maxInstallments, setMaxInstallments] = useState(settings.maxInstallments.toString());
  const [minAmount, setMinAmount] = useState(settings.minInstallmentAmount.toString());

  const handleSave = () => {
    onSave({
      maxInstallments: parseInt(maxInstallments) || 1,
      minInstallmentAmount: parseFloat(minAmount.replace(',', '.')) || 1.0,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-border/50 hover:border-border"
          title="Configurações e Banco de Dados"
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Configurar</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Painel de Controle
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Seção Banco de Dados - AGROUPADA AQUI */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50 flex flex-col gap-3">
             <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold uppercase tracking-tight">Produtos</span>
             </div>
             <p className="text-[11px] text-muted-foreground leading-tight">
               Gerencie a lista de produtos, adicione novos itens ou limpe o banco de dados local.
             </p>
             <DialogTrigger asChild>
                <Button variant="outline" onClick={onOpenDatabase} className="w-full gap-2 font-bold uppercase text-[10px] h-9">
                  <Database className="h-3.5 w-3.5" />
                  Gerenciar Banco de Dados
                </Button>
             </DialogTrigger>
          </div>

          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold uppercase tracking-tight">Preferências de Impressão</span>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="max-inst" className="text-xs font-semibold">Máximo de Parcelas</Label>
              <Input
                id="max-inst"
                type="number"
                value={maxInstallments}
                onChange={(e) => setMaxInstallments(e.target.value)}
                className="font-bold h-9"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="min-amount" className="text-xs font-semibold">Valor Mínimo da Parcela (R$)</Label>
              <Input
                id="min-amount"
                type="text"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="font-bold h-9"
                placeholder="Ex: 30,00"
              />
              <p className="text-[0.65rem] text-muted-foreground italic">
                O sistema calcula as parcelas baseado neste valor mínimo.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold uppercase tracking-tight">Sobre a Ferramenta</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              RD Cartaz v2.0 - Sistema profissional de geração de etiquetas e cartazes promocionais. 
              Otimizado para dispositivos móveis e impressão de alta fidelidade.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button onClick={handleSave} className="w-full font-bold uppercase tracking-wider">Salvar e Fechar</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
