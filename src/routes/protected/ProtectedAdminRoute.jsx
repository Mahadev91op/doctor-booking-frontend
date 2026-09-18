import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const ProtectedAdminRoute = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) {
      toast.error("Please login as Admin to access the Admin Panel");
    } else if (user.role !== "admin") {
      toast.error("Access denied: You are currently logged in as '" + user.role + "'. Please login with an Admin account.");
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return children;
};

export default ProtectedAdminRoute;
