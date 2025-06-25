import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { AuthLayout } from "./layouts/AuthLayout";
import { Register } from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
