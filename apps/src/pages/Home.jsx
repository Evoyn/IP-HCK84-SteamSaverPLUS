import FeaturedCarousel from "../components/FeaturedCarousel";
import TopDiscounts from "../components/TopDiscounts";
import FreeGames from "../components/FreeGames";
import Recommendations from "../components/RecomendationGames";

export default function Home() {
  return (
    <>
      <FeaturedCarousel />
      <TopDiscounts />
      <FreeGames />
      <Recommendations />
    </>
  );
}
