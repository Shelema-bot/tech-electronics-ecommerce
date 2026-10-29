import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import Pagination from "../../components/common/Pagination";
import VideoMeetingRoom from "../Meetings/VideoMeetingRoom";
import DashboardCard from "../components/DashboardCard";
import SalesChart from "../components/Charts/SalesChart";
import OrdersChart from "../components/Charts/OrdersChart";
import CategoryChart from "../components/Charts/CategoryChart";
import { normalizeRole, isShelema } from "../AdminRoute";
import { getImageUrl } from "../../utils/imageUrl";
import {
  FaChartLine, FaShoppingCart, FaBox, FaUsers,
  FaCheckCircle, FaTimesCircle, FaSearch, FaPlus,
  FaEye, FaTrash, FaEdit, FaSave, FaUserCheck,
  FaClipboardCheck, FaLock, FaTags, FaVideo
} from "react-icons/fa";
import "../components/Charts/Charts.css";
import "./Dashboard.css";

/* ── Status styles for orders ── */
const STATUS_META = {
  Pending:    { color: "#a16207", bg: "#fef9c3", icon: "🕐" },
  Processing: { color: "#1d4ed8", bg: "#dbeafe", icon: "⚙️" },
  Shipped:    { color: "#7c3aed", bg: "#ede9fe", icon: "🚚" },
  Delivered:  { color: "#16a34a", bg: "#dcfce7", icon: "✅" },
  Cancelled:  { color: "#dc2626", bg: "#fee2e2", icon: "✕" },
};
const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

/* ── Consolidated Role Display mapping ── */
const CONSOLIDATED_ROLES = [
  { value: "super_admin",       label: "Owner / CEO",        badgeBg: "#7c3aed" },
  { value: "admin",             label: "Admin",              badgeBg: "#2563eb" },
  { value: "cashier_finance",   label: "Cashier / Finance",  badgeBg: "#0891b2" },
  { value: "delivery",          label: "Delivery",           badgeBg: "#ea580c" },
  { value: "seller",            label: "Seller",             badgeBg: "#16a34a" },
  { value: "customer",          label: "Customer",           badgeBg: "#64748b" },
];

function getRoleLabel(role) {
  const norm = normalizeRole(role);
  if (norm === "SuperAdmin")                          return "Owner / CEO";
  if (norm === "Admin" || norm === "InventoryManager") return "Admin";
  if (norm === "CashierFinance")                      return "Cashier / Finance";
  if (norm === "Delivery")                            return "Delivery";
  if (norm === "Seller")                              return "Seller";
  return "Customer";
}

function getRoleBadgeBg(role) {
  const norm = normalizeRole(role);
  if (norm === "SuperAdmin")                          return "#7c3aed";
  if (norm === "Admin" || norm === "InventoryManager") return "#2563eb";
  if (norm === "CashierFinance")                      return "#0891b2";
  if (norm === "Delivery")                            return "#ea580c";
  if (norm === "Seller")                              return "#16a34a";
  return "#64748b";
}

// Helper to ensure state collections are always safe arrays
const toSafeArray = (data, key = null) => {
  if (Array.isArray(data)) return data;
  if (data && key && Array.isArray(data[key])) return data[key];
  if (data && Array.isArray(data.products)) return data.products;
  if (data && Array.isArray(data.orders)) return data.orders;
  if (data && Array.isArray(data.payments)) return data.payments;
  if (data && Array.isArray(data.users)) return data.users;
  if (data && Array.isArray(data.meetings)) return data.meetings;
  if (data && Array.isArray(data.categories)) return data.categories;
  if (data && Array.isArray(data.sellers)) return data.sellers;
  return [];
};

