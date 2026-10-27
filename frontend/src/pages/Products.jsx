import ProductList from "../components/ProductList/ProductList";
import { useSearchParams } from "react-router-dom";

function Products() {

  const [searchParams] = useSearchParams();

  const category = searchParams.get("category");
  const search = searchParams.get("search");

  return (

    <div>

      <h1>

        {category
          ? `${category} Products`
          : search
          ? `Search Results for "${search}"`
          : "All Products"}

      </h1>

      <ProductList />

    </div>

  );

}

export default Products;