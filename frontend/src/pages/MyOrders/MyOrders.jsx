import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./MyOrders.css";

const STATUS_COLORS = {
  pending: "status pending", processing: "status processing",
  shipped: "status shipped", delivered: "status delivered",
  cancelled: "status cancelled",
};

function MyOrders() {
  const toast = useToast();
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
      toast.success("Order removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove order");
    }
  };

  if (loading) {
    return <div className="loading-orders">Loading your orders...</div>;
  }

  return (
    <div className="my-orders">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <h3>No orders yet</h3>
          <p style={{ color: "#64748b", margin: "8px 0 20px", fontSize: "14px" }}>
            Discover our products and place your first order.
          </p>
          <Link to="/products" className="continue-btn">Start Shopping</Link>
        </div>
      ) : (
        orders.map(order => (
          <div className="order-card" key={order._id}>

            <div className="order-header">
              <div>
                <h3>Order ID</h3>
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
                Status:
                <span className={STATUS_COLORS[order.status?.toLowerCase()] || "status"}>
                  {order.status || "Pending"}
                </span>
              </p>
              <p>
                Payment:
                {order.isPaid
                  ? <span className="paid"> Paid ✓</span>
                  : <span className="pending-pay"> Pending</span>}
              </p>
              <p>Method: {order.paymentMethod || "—"}</p>
            </div>

            <h3 style={{ margin: "0 0 10px", fontSize: "15px", color: "#0f172a" }}>Products</h3>

            {order.orderItems?.map((item, i) => (
              <div className="order-product" key={i}>
                {item.image && (
                  <img src={getImageUrl(item.image)} alt={item.name} />
                )}
                <div>
                  <strong>{item.name}</strong>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <span>{(item.quantity * item.price).toLocaleString()} ETB</span>
              </div>
            ))}

            <h2>Total: {Number(order.totalPrice).toLocaleString()} ETB</h2>

            <button className="remove-order-btn" onClick={() => deleteOrder(order._id)}>
              Remove Order
            </button>

          </div>
        ))
      )}
    </div>
  );
}

export default MyOrders;
