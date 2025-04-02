import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import LoadingAnimation from "../Loading/LoadingAnimation";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isLoggedIn, permissionsID, loading } = useAuth();

  if (loading) {
    return <LoadingAnimation />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  if (requiredPermission && !permissionsID.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;