import React from "react";

const MainContent = ({ isNavbarOpen, children }) => {
  return (
    <div
      className={`transition-all duration-300 ${
        isNavbarOpen ? "ml-8" : "ml-6"
      } mt-12 p-4`}
    >
      {children}
    </div>
  );
};

export default MainContent;
