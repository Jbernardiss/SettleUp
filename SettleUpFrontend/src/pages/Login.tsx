import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFreighter } from "../hooks";
import { Button } from "../components";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isInstalled, isPermitted, publicKey, network, error, connect, disconnect, refresh } = useFreighter();

  useEffect(() => {
    if (isPermitted) {
      navigate("/home");
    }
  }, [isPermitted, navigate]);

  const handleConnect = useCallback(async () => {
    const ok = await connect();
    if (ok) {
      navigate("/home");
    }
  }, [connect, navigate]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      {!isInstalled && (
        <div className="text-red-600">
          Freighter não está instalado. Instale a extensão do navegador em `https://www.freighter.app/`.
        </div>
      )}

      <div className="flex gap-3">
        {!isPermitted ? (
          <Button onClick={handleConnect} text="Conectar Freighter" variant="primary" />
        ) : (
          <>
            <Button onClick={handleRefresh} text="Atualizar" variant="secondary" />
            <Button onClick={handleDisconnect} text="Desconectar" variant="tertiary" />
          </>
        )}
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {isPermitted && (
        <div className="mt-4 rounded border p-4 w-full max-w-xl">
          <div className="text-sm text-gray-700">Rede: {network ?? 'desconhecida'}</div>
          <div className="text-sm text-gray-700 break-all">Chave pública: {publicKey}</div>
        </div>
      )}
    </div>
  );
};