export default function Dashboard({ initialTab = "overview" }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Read tab from URL ?tab=... or prop
  const currentUrlTab = new URLSearchParams(location.search).get("tab") || initialTab || "overview";
  const [activeTab, setActiveTab] = useState(currentUrlTab);

  // Sync state if URL changes
  useEffect(() => {
    const qTab = new URLSearchParams(location.search).get("tab");
    if (qTab && qTab !== activeTab) {
      setActiveTab(qTab);
    }
  }, [location.search]);

  const switchTab = (tabKey) => {
    setActiveTab(tabKey);
    navigate(`/admin?tab=${tabKey}`, { replace: true });
  };

  // Current logged in user & role
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const shelemaUser = isShelema(currentUser);
  const userRoleNorm = normalizeRole(currentUser.role, currentUser);
  const isOwnerSuperAdmin = shelemaUser && (userRoleNorm === "SuperAdmin" || currentUser.role === "super_admin" || currentUser.role === "owner");

  // ── Global states ──
  const [loading, setLoading]         = useState(true);
  const [report, setReport]           = useState({
    totalProducts: 0, totalOrders: 0, totalCustomers: 0,
    totalRevenue: 0, pendingPayments: 0,
    productsByCategory: [], monthlySales: [], ordersByStatus: []
  });
  const [orders, setOrders]                     = useState([]);
  const [payments, setPayments]                 = useState([]);
  const [products, setProducts]                 = useState([]);
  const [users, setUsers]                       = useState([]);
  const [notifications, setNotifs]              = useState([]);
  const [pendingProducts, setPendingProducts]   = useState([]);
  const [pendingSellers, setPendingSellers]     = useState([]);

  // Modals & sub-states
  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [orderSearch, setOrderSearch]         = useState("");
  const [orderFilter, setOrderFilter]         = useState("All");

  const [productSearch, setProductSearch]     = useState("");
  const [productCategory, setProductCategory] = useState("All");
  const [stockFilter, setStockFilter]         = useState("all");
  const [stockInputs, setStockInputs]         = useState({});
  const [showAddProduct, setShowAddProduct]   = useState(false);
  const [editingProduct, setEditingProduct]   = useState(null);
  const [newProduct, setNewProduct]           = useState({
    name: "", price: "", originalPrice: "", category: "Laptops", stock: 10, description: ""
  });

  // Category management states
  const [categoriesList, setCategoriesList]   = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory]         = useState({ name: "" });

  const [userSearch, setUserSearch]           = useState("");
  const [userRoleFilter, setUserRoleFilter]   = useState("all");
  const [feedback, setFeedback]               = useState(null);

  // Approval notes state
  const [productNotes, setProductNotes]       = useState({});
  const [sellerNotes, setSellerNotes]         = useState({});

  // ── Table Pagination States ──
  const [ordersPage, setOrdersPage]               = useState(1);
  const [ordersPerPage, setOrdersPerPage]         = useState(10);
  const [paymentsPage, setPaymentsPage]           = useState(1);
  const [paymentsPerPage, setPaymentsPerPage]     = useState(10);
  const [productsPage, setProductsPage]           = useState(1);
  const [productsPerPage, setProductsPerPage]     = useState(10);
  const [usersPage, setUsersPage]                 = useState(1);
  const [usersPerPage, setUsersPerPage]           = useState(10);
  const [categoriesPage, setCategoriesPage]       = useState(1);
  const [categoriesPerPage, setCategoriesPerPage] = useState(10);
  const [meetingsPage, setMeetingsPage]           = useState(1);
  const [meetingsPerPage, setMeetingsPerPage]     = useState(6);
  const [dashboardMeetings, setDashboardMeetings] = useState([]);
  const [activeVideoMeeting, setActiveVideoMeeting] = useState(null);

  // Reset pagination when searches or filters change
  useEffect(() => { setOrdersPage(1); }, [orderSearch, orderFilter]);
  useEffect(() => { setPaymentsPage(1); }, [orderSearch]);
  useEffect(() => { setProductsPage(1); }, [productSearch, productCategory, stockFilter]);
  useEffect(() => { setUsersPage(1); }, [userSearch]);

  const showNotice = (msg, isErr = false) => {
    setFeedback({ msg, isErr });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Redirect away from users tab if not Shelema
  useEffect(() => {
    if (activeTab === "users" && !shelemaUser) {
      switchTab("overview");
    }
  }, [activeTab, shelemaUser]);

  // ── Fetch Initial Data ──
  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Load report & analytics overview (all staff: SuperAdmin, Admin, CashierFinance, Delivery)
      API.get("/admin/reports", { headers })
        .then(res => setReport(res.data || {}))
        .catch(err => console.warn("Reports fetch:", err));

      // Load meetings for all staff
      API.get("/meetings", { headers })
        .then(res => setDashboardMeetings(toSafeArray(res.data, "meetings")))
        .catch(() => {});

      // Load notifications
      API.get("/notifications", { headers })
        .then(res => setNotifs(res.data.notifications?.slice(0, 5) || []))
        .catch(() => {});

      // Load orders & payments if authorized (Shelema, CashierFinance, Delivery)
      if (shelemaUser || ["CashierFinance", "Delivery"].includes(userRoleNorm)) {
        API.get("/admin/orders", { headers })
          .then(res => setOrders(toSafeArray(res.data, "orders")))
          .catch(err => console.warn("Orders fetch:", err));

        if (shelemaUser || userRoleNorm === "CashierFinance") {
          API.get("/admin/payments", { headers })
            .then(res => setPayments(toSafeArray(res.data, "payments")))
            .catch(err => console.warn("Payments fetch:", err));
        }
      }

      // Load products if authorized (Shelema, Admin, InventoryManager, Seller)
      if (shelemaUser || ["Admin", "InventoryManager", "Seller"].includes(userRoleNorm)) {
        API.get("/products")
          .then(res => setProducts(toSafeArray(res.data, "products")))
          .catch(err => console.warn("Products fetch:", err));
      }

      // Load pending products for approval (SuperAdmin, Admin, InventoryManager)
      if (shelemaUser || ["Admin", "InventoryManager"].includes(userRoleNorm)) {
        API.get("/admin/products/pending", { headers })
          .catch(() => API.get("/staff/products/pending", { headers }))
          .then(res => setPendingProducts(toSafeArray(res?.data, "products")))
          .catch(err => console.warn("Pending products fetch:", err));
      }

      // Load pending sellers for approval (SuperAdmin, CashierFinance, Admin, InventoryManager)
      if (shelemaUser || ["CashierFinance", "Admin", "InventoryManager"].includes(userRoleNorm)) {
        API.get("/admin/sellers/pending", { headers })
          .catch(() => API.get("/staff/verifications/pending", { headers }))
          .then(res => setPendingSellers(toSafeArray(res?.data, "sellers")))
          .catch(err => console.warn("Pending sellers fetch:", err));
      }

      // Load categories
      API.get("/categories")
        .then(res => setCategoriesList(toSafeArray(res.data, "categories")))
        .catch(err => console.warn("Categories fetch:", err));

      // Load users if authorized (Shelema is the ONLY Super Admin who manages users)
      if (shelemaUser) {
        API.get("/admin/users", { headers })
          .then(res => setUsers(toSafeArray(res.data, "users")))
          .catch(err => console.warn("Users fetch:", err));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [userRoleNorm]);

  // ── Order Handlers ──
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      showNotice(`Order #${orderId.slice(-6)} status updated to ${newStatus}`);
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to update order status", true);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      await API.patch(`/admin/payments/${paymentId}/verify`);
      setPayments(prev => prev.map(p => p._id === paymentId ? { ...p, status: "Paid" } : p));
      showNotice(t("admin.paymentApprovedSuccess", "Payment approved and verified successfully!"));
      if (selectedPayment?._id === paymentId) setSelectedPayment(null);
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to approve payment", true);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = window.prompt("Reason for payment rejection (optional):", "Invalid or illegible transfer receipt");
    if (reason === null) return;
    try {
      await API.patch(`/admin/payments/${paymentId}/reject`, { rejectionReason: reason });
      setPayments(prev => prev.map(p => p._id === paymentId ? { ...p, status: "Rejected" } : p));
      showNotice(t("admin.paymentRejectedNotice", "Payment marked as rejected"));
      if (selectedPayment?._id === paymentId) setSelectedPayment(null);
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to reject payment", true);
    }
  };

  // ── Product Handlers ──
  const handleStockUpdate = async (productId) => {
    const val = stockInputs[productId];
    if (val === undefined || val === "") {
      showNotice(t("admin.enterStockNotice", "Please enter a stock quantity first"), true);
      return;
    }
    try {
      await API.put(`/products/${productId}`, { stock: Number(val) });
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: Number(val) } : p));
      showNotice(t("admin.stockUpdatedSuccess", "Stock level updated successfully!"));
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to update stock", true);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId));
      showNotice(t("admin.productDeletedSuccess", "Product deleted from catalog"));
    } catch (err) {
      showNotice(err.response?.data?.message || "Delete failed", true);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newProduct.name,
        price: Number(newProduct.price),
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : null,
        category: newProduct.category,
        stock: Number(newProduct.stock),
        description: newProduct.description,
      };
      const res = await API.post("/products", payload);
      setProducts(prev => [res.data.product || res.data, ...prev]);
      setShowAddProduct(false);
      setNewProduct({ name: "", price: "", originalPrice: "", category: "Laptops", stock: 10, description: "" });
      showNotice(t("admin.productCreatedSuccess", "New product created successfully!"));
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to create product", true);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const payload = {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        discountPrice: Number(editingProduct.discountPrice || editingProduct.price),
        originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : null,
        category: editingProduct.category,
        stock: Number(editingProduct.stock),
        description: editingProduct.description || "",
      };
      await API.put(`/products/${editingProduct._id}`, payload);
      setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...payload } : p));
      setEditingProduct(null);
      showNotice(t("admin.productUpdated", "Product updated successfully!"));
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to update product", true);
    }
  };

  // ── Category Handlers ──
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name?.trim()) return;
    try {
      const res = await API.post("/categories", { name: newCategory.name.trim() });
      const cat = res.data.category || res.data;
      setCategoriesList(prev => [cat, ...prev]);
      setNewCategory({ name: "" });
      setShowAddCategory(false);
      showNotice(t("admin.categoryCreated", "Category created successfully!"));
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to create category", true);
    }
  };

  const handleSaveCategoryEdit = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name?.trim()) return;
    try {
      await API.put(`/categories/${editingCategory._id}`, { name: editingCategory.name.trim() });
      setCategoriesList(prev => prev.map(c => c._id === editingCategory._id ? { ...c, name: editingCategory.name.trim() } : c));
      setEditingCategory(null);
      showNotice(t("admin.categoryUpdated", "Category updated successfully!"));
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to update category", true);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      setCategoriesList(prev => prev.filter(c => c._id !== id));
      showNotice(t("admin.categoryDeleted", "Category deleted successfully!"));
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to delete category", true);
    }
  };

  // ── User Management Handlers (Super Admin Exclusive) ──
  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      showNotice(`Role updated to ${getRoleLabel(newRole)}`);
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to assign role", true);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      await API.put(`/admin/users/${userId}/status`, { isActive: nextStatus });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: nextStatus } : u));
      showNotice(t(nextStatus ? "admin.accountActivated" : "admin.accountDeactivated", nextStatus ? "Account activated" : "Account deactivated"));
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to update user status", true);
    }
  };

  // ── Approvals Handlers ──
  // STRICT RULE: Only Owner / CEO Shelema can approve sellers!
  const handleApproveSeller = async (sellerId, status) => {
    if (!isOwnerSuperAdmin) {
      showNotice(t("admin.ownerOnlySellerApproval", "403 Forbidden: Only the Owner / CEO (Shelema) has permission to approve new sellers."), true);
      return;
    }
    try {
      const note = sellerNotes[sellerId] || "";
      try {
        await API.put(`/admin/sellers/${sellerId}/approve`, { status, note });
      } catch (err) {
        if (err.response?.status === 404) {
          await API.put(`/staff/verify/${sellerId}`, { status, note });
        } else {
          throw err;
        }
      }
      setPendingSellers(prev => prev.filter(s => s._id !== sellerId));
      showNotice(t("admin.sellerStatusSuccess", "Seller status updated successfully!"));
    } catch (err) {
      showNotice(err.response?.data?.message || "Action failed: 403 Forbidden", true);
    }
  };

  const handleApproveProduct = async (productId, status) => {
    try {
      const note = productNotes[productId] || "";
      try {
        await API.put(`/admin/products/${productId}/approve`, { status, note });
      } catch (err) {
        if (err.response?.status === 404) {
          await API.put(`/staff/products/${productId}/approve`, { status, note });
        } else {
          throw err;
        }
      }
      setPendingProducts(prev => prev.filter(p => p._id !== productId));
      showNotice(t("admin.productApprovalSuccess", "Product approval status updated!"));
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to update product approval status", true);
    }
  };

  // ── Filtered Collections ──
  const filteredOrders = useMemo(() => {
    const safe = Array.isArray(orders) ? orders : [];
    return safe.filter(o => {
      const matchSearch = !orderSearch ||
        o._id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = orderFilter === "All" || o.status === orderFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderFilter]);

  const filteredProducts = useMemo(() => {
    const safe = Array.isArray(products) ? products : [];
    return safe.filter(p => {
      const matchSearch = !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = productCategory === "All" || p.category === productCategory;
      const matchStock = stockFilter === "all" ||
        (stockFilter === "in" && p.stock > 5) ||
        (stockFilter === "low" && p.stock > 0 && p.stock <= 5) ||
        (stockFilter === "out" && p.stock === 0);
      return matchSearch && matchCat && matchStock;
    });
  }, [products, productSearch, productCategory, stockFilter]);

  const filteredUsers = useMemo(() => {
    const safe = Array.isArray(users) ? users : [];
    return safe.filter(u => {
      const matchSearch = !userSearch ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone?.toLowerCase().includes(userSearch.toLowerCase());
      const uNorm = normalizeRole(u.role, u);
      const matchRole = userRoleFilter === "all" || uNorm === normalizeRole(userRoleFilter);
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const pendingPaymentsList = useMemo(() => {
    const safe = Array.isArray(payments) ? payments : [];
    return safe.filter(p => ["Pending", "Pending Verification", "pending"].includes(p.status));
  }, [payments]);

  const productCategories = useMemo(() => {
    const safe = Array.isArray(products) ? products : [];
    return ["All", ...new Set(safe.map(p => p.category).filter(Boolean))];
  }, [products]);

  // Available tabs based on normalized RBAC actor
  const availableTabs = [
    { key: "overview", label: t("admin.overview", "Overview & Analytics"), icon: <FaChartLine /> },
    ...(shelemaUser || userRoleNorm === "CashierFinance" || userRoleNorm === "Delivery" ? [
      { key: "orders", label: userRoleNorm === "Delivery" ? t("admin.deliveries", "Orders & Deliveries") : t("admin.ordersAndPayments", "Orders & Payments"), icon: <FaShoppingCart /> }
    ] : []),
    ...(shelemaUser || userRoleNorm === "Admin" || userRoleNorm === "InventoryManager" || userRoleNorm === "Seller" ? [
      { key: "products", label: t("admin.productsAndStock", "Products & Stock"), icon: <FaBox /> }
    ] : []),
    ...(shelemaUser || userRoleNorm === "Admin" || userRoleNorm === "InventoryManager" ? [
      { key: "categories", label: t("admin.categories", "Categories"), icon: <FaTags /> }
    ] : []),
    ...(shelemaUser || userRoleNorm === "Admin" || userRoleNorm === "InventoryManager" ? [
      { key: "product-approval", label: t("admin.productApprovals", "Product Approvals"), icon: <FaClipboardCheck /> }
    ] : []),
    ...(shelemaUser || ["CashierFinance", "Admin", "InventoryManager"].includes(userRoleNorm) ? [
      { key: "seller-approval", label: t("admin.sellerApprovals", "Seller Approvals"), icon: <FaUserCheck /> }
    ] : []),
    ...(shelemaUser ? [
      { key: "users", label: t("admin.usersAndRoles", "Users & Roles"), icon: <FaUsers /> }
    ] : []),
    { key: "meetings", label: t("admin.staffMeetings", "Staff Meetings & Video"), icon: <FaVideo /> },
  ];

  // Sliced paginated arrays for admin tables (with safety checks)
  const safeOrders = Array.isArray(filteredOrders) ? filteredOrders : [];
  const safePayments = Array.isArray(pendingPaymentsList) ? pendingPaymentsList : [];
  const safeProducts = Array.isArray(filteredProducts) ? filteredProducts : [];
  const safeUsers = Array.isArray(filteredUsers) ? filteredUsers : [];
  const safeCategories = Array.isArray(categoriesList) ? categoriesList : [];
  const safeMeetings = Array.isArray(dashboardMeetings) ? dashboardMeetings : [];

  const curOrdersPage       = typeof ordersPage === "number" && ordersPage > 0 ? ordersPage : 1;
  const curOrdersPerPage    = typeof ordersPerPage === "number" && ordersPerPage > 0 ? ordersPerPage : 10;
  const paginatedOrders     = safeOrders.slice((curOrdersPage - 1) * curOrdersPerPage, curOrdersPage * curOrdersPerPage);

  const curPaymentsPage     = typeof paymentsPage === "number" && paymentsPage > 0 ? paymentsPage : 1;
  const curPaymentsPerPage  = typeof paymentsPerPage === "number" && paymentsPerPage > 0 ? paymentsPerPage : 10;
  const paginatedPayments   = safePayments.slice((curPaymentsPage - 1) * curPaymentsPerPage, curPaymentsPage * curPaymentsPerPage);

  const curProductsPage     = typeof productsPage === "number" && productsPage > 0 ? productsPage : 1;
  const curProductsPerPage  = typeof productsPerPage === "number" && productsPerPage > 0 ? productsPerPage : 10;
  const paginatedProducts   = safeProducts.slice((curProductsPage - 1) * curProductsPerPage, curProductsPage * curProductsPerPage);

  const curUsersPage        = typeof usersPage === "number" && usersPage > 0 ? usersPage : 1;
  const curUsersPerPage     = typeof usersPerPage === "number" && usersPerPage > 0 ? usersPerPage : 10;
  const paginatedUsers      = safeUsers.slice((curUsersPage - 1) * curUsersPerPage, curUsersPage * curUsersPerPage);

  const curCategoriesPage   = typeof categoriesPage === "number" && categoriesPage > 0 ? categoriesPage : 1;
  const curCategoriesPerPage = typeof categoriesPerPage === "number" && categoriesPerPage > 0 ? categoriesPerPage : 10;
  const paginatedCategories = safeCategories.slice((curCategoriesPage - 1) * curCategoriesPerPage, curCategoriesPage * curCategoriesPerPage);

  const curMeetingsPage     = typeof meetingsPage === "number" && meetingsPage > 0 ? meetingsPage : 1;
  const curMeetingsPerPage  = typeof meetingsPerPage === "number" && meetingsPerPage > 0 ? meetingsPerPage : 6;
  const paginatedMeetings   = safeMeetings.slice((curMeetingsPage - 1) * curMeetingsPerPage, curMeetingsPage * curMeetingsPerPage);

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="dash-spinner" /> Loading unified admin dashboard…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard-page">

        {/* ── Toast Feedback Notification ── */}
        {feedback && (
          <div className={`dash-feedback-banner ${feedback.isErr ? "error" : "success"}`}>
            {feedback.isErr ? <FaTimesCircle /> : <FaCheckCircle />}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* ── Welcome Header Banner ── */}
        <div className="dash-welcome">
          <div className="dash-welcome-left">
            <h2 className="dash-welcome-title">
              Welcome back, {currentUser.name?.split(" ")[0] || "Admin"} 👋
            </h2>
            <p className="dash-welcome-sub">
              Single-Page Management Portal &bull; Role: <strong>{getRoleLabel(currentUser.role)}</strong>
            </p>
          </div>
          <div className="dash-welcome-right">
            <Link to="/" className="dash-back-store-btn" title={t("nav.backToStore", "Back to Store")}>
              <span>🏪</span>
              <span>{t("nav.backToStore", "Back to Store")}</span>
            </Link>
            <div className="dash-actor-pill" style={{ background: getRoleBadgeBg(currentUser.role) }}>
              {getRoleLabel(currentUser.role)}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            UNIFIED DASHBOARD TAB NAVIGATION BAR
        ════════════════════════════════════════════════════ */}
        <div className="dash-tab-bar" role="tablist">
          {availableTabs.map(t => (
            <button
              key={t.key}
              role="tab"
              aria-selected={activeTab === t.key}
              className={`dash-tab-btn ${activeTab === t.key ? "active" : ""}`}
              onClick={() => switchTab(t.key)}
            >
              <span className="dash-tab-icon">{t.icon}</span>
              <span className="dash-tab-label">{t.label}</span>
              {t.key === "orders" && report.pendingPayments > 0 && (
                <span className="dash-tab-badge">{report.pendingPayments}</span>
              )}
              {t.key === "product-approval" && pendingProducts.length > 0 && (
                <span className="dash-tab-badge" style={{ background: "#2563eb" }}>{pendingProducts.length}</span>
              )}
              {t.key === "seller-approval" && pendingSellers.length > 0 && (
                <span className="dash-tab-badge" style={{ background: "#16a34a" }}>{pendingSellers.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════
            TAB 1: OVERVIEW & ANALYTICS
        ════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="dash-tab-content">
            {/* KPI Cards */}
            <div className="dashboard-cards">
              <DashboardCard
                title={t("admin.totalProducts", "Products")}
                value={report.totalProducts || products.length}
                color="#2563eb"
                icon="📦"
                trendLabel="In catalog"
              />
              <DashboardCard
                title={t("admin.totalOrders", "Orders")}
                value={report.totalOrders || orders.length}
                color="#f59e0b"
                icon="🛒"
                trendLabel="All time"
              />
              <DashboardCard
                title={t("admin.totalCustomers", "Customers")}
                value={report.totalCustomers || users.length}
                color="#0891b2"
                icon="👥"
                trendLabel="Registered"
              />
              <DashboardCard
                title={t("admin.totalRevenue", "Revenue")}
                value={`${Number(report.totalRevenue || 0).toLocaleString()} ETB`}
                color="#16a34a"
                icon="💰"
                trendLabel="Gross collected"
              />
              <DashboardCard
                title={t("admin.pendingPayments", "Pending Approvals")}
                value={(report.pendingPayments || 0) + pendingProducts.length + pendingSellers.length}
                color="#e11d48"
                icon="⏳"
                trendLabel="Awaiting action"
              />
            </div>

            {/* Charts Grid */}
            <div className="dash-charts-grid">
              <div className="dash-widget">
                <div className="dash-widget-header">
                  <h3 className="dash-widget-title">📈 {t("admin.salesOverview", "Sales & Revenue Analytics")}</h3>
                </div>
                <SalesChart data={report.monthlySales} />
              </div>
              <div className="dash-widget">
                <div className="dash-widget-header">
                  <h3 className="dash-widget-title">📊 {t("admin.orderStatusDistribution", "Order Status Breakdown")}</h3>
                </div>
                <OrdersChart data={report.ordersByStatus} />
              </div>
            </div>

            {/* Bottom Section: Recent Orders & Alerts */}
            <div className="dash-bottom-grid">
              {/* Recent Orders */}
              <div className="dash-widget">
                <div className="dash-widget-header">
                  <h3 className="dash-widget-title">{t("admin.recentOrders", "Recent Orders")}</h3>
                  {availableTabs.some(t => t.key === "orders") && (
                    <button className="dash-inline-btn" onClick={() => switchTab("orders")}>
                      View All Orders →
                    </button>
                  )}
                </div>
                {orders.length === 0 ? (
                  <div className="dash-widget-empty">No orders placed yet</div>
                ) : (
                  <div className="dash-orders-list">
                    {orders.slice(0, 5).map(o => {
                      const sm = STATUS_META[o.status] || STATUS_META.Pending;
                      return (
                        <div key={o._id} className="dash-order-row">
                          <div className="dash-order-info">
                            <div className="dash-order-name">{o.user?.name || "Customer"}</div>
                            <div className="dash-order-id">#{o._id?.slice(-8)} &bull; {o.orderItems?.length || 0} items</div>
                          </div>
                          <div className="dash-order-right">
                            <div className="dash-order-amount">{Number(o.totalPrice || 0).toLocaleString()} ETB</div>
                            <span className="dash-order-status" style={{ background: sm.bg, color: sm.color }}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category Distribution */}
              <div className="dash-widget">
                <div className="dash-widget-header">
                  <h3 className="dash-widget-title">📦 {t("admin.productsByCategory", "Category Distribution")}</h3>
                </div>
                <CategoryChart data={report.productsByCategory} />
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            TAB 2: ORDERS & PAYMENTS (Cashier/Finance & SuperAdmin)
        ════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="dash-tab-content">
            <div className="dash-section-bar">
              <div>
                <h3 className="dash-section-title">Order Management &amp; Payment Verification</h3>
                <p className="dash-section-sub">
                  Consolidated orders review, manual bank transfer receipts, and status updates.
                </p>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="dash-filter-row">
              <div className="dash-search-input-wrap">
                <FaSearch className="dash-search-icon" />
                <input
                  type="text"
                  placeholder="Search order ID, customer name, email..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                />
              </div>

              <div className="dash-filter-group">
                <label>Status:</label>
                <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}>
                  <option value="All">All Statuses ({orders.length})</option>
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="dash-table-card">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Fulfillment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="dash-empty-td">No matching orders found</td>
                    </tr>
                  ) : (
                    paginatedOrders.map(order => {
                      const sm = STATUS_META[order.status] || STATUS_META.Pending;
                      const pay = payments.find(p => p.order === order._id || p._id === order.payment);
                      return (
                        <tr key={order._id}>
                          <td>
                            <span className="dash-mono">#{order._id?.slice(-8)}</span>
                            <div className="dash-subtext">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <strong>{order.user?.name || "Guest"}</strong>
                            <div className="dash-subtext">{order.user?.email || "—"}</div>
                          </td>
                          <td>{order.orderItems?.length || 0} items</td>
                          <td>
                            <strong>{Number(order.totalPrice || 0).toLocaleString()} ETB</strong>
                            <div className="dash-subtext">{order.paymentMethod || "COD"}</div>
                          </td>
                          <td>
                            <span className={`dash-badge ${order.isPaid ? "badge-paid" : "badge-pending"}`}>
                              {order.isPaid ? "✓ Paid" : "⏳ Pending"}
                            </span>
                          </td>
                          <td>
                            <select
                              value={order.status}
                              onChange={e => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="dash-status-select"
                              style={{ borderColor: sm.color }}
                            >
                              {ORDER_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <div className="dash-actions-cell">
                              <button
                                className="dash-action-btn view-btn"
                                onClick={() => setSelectedOrder(order)}
                                title="View Order Details"
                              >
                                <FaEye /> Details
                              </button>
                              {pay && (
                                <button
                                  className="dash-action-btn pay-btn"
                                  onClick={() => setSelectedPayment(pay)}
                                  title="Verify Payment Receipt"
                                >
                                  💳 Verify
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Orders Pagination */}
            {safeOrders.length > 0 && (
              <Pagination
                currentPage={ordersPage}
                totalItems={safeOrders.length}
                pageSize={ordersPerPage}
                onPageChange={(p) => setOrdersPage(p)}
                onPageSizeChange={(sz) => { setOrdersPerPage(sz); setOrdersPage(1); }}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="orders"
                className="dash-table-pagination"
              />
            )}

            {/* Pending Payments Verification Queue */}
            <div className="dash-section-bar" style={{ marginTop: 32 }}>
              <div>
                <h3 className="dash-section-title">Manual Bank Transfer Verification Queue</h3>
                <p className="dash-section-sub">
                  Inspect user uploaded receipt proofs and confirm transactions directly.
                </p>
              </div>
            </div>

            <div className="dash-table-card">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Tx Ref</th>
                    <th>Customer</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Receipt Proof</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPaymentsList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="dash-empty-td">No pending payment verifications needed! 🎉</td>
                    </tr>
                  ) : (
                    paginatedPayments.map(p => (
                      <tr key={p._id}>
                        <td className="dash-mono">#{p.transactionReference || p._id?.slice(-8)}</td>
                        <td>{p.user?.name || "Customer"}</td>
                        <td>{p.methodName || p.methodCode || "Manual Transfer"}</td>
                        <td><strong>{Number(p.amount || 0).toLocaleString()} ETB</strong></td>
                        <td>
                          <span className="dash-badge badge-pending">{p.status}</span>
                        </td>
                        <td>
                          {p.paymentProof ? (
                            <button
                              className="dash-receipt-preview-btn"
                              onClick={() => setSelectedPayment(p)}
                            >
                              <img src={p.paymentProof} alt="Proof" /> View Receipt
                            </button>
                          ) : (
                            <span className="dash-subtext">No image proof</span>
                          )}
                        </td>
                        <td>
                          <div className="dash-actions-cell">
                            <button
                              className="dash-action-btn approve-btn"
                              onClick={() => handleApprovePayment(p._id)}
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="dash-action-btn reject-btn"
                              onClick={() => handleRejectPayment(p._id)}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Payments Pagination */}
            {safePayments.length > 0 && (
              <Pagination
                currentPage={paymentsPage}
                totalItems={safePayments.length}
                pageSize={paymentsPerPage}
                onPageChange={(p) => setPaymentsPage(p)}
                onPageSizeChange={(sz) => { setPaymentsPerPage(sz); setPaymentsPage(1); }}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="payments"
                className="dash-table-pagination"
              />
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            TAB 3: PRODUCTS & INVENTORY
        ════════════════════════════════════════════════════ */}
        {activeTab === "products" && (
          <div className="dash-tab-content">
            <div className="dash-section-bar">
              <div>
                <h3 className="dash-section-title">Products &amp; Inventory Management</h3>
                <p className="dash-section-sub">
                  Update stock levels, filter catalogs, add new electronics, and maintain pricing.
                </p>
              </div>
              <button
                className="dash-primary-btn"
                onClick={() => setShowAddProduct(prev => !prev)}
              >
                <FaPlus /> {showAddProduct ? "Close Form" : "Add Product"}
              </button>
            </div>

            {/* Inline Add Product Form */}
            {showAddProduct && (
              <form className="dash-inline-form-card" onSubmit={handleCreateProduct}>
                <h4>Create New Tech Product</h4>
                <div className="dash-form-grid">
                  <div>
                    <label>Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MacBook Pro M3 16GB"
                      value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Discount / Sale Price (ETB) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 125000"
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Original Regular Price (Optional strikethrough)</label>
                    <input
                      type="number"
                      placeholder="e.g. 140000"
                      value={newProduct.originalPrice}
                      onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      {["Laptops", "Smartphones", "Gaming", "Tablets", "Smart Watch", "Headphones & Audio", "Smart Home"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Initial Stock *</label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label>Description</label>
                    <textarea
                      rows="3"
                      placeholder="Product highlights, specifications, and warranty details..."
                      value={newProduct.description}
                      onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="dash-form-actions">
                  <button type="submit" className="dash-primary-btn">Save &amp; Publish</button>
                  <button type="button" className="dash-secondary-btn" onClick={() => setShowAddProduct(false)}>Cancel</button>
                </div>
              </form>
            )}

            {/* Filter row */}
            <div className="dash-filter-row">
              <div className="dash-search-input-wrap">
                <FaSearch className="dash-search-icon" />
                <input
                  type="text"
                  placeholder="Search products by title..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
              </div>

              <div className="dash-filter-group">
                <label>Category:</label>
                <select value={productCategory} onChange={e => setProductCategory(e.target.value)}>
                  {productCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="dash-filter-group">
                <label>Stock Filter:</label>
                <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
                  <option value="all">All Levels</option>
                  <option value="in">In Stock (&gt; 5)</option>
                  <option value="low">Low Stock (1 - 5)</option>
                  <option value="out">Out of Stock (0)</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="dash-table-card">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th>Update Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="dash-empty-td">No matching products found</td>
                    </tr>
                  ) : (
                    paginatedProducts.map(p => {
                      const isOut = p.stock === 0;
                      const isLow = p.stock > 0 && p.stock <= 5;
                      const discountPrice = p.discountPrice || p.price;
                      const originalPrice = p.originalPrice;
                      const hasDiscount = originalPrice && Number(originalPrice) > Number(discountPrice);

                      return (
                        <tr key={p._id}>
                          <td>
                            <div className="dash-prod-cell">
                              <img
                                src={getImageUrl(p.images?.[0] || p.image || "/placeholder.png")}
                                alt={p.name}
                                className="dash-prod-thumb"
                              />
                              <div>
                                <strong>{p.name}</strong>
                                <div className="dash-subtext">ID: {p._id?.slice(-8)}</div>
                              </div>
                            </div>
                          </td>
                          <td>{p.category || "General"}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <strong className="text-blue-600">{Number(discountPrice || 0).toLocaleString()} ETB</strong>
                              {hasDiscount && (
                                <span className="line-through text-gray-400 text-sm">
                                  {Number(originalPrice).toLocaleString()} ETB
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`dash-badge ${isOut ? "badge-out" : isLow ? "badge-low" : "badge-instock"}`}>
                              {isOut ? "Out of Stock" : isLow ? `Low (${p.stock})` : `In Stock (${p.stock})`}
                            </span>
                          </td>
                          <td>
                            <div className="dash-stock-edit-wrap">
                              <input
                                type="number"
                                className="dash-stock-input"
                                placeholder={p.stock}
                                value={stockInputs[p._id] ?? ""}
                                onChange={e => setStockInputs({ ...stockInputs, [p._id]: e.target.value })}
                              />
                              <button
                                className="dash-save-stock-btn"
                                onClick={() => handleStockUpdate(p._id)}
                                title="Save stock"
                              >
                                <FaSave />
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="dash-actions-cell">
                              <button
                                className="dash-action-btn edit-btn"
                                onClick={() => setEditingProduct(p)}
                                title="Quick Edit Product"
                              >
                                <FaEdit />
                              </button>
                              <Link
                                to={`/admin/edit-product/${p._id}`}
                                className="dash-action-btn edit-btn"
                                title="Full Edit Page"
                                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                              >
                                <FaEye />
                              </Link>
                              <button
                                className="dash-action-btn delete-btn"
                                onClick={() => handleDeleteProduct(p._id)}
                                title="Delete Product"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Products Pagination */}
            {safeProducts.length > 0 && (
              <Pagination
                currentPage={productsPage}
                totalItems={safeProducts.length}
                pageSize={productsPerPage}
                onPageChange={(p) => setProductsPage(p)}
                onPageSizeChange={(sz) => { setProductsPerPage(sz); setProductsPage(1); }}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="products"
                className="dash-table-pagination"
              />
            )}

            {/* Quick Edit Product Modal */}
            {editingProduct && (
              <div className="dash-modal-backdrop" onClick={() => setEditingProduct(null)}>
                <div className="dash-modal-card" onClick={e => e.stopPropagation()}>
                  <div className="dash-modal-header">
                    <h3>Edit Product: {editingProduct.name}</h3>
                    <button className="dash-modal-close" onClick={() => setEditingProduct(null)}>✕</button>
                  </div>
                  <form onSubmit={handleUpdateProduct} className="dash-modal-body">
                    <div className="dash-form-grid">
                      <div style={{ gridColumn: "1/-1" }}>
                        <label>Product Name *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>Discount / Sale Price (ETB) *</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.discountPrice || editingProduct.price}
                          onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value, discountPrice: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>Original Regular Price (Optional strikethrough)</label>
                        <input
                          type="number"
                          value={editingProduct.originalPrice || ""}
                          onChange={e => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>Category *</label>
                        <select
                          value={editingProduct.category}
                          onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        >
                          {productCategories.filter(c => c !== "All").map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>Stock Quantity *</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.stock}
                          onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                        />
                      </div>
                      <div style={{ gridColumn: "1/-1" }}>
                        <label>Description</label>
                        <textarea
                          rows="3"
                          value={editingProduct.description || ""}
                          onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="dash-form-actions" style={{ marginTop: 16 }}>
                      <button type="submit" className="dash-primary-btn">Save Changes</button>
                      <button type="button" className="dash-secondary-btn" onClick={() => setEditingProduct(null)}>Cancel</button>
                      <Link to={`/admin/edit-product/${editingProduct._id}`} className="dash-secondary-btn" style={{ marginLeft: "auto", textDecoration: "none" }}>
                        Full Edit Page →
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            TAB: CATEGORIES MANAGEMENT
        ════════════════════════════════════════════════════ */}
        {activeTab === "categories" && (
          <div className="dash-tab-content">
            <div className="dash-section-bar">
              <div>
                <h3 className="dash-section-title">Category Management</h3>
                <p className="dash-section-sub">
                  Add new product categories, rename existing categories, or manage catalog classifications.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="dash-primary-btn"
                  onClick={() => setShowAddCategory(prev => !prev)}
                >
                  <FaPlus /> {showAddCategory ? "Close Form" : "Add Category"}
                </button>
                <Link to="/admin/categories" className="dash-secondary-btn" style={{ textDecoration: "none" }}>
                  Full Category View →
                </Link>
              </div>
            </div>

            {/* Add Category Form */}
            {showAddCategory && (
              <form className="dash-inline-form-card" onSubmit={handleCreateCategory}>
                <h4>Create New Category</h4>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smart Projectors, Wearables..."
                    value={newCategory.name}
                    onChange={e => setNewCategory({ name: e.target.value })}
                    style={{ flex: 1, padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                  />
                  <button type="submit" className="dash-primary-btn">Save Category</button>
                  <button type="button" className="dash-secondary-btn" onClick={() => setShowAddCategory(false)}>Cancel</button>
                </div>
              </form>
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
              <div className="dash-modal-backdrop" onClick={() => setEditingCategory(null)}>
                <div className="dash-modal-card" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
                  <div className="dash-modal-header">
                    <h3>Edit Category</h3>
                    <button className="dash-modal-close" onClick={() => setEditingCategory(null)}>✕</button>
                  </div>
                  <form onSubmit={handleSaveCategoryEdit} className="dash-modal-body">
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Category Name</label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name}
                      onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                    />
                    <div className="dash-form-actions" style={{ marginTop: 16 }}>
                      <button type="submit" className="dash-primary-btn">Update Category</button>
                      <button type="button" className="dash-secondary-btn" onClick={() => setEditingCategory(null)}>Cancel</button>
                      <Link to={`/admin/edit-category/${editingCategory._id}`} className="dash-secondary-btn" style={{ marginLeft: "auto", textDecoration: "none" }}>
                        Full Edit Page →
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Categories Table */}
            <div className="dash-table-card">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Associated Products</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesList.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="dash-empty-td">No categories found</td>
                    </tr>
                  ) : (
                    paginatedCategories.map(c => {
                      const count = products.filter(p => p.category?.toLowerCase() === c.name?.toLowerCase()).length;
                      return (
                        <tr key={c._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 20 }}>📁</span>
                              <strong>{c.name}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="dash-badge badge-instock">
                              {count} {count === 1 ? "product" : "products"}
                            </span>
                          </td>
                          <td>
                            <div className="dash-actions-cell">
                              <button
                                className="dash-action-btn edit-btn"
                                onClick={() => setEditingCategory(c)}
                                title="Edit Category Name"
                              >
                                <FaEdit />
                              </button>
                              <Link
                                to={`/admin/edit-category/${c._id}`}
                                className="dash-action-btn edit-btn"
                                title="Full Category Edit Page"
                                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                              >
                                <FaEye />
                              </Link>
                              <button
                                className="dash-action-btn delete-btn"
                                onClick={() => handleDeleteCategory(c._id)}
                                title="Delete Category"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Categories Pagination */}
            {safeCategories.length > 0 && (
              <Pagination
                currentPage={categoriesPage}
                totalItems={safeCategories.length}
                pageSize={categoriesPerPage}
                onPageChange={(p) => setCategoriesPage(p)}
                onPageSizeChange={(sz) => { setCategoriesPerPage(sz); setCategoriesPage(1); }}
                pageSizeOptions={[5, 10, 20]}
                itemLabel="categories"
                className="dash-table-pagination"
              />
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            TAB 4: PRODUCT APPROVALS (InventoryManager & SuperAdmin)
        ════════════════════════════════════════════════════ */}
        {activeTab === "product-approval" && (
          <div className="dash-tab-content">
            <div className="dash-section-bar">
              <div>
                <h3 className="dash-section-title">Product Approvals &amp; Catalog Quality</h3>
                <p className="dash-section-sub">
                  Inspect and approve products submitted by third-party sellers before they appear in the public catalog.
                </p>
              </div>
            </div>

            {pendingProducts.length === 0 ? (
              <div className="dash-table-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>📦</div>
                <h3 style={{ fontSize: "18px", color: "#0f172a", marginBottom: "6px" }}>No Pending Products</h3>
                <p style={{ color: "#64748b", fontSize: "14px" }}>All seller products have been reviewed and catalog is up-to-date.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "20px" }}>
                {pendingProducts.map(p => (
                  <div key={p._id} className="dash-table-card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        {p.images?.[0] ? (
                          <img src={getImageUrl(p.images[0])} alt={p.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                        ) : (
                          <div style={{ width: 64, height: 64, background: "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📦</div>
                        )}
                        <div>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#0f172a" }}>{p.name}</h4>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>{p.category} &bull; {p.brand || "Unbranded"}</span>
                        </div>
                      </div>
                      <span className="dash-badge badge-pending">Pending Review</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px", fontSize: "13.5px" }}>
                      <div>
                        <strong style={{ color: "#475569" }}>Price: </strong>
                        <span style={{ color: "#2563eb", fontWeight: 700 }}>{Number(p.discountPrice || p.price).toLocaleString()} ETB</span>
                        {p.originalPrice && Number(p.originalPrice) > Number(p.discountPrice || p.price) && (
                          <span style={{ marginLeft: 8, textDecoration: "line-through", color: "#94a3b8" }}>{Number(p.originalPrice).toLocaleString()} ETB</span>
                        )}
                      </div>
                      <div>
                        <strong style={{ color: "#475569" }}>Initial Stock: </strong>
                        <span>{p.stock} units</span>
                      </div>
                      <div>
                        <strong style={{ color: "#475569" }}>Seller: </strong>
                        <span>{p.submittedBy?.name || "Seller"} ({p.submittedBy?.email || "—"})</span>
                      </div>
                      <div>
                        <strong style={{ color: "#475569" }}>Business: </strong>
                        <span>{p.submittedBy?.staffInfo?.businessName || "—"}</span>
                      </div>
                    </div>

                    {p.description && (
                      <p style={{ fontSize: "13.5px", color: "#475569", background: "#f8fafc", padding: "10px 14px", borderRadius: 6, marginBottom: "14px" }}>
                        {p.description}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        placeholder="Optional note for seller..."
                        value={productNotes[p._id] || ""}
                        onChange={e => setProductNotes({ ...productNotes, [p._id]: e.target.value })}
                        style={{ flex: 1, minWidth: "220px", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                      />
                      <button
                        className="dash-action-btn approve-btn"
                        style={{ padding: "8px 16px" }}
                        onClick={() => handleApproveProduct(p._id, "approved")}
                      >
                        ✓ Approve &amp; Publish
                      </button>
                      <button
                        className="dash-action-btn reject-btn"
                        style={{ padding: "8px 16px" }}
                        onClick={() => handleApproveProduct(p._id, "rejected")}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            TAB 5: SELLER APPROVALS (Strictly Owner / Super Admin Shelema)
        ════════════════════════════════════════════════════ */}
        {activeTab === "seller-approval" && (
          <div className="dash-tab-content">
            <div className="dash-section-bar">
              <div>
                <h3 className="dash-section-title">Seller Verification &amp; Account Approvals</h3>
                <p className="dash-section-sub">
                  Verify seller identities, trade licenses, and national ID credentials.
                </p>
              </div>
              <div className="dash-actor-pill" style={{ background: isOwnerSuperAdmin ? "#16a34a" : "#f59e0b" }}>
                {isOwnerSuperAdmin ? "Owner Verification Authority" : "Read-Only Mode"}
              </div>
            </div>

            {/* Strict RBAC Guard Banner if current user is not owner */}
            {!isOwnerSuperAdmin && (
              <div style={{
                background: "#fef3c7",
                border: "1px solid #f59e0b",
                color: "#92400e",
                padding: "14px 18px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "14px"
              }}>
                <FaLock style={{ fontSize: "20px", flexShrink: 0 }} />
                <div>
                  <strong>{t("admin.ownerOnlyLockTitle", "Strict RBAC Policy")}:</strong> {t("admin.ownerOnlyLockMessage", "Approving or rejecting new sellers is exclusively restricted to the store Owner / CEO (Shelema). Other admin roles are confined to view-only mode.")}
                </div>
              </div>
            )}

            {pendingSellers.length === 0 ? (
              <div className="dash-table-card" style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🎉</div>
                <h3 style={{ fontSize: "18px", color: "#0f172a", marginBottom: "6px" }}>All Caught Up!</h3>
                <p style={{ color: "#64748b", fontSize: "14px" }}>No pending seller applications awaiting review.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "20px" }}>
                {pendingSellers.map(seller => (
                  <div key={seller._id} className="dash-table-card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>
                          {seller.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#0f172a" }}>{seller.name}</h4>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>{seller.email} &bull; {seller.phone || "No phone"}</span>
                        </div>
                      </div>
                      <span className="dash-badge badge-pending">Pending Verification</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px", fontSize: "13.5px" }}>
                      <div>
                        <strong style={{ color: "#475569" }}>Business Name: </strong>
                        <span>{seller.staffInfo?.businessName || "—"}</span>
                      </div>
                      <div>
                        <strong style={{ color: "#475569" }}>National ID No: </strong>
                        <span className="dash-mono">{seller.staffInfo?.nationalIdNumber || "—"}</span>
                      </div>
                      <div>
                        <strong style={{ color: "#475569" }}>Applied Date: </strong>
                        <span>
                          {seller.staffInfo?.appliedAt ? new Date(seller.staffInfo.appliedAt).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                    </div>

                    {seller.staffInfo?.nationalIdImage && (
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontWeight: 600, fontSize: "12.5px", color: "#475569", marginBottom: "6px" }}>Uploaded National ID / Document:</div>
                        <img
                          src={getImageUrl(seller.staffInfo.nationalIdImage)}
                          alt="National ID"
                          style={{ maxHeight: "160px", maxWidth: "100%", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        />
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        placeholder="Optional note for seller..."
                        value={sellerNotes[seller._id] || ""}
                        onChange={e => setSellerNotes({ ...sellerNotes, [seller._id]: e.target.value })}
                        disabled={!isOwnerSuperAdmin}
                        style={{ flex: 1, minWidth: "220px", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1" }}
                      />
                      <button
                        className="dash-action-btn approve-btn"
                        style={{ padding: "8px 16px", ...(isOwnerSuperAdmin ? {} : { opacity: 0.5, cursor: "not-allowed" }) }}
                        disabled={!isOwnerSuperAdmin}
                        onClick={() => handleApproveSeller(seller._id, "approved")}
                        title={!isOwnerSuperAdmin ? "Only the owner (Shelema) can approve sellers" : "Approve Seller"}
                      >
                        ✓ Approve Seller
                      </button>
                      <button
                        className="dash-action-btn reject-btn"
                        style={{ padding: "8px 16px", ...(isOwnerSuperAdmin ? {} : { opacity: 0.5, cursor: "not-allowed" }) }}
                        disabled={!isOwnerSuperAdmin}
                        onClick={() => handleApproveSeller(seller._id, "rejected")}
                        title={!isOwnerSuperAdmin ? "Only the owner (Shelema) can reject sellers" : "Reject Seller"}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            TAB 6: USERS & ROLES (Shelema Super Admin Exclusive)
        ════════════════════════════════════════════════════ */}
        {activeTab === "users" && shelemaUser && (
          <div className="dash-tab-content">
            <div className="dash-section-bar">
              <div>
                <h3 className="dash-section-title">User Accounts &amp; Strict Role-Based Access Control</h3>
                <p className="dash-section-sub">
                  Shelema is the exclusive Owner / CEO. Assign operational duties: Admin, Cashier/Finance, Delivery, Seller, or Customer.
                </p>
              </div>
            </div>

            {/* Filter row */}
            <div className="dash-filter-row">
              <div className="dash-search-input-wrap">
                <FaSearch className="dash-search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>

              <div className="dash-filter-group">
                <label>Filter Role:</label>
                <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                  <option value="all">All Roles ({users.length})</option>
                  <option value="SuperAdmin">Owner / CEO</option>
                  <option value="Admin">Admin</option>
                  <option value="CashierFinance">Cashier / Finance</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Seller">Seller</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="dash-table-card">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Current Role</th>
                    <th>Assign New Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="dash-empty-td">No users found matching your search</td>
                    </tr>
                  ) : (
                    paginatedUsers.map(user => {
                      const isTargetShelema = isShelema(user);
                      return (
                        <tr key={user._id}>
                          <td>
                            <strong>{user.name}</strong>
                            {isTargetShelema && (
                              <span style={{ marginLeft: 6, fontSize: 11, background: "#7c3aed", color: "#fff", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                                Owner / CEO
                              </span>
                            )}
                            <div className="dash-subtext">Phone: {user.phone || "—"}</div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`dash-badge ${user.isActive ? "badge-instock" : "badge-out"}`}>
                              {user.isActive ? "Active" : "Deactivated"}
                            </span>
                          </td>
                          <td>
                            <span
                              className="dash-actor-pill"
                              style={{ background: getRoleBadgeBg(user.role), fontSize: 11 }}
                            >
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td>
                            <select
                              value={["inventory_manager", "InventoryManager"].includes(user.role) ? "admin" : (["owner", "SuperAdmin"].includes(user.role) ? "super_admin" : (user.role || "customer"))}
                              onChange={e => handleRoleChange(user._id, e.target.value)}
                              className="dash-status-select"
                              disabled={isTargetShelema}
                              title={isTargetShelema ? "Shelema's Owner / CEO account cannot be modified" : "Assign role"}
                            >
                              {CONSOLIDATED_ROLES.map(r => {
                                // Only Shelema can hold super_admin
                                if (r.value === "super_admin" && !isTargetShelema) return null;
                                return <option key={r.value} value={r.value}>{r.label}</option>;
                              })}
                            </select>
                          </td>
                          <td>
                            <button
                              className={`dash-action-btn ${user.isActive ? "reject-btn" : "approve-btn"}`}
                              onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                              disabled={isTargetShelema}
                              title={isTargetShelema ? "Cannot deactivate Shelema's Owner / CEO account" : (user.isActive ? "Deactivate" : "Activate")}
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Users Pagination */}
            {safeUsers.length > 0 && (
              <Pagination
                currentPage={usersPage}
                totalItems={safeUsers.length}
                pageSize={usersPerPage}
                onPageChange={(p) => setUsersPage(p)}
                onPageSizeChange={(sz) => { setUsersPerPage(sz); setUsersPage(1); }}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="users"
                className="dash-table-pagination"
              />
            )}
          </div>
        )}

{/* ════════════════════════════════════════════════════
            TAB: STAFF MEETINGS & LIVE VIDEO CONFERENCING
        ════════════════════════════════════════════════════ */}
        {activeTab === "meetings" && (
          <div className="dash-tab-content">
            <div className="dash-section-bar">
              <div>
                <h3 className="dash-section-title">📹 Staff Meetings &amp; Live Video Rooms</h3>
                <p className="dash-section-sub">
                  Team video conferences, real-time screen sharing, in-call chat, and department standups.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {shelemaUser ? (
                  <>
                    <button
                      className="dash-primary-btn"
                      style={{ background: "#16a34a" }}
                      onClick={() => {
                        const instantRoomId = "inst-" + Math.random().toString(36).substring(2, 8);
                        setActiveVideoMeeting({
                          _id: "instant-meeting",
                          roomId: instantRoomId,
                          title: "Instant Staff Video Sync",
                          targetAudience: "all_staff",
                          platform: "in_app_video",
                          invitees: []
                        });
                      }}
                    >
                      <FaVideo /> Launch Instant Video Call
                    </button>
                    <Link to="/admin/meetings" className="dash-primary-btn">
                      📅 Open Meeting Scheduler
                    </Link>
                  </>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b", background: "#f1f5f9", padding: "8px 16px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
                    🔒 Staff Meeting Participant (Scheduled by Owner)
                  </span>
                )}
              </div>
            </div>

            {/* Live Call Banner if ongoing meetings exist */}
            {dashboardMeetings.filter(m => m.status === "ongoing").length > 0 && (
              <div style={{
                background: "linear-gradient(135deg, #1e293b, #0f172a)",
                border: "1px solid #22c55e",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(34, 197, 94, 0.2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    width: 12, height: 12, borderRadius: "50%", background: "#22c55e",
                    boxShadow: "0 0 10px #22c55e"
                  }} />
                  <div>
                    <strong style={{ fontSize: 15, display: "block" }}>🔴 Live Staff Meeting in Progress</strong>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>
                      {dashboardMeetings.find(m => m.status === "ongoing")?.title || "Staff Sync"}
                    </span>
                  </div>
                </div>
                <button
                  style={{
                    padding: "9px 18px", background: "#16a34a", color: "#fff",
                    border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13
                  }}
                  onClick={() => setActiveVideoMeeting(dashboardMeetings.find(m => m.status === "ongoing"))}
                >
                  📹 Join Video Room
                </button>
              </div>
            )}

            {/* Meetings Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {dashboardMeetings.length === 0 ? (
                <div className="dash-table-card" style={{ gridColumn: "1/-1", padding: 48, textAlign: "center" }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>📹</div>
                  <h4 style={{ margin: 0, color: "#0f172a" }}>No Scheduled Meetings Yet</h4>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "6px 0 16px" }}>
                    {shelemaUser
                      ? "Start an instant video room or schedule a future department sync."
                      : "No team meetings currently scheduled by the owner. Check back later."}
                  </p>
                  {shelemaUser && (
                    <Link to="/admin/meetings" className="dash-inline-btn" style={{ textDecoration: "none" }}>
                      Schedule Staff Meeting →
                    </Link>
                  )}
                </div>
              ) : (
                paginatedMeetings.map(m => (
                  <div key={m._id} className="dash-table-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                          background: m.status === "ongoing" ? "#dcfce7" : (m.status === "scheduled" ? "#dbeafe" : "#f1f5f9"),
                          color: m.status === "ongoing" ? "#16a34a" : (m.status === "scheduled" ? "#1d4ed8" : "#64748b")
                        }}>
                          {m.status === "ongoing" ? "🔴 Live Now" : m.status}
                        </span>
                        <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                          Room: {m.roomId || "LIVE"}
                        </span>
                      </div>
                      <h4 style={{ margin: "0 0 6px", fontSize: 16, color: "#0f172a", fontWeight: 700 }}>
                        {m.title}
                      </h4>
                      {m.description && (
                        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px", lineHeight: 1.5, maxHeight: 40, overflow: "hidden" }}>
                          {m.description}
                        </p>
                      )}
                      <div style={{ fontSize: 12, color: "#475569", marginBottom: 14 }}>
                        <div>📅 {new Date(m.scheduledAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                        <div>⏱ {m.durationMin || 60} min &bull; 👥 {m.targetAudience?.replace("_", " ")}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                      <button
                        style={{
                          flex: 1, padding: "9px 12px", background: "#2563eb", color: "#fff",
                          border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6
                        }}
                        onClick={() => setActiveVideoMeeting(m)}
                      >
                        <FaVideo /> Join Room
                      </button>
                      <Link
                        to="/admin/meetings"
                        style={{
                          padding: "9px 14px", background: "#f1f5f9", color: "#334155",
                          borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none",
                          display: "inline-flex", alignItems: "center", justifyContent: "center"
                        }}
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Staff Meetings Pagination */}
            {safeMeetings.length > 0 && (
              <Pagination
                currentPage={meetingsPage}
                totalItems={safeMeetings.length}
                pageSize={meetingsPerPage}
                onPageChange={(p) => setMeetingsPage(p)}
                onPageSizeChange={(sz) => { setMeetingsPerPage(sz); setMeetingsPage(1); }}
                pageSizeOptions={[4, 6, 12]}
                itemLabel="meetings"
                className="dash-table-pagination"
              />
            )}
          </div>
        )}

        {/* ── Active Video Meeting Fullscreen Component ── */}
        {activeVideoMeeting && (
          <VideoMeetingRoom
            meeting={activeVideoMeeting}
            onClose={() => {
              setActiveVideoMeeting(null);
              API.get("/meetings").then(res => setDashboardMeetings(res.data.meetings || [])).catch(() => {});
            }}
            currentUser={currentUser}
          />
        )}

        {/* ── Order Detail Modal ── */}
        {selectedOrder && (
          <div className="dash-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="dash-modal-card" onClick={e => e.stopPropagation()}>
              <div className="dash-modal-header">
                <h3>Order #{selectedOrder._id?.slice(-8)}</h3>
                <button className="dash-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>
              <div className="dash-modal-body">
                <div className="dash-modal-grid">
                  <div><strong>Customer:</strong> {selectedOrder.user?.name || "Guest"}</div>
                  <div><strong>Email:</strong> {selectedOrder.user?.email || "—"}</div>
                  <div><strong>Total Amount:</strong> {Number(selectedOrder.totalPrice).toLocaleString()} ETB</div>
                  <div><strong>Status:</strong> {selectedOrder.status}</div>
                </div>

                <h4 style={{ marginTop: 18, marginBottom: 8 }}>Order Items</h4>
                <div className="dash-modal-items-list">
                  {selectedOrder.orderItems?.map((it, i) => (
                    <div key={i} className="dash-modal-item-row">
                      <span>{it.name} &times; {it.quantity}</span>
                      <strong>{Number(it.price * it.quantity).toLocaleString()} ETB</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Payment Proof Modal ── */}
        {selectedPayment && (
          <div className="dash-modal-overlay" onClick={() => setSelectedPayment(null)}>
            <div className="dash-modal-card" onClick={e => e.stopPropagation()}>
              <div className="dash-modal-header">
                <h3>Payment Verification</h3>
                <button className="dash-modal-close" onClick={() => setSelectedPayment(null)}>✕</button>
              </div>
              <div className="dash-modal-body">
                <div className="dash-modal-grid">
                  <div><strong>Amount:</strong> {Number(selectedPayment.amount).toLocaleString()} ETB</div>
                  <div><strong>Method:</strong> {selectedPayment.methodName || selectedPayment.methodCode}</div>
                  <div><strong>Tx Ref:</strong> {selectedPayment.transactionReference || selectedPayment._id}</div>
                  <div><strong>Current Status:</strong> {selectedPayment.status}</div>
                </div>

                {selectedPayment.paymentProof ? (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Uploaded Bank Receipt:</div>
                    <img
                      src={selectedPayment.paymentProof}
                      alt="Bank Transfer Proof"
                      className="dash-payment-proof-img"
                    />
                  </div>
                ) : (
                  <div style={{ marginTop: 16, color: "#94a3b8" }}>No image receipt attached.</div>
                )}

                <div className="dash-form-actions" style={{ marginTop: 24 }}>
                  <button
                    className="dash-primary-btn"
                    style={{ background: "#16a34a" }}
                    onClick={() => handleApprovePayment(selectedPayment._id)}
                  >
                    ✓ Confirm &amp; Approve Payment
                  </button>
                  <button
                    className="dash-secondary-btn"
                    style={{ background: "#fee2e2", color: "#dc2626", borderColor: "#fecaca" }}
                    onClick={() => handleRejectPayment(selectedPayment._id)}
                  >
                    ✕ Reject Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
