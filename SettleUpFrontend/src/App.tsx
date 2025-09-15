import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login, Notificacoes, Home, CarteiraDigital } from "../src/pages/";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Login />} />
          <Route path="home" element={<Home />} />
          <Route path="notificacoes" element={<Notificacoes />} />
          <Route path="carteira" element={<CarteiraDigital />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
