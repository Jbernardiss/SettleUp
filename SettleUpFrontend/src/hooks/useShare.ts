import { useState, useCallback } from 'react';
import { type ShareData } from '../types/events';

interface UseShareReturn {
  shareContent: (data: ShareData) => Promise<void>;
  copyToClipboard: (text: string) => Promise<void>;
  isSharing: boolean;
  shareError: string | null;
  copySuccess: boolean;
}

export const useShare = (): UseShareReturn => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const shareContent = useCallback(async (data: ShareData): Promise<void> => {
    setIsSharing(true);
    setShareError(null);
    
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        // Fallback: copiar para clipboard
        const shareText = `${data.title}\n\n${data.text}\n\n${data.url}`;
        await copyToClipboard(shareText);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        // Usuário cancelou o compartilhamento
        const errorMessage = 'Erro ao compartilhar conteúdo';
        setShareError(errorMessage);
        
        // Fallback: tentar copiar para clipboard
        try {
          const shareText = `${data.title}\n\n${data.text}\n\n${data.url}`;
          await copyToClipboard(shareText);
        } catch (copyErr) {
          throw new Error('Erro ao compartilhar e copiar conteúdo');
        }
      }
    } finally {
      setIsSharing(false);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    setShareError(null);
    setCopySuccess(false);
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para navegadores mais antigos
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (!successful) {
          throw new Error('Falha ao copiar texto');
        }
      }
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      const errorMessage = 'Erro ao copiar para área de transferência';
      setShareError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    shareContent,
    copyToClipboard,
    isSharing,
    shareError,
    copySuccess
  };
};