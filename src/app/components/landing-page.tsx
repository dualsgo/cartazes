'use client';

import React from 'react';
import { AlertTriangle, ExternalLink, ArrowRight, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const officialUrl = 'https://rdcartaz.vercel.app/';

  const handleRedirect = () => {
    window.location.href = officialUrl;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8fafc] no-print print:hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg p-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-border/50 overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            {/* Icon/Badge */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center border-2 border-amber-100 shadow-sm">
                  <AlertTriangle className="w-10 h-10 text-amber-500" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-lg shadow-lg border-2 border-white">
                  <FlaskConical className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Content */}
            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
              Versão de Testes
            </h1>
            <p className="text-gray-600 mb-10 leading-relaxed max-w-sm mx-auto">
              Você está acessando um ambiente de desenvolvimento. Esta versão <span className="font-bold text-gray-900">não deve ser utilizada</span> para produção.
            </p>

            {/* Alert Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10 text-left">
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 text-sm mb-1">Versão Oficial</h3>
                  <p className="text-blue-700/80 text-xs leading-normal">
                    Para gerar seus cartazes com segurança e estabilidade, utilize o link oficial abaixo.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid gap-3">
              <Button 
                onClick={handleRedirect}
                className="w-full h-14 text-lg font-bold gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                Acessar Versão Oficial
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <button 
                onClick={onEnterApp}
                className="w-full h-12 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                Continuar na versão de testes
              </button>
            </div>
          </div>

          <div className="bg-gray-50/50 border-t border-gray-100 py-4 px-8 text-center">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
              Ambiente de Homologação • 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
