'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, X, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "reader";

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(containerId);
    scannerRef.current = html5QrCode;

    const config = {
      fps: 15,
      qrbox: { width: 250, height: 150 },
      aspectRatio: 1.0,
    };

    // Formatos suportados (focado em EAN e CODE128 para varejo)
    const formats = [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.QR_CODE
    ];

    html5QrCode.start(
      { facingMode: "environment" },
      { ...config, formatsToSupport: formats },
      (decodedText) => {
        // Sucesso
        stopScanner().then(() => {
          onScanSuccess(decodedText);
        });
      },
      (errorMessage) => {
        // Erro silencioso durante scan
      }
    ).catch(err => {
      console.error("Erro ao iniciar câmera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões e se está usando HTTPS.");
    });

    return () => {
      stopScanner();
    };
  }, [onScanSuccess]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Erro ao parar scanner:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Botão de Fechar (Topo Direito) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all active:scale-90"
          title="Fechar Scanner"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Camera className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Scanner de Código</h2>
          <p className="text-xs text-gray-500 font-medium italic">Aponte para o código de barras do produto</p>
        </div>

        {/* Scanner Container */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-square border-4 border-gray-100">
          <div id={containerId} className="w-full h-full"></div>
          
          {/* Mira / Crosshair Overlay */}
          {!error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[260px] h-[160px] border-2 border-blue-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
                
                {/* Linha Laser Animada */}
                <div className="w-full h-0.5 bg-blue-500/50 shadow-[0_0_10px_#3b82f6] animate-scan-line"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-red-900/90">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p className="text-sm font-bold uppercase mb-2">Erro de Acesso</p>
              <p className="text-xs opacity-80">{error}</p>
              <p className="text-[10px] mt-4 italic">Nota: Câmera requer HTTPS em dispositivos móveis.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-8 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 font-bold uppercase tracking-wider text-gray-500">
            Cancelar
          </Button>
          <button 
            onClick={onClose}
            className="flex-[2] bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs h-12 shadow-lg active:scale-95 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
