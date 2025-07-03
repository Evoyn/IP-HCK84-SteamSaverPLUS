import { Outlet } from "react-router";
import Footer from "../components/Footer";
import Header from "../components/Header";

export function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
