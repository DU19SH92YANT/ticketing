import axios from "axios";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders");
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <h2 className="text-center mt-4">Loading your orders...</h2>;
  }

  if (error) {
    return <h2 className="text-danger text-center mt-4">{error}</h2>;
  }

  return (
    <div className="container mt-4">
      <h2>My Orders</h2>
      <ul className="list-group mt-3">
        {orders.map((order) => (
          <li key={order.id} className="list-group-item">
            <strong>Ticket:</strong> {order.ticket.title} <br />
            <strong>Price:</strong> ₹{order.ticket.price} <br />
            <strong>Status:</strong>{" "}
            <span
              className={`badge ${
                order.status === "complete" ? "bg-success" : "bg-warning"
              }`}
            >
              {order.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;
