import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DepartmentDashboard_API } from "../../Constants/apiRoutes";
import axios from "axios";
import { Icon } from "@iconify/react";

// Define the new icon components
const FinanceIcon = () => <Icon icon="mdi:finance" width={50} height={50} />;
const TechnicalIcon = () => <Icon icon="mdi:cog" width={50} height={50} />;
const SalesIcon = () => <Icon icon="mdi:chart-line" width={50} height={50} />;
const ProjectsIcon = () => (
  <Icon icon="mdi:clipboard-list-outline" width={50} height={50} />
);
const LegalIcon = () => <Icon icon="mdi:gavel" width={50} height={50} />;
const OthersIcon = () => (
  <Icon icon="mdi:dots-horizontal" width={50} height={50} />
);

// Define the icon mapping
const iconMapping = {
  1: <TechnicalIcon />, // Technical Function
  2: <FinanceIcon />, // Finance
  3: <Icon icon="mdi:account-group" width={50} height={50} />, // Human Resources
  4: <Icon icon="mdi:speaker" width={50} height={50} />, // Marketing
  5: <SalesIcon />, // Sales
  6: <ProjectsIcon />, // Projects
  7: <LegalIcon />, // Legal
  8: <OthersIcon />, // Others
};

const functionsList = [
  { id: 1, name: "Technical" },
  { id: 2, name: "Finance" },
  { id: 3, name: "Human Resources" },
  { id: 4, name: "Marketing" },
  { id: 5, name: "Sales" },
  { id: 6, name: "Projects" },
  { id: 7, name: "Legal" },
  { id: 8, name: "Others" },
];

function Department() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentInfo, setDepartmentInfo] = useState([]);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(DepartmentDashboard_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const departmentData = response.data;

        const combinedData = functionsList.map((func) => {
          const found = departmentData.find(
            (dept) => dept.DepartmentId === func.id
          );
          return {
            id: func.id, // Include the id here
            name: func.name,
            documentCount: found ? found.DocumentCount : "0",
          };
        });

        setDepartmentInfo(combinedData);
      } catch (err) {
        setError("Failed to fetch data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, []);

  const goToTechnical = () => {
    navigate("/documentsList?filter=Technical");
  };
  const goToFinance = () => {
    navigate("/documentsList?filter=Finance");
  };
  const goToHumanResource = () => {
    navigate("/documentsList?filter=HumanResource");
  };
  const goToSales = () => {
    navigate("/documentsList?filter=Sales");
  };
  const goToProjects = () => {
    navigate("/documentsList?filter=Projects");
  };
  const goToLegal = () => {
    navigate("/documentsList?filter=Legal");
  };
  const goToOthers = () => {
    navigate("/documentsList?filter=Others");
  };

  if (loading) return <div>Loading...</div>; // Show loading state
  if (error) return <div>{error}</div>; // Show error state

  return (
    <div className="main-container">
      <h2 className="heading">Functions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-2 mb-8 mt-2">
        {departmentInfo.map((dept) => (
          <div
            key={dept.name}
            className="relative h-32 p-4 bg-white bg-opacity-90 shadow-lg shadow-[#8B4513]/90 rounded-2xl overflow-hidden"
            onClick={() => {
              if (dept.name === "Technical") goToTechnical();
              else if (dept.name === "Finance") goToFinance();
              else if (dept.name === "Human Resources") goToHumanResource();
              else if (dept.name === "Sales") goToSales();
              else if (dept.name === "Projects") goToProjects();
              else if (dept.name === "Legal") goToLegal();
              else if (dept.name === "Others") goToOthers();
            }}
          >
            <div className="flex items-center justify-items-center p-6 py-3 w-full max-w-sm gap-4 text-[#8B4513]">
              {/* Use the icon mapping to get the correct icon */}
              {iconMapping[dept.id]}

              <div>
                <h2 className="text-2xl font-bold text-[#8B4513]">
                  {dept.documentCount}
                </h2>
                <p className="text-lg text-[#8B4513] opacity-80 font-bold ml-1">
                  {dept.name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Department;
