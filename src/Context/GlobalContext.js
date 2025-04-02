import React, { createContext, useState, useEffect } from 'react';
import { GETALLCUSTOMERS_API } from '../../src/Constants/apiRoutes';

const GlobalContext = createContext();

const GlobalProvider = ({ children }) => {

  return (
    <GlobalContext.Provider value={{ }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalContext, GlobalProvider };