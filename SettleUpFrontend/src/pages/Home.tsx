import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/index";

export const Home: React.FC = () => {
  const navigate = useNavigate();

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
