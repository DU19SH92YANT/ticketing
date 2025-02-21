import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link"; // ✅ Correct import for Next.js Link
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is imported

const LandingPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/users/currentUser", {
          withCredentials: true,
        });
        setCurrentUser(response.data?.currentUser || null);
      } catch (error) {
        console.error(
          "❌ Error fetching user:",
          error.response?.data || error.message
        );
      }
    };

    const fetchTickets = async () => {
      try {
        const response = await axios.get("/api/tickets");
        setTickets(response.data || []);
      } catch (error) {
        console.error(
          "❌ Error fetching tickets:",
          error.response?.data || error.message
        );
      }
    };

    fetchUser();
    fetchTickets();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Landing Page</h2>
      {currentUser ? (
        <h4 className="text-success">Welcome, {currentUser.email}</h4>
      ) : (
        <h4 className="text-danger">Not Logged In</h4>
      )}

      <h3 className="mt-4 mb-3">Available Tickets</h3>
      {tickets.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-hover shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.title}</td>
                  <td>${ticket.price}</td>
                  <td>
                    <Link
                      href="/tickets/[ticketId]"
                      as={`/tickets/${ticket.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">No tickets available</p>
      )}
    </div>
  );
};

export default LandingPage;
