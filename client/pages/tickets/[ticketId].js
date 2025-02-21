import axios from "axios";
import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import "bootstrap/dist/css/bootstrap.min.css";
import useRequest from "../../hooks/use-request";

const TicketShow = () => {
  const router = useRouter();
  const { ticketId } = router.query;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticketId,
    },
    onSuccess: (order) =>
      Router.push("/orders/[orderId]", `/orders/${order.id}`),
  });

  useEffect(() => {
    if (!ticketId) return; // Avoid making API call if ticketId is not available

    const fetchTicket = async () => {
      try {
        const response = await axios.get(`/api/tickets/${ticketId}`);
        setTicket(response.data);
      } catch (err) {
        setError("Ticket not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>Loading ticket details...</h2>
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
      <h2>Ticket Details</h2>
      <div className="card shadow-sm mt-3">
        <div className="card-body">
          <h4 className="card-title">{ticket.title}</h4>
          <p className="card-text">
            <strong>Price:</strong> ${ticket.price}
          </p>
          <button className="btn btn-primary" onClick={() => doRequest()}>
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketShow;
