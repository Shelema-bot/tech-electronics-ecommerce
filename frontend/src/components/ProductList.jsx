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
import Pagination from "./common/Pagination";
import "./ProductList.css";

const SORT_OPTIONS = [
  { value: "default",    key: "sort.default",    label: "Default" },
  { value: "price-asc",  key: "sort.price-asc",  label: "Price: Low to High" },
  { value: "price-desc", key: "sort.price-desc", label: "Price: High to Low" },
  { value: "name-asc",   key: "sort.name-asc",   label: "Name: A–Z" },
  { value: "name-desc",  key: "sort.name-desc",  label: "Name: Z–A" },
  { value: "newest",     key: "sort.newest",     label: "Newest First" },
];

function ProductList() {
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [sort, setSort]                 = useState("default");
  const [priceMax, setPriceMax]         = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [searchParams]                  = useSearchParams();
  const navigate                        = useNavigate();
  const { t }                           = useTranslation();

  const currentTab    = searchParams.get("tab") || "all";
  const selectedBrand = searchParams.get("brand") || "";
  const category      = searchParams.get("category") || "";
  const search        = searchParams.get("search")   || "";

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
        const pData = pRes.data;
        const fetchedProducts = Array.isArray(pData?.products)
          ? pData.products
          : Array.isArray(pData)
          ? pData
          : [];
        setProducts(fetchedProducts);

        const cData = cRes.data;
        const fetchedCategories = Array.isArray(cData?.categories)
          ? cData.categories
          : Array.isArray(cData)
          ? cData
          : [];
        setCategories(fetchedCategories);
      } catch (e) {
        console.error("Failed to load products/categories:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, priceMax, sort, currentTab, selectedBrand]);

  const safeProducts   = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Dynamic & Curated Brands list
  const catalogBrands = Array.from(
    new Set(
      safeProducts
        .map(p => (p?.brand && typeof p.brand === "string" ? p.brand.trim() : ""))
        .filter(Boolean)
    )
  );
  const FALLBACK_BRANDS = ["Apple", "Samsung", "HP", "Dell", "Lenovo", "Asus", "Sony", "Acer", "Canon", "DJI", "Logitech"];
  const displayBrands = catalogBrands.length > 0 ? catalogBrands : FALLBACK_BRANDS;

  // Active Deals count
  const dealsCount = safeProducts.filter(p => {
    const price = Number(p?.price || 0);
    const disc  = Number(p?.discountPrice || 0);
    return disc > 0 && disc < price;
  }).length;

  // Safe Filtering
  let filtered = safeProducts;

  // Tab-specific filtering
  if (currentTab === "deals" || currentTab === "hot") {
    filtered = filtered.filter(p => {
      const price = Number(p?.price || 0);
      const disc  = Number(p?.discountPrice || 0);
      return disc > 0 && disc < price;
    });
  }

  // Brand filtering
  if (selectedBrand) {
    const brandQuery = String(selectedBrand).toLowerCase().trim();
    filtered = filtered.filter(p => {
      const b = String(p?.brand || "").toLowerCase().trim();
      const n = String(p?.name || "").toLowerCase().trim();
      return b === brandQuery || n.includes(brandQuery);
    });
  }

  if (category) {
    const catQuery = String(category).toLowerCase().trim();
    filtered = filtered.filter(p => String(p?.category || "").toLowerCase().trim() === catQuery);
  }

  if (search) {
    const sQuery = String(search).toLowerCase().trim();
    filtered = filtered.filter(p =>
      String(p?.name || "").toLowerCase().includes(sQuery) ||
      String(p?.brand || "").toLowerCase().includes(sQuery) ||
      String(p?.category || "").toLowerCase().includes(sQuery)
    );
  }

  if (priceMax && !isNaN(priceMax)) {
    const maxVal = Number(priceMax);
    filtered = filtered.filter(p => {
      const effPrice = Number(p?.discountPrice || p?.price || 0);
      return effPrice <= maxVal;
    });
  }

  // Safe Sort
  const sorted = [...filtered].sort((a, b) => {
    if (currentTab === "new" && sort === "default") {
      const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      return timeB - timeA;
    }
    const priceA = Number(a?.discountPrice || a?.price || 0);
    const priceB = Number(b?.discountPrice || b?.price || 0);
    if (sort === "price-asc")  return priceA - priceB;
    if (sort === "price-desc") return priceB - priceA;
    if (sort === "name-asc")   return String(a?.name || "").localeCompare(String(b?.name || ""));
    if (sort === "name-desc")  return String(b?.name || "").localeCompare(String(a?.name || ""));
    if (sort === "newest") {
      const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      return timeB - timeA;
    }
    return 0;
  });

  const handleTabChange = (newTab) => {
    const params = new URLSearchParams(searchParams);
    if (newTab === "all") {
      params.delete("tab");
      params.delete("brand");
    } else {
      params.set("tab", newTab);
      if (newTab !== "brands") {
        params.delete("brand");
      }
    }
    const qs = params.toString();
    navigate(qs ? `/products?${qs}` : "/products");
  };

  const handleBrandSelect = (b) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", "brands");
    if (!b) {
      params.delete("brand");
    } else {
      params.set("brand", b);
    }
    const qs = params.toString();
    navigate(qs ? `/products?${qs}` : "/products");
  };

  // Pagination calculation
  const totalItems  = sorted.length;
  const totalPages  = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validPage   = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex  = (validPage - 1) * itemsPerPage;
  const endIndex    = startIndex + itemsPerPage;
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

  const activeFilters = (category ? 1 : 0) + (priceMax ? 1 : 0) + (sort !== "default" ? 1 : 0) + (selectedBrand ? 1 : 0) + (currentTab !== "all" ? 1 : 0);

  const pageTitle = selectedBrand
    ? `${selectedBrand} ${t("product.products", "Products")}`
    : currentTab === "deals" || currentTab === "hot"
    ? `🔥 ${t("product.hotDealsTitle", "Hot Deals & Clearances")}`
    : currentTab === "new"
    ? `✨ ${t("product.newArrivalsTitle", "New Arrivals")}`
    : category
    ? `${category} ${t("product.products", "Products")}`
    : search
    ? `${t("common.search", "Search")}: "${search}"`
    : t("product.allProducts", "All Products");

  return (
    <div className="pl-page">

      {/* ── Product Section Sub-Navbar ── */}
      <nav className="pl-sub-navbar" aria-label="Product Navigation">
        <div className="pl-sub-nav-tabs">
          <button
            type="button"
            className={`pl-sub-tab ${currentTab === "all" && !selectedBrand ? "active" : ""}`}
            onClick={() => handleTabChange("all")}
          >
            <span className="pl-sub-tab-icon">🛍️</span>
            <span className="pl-sub-tab-text">{t("product.allProducts", "All Products")}</span>
          </button>

          <button
            type="button"
            className={`pl-sub-tab pl-tab-hot ${currentTab === "deals" || currentTab === "hot" ? "active" : ""}`}
            onClick={() => handleTabChange("deals")}
          >
            <span className="pl-sub-tab-icon">🔥</span>
            <span className="pl-sub-tab-text">{t("product.dealsHot", "Hot Deals")}</span>
            {dealsCount > 0 && <span className="pl-sub-tab-pill">{dealsCount}</span>}
          </button>

          <button
            type="button"
            className={`pl-sub-tab ${currentTab === "new" ? "active" : ""}`}
            onClick={() => handleTabChange("new")}
          >
            <span className="pl-sub-tab-icon">✨</span>
            <span className="pl-sub-tab-text">{t("product.newArrivals", "New Arrivals")}</span>
          </button>

          <button
            type="button"
            className={`pl-sub-tab ${currentTab === "brands" || selectedBrand ? "active" : ""}`}
            onClick={() => handleTabChange("brands")}
          >
            <span className="pl-sub-tab-icon">🏷️</span>
            <span className="pl-sub-tab-text">{t("product.brands", "Brands")}</span>
            {selectedBrand && <span className="pl-sub-tab-brand-active">: {selectedBrand}</span>}
          </button>
        </div>

        {/* Deals Hot Highlight Strip */}
        {(currentTab === "deals" || currentTab === "hot") && (
          <div className="pl-deals-strip">
            <span className="pl-deals-strip-icon">🔥</span>
            <div className="pl-deals-strip-text">
              <strong>{t("product.hotDealsTitle", "Limited-Time Hot Deals & Clearance Sales")}</strong>
              <span>{t("product.hotDealsDesc", "Special discounted prices on certified tech gadgets. While stock lasts!")}</span>
            </div>
          </div>
        )}

        {/* Brands Selector Drawer */}
        {(currentTab === "brands" || selectedBrand) && (
          <div className="pl-brands-strip">
            <span className="pl-brands-strip-title">{t("product.shopByBrand", "Shop by Brand:")}</span>
            <div className="pl-brands-chips-scroll">
              <button
                type="button"
                className={`pl-brand-chip ${!selectedBrand ? "active" : ""}`}
                onClick={() => handleBrandSelect("")}
              >
                {t("product.allBrands", "All Brands")}
              </button>
              {displayBrands.map(b => {
                const bStr = String(b || "");
                const isSelected = selectedBrand && bStr.toLowerCase() === String(selectedBrand).toLowerCase();
                return (
                  <button
                    key={bStr}
                    type="button"
                    className={`pl-brand-chip ${isSelected ? "active" : ""}`}
                    onClick={() => handleBrandSelect(bStr)}
                  >
                    {bStr}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

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
              {totalPages > 1 && (
                <Pagination
                  currentPage={validPage}
                  totalItems={totalItems}
                  pageSize={itemsPerPage}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  onPageSizeChange={(sz) => {
                    setItemsPerPage(sz);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={[6, 12, 24, 48]}
                  itemLabel={t("product.products", "products")}
                  showPageSize={false}
                  showQuickJump={false}
                  className="pl-pagination-top"
                />
              )}

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

              {/* ── PAGINATION CONTROLS ── */}
              <Pagination
                currentPage={validPage}
                totalItems={totalItems}
                pageSize={itemsPerPage}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                onPageSizeChange={(sz) => {
                  setItemsPerPage(sz);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 12, 24, 48]}
                itemLabel={t("product.products", "products")}
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
