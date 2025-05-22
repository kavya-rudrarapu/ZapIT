
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return isAdmin ? children : <Navigate to="/adminLogin" replace />;
};

export default AdminProtectedRoute;
