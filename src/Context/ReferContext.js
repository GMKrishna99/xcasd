import React, { createContext, useContext, useState } from "react";

// Create a context
const ReferenceContext = createContext();

// Create a provider component
export const ReferenceProvider = ({ children }) => {
  const [referenceId, setReferenceId] = useState(null); // Store selected reference ID

  return (
    <ReferenceContext.Provider value={{ referenceId, setReferenceId }}>
      {children}
    </ReferenceContext.Provider>
  );
};

// Create a custom hook to use the context
export const useReference = () => {
  return useContext(ReferenceContext);
};
