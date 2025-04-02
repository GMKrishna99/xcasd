import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import LoadingAnimation from "../Components/Loading/LoadingAnimation";
import { GETALLUSERSBYID_API, getTenantSettings } from "../Constants/apiRoutes";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [permissionsID, setPermissionsID] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [tenantSettings, setTenantSettings] = useState(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const userID = decodedToken.UserID; // Get UserID from the token
          const tenantID = decodedToken.TenantID; // Get TenantID from the token

          setIsLoggedIn(true);
          setUserRole(decodedToken.RoleID);
          setPermissionsID(decodedToken.PermissionID || []);

          // Fetch user details and tenant settings
          fetchUserDetails(token, userID);
          fetchTenantSettings(token, tenantID);
        } catch (error) {
          console.error("Token decoding failed:", error);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setPermissionsID([]);
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (token) => {
    localStorage.setItem("token", token);
    const decodedToken = jwtDecode(token);
    const userID = decodedToken.UserID;
    const tenantID = decodedToken.TenantID;

    setIsLoggedIn(true);
    setUserRole(decodedToken.RoleID);
    setPermissionsID(decodedToken.PermissionID || []);

    // Fetch user details and store them in state
    await fetchUserDetails(token, userID);
    await fetchTenantSettings(token, tenantID);
  };

  const fetchUserDetails = async (token, userID) => {
    try {
      const response = await fetch(`${GETALLUSERSBYID_API}/${userID}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching user details: ${response.statusText}`);
      }

      const userDataResponse = await response.json();
      const userDetails = userDataResponse?.user || null;

      if (userDetails) {
        // Store user details in localStorage
        localStorage.setItem("userData", JSON.stringify(userDetails));

        // Optionally, set the user details in state
        setUserData(userDetails);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setUserData(null);
    }
  };

  const fetchTenantSettings = async (token, tenantID) => {
    try {
      // Make the API request using axios
      const response = await axios.get(`${getTenantSettings}/${tenantID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Check if the response is successful (status 200)
      if (response.status !== 200) {
        throw new Error(
          `Error fetching tenant settings: ${response.statusText}`
        );
      }

      // Get tenant settings from the response data
      const tenantSettings = response.data;

      // Store tenant settings in localStorage
      localStorage.setItem("tenantSettings", JSON.stringify(tenantSettings));

      // Optionally, set the tenant settings in state if needed
      setTenantSettings(tenantSettings);
    } catch (error) {
      console.error("Error fetching tenant settings:", error);
      setTenantSettings(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("storesData");
    localStorage.removeItem("userData");
    localStorage.removeItem("tenantSettings");

    setIsLoggedIn(false);
    setUserRole(null);
    setPermissionsID([]);
  };

  if (loading) {
    return <LoadingAnimation />; // Or a spinner/loading indicator
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userRole,
        permissionsID,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
