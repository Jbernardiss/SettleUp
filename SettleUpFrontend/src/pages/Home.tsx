import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/index";
import { useFreighter } from "../hooks";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isPermitted, publicKey, network } = useFreighter();

  const handleLoginClick = useCallback(() => {
    console.log("Login button clicked");
    navigate("/");
  }, [navigate]);

  const handleNotificacoesClick = useCallback(() => {
    console.log("Notificações button clicked");
    navigate("/notificacoes");
  }, [navigate]);

  const handleCarteiraClick = useCallback(() => {
    console.log("Carteira Digital button clicked");
    navigate("/carteira");
  }, [navigate]);

  return (
    <div className="relative flex  min-h-screen  flex-col justify-center items-center m:py-12">
      <h1 className="text-center text-5xl">Welcome to the Home page!</h1>
      <div className="mt-8 w-full max-w-2xl px-6">
        {!isPermitted ? (
          <div className="text-red-600">Conecte sua carteira na página de Login.</div>
        ) : (
          <div className="rounded border p-4">
            <div className="text-sm text-gray-700">Rede: {network ?? "desconhecida"}</div>
            <div className="text-sm text-gray-700 break-all">Chave pública: {publicKey}</div>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-10 gap-10">
        <Button onClick={handleLoginClick} text="Login" variant="primary" />
        <Button
          onClick={handleNotificacoesClick}
          text="Notificações"
          variant="secondary"
        />
        <Button
          onClick={handleCarteiraClick}
          text="Carteira Digital"
          variant="tertiary"
        />
      </div>
    </div>
  );
};
