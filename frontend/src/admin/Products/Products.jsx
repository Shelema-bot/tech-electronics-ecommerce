import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./Products.css";

const PER_PAGE = 10;

function Products() {
  const toast = useToast();
  const [products, setProducts]       = useState([]);
  const [search, setSearch]           = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [stockValues, setStockValues] = useState({});
  const [loading, setLoading]         = useState(true);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data.products || res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
      toast.success("Product deleted successfully");
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };

  const updateStock = async (id) => {
    const val = stockValues[id];
    if (val === "" || val === undefined) { toast.warning("Enter a stock value first"); return; }
    try {
      await API.put(`/products/${id}`, { stock: Number(val) });
      fetchProducts();
      toast.success("Stock updated successfully");
    } catch (err) {
      console.log(err);
      toast.error("Stock update failed");
    }
  };

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch   = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalPages      = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentProducts = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: "28px", color: "#64748b" }}>Loading products...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="products-admin">

        <div className="products-header">
          <div>
            <h1>Products Management</h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
              {products.length} products total
            </p>
          </div>
          <div className="products-actions">
            <input
              type="text"
              placeholder="Search products..."
              className="search-box"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            <select
              className="category-filter"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Link to="/admin/add-product" className="add-btn">+ Add Product</Link>
          </div>
        </div>

        <div className="products-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Image</th><th>Name</th><th>Category</th>
                <th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length === 0 ? (
                <tr><td colSpan="7" className="products-empty">No products found</td></tr>
              ) : (
                currentProducts.map(product => (
                  <tr key={product._id}>
                    <td>
                      {product.images?.length > 0 ? (
                        <img src={getImageUrl(product.images[0])} className="product-thumb" alt={product.name} />
                      ) : "—"}
                    </td>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{Number(product.price).toLocaleString()} ETB</td>
                    <td>
                      <input
                        type="number"
                        className="stock-input"
                        value={stockValues[product._id] ?? product.stock}
                        onChange={e => setStockValues({ ...stockValues, [product._id]: e.target.value })}
                        min="0"
                      />
                      <button className="stock-update-btn" onClick={() => updateStock(product._id)}>Save</button>
                    </td>
                    <td>
                      {product.stock === 0 ? (
                        <span className="stock out">Out of Stock</span>
                      ) : product.stock <= 5 ? (
                        <span className="stock low">Low Stock</span>
                      ) : (
                        <span className="stock good">In Stock</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/admin/edit-product/${product._id}`} className="edit">Edit</Link>
                      <button className="delete" onClick={() => deleteProduct(product._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={currentPage === i + 1 ? "active-page" : ""} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default Products;
