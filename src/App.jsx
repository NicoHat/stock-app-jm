import { BrowserRouter, Routes, Route } from "react-router-dom";
import StockFisico from "./pages/StockFisico";
import StockSistema from "./pages/StockSistema";
import StockAdmin from "./pages/StockAdmin";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StockFisico />} />
        <Route path="/sistema" element={<StockSistema />} />
        <Route path="/admin" element={<StockAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}