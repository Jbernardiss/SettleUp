import { useRef, useEffect, useState } from 'react';
import { toCanvas } from 'qrcode';
import { type QRCodeOptions } from '../types/events';

interface UseQRCodeReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null> ;
  generateQR: (text: string, options?: QRCodeOptions) => Promise<void>;
  isGenerating: boolean;
  qrError: string | null;
  qrGenerated: boolean;
}

export const useQRCode = (): UseQRCodeReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  const defaultOptions: QRCodeOptions = {
    width: 200,
    height: 200,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#1a1a1a',
      light: '#ffffff'
    }
  };

  const generateQR = async (text: string, options: QRCodeOptions = {}): Promise<void> => {
    if (!canvasRef.current) {
      setQrError('Canvas não encontrado');
      return;
    }

    setIsGenerating(true);
    setQrError(null);
    setQrGenerated(false);

    try {
      const finalOptions = { ...defaultOptions, ...options };
      
      await toCanvas(canvasRef.current, text, finalOptions);
      setQrGenerated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar QR Code';
      setQrError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Limpar estado quando o componente for desmontado
  useEffect(() => {
    return () => {
      setQrError(null);
      setQrGenerated(false);
      setIsGenerating(false);
    };
  }, []);

  return {
    canvasRef,
    generateQR,
    isGenerating,
    qrError,
    qrGenerated
  };
};