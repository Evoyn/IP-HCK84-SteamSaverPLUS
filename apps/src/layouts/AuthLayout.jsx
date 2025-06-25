import { Outlet } from "react-router";
import Footer from "../components/Footer";
import Header from "../components/Header";

export function AuthLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
