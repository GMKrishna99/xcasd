
import React, { createContext, useState } from 'react';
import {GETALLROLESBYID_API} from "../../src/Constants/apiRoutes";
// Create the context
export const UserRoleContext = createContext();

// Provider component
export const RoleProvider = ({ children }) => {
  const [userRoleDetails, setRoleDetails] = useState(null);

  // Function to fetch user role data by ID
  const getUserRoleById = async (roleId) => {
    try {
      const response = await fetch(
        // `https://imlystudios-backend-mqg4.onrender.com/api/userrole/getRoleById/${roleId}`
         `${GETALLROLESBYID_API}/${roleId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user role details');
      }
      const data = await response.json();
      setRoleDetails(data);  // Set fetched data into the context state
      return data;
    } catch (error) {
      console.error('Error fetching user role details:', error);
      throw error;
    }
  };

  return (
    <UserRoleContext.Provider value={{ userRoleDetails, setRoleDetails, getUserRoleById }}>
      {children}
    </UserRoleContext.Provider>
  );
};
