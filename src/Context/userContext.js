
import React, { createContext, useState } from 'react';
import {GETALLUSERSBYID_API} from "../../src/Constants/apiRoutes";
// Create the context
export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);

  // Function to fetch user data by ID
  const getUserById = async (userId) => {
    try {
      const response = await fetch(
        // `https://imlystudios-backend-mqg4.onrender.com/api/users/getUserById/${userId}`
         `${GETALLUSERSBYID_API}/${userId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await response.json();
      setUserDetails(data);  // Set fetched data into the context state
      return data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  };


  return (
    <UserContext.Provider value={{ userDetails, setUserDetails, getUserById }}>
      {children}
    </UserContext.Provider>
  );
};
