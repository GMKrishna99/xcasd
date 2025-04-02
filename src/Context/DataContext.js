import React, { createContext, useEffect, useState } from "react";

// Create the context
export const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [citiesData, setCitiesData] = useState([]);
  const [statesData, setStatesData] = useState([]);
  const [countriesData, setCountriesData] = useState([]);
  const [storesData, setStoresData] = useState([]); // Add store data state
  const [loading, setLoading] = useState(true); // Loading state

  const fetchDataFromLocalStorage = (key, setter) => {
    const data = JSON.parse(localStorage.getItem(key));
    if (data) {
      setter(data); // Access the data array
    } else {
      console.warn(`No ${key} data found in localStorage`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Start loading
      setLoading(true);

      // Fetch data from local storage
      fetchDataFromLocalStorage("citiesData", setCitiesData);
      fetchDataFromLocalStorage("statesData", setStatesData);
      fetchDataFromLocalStorage("countriesData", setCountriesData);
      fetchDataFromLocalStorage("storesData", setStoresData); // Fetch store data

      // Finish loading
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider
      value={{ citiesData, statesData, countriesData, storesData, loading }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;