import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/users/currentUser", {
          withCredentials: true,
        });
        setCurrentUser(response.data?.currentUser || null);
      } catch (error) {
        console.error(
          "Error fetching user:",
          error.response?.data || error.message
        );
      }
    };
    fetchUser();
  }, []);

  const signOut = async () => {
    try {
      await axios.post("/api/users/signout", {}, { withCredentials: true });
      setCurrentUser(null);
      router.push("/");
    } catch (error) {
      console.error(
        "Error signing out:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
