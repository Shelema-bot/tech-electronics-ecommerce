import Hero from "../components/Hero/Hero";
import CategoryCard from "../components/CategoryCard/CategoryCard";

function Home() {

  return (
    <>

      <Hero />

      <section id="categories">
        <CategoryCard />
      </section>

    </>
  );
}

export default Home;