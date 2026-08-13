import { getImageUrl } from "../../utils/imageUrl";

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img
        src={getImageUrl(product.images?.[0])}
        alt={product.name}
        className="product-image"
      />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <h4>{product.price} ETB</h4>
    </div>
  );
}

export default ProductCard;
