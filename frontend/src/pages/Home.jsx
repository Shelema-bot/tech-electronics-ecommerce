import Hero from "../components/Hero/Hero";
import CategoryCard from "../components/CategoryCard/CategoryCard";
import LatestProducts from "../components/LatestProducts/LatestProducts";

function Home() {
  return (
    <>
      <Hero />

      <section id="categories">
        <CategoryCard />
      </section>

      <LatestProducts />
    </>
  );
}

export default Home;
