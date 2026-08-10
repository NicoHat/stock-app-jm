import { BrowserRouter, Routes, Route } from "react-router-dom";
import StockFisico from "./pages/StockFisico";
import StockSistema from "./pages/StockSistema";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StockFisico />} />
        <Route path="/sistema" element={<StockSistema />} />
      </Routes>
    </BrowserRouter>
  );
}