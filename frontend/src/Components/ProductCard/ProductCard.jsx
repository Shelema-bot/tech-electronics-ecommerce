function ProductCard({ product }) {

  console.log(product);

  return (
    <div className="product-card">

      <img 
        src={`http://localhost:5000/${product.images[0].replace("\\", "/")}`}
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