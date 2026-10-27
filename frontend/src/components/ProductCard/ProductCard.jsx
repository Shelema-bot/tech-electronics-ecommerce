import React from "react";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../../utils/imageUrl";
import { usePreference } from "../../context/PreferenceContext";

function ProductCard({ product }) {
  const { t } = useTranslation();
  const { fmt } = usePreference();

  if (!product) return null;

  const discountPrice = product.discountPrice ?? product.price;
  const originalPrice = product.originalPrice ?? (product.discountPrice && product.price > product.discountPrice ? product.price : null);

  return (
    <div className="product-card">
      <img
        src={getImageUrl(product.images?.[0] || product.image)}
        alt={product.name}
        className="product-image"
      />
      <h3>{product.name}</h3>
      {product.description && <p>{product.description}</p>}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-blue-600">{fmt(discountPrice)}</span>
        {originalPrice && Number(originalPrice) > Number(discountPrice) && (
          <span className="text-sm line-through text-gray-400">{fmt(originalPrice)}</span>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
