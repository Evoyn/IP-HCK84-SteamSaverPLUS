import { Navigate, Outlet } from "react-router";
import Footer from "../components/Footer";
import Header from "../components/Header";

export function AuthLayout() {
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
