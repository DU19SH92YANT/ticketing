import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import StripeCheckout from "react-stripe-checkout";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../../context/contextApi";

const OrderShow = () => {
  const { currentUser } = useAuth();

  const router = useRouter();
  const { orderId } = router.query;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${orderId}`);
        setOrder(response.data);

        // Calculate time left for expiration
        const expiresAt = new Date(response.data.expiresAt).getTime();
        const updateTimer = () => {
          const now = new Date().getTime();
          const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
          setTimeLeft(secondsLeft);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer); // Cleanup on unmount
      } catch (err) {
        setError("Order not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleToken = async (token) => {
    console.log(token, "token");
    try {
      const response = await axios.post(
        "/api/payments",
        {
          orderId,
          token: token.id,
        },
        { withCredentials: true }
      );
      alert("Payment Successful!");
      router.push("/orders"); // Redirect after payment
    } catch (err) {
      alert("Payment Failed. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <h2 className="text-danger">{error}</h2>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Order Details</h2>
      <div className="card shadow-sm mt-3">
        <div className="card-body">
          <h4 className="card-title">Order ID: {order.id}</h4>
          <p className="card-text">
            <strong>Ticket:</strong> {order.ticket.title}
          </p>
          <p className="card-text">
            <strong>Price:</strong> ${order.ticket.price}
          </p>
          <p className="card-text">
            <strong>Status:</strong>{" "}
            <span className="badge bg-info">{order.status}</span>
          </p>
          <p className="card-text text-danger">
            <strong>Time Left:</strong> {timeLeft} seconds
          </p>

          {timeLeft > 0 ? (
            <StripeCheckout
              token={handleToken}
              stripeKey="pk_test_51NHQlrSFEALwOkMgE92N4LB8loAttBp3BVcwXfQPmitwa9ARlYRs8ryfkEdeNpfW4HOnLM0M1nTIPpfUcogvu20000DB2HnNTQ"
              amount={order.ticket.price * 100}
              currency="INR"
              email={currentUser.email}
            />
          ) : (
            <p className="text-danger">Order Expired</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderShow;
