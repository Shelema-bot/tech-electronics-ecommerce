import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./Products.css";

const PER_PAGE = 12;

function Products() {
  const toast = useToast();
  const [products, setProducts]             = useState([]);
  const [search, setSearch]                 = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter]       = useState("all");
  const [viewMode, setViewMode]             = useState("table"); // "table" | "grid"
  const [currentPage, setCurrentPage]       = useState(1);
  const [stockValues, setStockValues]       = useState({});
  const [loading, setLoading]               = useState(true);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products");
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const updateStock = async (id) => {
    const val = stockValues[id];
    if (val === "" || val === undefined) { toast.warning("Enter a stock value first"); return; }
    try {
      await API.put(`/products/${id}`, { stock: Number(val) });
      toast.success("Stock updated");
      fetchProducts();
    } catch (err) {
      toast.error("Stock update failed");
    }
  };

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch   = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchStock    = stockFilter === "all" ||
      (stockFilter === "in"  && p.stock > 5)   ||
      (stockFilter === "low" && p.stock > 0 && p.stock <= 5) ||
      (stockFilter === "out" && p.stock === 0);
    return matchSearch && matchCategory && matchStock;
  });

  const totalPages      = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated       = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // Stats
  const inStock  = products.filter(p => p.stock > 5).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outStock = products.filter(p => p.stock === 0).length;

  const stockBadge = (stock) => {
    if (stock === 0)    return { label:"Out of Stock", cls:"out" };
    if (stock <= 5)     return { label:"Low Stock",    cls:"low" };
    return                     { label:"In Stock",     cls:"good" };
  };

  const handleSearchChange = (e) => { setSearch(e.target.value); setCurrentPage(1); };
  const handleCatChange    = (e) => { setCategoryFilter(e.target.value); setCurrentPage(1); };
  const handleStockFilter  = (v) => { setStockFilter(v); setCurrentPage(1); };

  if (loading) {
    return (
      <AdminLayout>
        <div className="prod-loading-wrap">
          <div className="prod-spinner" /> Loading products…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="products-admin">

        {/* Header */}
        <div className="prod-header">
          <div>
            <h1 className="prod-title">Products</h1>
            <p className="prod-sub">Manage your product catalogue</p>
          </div>
          <Link to="/admin/add-product" className="prod-add-btn">+ Add Product</Link>
        </div>

        {/* Stats */}
        <div className="prod-stats-grid">
          {[
            { label:"Total Products", value:products.length, icon:"📦", color:"#2563eb" },
            { label:"In Stock",       value:inStock,         icon:"✅", color:"#16a34a" },
            { label:"Low Stock",      value:lowStock,        icon:"⚠️", color:"#f59e0b" },
            { label:"Out of Stock",   value:outStock,        icon:"❌", color:"#dc2626" },
          ].map(s => (
            <div
              key={s.label}
              className={`prod-stat-card ${stockFilter === (s.label === "Total Products" ? "all" : s.label === "In Stock" ? "in" : s.label === "Low Stock" ? "low" : "out") ? "selected" : ""}`}
              style={{ borderTop:`3px solid ${s.color}`, cursor:"pointer" }}
              onClick={() => handleStockFilter(
                s.label === "Total Products" ? "all"
                : s.label === "In Stock" ? "in"
                : s.label === "Low Stock" ? "low" : "out"
              )}
            >
              <div className="prod-stat-row">
                <span className="prod-stat-icon" style={{ background:`${s.color}18`, color:s.color }}>{s.icon}</span>
                <span className="prod-stat-value" style={{ color:s.color }}>{s.value}</span>
              </div>
              <div className="prod-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="prod-toolbar">
          <input
            type="text"
            className="prod-search"
            placeholder="🔍  Search products…"
            value={search}
            onChange={handleSearchChange}
          />
          <select className="prod-cat-filter" value={categoryFilter} onChange={handleCatChange}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="prod-view-toggle">
            <button
              className={`prod-view-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table view"
            >☰</button>
            <button
              className={`prod-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >⊞</button>
          </div>
          <span className="prod-count">{filtered.length} of {products.length}</span>
        </div>

        {paginated.length === 0 ? (
          <div className="prod-empty">
            <div style={{ fontSize:40, marginBottom:8 }}>📦</div>
            No products found
          </div>
        ) : viewMode === "table" ? (
          /* ── Table view ── */
          <div className="products-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Image</th><th>Name</th><th>Category</th>
                  <th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(product => {
                  const sb = stockBadge(product.stock);
                  return (
                    <tr key={product._id}>
                      <td>
                        {product.images?.length > 0 ? (
                          <img src={getImageUrl(product.images[0])} className="product-thumb" alt={product.name} />
                        ) : (
                          <div className="prod-no-img">📷</div>
                        )}
                      </td>
                      <td><div className="prod-name">{product.name}</div></td>
                      <td><span className="prod-cat-badge">{product.category}</span></td>
                      <td className="prod-price">{Number(product.price).toLocaleString()} ETB</td>
                      <td>
                        <div className="prod-stock-cell">
                          <input
                            type="number"
                            className="stock-input"
                            value={stockValues[product._id] ?? product.stock}
                            onChange={e => setStockValues({ ...stockValues, [product._id]: e.target.value })}
                            min="0"
                          />
                          <button className="stock-update-btn" onClick={() => updateStock(product._id)}>Save</button>
                        </div>
                      </td>
                      <td>
                        <span className={`stock ${sb.cls}`}>{sb.label}</span>
                      </td>
                      <td>
                        <div style={{ display:"flex", gap:6 }}>
                          <Link to={`/admin/edit-product/${product._id}`} className="edit">Edit</Link>
                          <button className="delete" onClick={() => deleteProduct(product._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── Grid view ── */
          <div className="prod-grid">
            {paginated.map(product => {
              const sb = stockBadge(product.stock);
              return (
                <div key={product._id} className="prod-grid-card">
                  <div className="prod-grid-img-wrap">
                    {product.images?.length > 0 ? (
                      <img src={getImageUrl(product.images[0])} alt={product.name} className="prod-grid-img" />
                    ) : (
                      <div className="prod-grid-no-img">📷</div>
                    )}
                    <span className={`prod-grid-stock-badge stock ${sb.cls}`}>{sb.label}</span>
                  </div>
                  <div className="prod-grid-body">
                    <div className="prod-grid-name">{product.name}</div>
                    <div className="prod-grid-cat">{product.category}</div>
                    <div className="prod-grid-price">{Number(product.price).toLocaleString()} ETB</div>
                    <div className="prod-grid-stock-row">
                      <input
                        type="number"
                        className="stock-input"
                        value={stockValues[product._id] ?? product.stock}
                        onChange={e => setStockValues({ ...stockValues, [product._id]: e.target.value })}
                        min="0"
                      />
                      <button className="stock-update-btn" onClick={() => updateStock(product._id)}>✓</button>
                    </div>
                    <div className="prod-grid-actions">
                      <Link to={`/admin/edit-product/${product._id}`} className="edit" style={{ flex:1, textAlign:"center" }}>Edit</Link>
                      <button className="delete" style={{ flex:1 }} onClick={() => deleteProduct(product._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} className={currentPage === p ? "active-page" : ""} onClick={() => setCurrentPage(p)}>
                  {p}
                </button>
              );
            })}
            {totalPages > 7 && <span style={{ color:"#94a3b8", alignSelf:"center" }}>…</span>}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default Products;
