import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= CUSTOMER COMPONENTS =================
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import PrivateRoute from "./components/PrivateRoute";

// ================= CUSTOMER PAGES =================
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import Home from "./pages/Home";
import PaymentSuccess from "./pages/PaymentSuccess";
import About from "./pages/About/About";
import ProductList from "./components/ProductList";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import MyOrders from "./pages/MyOrders/MyOrders";
import Profile from "./pages/Profile/Profile";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Contact from "./pages/Contact/Contact";
import MyMessages from "./pages/MyMessages/MyMessages";
import Team from "./components/Team/Team";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist/Wishlist";
import Help from "./pages/Help/Help";
import Terms from "./pages/Terms/Terms";
import Privacy from "./pages/Privacy/Privacy";
import FAQ from "./pages/FAQ/FAQ";
import ShippingInfo from "./pages/ShippingInfo/ShippingInfo";
import Returns from "./pages/Returns/Returns";
import PaymentHistory from "./pages/PaymentHistory/PaymentHistory";
import Notifications from "./pages/Notifications/Notifications";
import AnnouncementBar from "./components/AnnouncementBar/AnnouncementBar";

// ================= ADMIN PAGES =================
import Dashboard from "./admin/Dashboard/Dashboard";
import AdminProducts from "./admin/Products/Products";
import AddProduct from "./admin/Products/AddProduct";
import EditProduct from "./admin/Products/EditProduct";
import Category from "./admin/Categories/Category";
import AddCategory from "./admin/Categories/AddCategory";
import EditCategory from "./admin/Categories/EditCategory";
import Orders from "./admin/Orders/Orders";
import Customers from "./admin/Customers/Customers";
import Payments from "./admin/Payments/Payments";
import Reports from "./admin/Reports/Reports";
import Settings from "./admin/Settings/Settings";
import AdminProfile from "./admin/Profile/AdminProfile";
import ContactMessages from "./admin/Contacts/ContactMessages";
import AdminRoute from "./admin/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= CUSTOMER WEBSITE ================= */}
        <Route path="/" element={<><AnnouncementBar /><Navbar /><Home /><Footer /></>} />
        <Route path="/products" element={<><AnnouncementBar /><Navbar /><ProductList /><Footer /></>} />
        <Route path="/product/:id" element={<><Navbar /><ProductDetails /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/team" element={<><Navbar /><Team /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
        <Route path="/cart" element={<><Navbar /><Cart /><Footer /></>} />
        <Route path="/wishlist" element={<><Navbar /><Wishlist /><Footer /></>} />
        <Route path="/checkout" element={<><Navbar /><Checkout /><Footer /></>} />
        <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
        <Route path="/register" element={<><Navbar /><Register /><Footer /></>} />
        <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /><Footer /></>} />
        <Route path="/reset-password" element={<><Navbar /><ResetPassword /><Footer /></>} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/help" element={<><Navbar /><Help /><Footer /></>} />
        <Route path="/terms" element={<><Navbar /><Terms /><Footer /></>} />
        <Route path="/privacy" element={<><Navbar /><Privacy /><Footer /></>} />
        <Route path="/faq" element={<><Navbar /><FAQ /><Footer /></>} />
        <Route path="/shipping-info" element={<><Navbar /><ShippingInfo /><Footer /></>} />
        <Route path="/returns" element={<><Navbar /><Returns /><Footer /></>} />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <><Navbar /><Profile /><Footer /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <PrivateRoute>
              <><Navbar /><MyOrders /><Footer /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-messages"
          element={
            <PrivateRoute>
              <><Navbar /><MyMessages /><Footer /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/payment-history"
          element={
            <PrivateRoute>
              <><Navbar /><PaymentHistory /><Footer /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <><Navbar /><Notifications /><Footer /></>
            </PrivateRoute>
          }
        />

        {/* ================= ADMIN PANEL ================= */}
        <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/add-product" element={<AdminRoute><AddProduct /></AdminRoute>} />
        <Route path="/admin/edit-product/:id" element={<AdminRoute><EditProduct /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><Category /></AdminRoute>} />
        <Route path="/admin/add-category" element={<AdminRoute><AddCategory /></AdminRoute>} />
        <Route path="/admin/edit-category/:id" element={<AdminRoute><EditCategory /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><Orders /></AdminRoute>} />
        <Route path="/admin/customers" element={<AdminRoute><Customers /></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><Payments /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
        <Route path="/admin/contacts" element={<AdminRoute><ContactMessages /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<><Navbar /><NotFound /><Footer /></>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
