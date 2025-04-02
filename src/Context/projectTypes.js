
import React, { createContext, useState } from 'react';
import { getProjects } from "../Constants/apiRoutes";

// Create context
export const ProjectTypesContext = createContext();

// ProjectTypesProvider component
export const ProjectTypesProvider = ({ children }) => {
  const [projectTypes, setProjectTypes] = useState([]); // Initialize with an empty array
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch data from API (only when explicitly called)
  const fetchProjectTypes = async () => {
    setLoading(true); // Set loading state to true
    try {
      const response = await fetch(getProjects);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const result = await response.json();

      // Update projectTypes state
      setProjectTypes(result.data || []);
    } catch (error) {
      console.error('Error fetching project types:', error.message);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <ProjectTypesContext.Provider value={{ projectTypes, fetchProjectTypes, loading }}>
      {children}
    </ProjectTypesContext.Provider>
  );
};
