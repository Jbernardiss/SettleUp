import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login, Notificacoes, Home, CarteiraDigital } from "../src/pages/";
import CreateEvent from "./pages/CreateEvent";
import { FreighterWalletProvider } from "./contexts/FreighterWalletContext";
import InviteQR from "./pages/InviteQR";

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
            <Route path="qrcode" element={<CreateEvent />} />
            <Route path="invite-qr" element={<InviteQR />} />
          </Route>
        </Routes>
      </FreighterWalletProvider>
    </BrowserRouter>
  );
}

export default App;
