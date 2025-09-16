import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login, Notificacoes, Home, CarteiraDigital } from "../src/pages/";
import { FreighterWalletProvider } from "./contexts/FreighterWalletContext";

function App() {
  return (
    <BrowserRouter>
      <FreighterWalletProvider>
      <Routes>
        <Route path="/">
          <Route index element={<Login />} />
          <Route path="home" element={<Home />} />
          <Route path="notificacoes" element={<Notificacoes />} />
          <Route path="carteira" element={<CarteiraDigital />} />
        </Route>
      </Routes>
      </FreighterWalletProvider>
    </BrowserRouter>
  );
}

export default App;
