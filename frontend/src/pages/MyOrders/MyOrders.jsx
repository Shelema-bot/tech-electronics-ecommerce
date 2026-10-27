import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { usePreference } from "../../context/PreferenceContext";
import { getImageUrl } from "../../utils/imageUrl";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./MyOrders.css";

const STATUS_COLORS = {
  pending: "status pending", processing: "status processing",
  shipped: "status shipped", delivered: "status delivered",
  cancelled: "status cancelled",
};

function MyOrders() {
  const toast    = useToast();
  const { fmt }  = usePreference();
  const { t }    = useTranslation();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/myorders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("MY ORDERS ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Remove this order from your history?")) return;
    try {
      await API.delete(`/orders/${orderId}`);
      fetchOrders();
      toast.success(t("account.orderRemoved", "Order removed"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("account.orderRemoveFailed", "Failed to remove order"));
    }
  };

  if (loading) {
    return (
      <AccountLayout>
        <div className="loading-orders">{t("common.loading", "Loading your orders...")}</div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="my-orders">
        <h1>{t("account.myOrders", "My Orders")}</h1>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <h3>{t("account.noOrdersYet", "No orders yet")}</h3>
            <p style={{ color: "#64748b", margin: "8px 0 20px", fontSize: "14px" }}>
              {t("account.noOrdersDesc", "Discover our products and place your first order.")}
            </p>
            <Link to="/products" className="continue-btn">
              {t("account.startShopping", "Start Shopping")}
            </Link>
          </div>
        ) : (
          orders.map(order => (
            <div className="order-card" key={order._id}>

              <div className="order-header">
                <div>
                  <h3>{t("account.orderId", "Order ID")}</h3>
                  <p>{order._id}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "13px", color: "#64748b" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric"
                    })}
                  </p>
                </div>
              </div>

              <div className="order-info">
                <p>
                  {t("common.status", "Status")}:{" "}
                  <span className={STATUS_COLORS[order.status?.toLowerCase()] || "status"}>
                    {order.status || "Pending"}
                  </span>
                </p>
                <p>
                  {t("account.payment", "Payment")}:{" "}
                  {order.isPaid
                    ? <span className="paid"> {t("account.paid", "Paid ✓")}</span>
                    : <span className="pending-pay"> {t("account.pendingPay", "Pending")}</span>}
                </p>
                <p>{t("checkout.payment", "Method")}: {order.paymentMethod || "—"}</p>
              </div>

              <h3 style={{ margin: "0 0 10px", fontSize: "15px", color: "#0f172a" }}>
                {t("product.products", "Products")}
              </h3>

              {order.orderItems?.map((item, i) => (
                <div className="order-product" key={i}>
                  {item.image && (
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  )}
                  <div>
                    <strong>{item.name}</strong>
                    <p>{t("product.quantity", "Quantity")}: {item.quantity}</p>
                  </div>
                  <span>{fmt(item.quantity * item.price)}</span>
                </div>
              ))}

              <h2>{t("common.total", "Total")}: {fmt(order.totalPrice)}</h2>

              <button className="remove-order-btn" onClick={() => deleteOrder(order._id)}>
                {t("account.removeOrder", "Remove Order")}
              </button>

            </div>
          ))
        )}

      </div>
    </AccountLayout>
  );
}

export default MyOrders;
