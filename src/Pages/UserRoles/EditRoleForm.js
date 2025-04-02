import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import Select from "react-select";
import {
  FETCH_PERMISSION_URL_BY_ROLEID,
  CREATE_OR_UPDATE_ROLE_URL,
} from "../../Constants/apiRoutes";
import { DataContext } from "../../Context/DataContext";
import { toast, ToastContainer } from "react-toastify";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
const functions = [
  { id: 1, name: "Technical Function" },
  { id: 2, name: "Finance" },
  { id: 3, name: "Human Resources" },
  { id: 4, name: "Marketing" },
  { id: 5, name: "Sales" },
  { id: 6, name: "Projects" },
  { id: 7, name: "Legal" },
  { id: 8, name: "Others" },
];
const EditRoleForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roleId, roleName, storeId, storeMap, company, functionName } =
    location.state || {};
  const [updatedStoreId, setUpdatedStoreId] = useState(storeId);
  const [updatedRoleName, setUpdatedRoleName] = useState(roleName);
  const [permissionsByModule, setPermissionsByModule] = useState({});
  const [loading, setLoading] = useState(true); // Indicates initial loading state
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Indicates loading during form submission
  const [companyName, setCompanyName] = useState(company);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [query, setQuery] = useState("");

  // Filter functions based on search query
  const filteredFunctions = query
    ? functions.filter((func) =>
        func.name.toLowerCase().includes(query.toLowerCase())
      )
    : functions;

  // Set the selected function when editing
  useEffect(() => {
    if (functionName) {
      const existingFunction = functions.find(
        (func) => func.name === functionName
      );
      setSelectedFunction(existingFunction || null);
    }
  }, [functionName]);

  const handleFunctionChange = (func) => {
    setSelectedFunction(func);
  };

  // Fetch role permissions and categorize them by PermissionModule
  useEffect(() => {
    const fetchRolePermissions = async () => {
      setLoading(true); // Start loading animation when API call starts
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${FETCH_PERMISSION_URL_BY_ROLEID}/${roleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        const categorizedPermissions = {};

        if (data && Array.isArray(data)) {
          data.forEach((permission) => {
            const module = permission.PermissionModule; // Use PermissionModule from the response
            if (!categorizedPermissions[module]) {
              categorizedPermissions[module] = [];
            }
            categorizedPermissions[module].push({
              ID: permission.PermissionId,
              Name: permission.PermissionName,
              IsChecked: permission.IsChecked,
            });
          });
        }
        setPermissionsByModule(categorizedPermissions);
      } catch (err) {
        setError("Failed to fetch role permissions");
      } finally {
        setLoading(false); // Stop loading animation when API call is finished
      }
    };

    fetchRolePermissions();
  }, [roleId]);

  const handleClose = () => {
    navigate("/RoleUser");
  };

  const handleCheckboxChange = (moduleName, permissionId) => {
    setPermissionsByModule((prevState) => {
      const updatedPermissions = { ...prevState };
      updatedPermissions[moduleName] = updatedPermissions[moduleName].map(
        (permission) =>
          permission.ID === permissionId
            ? { ...permission, IsChecked: !permission.IsChecked }
            : permission
      );
      return updatedPermissions;
    });
  };

  const handleSelectAllChange = (moduleName, isChecked) => {
    setPermissionsByModule((prevState) => {
      const updatedPermissions = { ...prevState };
      updatedPermissions[moduleName] = updatedPermissions[moduleName].map(
        (permission) => ({
          ...permission,
          IsChecked: isChecked,
        })
      );
      return updatedPermissions;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedPermissions = [];

    const payload = {
      roleId,
      roleName: updatedRoleName,
      permissions: updatedPermissions,
    };
    const validateRoleDataSubmit = () => {
      if (!payload.roleName) return "Role Name is required.";
    };
    const validationError = validateRoleDataSubmit();
    if (validationError) {
      toast.error(validationError, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return; // Exit function if validation fails
    }

    Object.keys(permissionsByModule).forEach((moduleName) => {
      permissionsByModule[moduleName].forEach((permission) => {
        updatedPermissions.push({
          permissionId: permission.ID,
          isChecked: permission.IsChecked,
        });
      });
    });

    try {
      setIsLoading(true); // Start loading animation during form submission
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${CREATE_OR_UPDATE_ROLE_URL}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Ensure correct content type
          },
        }
      );

      toast.success("Role updated successfully!");
      setTimeout(() => {
        navigate("/roleuser");
      }, 5500);
    } catch (error) {
      toast.error("Error updating role. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading animation after form submission
    }
  };

  // Show loading animation when page is loading or form is submitting
  if (loading || isLoading) return <LoadingAnimation />;
  if (error) return <div>{error}</div>;

  return (
    <div className={`main-container`}>
      <div className="p-6 rounded-lg ">
        <ToastContainer />
        {/* <h2 className="text-xl font-semibold mb-6"> */}
        <h2 className="text-lg font-bold text-[#8B4513]">Edit Role</h2>

        <hr className="border-[#8B4513] opacity-20 my-4 mt-2 mb-4" />

        <div className="mb-4 flex flex-col items-center justify-center w-full"></div>

        <div className="mb-4 flex flex-col sm:flex-row items-center justify-center w-full">
          {/* Role Name Field */}
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-3/4">
            <label className="block font-semibold mr-[14px] min-w-[150px] text-right whitespace-nowrap">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={updatedRoleName}
              onChange={(e) => setUpdatedRoleName(e.target.value)}
              className="border border-gray-300 p-2 w-full sm:w-[70%] rounded-md"
              placeholder="Enter Role Name"
            />
          </div>

          {/* Company Name Field */}
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-3/4">
            <label className="block font-semibold mr-[14px] min-w-[150px] text-right whitespace-nowrap">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="border border-gray-300 p-2 w-full sm:w-[70%] rounded-md"
              placeholder="Enter Company Name"
            />
          </div>
        </div>

        {/* Function Field (Increased Width) */}
        <div className="flex flex-col sm:flex-row items-center w-full sm:w-1/2">
          <label className="block font-semibold mr-[14px] min-w-[150px] text-right whitespace-nowrap">
            Function <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-[70%]">
            <Combobox
              as="div"
              value={selectedFunction}
              onChange={handleFunctionChange}
              className="w-full"
            >
              <div className="relative w-full">
                <Combobox.Input
                  id="FunctionID"
                  name="FunctionID"
                  className="block w-full border border-gray-300 p-3 rounded-md shadow-sm sm:text-sm focus:outline-none"
                  onChange={(event) => setQuery(event.target.value)}
                  displayValue={(func) => func?.name || ""}
                  placeholder="Select Function"
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Combobox.Button>
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredFunctions.map((func) => (
                    <Combobox.Option
                      key={func.id}
                      value={func}
                      className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                    >
                      <span className="block truncate font-normal group-data-[selected]:font-semibold">
                        {func.name}
                      </span>
                      <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
          </div>
        </div>

        <hr className="border-[#8B4513] opacity-20 my-4 mb-6" />

        {/* Permissions by Module */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(permissionsByModule).map((moduleName) => {
            const isAllSelected = permissionsByModule[moduleName].every(
              (permission) => permission.IsChecked
            );

            // Define restricted permissions for each module
            const restrictedPermissionsByModule = {
              "Role Management": [7, 8, 9, 48, 31],
              "Menu Management": [44],
            };

            const restrictedPermissions =
              restrictedPermissionsByModule[moduleName] || [];

            return (
              <div
                key={moduleName}
                className="border-[0.5px] border-[#ce8c5d] p-4 rounded-lg bg-white shadow-md"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-[#8B4513]">
                    {moduleName}
                  </h2>
                  <label className="text-sm">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) =>
                        handleSelectAllChange(moduleName, e.target.checked)
                      }
                      // className="mr-2 form-checkbox h-[12px] w-[12px] text-blue-600"
                      className="mr-2 form-checkbox h-[12px] w-[12px] text-[#8B4513] border-[#8B4513]"
                      disabled={restrictedPermissions.length > 0} // Disable "Select All" if restrictions exist
                    />
                    Select All
                  </label>
                </div>
                <hr className="border-gray-300 my-4 mt-2 mb-4" />

                {permissionsByModule[moduleName].map((permission) => (
                  <div key={permission.ID} className="flex items-center mb-2">
                    <label>
                      <input
                        type="checkbox"
                        checked={permission.IsChecked}
                        onChange={() =>
                          handleCheckboxChange(moduleName, permission.ID)
                        }
                        // className="mr-2 form-checkbox h-[12px] w-[12px] text-blue-600"
                        className="mr-2 form-checkbox h-[12px] w-[12px] text-[#8B4513] border-[#8B4513]"
                        disabled={restrictedPermissions.includes(permission.ID)} // Disable restricted permissions
                      />
                      {permission.Name}
                    </label>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-end space-x-0 sm:space-x-4">
          <button
            onClick={handleClose}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-[#8B4513] to-[#D2691E] text-white rounded-lg hover:from-[#A0522D] hover:to-[#D2691E] transition-all duration-300 w-full sm:w-auto"
          >
            Close
          </button>

          <button
            onClick={handleSubmit}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-[#8B4513] to-[#D2691E] text-white rounded-lg hover:from-[#A0522D] hover:to-[#D2691E] transition-all duration-300 w-full sm:w-auto"
          >
            Update Role
          </button>
          {isLoading && <LoadingAnimation />}
        </div>
      </div>
    </div>
  );
};

export default EditRoleForm;
