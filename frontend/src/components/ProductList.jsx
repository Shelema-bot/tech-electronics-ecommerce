import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { usePreference } from "../context/PreferenceContext";
import { getImageUrl } from "../utils/imageUrl";
import { CAT_IMAGE_MAP } from "./CategoryCard/CategoryCard";
import "./ProductList.css";

const SORT_OPTIONS = [
  { value: "default",    key: "sort.default",    label: "Default" },
  { value: "price-asc",  key: "sort.price-asc",  label: "Price: Low to High" },
  { value: "price-desc", key: "sort.price-desc", label: "Price: High to Low" },
  { value: "name-asc",   key: "sort.name-asc",   label: "Name: A–Z" },
  { value: "name-desc",  key: "sort.name-desc",  label: "Name: Z–A" },
  { value: "newest",     key: "sort.newest",     label: "Newest First" },
];

const ITEMS_PER_PAGE = 12;

/* ── Dual-Sided Pagination Controls Component ── */
function PaginationControls({ currentPage, totalPages, onPageChange, totalItems, startIndex, endIndex, className = "" }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const handlePageSelect = (page) => {
    onPageChange(page);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className={`pl-pagination-bar ${className}`}>
      <div className="pl-pagination-info">
        Showing <strong>{Math.min(startIndex + 1, totalItems)}–{Math.min(endIndex, totalItems)}</strong> of <strong>{totalItems}</strong> products
      </div>
      <div className="pl-pagination-nav">
        <button
          className="pl-page-btn pl-prev-btn"
          disabled={currentPage <= 1}
          onClick={() => handlePageSelect(currentPage - 1)}
          aria-label="Previous Page"
        >
          ‹ Prev
        </button>

        <div className="pl-page-numbers">
          {pages.map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="pl-page-dots">…</span>
            ) : (
              <button
                key={p}
                className={`pl-page-num ${p === currentPage ? "active" : ""}`}
                onClick={() => handlePageSelect(p)}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          className="pl-page-btn pl-next-btn"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageSelect(currentPage + 1)}
          aria-label="Next Page"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

function ProductList() {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [sort, setSort]               = useState("default");
  const [priceMax, setPriceMax]       = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams]                = useSearchParams();
  const navigate                      = useNavigate();
  const { t }                         = useTranslation();

  const category = searchParams.get("category") || "";
  const search   = searchParams.get("search")   || "";

  const { addToCart }                   = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast                           = useToast();
  const { fmt, currency }               = usePreference();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [pRes, cRes] = await Promise.all([
          API.get("/products"),
          API.get("/categories"),
        ]);
        setProducts(pRes.data.products || pRes.data);
        setCategories(cRes.data || []);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, priceMax, sort]);

  // Filter
  let filtered = products;
  if (category) filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
  if (search)   filtered = filtered.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );
  if (priceMax && !isNaN(priceMax)) filtered = filtered.filter(p => (p.discountPrice || p.price) <= Number(priceMax));

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;
    if (sort === "price-asc")  return priceA - priceB;
    if (sort === "price-desc") return priceB - priceA;
    if (sort === "name-asc")   return a.name?.localeCompare(b.name);
    if (sort === "name-desc")  return b.name?.localeCompare(a.name);
    if (sort === "newest")     return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  // Pagination calculation
  const totalItems  = sorted.length;
  const totalPages  = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validPage   = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex  = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex    = startIndex + ITEMS_PER_PAGE;
  const paginated   = sorted.slice(startIndex, endIndex);

  const handleCatClick = (name) => {
    setSidebarOpen(false);
    navigate(`/products?category=${encodeURIComponent(name)}`);
  };

  const clearFilters = () => {
    setSort("default");
    setPriceMax("");
    navigate("/products");
  };

  const activeFilters = (category ? 1 : 0) + (priceMax ? 1 : 0) + (sort !== "default" ? 1 : 0);

  const pageTitle = category
    ? `${category} ${t("product.products", "Products")}`
    : search
    ? `${t("common.search", "Search")}: "${search}"`
    : t("product.allProducts", "All Products");

  return (
    <div className="pl-page">

      {/* ── Top bar ── */}
      <div className="pl-topbar">
        <div className="pl-title-area">
          <h1>{pageTitle}</h1>
          <span className="pl-count">{sorted.length} {t("product.products", "products")}</span>
        </div>
        <div className="pl-controls">
          {/* Mobile filter toggle */}
          <button className="pl-filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ⚙ {t("product.filters", "Filters")} {activeFilters > 0 && <span className="pl-filter-badge">{activeFilters}</span>}
          </button>
          {/* Sort */}
          <select className="pl-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {t(o.key, o.label)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pl-body">

        {/* ── Sidebar ── */}
        <aside className={`pl-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="pl-sidebar-header">
            <span>{t("product.filters", "Filters")}</span>
            {activeFilters > 0 && (
              <button className="pl-clear-btn" onClick={clearFilters}>{t("product.clearAll", "Clear all")}</button>
            )}
            <button className="pl-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          {/* Categories */}
          <div className="pl-filter-group">
            <h4>{t("product.filterCategories", "Categories")}</h4>
            <button
              className={`pl-cat-btn ${!category ? "active" : ""}`}
              onClick={() => { setSidebarOpen(false); navigate("/products"); }}
            >
              {t("nav.allCategories", "All Categories →")}
            </button>
            {categories.map(cat => {
              const img = CAT_IMAGE_MAP[cat.name];
              return (
                <button
                  key={cat._id}
                  className={`pl-cat-btn ${category === cat.name ? "active" : ""}`}
                  onClick={() => handleCatClick(cat.name)}
                >
                  {img && <img src={img} alt="" className="pl-cat-thumb" />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Price */}
          <div className="pl-filter-group">
            <h4>{t("product.maxPrice", "Max Price")} ({currency.code})</h4>
            <input
              type="number"
              className="pl-price-input"
              placeholder={`e.g. ${currency.code === "ETB" ? "50000" : "1000"}`}
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              min="0"
            />
            {priceMax && (
              <button className="pl-clear-price" onClick={() => setPriceMax("")}>✕ {t("common.cancel", "Clear")}</button>
            )}
          </div>

          {/* Sort (sidebar duplicate for mobile) */}
          <div className="pl-filter-group pl-sort-mobile">
            <h4>{t("product.sortBy", "Sort By")}</h4>
            <select className="pl-sort-select-sb" value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {t(o.key, o.label)}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && <div className="pl-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* ── Products Main Area ── */}
        <div className="pl-main">
          {loading ? (
            <div className="pl-loading">
              <div className="pl-spinner" />
              {t("product.loading", "Loading products...")}
            </div>
          ) : sorted.length === 0 ? (
            <div className="pl-empty">
              <div className="pl-empty-icon">🔍</div>
              <h3>{t("product.noProductsFound", "No products found")}</h3>
              <p>{t("product.adjustFilters", "Try adjusting your filters or search term.")}</p>
              <button className="pl-empty-btn" onClick={clearFilters}>{t("product.clearFilters", "Clear Filters")}</button>
            </div>
          ) : (
            <>
              {/* ── TOP PAGINATION CONTROLS ── */}
              <PaginationControls
                currentPage={validPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                className="pl-pagination-top"
              />

              {/* ── PRODUCTS GRID ── */}
              <div className="pl-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {paginated.map(product => {
                  const inWish = isInWishlist(product._id);
                  const outOfStock = product.stock === 0;
                  const lowStock = product.stock > 0 && product.stock <= 5;

                  const discountPrice = product.discountPrice || product.price;
                  const originalPrice = product.originalPrice || (product.discountPrice && product.price > product.discountPrice ? product.price : null);
                  const hasDiscount = originalPrice && Number(originalPrice) > Number(discountPrice);

                  return (
                    <div className="pl-card" key={product._id}>
                      {/* Badges */}
                      <div className="pl-badges">
                        {outOfStock && <span className="pl-badge out">{t("product.outOfStock", "Out of Stock")}</span>}
                        {lowStock && <span className="pl-badge low">{t("product.lowStock", "⚠ Only {{count}} left", { count: product.stock })}</span>}
                      </div>

                      {/* Wishlist */}
                      <button
                        className={`pl-wish ${inWish ? "active" : ""}`}
                        onClick={() => toggleWishlist(product)}
                        title={inWish ? t("product.removeFromWishlist", "Remove from wishlist") : t("product.addToWishlist", "Add to wishlist")}
                      >
                        {inWish ? "♥" : "♡"}
                      </button>

                      {/* Image */}
                      <Link to={`/product/${product._id}`} className="pl-img-link">
                        {product.images?.length > 0 ? (
                          <img
                            src={getImageUrl(product.images[0])}
                            alt={product.name}
                            className="pl-img"
                          />
                        ) : (
                          <div className="pl-no-img">📦</div>
                        )}
                      </Link>

                      {/* Body */}
                      <div className="pl-card-body">
                        {product.brand && <p className="pl-brand">{product.brand}</p>}
                        <Link to={`/product/${product._id}`} className="pl-name-link">
                          <h3 className="pl-name">{product.name}</h3>
                        </Link>
                        {product.category && <p className="pl-category">{product.category}</p>}

                        <div className="pl-footer">
                          <div className="flex items-center gap-2">
                            <span className="pl-price text-lg font-bold text-blue-600">
                              {fmt(discountPrice)}
                            </span>
                            {hasDiscount && (
                              <span className="text-sm line-through text-gray-400">
                                {fmt(originalPrice)}
                              </span>
                            )}
                          </div>
                          <button
                            className="pl-cart-btn"
                            disabled={outOfStock}
                            onClick={() => {
                              addToCart({ ...product, price: discountPrice });
                              if (!outOfStock) toast.success(`${product.name} ${t("product.addedToCart", "added to cart")}`);
                            }}
                          >
                            {outOfStock ? t("product.soldOut", "Sold Out") : t("product.addToCart", "Add to Cart")}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── BOTTOM PAGINATION CONTROLS ── */}
              <PaginationControls
                currentPage={validPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                className="pl-pagination-bottom"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
