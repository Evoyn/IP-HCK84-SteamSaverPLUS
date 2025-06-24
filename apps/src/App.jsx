import "./App.css";
import FeaturedCarousel from "./components/FeaturedCarousel";
import Footer from "./components/Footer";
import Header from "./components/Header";
import TopDiscounts from "./components/TopDiscounts";

function App() {
  return (
    <>
      <Header />
      <FeaturedCarousel />
      <TopDiscounts />
      <Footer />
    </>
  );
}

export default App;
