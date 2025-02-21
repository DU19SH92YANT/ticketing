import "bootstrap/dist/css/bootstrap.css";
import { AuthProvider, useAuth } from "../context/contextApi";
import Link from "next/link";

const Header = () => {
  const { currentUser, signOut } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link href="/" className="navbar-brand">
          🚀 Ticketing App
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {currentUser ? (
              <>
                <li className="nav-item">
                  <span className="nav-link text-white">
                    Welcome, {currentUser.email}
                  </span>
                </li>
                <li className="nav-item">
                  <Link href="/tickets/new" className="navbar-brand">
                    🚀 Create Ticket
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/orders" className="navbar-brand">
                    My Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light" onClick={signOut}>
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link href="/auth/signin" className="nav-link text-white">
                    Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/auth/signup" className="nav-link text-white">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

const App = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <Header />
      <div className="container mt-4">
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
};

export default App;
