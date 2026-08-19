import Hero from "../components/Hero/Hero";
import CategoryCard from "../components/CategoryCard/CategoryCard";
import LatestProducts from "../components/LatestProducts/LatestProducts";
import TrustBadges from "../components/TrustBadges/TrustBadges";

function Home() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <section id="categories">
        <CategoryCard />
      </section>
      <LatestProducts />
    </>
  );
}

export default Home;
